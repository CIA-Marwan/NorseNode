/**
 * Norse Node
 * Copyright (c) 2026 Marwan Abdelrahman.
 * All rights reserved.
 *
 * Original source code is proprietary.
 * No permission is granted to copy, modify,
 * redistribute, sublicense, or commercially
 * exploit this software without prior written
 * authorization from the copyright holder.
 *
 * Project: Norse Node
 * Author: Marwan Abdelrahman
 */

const SERVER_PARTICIPANT_LIMIT = 25;
const MAX_SESSION_HOURS = 10;
const MAX_DEMO_SERVERS = 3;
const DEMO_SERVERS_STORAGE_KEY = "norseNodeDemoServers";
const FLOOR_NUMBER = Number(document.body.dataset.floor);
const BUILDING_ID = document.body.dataset.building || "griffin";
const FLOOR_ID = document.body.dataset.serverScope || `${BUILDING_ID}-floor-${FLOOR_NUMBER}`;
const roomInput = document.querySelector("#room-name");
const roomLoadButton = document.querySelector("#load-room-servers");
let activeRoomName = "";
let activeRoomKey = "";
const localHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const IS_BROWSER_DEMO = window.location.protocol === "file:"
    || !localHosts.has(window.location.hostname)
    || new URLSearchParams(window.location.search).get("demo") === "1";
const localApiHost = window.location.hostname === "localhost" ? "127.0.0.1" : window.location.hostname;
const STUDY_API_BASE_URL = window.location.protocol === "file:"
    ? "http://127.0.0.1:8000"
    : `${window.location.protocol}//${localApiHost}:8000`;
let userProfile = null;
try {
    userProfile = JSON.parse(sessionStorage.getItem("norseNodeUser") || "null");
} catch (error) {
    console.error("Unable to read the Norse Node sign-in profile:", error);
    sessionStorage.removeItem("norseNodeUser");
}

