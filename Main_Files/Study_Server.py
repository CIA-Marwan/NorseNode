#!/usr/bin/env python3
"""Local Norse Node study-session API and static-file server."""
# Norse Node
# Copyright (c) 2026 Marwan Abdelrahman.
# All rights reserved.
#
# Original source code is proprietary.
# No permission is granted to copy, modify,
# redistribute, sublicense, or commercially
# exploit this software without prior written
# authorization from the copyright holder.
#
# Project: Norse Node
# Author: Marwan Abdelrahman


from datetime import datetime, time, timedelta, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import re
import sqlite3
import unicodedata
from urllib.parse import parse_qs, unquote, urlsplit
import uuid
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError


ROOT = Path(__file__).resolve().parent
HOST = os.environ.get("NORSE_NODE_HOST", "127.0.0.1")
PORT = int(os.environ.get("NORSE_NODE_PORT", "8000"))
SERVER_PARTICIPANT_LIMIT = 25
MAX_SESSION_DURATION = timedelta(hours=10)
DATABASE_PATH = Path(os.environ.get("NORSE_NODE_DB", ROOT / "norse_node.sqlite3"))
LOCAL_DEVELOPMENT_ORIGINS = {
    "http://localhost:8000",
    "http://localhost:8001",
    "http://127.0.0.1:8000",
    "http://127.0.0.1:8001",
}
PROHIBITED_SERVER_TERMS = {
    "ass", "arse", "asshole", "bastard", "beaner", "bitch", "bollocks",
    "bullshit", "chink", "coon", "crap", "cracker", "cunt", "damn", "dick",
    "dumbass", "fag", "faggot", "fuck", "fucking", "gook", "goddamn", "jap",
    "kike", "motherfucker", "nigger", "nigga", "piss", "prick", "pussy",
    "raghead", "redskin", "retard", "shit", "slut", "spic", "towelhead",
    "twat", "wetback", "whore", "whitepower",
}
LEET_CHARACTERS = str.maketrans({
    "0": "o",
    "1": "i",
    "3": "e",
    "4": "a",
    "5": "s",
    "7": "t",
    "8": "b",
    "@": "a",
    "$": "s",
})


def now_utc():
    return datetime.now(timezone.utc)


def validate_server_copy(value, field_name, word_limit):
    word_count = len(value.split())
    if word_count > word_limit:
        raise ValueError(f"{field_name} can contain no more than {word_limit} words.")

    normalized = unicodedata.normalize("NFKD", value).casefold()
    normalized = "".join(character for character in normalized if not unicodedata.combining(character))
    normalized = normalized.translate(LEET_CHARACTERS)
    words = re.sub(r"[\W_]", " ", normalized, flags=re.UNICODE).split()
    longest_term = max(map(len, PROHIBITED_SERVER_TERMS))
    for start in range(len(words)):
        joined = ""
        for end in range(start, len(words)):
            joined += words[end]
            if len(joined) > longest_term:
                break
            if joined in PROHIBITED_SERVER_TERMS:
                raise ValueError(f"{field_name} contains language that isn't allowed.")


def parse_today_time(value, field_name, zone, local_today):
    if not isinstance(value, str):
        raise ValueError(f"{field_name} is required.")
    try:
        parsed_time = datetime.strptime(value, "%H:%M").time()
    except ValueError as error:
        raise ValueError(f"{field_name} must be a valid time in HH:MM format.") from error

    local_datetime = datetime.combine(local_today, parsed_time).replace(tzinfo=zone)
    utc_datetime = local_datetime.astimezone(timezone.utc)
    if utc_datetime.astimezone(zone).replace(tzinfo=None) != local_datetime.replace(tzinfo=None):
        raise ValueError(f"{field_name} falls within a clock-change gap and is not a valid local time.")
    return utc_datetime


def connect_database():
    connection = sqlite3.connect(DATABASE_PATH, timeout=10)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def initialize_database():
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with connect_database() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS study_sessions (
                id TEXT PRIMARY KEY,
                floor TEXT NOT NULL,
                floor_group TEXT NOT NULL DEFAULT '',
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                creator_id TEXT NOT NULL,
                creator_name TEXT NOT NULL,
                max_members INTEGER NOT NULL DEFAULT 25,
                starts_at TEXT NOT NULL,
                ends_at TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS session_members (
                session_id TEXT NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
                user_id TEXT NOT NULL,
                display_name TEXT NOT NULL,
                joined_at TEXT NOT NULL,
                PRIMARY KEY (session_id, user_id)
            );
            CREATE TABLE IF NOT EXISTS session_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
                user_id TEXT NOT NULL,
                display_name TEXT NOT NULL,
                text TEXT NOT NULL,
                sent_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS study_sessions_floor_expiry
                ON study_sessions(floor, ends_at);
            CREATE INDEX IF NOT EXISTS session_members_user
                ON session_members(user_id);
            CREATE INDEX IF NOT EXISTS session_messages_session_id
                ON session_messages(session_id, id);
            """
        )
        session_columns = {
            row["name"] for row in connection.execute("PRAGMA table_info(study_sessions)")
        }
        if "max_members" not in session_columns:
            connection.execute(
                "ALTER TABLE study_sessions ADD COLUMN max_members INTEGER NOT NULL DEFAULT 25"
            )
        if "floor_group" not in session_columns:
            connection.execute(
                "ALTER TABLE study_sessions ADD COLUMN floor_group TEXT NOT NULL DEFAULT ''"
            )
        connection.execute(
            """
            UPDATE study_sessions
            SET floor_group = CASE
                WHEN floor LIKE 'mep-center-floor-%-room-%'
                    THEN substr(floor, 1, instr(floor, '-room-') - 1)
                ELSE floor
            END
            WHERE floor_group = ''
            """
        )
        connection.execute(
            "UPDATE study_sessions SET max_members = ?", (SERVER_PARTICIPANT_LIMIT,)
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS study_sessions_floor_group_expiry "
            "ON study_sessions(floor_group, ends_at)"
        )


def cleanup_expired(connection):
    connection.execute(
        "DELETE FROM study_sessions WHERE julianday(ends_at) <= julianday(?)",
        (now_utc().isoformat(timespec="microseconds"),),
    )


def floor_occupancy(connection, floor_group):
    row = connection.execute(
        """
        SELECT COUNT(DISTINCT members.user_id) AS occupancy
        FROM session_members AS members
        JOIN study_sessions AS sessions ON sessions.id = members.session_id
        WHERE sessions.floor_group = ?
          AND julianday(sessions.ends_at) > julianday(?)
        """,
        (floor_group, now_utc().isoformat(timespec="microseconds")),
    ).fetchone()
    return row["occupancy"]


def active_membership(connection, user_id, floor):
    return connection.execute(
        """
        SELECT sessions.id, sessions.title
        FROM session_members AS members
        JOIN study_sessions AS sessions ON sessions.id = members.session_id
        WHERE members.user_id = ?
          AND sessions.floor = ?
          AND julianday(sessions.ends_at) > julianday(?)
        LIMIT 1
        """,
        (user_id, floor, now_utc().isoformat(timespec="microseconds")),
    ).fetchone()


class StudyRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        if not any(header.lower().startswith(b"cache-control:") for header in self._headers_buffer):
            self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_cors_headers(self):
        origin = self.headers.get("Origin")
        if origin in LOCAL_DEVELOPMENT_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def read_json(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError as error:
            raise ValueError("Invalid request body length.") from error
        if length <= 0 or length > 20_000:
            raise ValueError("Request body must be between 1 and 20,000 bytes.")
        try:
            payload = json.loads(self.rfile.read(length))
        except (json.JSONDecodeError, UnicodeDecodeError) as error:
            raise ValueError("Request body must contain valid JSON.") from error
        if not isinstance(payload, dict):
            raise ValueError("Request body must be a JSON object.")
        return payload

    def require_text(self, payload, key, max_length):
        value = payload.get(key)
        if not isinstance(value, str) or not value.strip():
            raise ValueError(f"{key} is required.")
        value = value.strip()
        if len(value) > max_length:
            raise ValueError(f"{key} must be {max_length} characters or fewer.")
        return value

    def do_GET(self):
        request = urlsplit(self.path)
        if request.path == "/":
            self.send_response(302)
            self.send_header("Location", "/Login_Page.html")
            self.end_headers()
            return
        if request.path.startswith("/api/"):
            self.handle_api_get(request.path, parse_qs(request.query))
            return
        super().do_GET()

    def handle_api_get(self, path, query):
        if path == "/api/sessions":
            floor = query.get("floor", [""])[0]
            floor_group = query.get("floorGroup", [floor])[0]
            if not floor:
                self.send_json(400, {"error": "floor is required."})
                return
            if not floor_group:
                self.send_json(400, {"error": "floorGroup cannot be empty."})
                return
            with connect_database() as connection:
                cleanup_expired(connection)
                session_rows = connection.execute(
                    """
                    SELECT * FROM study_sessions
                    WHERE floor = ? AND julianday(ends_at) > julianday(?)
                    ORDER BY starts_at, created_at
                    """,
                    (floor, now_utc().isoformat(timespec="microseconds")),
                ).fetchall()
                sessions = []
                for session in session_rows:
                    member_rows = connection.execute(
                        """
                        SELECT user_id, display_name FROM session_members
                        WHERE session_id = ? ORDER BY joined_at
                        """,
                        (session["id"],),
                    ).fetchall()
                    sessions.append(
                        {
                            "id": session["id"],
                            "floor": session["floor"],
                            "title": session["title"],
                            "description": session["description"],
                            "creatorName": session["creator_name"],
                            "creatorId": session["creator_id"],
                            "maxMembers": session["max_members"],
                            "startsAt": session["starts_at"],
                            "endsAt": session["ends_at"],
                            "participants": [
                                {"userId": member["user_id"], "name": member["display_name"]}
                                for member in member_rows
                            ],
                            "participantCount": len(member_rows),
                            "availableSeats": max(
                                0,
                                session["max_members"] - len(member_rows),
                            ),
                        }
                    )
                self.send_json(
                    200,
                    {
                        "sessions": sessions,
                        "floorOccupancy": floor_occupancy(connection, floor_group),
                        "floorCapacity": SERVER_PARTICIPANT_LIMIT,
                    },
                )
            return

        parts = [unquote(part) for part in path.strip("/").split("/")]
        if len(parts) == 4 and parts[0] == "api" and parts[1] == "sessions" and parts[3] == "messages":
            self.get_session_messages(parts[2], query.get("userId", [""])[0])
            return

        self.send_json(404, {"error": "API endpoint not found."})

    def do_OPTIONS(self):
        if not urlsplit(self.path).path.startswith("/api/"):
            self.send_error(404, "API endpoint not found.")
            return
        self.send_response(204)
        self.send_cors_headers()
        self.end_headers()

    def get_session_messages(self, session_id, user_id):
        if not user_id:
            self.send_json(400, {"error": "userId is required."})
            return
        with connect_database() as connection:
            cleanup_expired(connection)
            member = connection.execute(
                "SELECT 1 FROM session_members WHERE session_id = ? AND user_id = ?",
                (session_id, user_id),
            ).fetchone()
            if not member:
                exists = connection.execute(
                    "SELECT 1 FROM study_sessions WHERE id = ?", (session_id,)
                ).fetchone()
                self.send_json(
                    403 if exists else 404,
                    {"error": "Join this active server to read its chat." if exists else "This server has expired or does not exist."},
                )
                return
            rows = connection.execute(
                """
                SELECT user_id, display_name, text, sent_at FROM session_messages
                WHERE session_id = ? ORDER BY id
                """,
                (session_id,),
            ).fetchall()
            self.send_json(
                200,
                {
                    "messages": [
                        {
                            "userId": row["user_id"],
                            "displayName": row["display_name"],
                            "text": row["text"],
                            "sentAt": row["sent_at"],
                        }
                        for row in rows
                    ]
                },
            )

    def do_POST(self):
        request = urlsplit(self.path)
        if not request.path.startswith("/api/"):
            self.send_json(404, {"error": "API endpoint not found."})
            return
        try:
            payload = self.read_json()
        except ValueError as error:
            self.send_json(400, {"error": str(error)})
            return

        if request.path == "/api/sessions":
            self.create_session(payload)
            return

        parts = [unquote(part) for part in request.path.strip("/").split("/")]
        if len(parts) == 4 and parts[0] == "api" and parts[1] == "sessions":
            if parts[3] == "join":
                self.join_session(parts[2], payload)
                return
            if parts[3] == "leave":
                self.leave_session(parts[2], payload)
                return
            if parts[3] == "messages":
                self.create_message(parts[2], payload)
                return

        self.send_json(404, {"error": "API endpoint not found."})

    def do_DELETE(self):
        request = urlsplit(self.path)
        parts = [unquote(part) for part in request.path.strip("/").split("/")]
        if len(parts) != 3 or parts[0] != "api" or parts[1] != "sessions":
            self.send_json(404, {"error": "API endpoint not found."})
            return
        try:
            payload = self.read_json()
        except ValueError as error:
            self.send_json(400, {"error": str(error)})
            return
        self.delete_session(parts[2], payload)

    def create_session(self, payload):
        try:
            if "startsAt" in payload or "endsAt" in payload:
                raise ValueError("Only start and end times are accepted; sessions are always for today.")
            title = self.require_text(payload, "title", 300)
            description = self.require_text(payload, "description", 3000)
            validate_server_copy(title, "Server title", 5)
            validate_server_copy(description, "Description", 50)
            user_id = self.require_text(payload, "userId", 100)
            display_name = self.require_text(payload, "displayName", 100)
            floor = self.require_text(payload, "floor", 100)
            floor_group = (
                self.require_text(payload, "floorGroup", 100)
                if "floorGroup" in payload
                else floor
            )
            if floor != floor_group and not floor.startswith(f"{floor_group}-room-"):
                raise ValueError("floorGroup must match floor or its room-specific scope.")
            max_members = payload.get("maxMembers")
            if isinstance(max_members, bool) or not isinstance(max_members, int):
                raise ValueError("Maximum users must be a whole number.")
            if max_members != SERVER_PARTICIPANT_LIMIT:
                raise ValueError(f"Every study server must have a {SERVER_PARTICIPANT_LIMIT}-person limit.")
            timezone_name = self.require_text(payload, "timeZone", 100)
            try:
                zone = ZoneInfo(timezone_name)
            except ZoneInfoNotFoundError as error:
                raise ValueError("timeZone must be a valid IANA time-zone name.") from error
            current_time = now_utc()
            local_today = current_time.astimezone(zone).date()
            starts_at = parse_today_time(payload.get("startTime"), "Start time", zone, local_today)
            ends_at = parse_today_time(payload.get("endTime"), "End time", zone, local_today)
            if starts_at < current_time:
                raise ValueError("Start time must be later than the current time today.")
            duration = ends_at - starts_at
            if duration <= timedelta(0):
                raise ValueError("End time must be later than start time on today's date.")
            if duration > MAX_SESSION_DURATION:
                raise ValueError("A study server can last no longer than 10 hours.")
        except ValueError as error:
            self.send_json(400, {"error": str(error)})
            return

        session_id = uuid.uuid4().hex
        current_time = now_utc().isoformat(timespec="microseconds")
        starts_at_text = starts_at.isoformat(timespec="microseconds")
        ends_at_text = ends_at.isoformat(timespec="microseconds")

        with connect_database() as connection:
            connection.execute("BEGIN IMMEDIATE")
            cleanup_expired(connection)
            membership = active_membership(connection, user_id, floor)
            if membership:
                self.send_json(409, {"error": f"You are already in “{membership['title']}”. Leave that session before creating another."})
                return
            connection.execute(
                """
                INSERT INTO study_sessions
                    (id, floor, floor_group, title, description, creator_id, creator_name, max_members, starts_at, ends_at, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (session_id, floor, floor_group, title, description, user_id, display_name, max_members, starts_at_text, ends_at_text, current_time),
            )
            connection.execute(
                """
                INSERT INTO session_members (session_id, user_id, display_name, joined_at)
                VALUES (?, ?, ?, ?)
                """,
                (session_id, user_id, display_name, current_time),
            )
        self.send_json(201, {"id": session_id})

    def join_session(self, session_id, payload):
        try:
            user_id = self.require_text(payload, "userId", 100)
            display_name = self.require_text(payload, "displayName", 100)
        except ValueError as error:
            self.send_json(400, {"error": str(error)})
            return

        with connect_database() as connection:
            connection.execute("BEGIN IMMEDIATE")
            cleanup_expired(connection)
            session = connection.execute(
                "SELECT floor, floor_group FROM study_sessions WHERE id = ?", (session_id,)
            ).fetchone()
            if not session:
                self.send_json(404, {"error": "This server has expired or does not exist."})
                return
            existing_member = connection.execute(
                "SELECT 1 FROM session_members WHERE session_id = ? AND user_id = ?",
                (session_id, user_id),
            ).fetchone()
            if existing_member:
                self.send_json(200, {"joined": True})
                return
            member_count = connection.execute(
                "SELECT COUNT(*) AS count FROM session_members WHERE session_id = ?",
                (session_id,),
            ).fetchone()["count"]
            max_members = connection.execute(
                "SELECT max_members FROM study_sessions WHERE id = ?",
                (session_id,),
            ).fetchone()["max_members"]
            if member_count >= max_members:
                self.send_json(409, {"error": "This server has reached its user limit."})
                return
            membership = active_membership(connection, user_id, session["floor"])
            if membership:
                self.send_json(409, {"error": f"You are already in “{membership['title']}”. You can join one server at a time."})
                return
            connection.execute(
                """
                INSERT INTO session_members (session_id, user_id, display_name, joined_at)
                VALUES (?, ?, ?, ?)
                """,
                (session_id, user_id, display_name, now_utc().isoformat(timespec="microseconds")),
            )
        self.send_json(200, {"joined": True})

    def leave_session(self, session_id, payload):
        try:
            user_id = self.require_text(payload, "userId", 100)
        except ValueError as error:
            self.send_json(400, {"error": str(error)})
            return

        with connect_database() as connection:
            connection.execute("BEGIN IMMEDIATE")
            cleanup_expired(connection)
            membership = connection.execute(
                """
                SELECT 1 FROM session_members
                WHERE session_id = ? AND user_id = ?
                """,
                (session_id, user_id),
            ).fetchone()
            if not membership:
                self.send_json(404, {"error": "You are not a participant in this active server."})
                return
            connection.execute(
                "DELETE FROM session_members WHERE session_id = ? AND user_id = ?",
                (session_id, user_id),
            )
        self.send_json(200, {"left": True})

    def delete_session(self, session_id, payload):
        try:
            user_id = self.require_text(payload, "userId", 100)
        except ValueError as error:
            self.send_json(400, {"error": str(error)})
            return

        with connect_database() as connection:
            connection.execute("BEGIN IMMEDIATE")
            cleanup_expired(connection)
            session = connection.execute(
                "SELECT creator_id FROM study_sessions WHERE id = ?", (session_id,)
            ).fetchone()
            if not session:
                self.send_json(404, {"error": "This server has expired or does not exist."})
                return
            if session["creator_id"] != user_id:
                self.send_json(403, {"error": "Only the person who created this server can delete it."})
                return
            connection.execute("DELETE FROM study_sessions WHERE id = ?", (session_id,))
        self.send_json(200, {"deleted": True})

    def create_message(self, session_id, payload):
        try:
            user_id = self.require_text(payload, "userId", 100)
            display_name = self.require_text(payload, "displayName", 100)
            text = self.require_text(payload, "text", 500)
        except ValueError as error:
            self.send_json(400, {"error": str(error)})
            return

        with connect_database() as connection:
            connection.execute("BEGIN IMMEDIATE")
            cleanup_expired(connection)
            member = connection.execute(
                "SELECT 1 FROM session_members WHERE session_id = ? AND user_id = ?",
                (session_id, user_id),
            ).fetchone()
            if not member:
                exists = connection.execute(
                    "SELECT 1 FROM study_sessions WHERE id = ?", (session_id,)
                ).fetchone()
                self.send_json(
                    403 if exists else 404,
                    {"error": "Join this active server before sending chat messages." if exists else "This server has expired or does not exist."},
                )
                return
            connection.execute(
                """
                INSERT INTO session_messages (session_id, user_id, display_name, text, sent_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (session_id, user_id, display_name, text, now_utc().isoformat(timespec="microseconds")),
            )
        self.send_json(201, {"sent": True})


def main():
    initialize_database()
    server = ThreadingHTTPServer((HOST, PORT), StudyRequestHandler)
    print(f"Norse Node is serving on http://{HOST}:{PORT}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Norse Node server.", flush=True)
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