function getUserId() {
    const storedUserId = localStorage.getItem("norseNodeUserId");
    if (storedUserId) return storedUserId;

    const newUserId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `user-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("norseNodeUserId", newUserId);
    return newUserId;
}

const userId = IS_BROWSER_DEMO ? "demo-user" : getUserId();

const serverList = document.querySelector("#study-server-list");
const serverStatus = document.querySelector("#server-status");
const serverSearch = document.querySelector("#server-search");
const createDialog = document.querySelector("#create-server-dialog");
const createForm = document.querySelector("#create-server-form");
const createError = document.querySelector("#server-form-error");
const chatDialog = document.querySelector("#study-chat-dialog");
const chatForm = document.querySelector("#study-chat-form");
const chatMessages = document.querySelector("#study-chat-messages");
const chatInput = document.querySelector("#study-chat-input");
const chatError = document.querySelector("#study-chat-error");
const createButton = document.querySelector("#open-create-server");
const titleInput = createForm.elements.title;
const descriptionInput = createForm.elements.description;
const maxMembersInput = createForm.elements.maxMembers;
const titleLabel = createForm.querySelector('label[for="server-title"]');
const descriptionLabel = createForm.querySelector('label[for="server-description"]');
titleInput.maxLength = 300;
descriptionInput.maxLength = 3000;
titleLabel.textContent = "Server title (up to 5 words)";
descriptionLabel.textContent = "Description (up to 50 words)";
const moderationNote = document.createElement("p");
moderationNote.className = "server-dialog-intro";
moderationNote.textContent = "Profanity and hateful or discriminatory language aren't allowed.";
titleLabel.before(moderationNote);
maxMembersInput.value = SERVER_PARTICIPANT_LIMIT;
maxMembersInput.min = SERVER_PARTICIPANT_LIMIT;
maxMembersInput.max = SERVER_PARTICIPANT_LIMIT;
maxMembersInput.readOnly = true;
createForm.querySelector('label[for="server-max-members"]').textContent =
    "Participant limit (including you)";
const currentUserName = userProfile
    ? `${userProfile.firstName} ${userProfile.lastName}`.trim()
    : "";

let sessions = [];
let activeChatSessionId = null;
let sessionRefreshTimer;
let chatRefreshTimer;
let requestPending = false;
let demoServerCount = 0;

function getCurrentFloorScope() {
    return roomInput
        ? `${FLOOR_ID}-room-${encodeURIComponent(activeRoomKey)}`
        : FLOOR_ID;
}

function readDemoSessions() {
    let storedValue;
    try {
        storedValue = sessionStorage.getItem(DEMO_SERVERS_STORAGE_KEY);
    } catch (error) {
        throw new Error(`Unable to access temporary demo servers: ${error.message}`);
    }

    if (!storedValue) return [];

    let storedSessions;
    try {
        storedSessions = JSON.parse(storedValue);
    } catch (error) {
        throw new Error(`Temporary demo server data is invalid: ${error.message}`);
    }

    const isValidSession = (session) =>
        session
        && typeof session.id === "string"
        && typeof session.title === "string"
        && typeof session.description === "string"
        && typeof session.creatorId === "string"
        && typeof session.creatorName === "string"
        && typeof session.floor === "string"
        && typeof session.floorGroup === "string"
        && Number.isFinite(Date.parse(session.startsAt))
        && Number.isFinite(Date.parse(session.endsAt))
        && Array.isArray(session.participants)
        && session.participants.every((participant) =>
            participant
            && typeof participant.userId === "string"
            && typeof participant.name === "string",
        )
        && Array.isArray(session.messages)
        && session.messages.every((message) =>
            message
            && typeof message.userId === "string"
            && typeof message.displayName === "string"
            && typeof message.text === "string"
            && Number.isFinite(Date.parse(message.sentAt)),
        );

    if (!Array.isArray(storedSessions) || !storedSessions.every(isValidSession)) {
        throw new Error("Temporary demo server data is invalid. Sign out and reset the demo to clear it.");
    }

    return storedSessions;
}

function writeDemoSessions(nextSessions) {
    try {
        sessionStorage.setItem(DEMO_SERVERS_STORAGE_KEY, JSON.stringify(nextSessions));
    } catch (error) {
        throw new Error(`Unable to save temporary demo servers: ${error.message}`);
    }
}

function getActiveDemoSessions() {
    const storedSessions = readDemoSessions();
    const activeSessions = storedSessions.filter((session) => Date.parse(session.endsAt) > Date.now());
    if (activeSessions.length !== storedSessions.length) {
        writeDemoSessions(activeSessions);
    }
    if (activeSessions.length > MAX_DEMO_SERVERS) {
        throw new Error("The demo contains more than three active servers. Sign out and reset the demo to continue.");
    }
    demoServerCount = activeSessions.length;
    return activeSessions;
}

function clearDemoSession() {
    try {
        sessionStorage.removeItem(DEMO_SERVERS_STORAGE_KEY);
        sessionStorage.removeItem("norseNodeUser");
        sessionStorage.removeItem("norseNodeUserId");
    } catch (error) {
        showServerStatus(`Unable to reset the demo session: ${error.message}`, true);
        return false;
    }
    return true;
}

function addDemoSessionControls() {
    if (!IS_BROWSER_DEMO) return;

    const controls = document.createElement("div");
    controls.className = "study-server-controls";
    createButton.parentElement.append(controls);
    controls.append(createButton);

    const resetButton = document.createElement("button");
    resetButton.type = "button";
    resetButton.className = "create-server-button demo-reset-button";
    resetButton.textContent = "Sign Out & Reset Demo";
    resetButton.addEventListener("click", () => {
        if (!clearDemoSession()) return;
        window.location.assign(new URL("../Main_Files/Login_Page.html", window.location.href));
    });
    controls.append(resetButton);
}

const PROHIBITED_SERVER_TERMS = new Set([
    "ass", "arse", "asshole", "bastard", "beaner", "bitch", "bollocks",
    "bullshit", "chink", "coon", "crap", "cracker", "cunt", "damn", "dick",
    "dumbass", "fag", "faggot", "fuck", "fucking", "gook", "goddamn", "jap",
    "kike", "motherfucker", "nigger", "nigga", "piss", "prick", "pussy",
    "raghead", "redskin", "retard", "shit", "slut", "spic", "towelhead",
    "twat", "wetback", "whore", "whitepower",
]);
const LEET_CHARACTERS = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b", "@": "a", "$": "s" };

function containsProhibitedServerLanguage(value) {
    const normalized = value
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[0134578@$]/g, (character) => LEET_CHARACTERS[character])
        .replace(/[\W_]/g, " ")
        .trim()
        .replace(/\s+/g, " ");
    const words = normalized.split(" ");
    const longestTerm = Math.max(...[...PROHIBITED_SERVER_TERMS].map((term) => term.length));
    for (let start = 0; start < words.length; start += 1) {
        let joined = "";
        for (let end = start; end < words.length && joined.length <= longestTerm; end += 1) {
            joined += words[end];
            if (PROHIBITED_SERVER_TERMS.has(joined)) return true;
        }
    }
    return false;
}

function getServerTextError(value, fieldName, wordLimit) {
    const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount > wordLimit) {
        return `${fieldName} can contain no more than ${wordLimit} words.`;
    }
    if (containsProhibitedServerLanguage(value)) {
        return `${fieldName} contains language that isn't allowed.`;
    }
    return "";
}

function validateServerFormText() {
    const titleError = getServerTextError(titleInput.value, "Server title", 5);
    const descriptionError = getServerTextError(descriptionInput.value, "Description", 50);
    titleInput.setCustomValidity(titleError);
    descriptionInput.setCustomValidity(descriptionError);
    createError.textContent = titleError || descriptionError;
}

titleInput.addEventListener("input", validateServerFormText);
descriptionInput.addEventListener("input", validateServerFormText);

async function apiRequest(path, options = {}) {
    if (IS_BROWSER_DEMO) {
        throw new Error("The browser demo does not connect to a shared study-server API.");
    }

    const response = await fetch(`${STUDY_API_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
    });
    const contentType = response.headers.get("content-type") || "";
    const responseText = await response.text();
    let payload;

    try {
        payload = JSON.parse(responseText);
    } catch {
        if (contentType.includes("text/html") || /^\s*<!doctype html|^\s*<html/i.test(responseText)) {
            throw new Error(
                `The study API returned an HTML page instead of JSON (HTTP ${response.status}). Restart Study_Server.py if needed.`,
            );
        }
        throw new Error(`The study API returned an invalid response (HTTP ${response.status}).`);
    }

    if (!response.ok) {
        throw new Error(payload.error || "The study server request failed.");
    }
    if (!contentType.includes("application/json")) {
        throw new Error(`The study API returned an unexpected content type: ${contentType || "unknown"}.`);
    }

    return payload;
}

function showServerStatus(message, isError = false) {
    serverStatus.textContent = message;
    serverStatus.classList.toggle("is-error", isError);
}

function getConnectionErrorMessage(error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
        return "Study servers are currently unavailable.";
    }

    return error.message;
}

function formatDateTime(value) {
    return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(value));
}

function makeTextElement(tagName, className, text) {
    const element = document.createElement(tagName);
    element.className = className;
    element.textContent = text;
    return element;
}

function makeSessionCard(session) {
    const card = document.createElement("article");
    card.className = "study-server-card";

    const heading = document.createElement("div");
    heading.className = "study-server-card-heading";
    const title = makeTextElement("h3", "study-server-title", session.title);
    const occupancy = makeTextElement(
        "span",
        "study-server-occupancy",
        `${session.participantCount}/${SERVER_PARTICIPANT_LIMIT} participants`,
    );
    heading.append(title, occupancy);

    const description = makeTextElement("p", "study-server-description", session.description);
    const details = makeTextElement(
        "p",
        "study-server-meta",
        `Hosted by ${session.creatorName} · ${formatDateTime(session.startsAt)} – ${formatDateTime(session.endsAt)}`,
    );

    const participants = makeTextElement(
        "p",
        "study-server-meta",
        `Participants: ${session.participants.map((participant) => participant.name).join(", ")}`,
    );

    const actions = document.createElement("div");
    actions.className = "study-server-actions";
    const isMember = session.participants.some((participant) => participant.userId === userId);

    const joinButton = document.createElement("button");
    joinButton.type = "button";
    joinButton.className = "create-server-button";
    joinButton.textContent = isMember
        ? "Joined"
        : session.availableSeats > 0 ? "Join Server" : "Server Full";
    joinButton.disabled = isMember || session.availableSeats <= 0 || !currentUserName;
    if (!isMember) {
        joinButton.addEventListener("click", () => joinSession(session.id, joinButton));
    }

    const chatButton = document.createElement("button");
    chatButton.type = "button";
    chatButton.className = "create-server-button";
    chatButton.textContent = isMember ? "Open Chat" : "Join to Chat";
    chatButton.disabled = !isMember;
    if (isMember) {
        chatButton.addEventListener("click", () => openChat(session));
    }
    actions.append(joinButton, chatButton);

    if (session.creatorId === userId) {
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "create-server-button delete-server-button";
        deleteButton.textContent = "Delete Server";
        deleteButton.addEventListener("click", () => deleteSession(session.id, deleteButton));
        actions.append(deleteButton);
    }

    card.append(heading, description, details, participants, actions);
    return card;
}

function renderSessions() {
    if (roomInput && !activeRoomName) {
        serverList.replaceChildren();
        createButton.disabled = true;
        showServerStatus("Enter a room name or number to view its separate servers.");
        return;
    }

    const searchTerm = serverSearch.value.trim().toLocaleLowerCase();
    const matchingSessions = sessions.filter((session) =>
        `${session.title} ${session.description}`.toLocaleLowerCase().includes(searchTerm),
    );
    serverList.replaceChildren(...matchingSessions.map(makeSessionCard));
    createButton.disabled = !currentUserName || (IS_BROWSER_DEMO && demoServerCount >= MAX_DEMO_SERVERS);

    if (!currentUserName) {
        showServerStatus("Sign in on this same address to create a server, join sessions, or chat. For collaborators, sign in through the host's network address.", true);
    } else if (IS_BROWSER_DEMO && demoServerCount >= MAX_DEMO_SERVERS) {
        showServerStatus("Demo limit reached: delete a server before creating another. Servers are private to this browser session.");
    } else if (matchingSessions.length === 0) {
        showServerStatus(IS_BROWSER_DEMO
            ? "No active study servers yet. Demo servers stay in this browser session and are not shared."
            : searchTerm ? "No active servers match your search." : "No active study servers yet.");
    } else {
        const serverLabel = `${matchingSessions.length} active ${matchingSessions.length === 1 ? "server" : "servers"}`;
        showServerStatus(IS_BROWSER_DEMO
            ? `${serverLabel} · Private to this browser session`
            : serverLabel);
    }
}

async function loadSessions() {
    if (roomInput && !activeRoomName) {
        renderSessions();
        return;
    }

    const requestedRoomKey = activeRoomKey;
    const requestedRoomName = activeRoomName;
    try {
        const floorScope = getCurrentFloorScope();
        if (IS_BROWSER_DEMO) {
            sessions = getActiveDemoSessions()
                .filter((session) => session.floor === floorScope)
                .map((session) => ({
                    ...session,
                    participantCount: session.participants.length,
                    availableSeats: session.maxMembers - session.participants.length,
                }));
            sessions.roomName = requestedRoomName;
            renderSessions();
            return;
        }

        const payload = await apiRequest(
            `/api/sessions?floor=${encodeURIComponent(floorScope)}&floorGroup=${encodeURIComponent(FLOOR_ID)}`,
        );
        if (roomInput && activeRoomKey !== requestedRoomKey) return;
        sessions = payload.sessions;
        sessions.roomName = requestedRoomName;
        renderSessions();
    } catch (error) {
        if (roomInput && activeRoomKey !== requestedRoomKey) return;
        showServerStatus(getConnectionErrorMessage(error), true);
    }
}

async function deleteSession(sessionId, button) {
    button.disabled = true;
    try {
        if (IS_BROWSER_DEMO) {
            writeDemoSessions(getActiveDemoSessions().filter((session) => session.id !== sessionId));
        } else {
            await apiRequest(`/api/sessions/${encodeURIComponent(sessionId)}`, {
                method: "DELETE",
                body: JSON.stringify({ userId }),
            });
        }
        if (activeChatSessionId === sessionId) chatDialog.close();
        showServerStatus("Study server deleted.");
        await loadSessions();
    } catch (error) {
        showServerStatus(error.message, true);
        button.disabled = false;
    }
}

async function joinSession(sessionId, button) {
    button.disabled = true;
    try {
        if (IS_BROWSER_DEMO) {
            showServerStatus("Demo servers are private to this browser session; no other participants can join.", true);
            button.disabled = false;
            return;
        }

        await apiRequest(`/api/sessions/${encodeURIComponent(sessionId)}/join`, {
            method: "POST",
            body: JSON.stringify({ userId, displayName: currentUserName }),
        });
        await loadSessions();
    } catch (error) {
        showServerStatus(error.message, true);
        button.disabled = false;
    }
}

function localTimeString(date) {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function updateEndTimeBounds() {
    const startInput = createForm.elements.startTime;
    const endInput = createForm.elements.endTime;
    endInput.min = startInput.value || localTimeString(new Date());

    if (startInput.value) {
        const [hours, minutes] = startInput.value.split(":").map(Number);
        const latestEndMinutes = Math.min(hours * 60 + minutes + MAX_SESSION_HOURS * 60, 23 * 60 + 59);
        endInput.max = `${String(Math.floor(latestEndMinutes / 60)).padStart(2, "0")}:${String(latestEndMinutes % 60).padStart(2, "0")}`;
    } else {
        endInput.max = "23:59";
    }

    if (endInput.value && endInput.value < endInput.min) {
        endInput.value = "";
    }
}

function prepareTodayTimeInputs() {
    const localNow = new Date();
    localNow.setSeconds(0, 0);
    const currentTime = localTimeString(localNow);
    const today = new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(localNow);

    createForm.elements.startTime.min = currentTime;
    createForm.elements.endTime.min = currentTime;
    createForm.elements.startTime.max = "23:59";
    createForm.elements.endTime.max = "23:59";
    document.querySelector("#server-schedule-note").textContent =
        `This server is for today only (${today}). Choose today's start and end times; the date and year are fixed. Sessions may last up to 10 hours and must end today.`;
}

function activateRoomContext() {
    const roomName = roomInput.value.trim().replace(/\s+/g, " ");
    if (!roomName) {
        activeRoomName = "";
        activeRoomKey = "";
        sessions = [];
        serverList.replaceChildren();
        createButton.disabled = true;
        showServerStatus("Enter a room name or number to view its separate servers.", true);
        roomInput.focus();
        return;
    }
    if (roomName.length > 80) {
        activeRoomName = "";
        activeRoomKey = "";
        sessions = [];
        serverList.replaceChildren();
        createButton.disabled = true;
        showServerStatus("Room name or number must be 80 characters or fewer.", true);
        roomInput.focus();
        return;
    }

    activeRoomName = roomName;
    activeRoomKey = roomName.toLowerCase();
    sessions = [];
    sessions.roomName = activeRoomName;
    serverList.replaceChildren();
    createButton.disabled = true;
    loadSessions();
}

if (roomInput && roomLoadButton) {
    roomLoadButton.addEventListener("click", activateRoomContext);
    roomInput.addEventListener("input", () => {
        activeRoomName = "";
        activeRoomKey = "";
        sessions = [];
        serverList.replaceChildren();
        createButton.disabled = true;
        renderSessions();
    });
    roomInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            activateRoomContext();
        }
    });
}

createButton.addEventListener("click", () => {
    createError.textContent = "";
    createForm.reset();
    prepareTodayTimeInputs();
    updateEndTimeBounds();
    createDialog.showModal();
});

createForm.querySelector("[data-close-dialog]").addEventListener("click", () => createDialog.close());
createForm.elements.startTime.addEventListener("input", updateEndTimeBounds);

createForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (requestPending) return;

    const formData = new FormData(createForm);
    const title = String(formData.get("title")).trim();
    const description = String(formData.get("description")).trim();
    const titleError = getServerTextError(title, "Server title", 5);
    const descriptionError = getServerTextError(description, "Description", 50);
    if (titleError || descriptionError) {
        createError.textContent = titleError || descriptionError;
        (titleError ? titleInput : descriptionInput).focus();
        return;
    }
    const [startHours, startMinutes] = String(formData.get("startTime")).split(":").map(Number);
    const [endHours, endMinutes] = String(formData.get("endTime")).split(":").map(Number);
    const start = new Date();
    const end = new Date();
    start.setHours(startHours, startMinutes, 0, 0);
    end.setHours(endHours, endMinutes, 0, 0);
    const durationHours = (end.getTime() - start.getTime()) / 3600000;

    if (!formData.get("startTime") || !formData.get("endTime")) {
        createError.textContent = "Choose both a start time and an end time for today.";
        return;
    }
    if (!Number.isFinite(durationHours) || durationHours <= 0) {
        createError.textContent = "Choose an end time later than the start time today.";
        return;
    }
    if (start.getTime() < Date.now()) {
        createError.textContent = "The start time must be later than the current time today.";
        return;
    }
    if (durationHours > MAX_SESSION_HOURS) {
        createError.textContent = "A study server can last no longer than 10 hours.";
        return;
    }
    requestPending = true;
    const submitButton = createForm.querySelector("[type='submit']");
    submitButton.disabled = true;
    createError.textContent = "";

    try {
        if (IS_BROWSER_DEMO) {
            const activeDemoSessions = getActiveDemoSessions();
            if (activeDemoSessions.length >= MAX_DEMO_SERVERS) {
                throw new Error("The demo is limited to three active study servers. Delete a server before creating another.");
            }

            const localStartsAt = new Date(start);
            const localEndsAt = new Date(end);
            const demoSession = {
                id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
                    ? crypto.randomUUID()
                    : `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                floor: getCurrentFloorScope(),
                floorGroup: FLOOR_ID,
                title,
                description,
                creatorId: userId,
                creatorName: currentUserName,
                maxMembers: SERVER_PARTICIPANT_LIMIT,
                startsAt: localStartsAt.toISOString(),
                endsAt: localEndsAt.toISOString(),
                participants: [{ userId, name: currentUserName }],
                messages: [],
            };
            writeDemoSessions([...activeDemoSessions, demoSession]);
        } else {
            await apiRequest("/api/sessions", {
                method: "POST",
                body: JSON.stringify({
                    title,
                    description,
                    maxMembers: SERVER_PARTICIPANT_LIMIT,
                    startTime: formData.get("startTime"),
                    endTime: formData.get("endTime"),
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    userId,
                    displayName: currentUserName,
                    floorGroup: FLOOR_ID,
                    floor: getCurrentFloorScope(),
                }),
            });
        }
        createDialog.close();
        await loadSessions();
    } catch (error) {
        createError.textContent = error.message;
    } finally {
        requestPending = false;
        submitButton.disabled = false;
    }
});

async function openChat(session) {
    activeChatSessionId = session.id;
    document.querySelector("#study-chat-title").textContent = session.title;
    chatError.textContent = "";
    chatInput.value = "";
    chatDialog.showModal();
    await loadChatMessages();
    window.clearInterval(chatRefreshTimer);
    chatRefreshTimer = window.setInterval(loadChatMessages, 2000);
}

async function loadChatMessages() {
    if (!activeChatSessionId) return;

    try {
        const messages = IS_BROWSER_DEMO
            ? getActiveDemoSessions().find((session) => session.id === activeChatSessionId)?.messages
            : (await apiRequest(
                `/api/sessions/${encodeURIComponent(activeChatSessionId)}/messages?userId=${encodeURIComponent(userId)}`,
            )).messages;
        if (!messages) {
            throw new Error("This study server is no longer available in the current demo session.");
        }
        const messageNodes = messages.map((message) => {
            const item = document.createElement("article");
            item.className = `study-chat-message${message.userId === userId ? " is-own-message" : ""}`;
            item.append(
                makeTextElement("strong", "study-chat-author", message.displayName),
                makeTextElement("p", "study-chat-text", message.text),
                makeTextElement("time", "study-chat-time", formatDateTime(message.sentAt)),
            );
            return item;
        });
        chatMessages.replaceChildren(...messageNodes);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        chatError.textContent = error.message;
    }
}

chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = chatInput.value.trim();
    if (!text || !activeChatSessionId) return;

    const sendButton = chatForm.querySelector("button");
    sendButton.disabled = true;
    chatError.textContent = "";
    try {
        if (IS_BROWSER_DEMO) {
            const activeDemoSessions = getActiveDemoSessions();
            const session = activeDemoSessions.find((item) => item.id === activeChatSessionId);
            if (!session) throw new Error("This study server is no longer available in the current demo session.");
            session.messages.push({
                userId,
                displayName: currentUserName,
                text,
                sentAt: new Date().toISOString(),
            });
            writeDemoSessions(activeDemoSessions);
        } else {
            await apiRequest(`/api/sessions/${encodeURIComponent(activeChatSessionId)}/messages`, {
                method: "POST",
                body: JSON.stringify({ userId, displayName: currentUserName, text }),
            });
        }
        chatInput.value = "";
        await loadChatMessages();
        if (chatDialog.open) chatInput.focus();
    } catch (error) {
        chatError.textContent = error.message;
    } finally {
        sendButton.disabled = false;
    }
});

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    if (button.closest("#create-server-form")) return;
    button.addEventListener("click", () => chatDialog.close());
});

chatDialog.addEventListener("close", () => {
    activeChatSessionId = null;
    window.clearInterval(chatRefreshTimer);
});

createDialog.addEventListener("click", (event) => {
    if (event.target === createDialog) createDialog.close();
});
createDialog.addEventListener("close", () => {
    titleInput.setCustomValidity("");
    descriptionInput.setCustomValidity("");
    createError.textContent = "";
});

chatDialog.addEventListener("click", (event) => {
    if (event.target === chatDialog) chatDialog.close();
});

serverSearch.addEventListener("input", renderSessions);
window.addEventListener("storage", (event) => {
    if (event.key === "norseNodeUser" || event.key === "norseNodeUserId") {
        window.location.reload();
    }
});

addDemoSessionControls();
loadSessions();
sessionRefreshTimer = window.setInterval(loadSessions, 3000);
