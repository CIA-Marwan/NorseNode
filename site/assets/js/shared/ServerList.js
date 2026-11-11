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

function getRoomLeaderName(room) {
    const leader = room.getLeader();
    return leader && typeof leader.getFullName === "function" ? leader.getFullName() : "Unknown leader";
}

function getRoomLocationName(room) {
    const location = room.getLocation();
    if (!location) {
        return "Unknown location";
    }

    if (typeof location.getDisplayName === "function") {
        return location.getDisplayName();
    }

    const building = typeof location.getBuilding === "function" ? location.getBuilding() : (location.building || "Unknown building");
    const floorName = typeof location.getFloorName === "function" ? location.getFloorName() : (location.floorName || "Unknown floor");
    return `${building} - ${floorName}`;
}

function getUniqueFloorNames() {
    if (typeof dummyRooms === "undefined") {
        return ["All Floors"];
    }

    const floors = dummyRooms.map((room) => getRoomLocationName(room));
    return ["All Floors", ...new Set(floors)];
}

function populateFloorFilter() {
    const filter = document.getElementById("floor-filter");
    if (!filter) {
        return;
    }

    const floors = getUniqueFloorNames();
    filter.innerHTML = floors
        .map((floor) => `<option value="${floor}">${floor}</option>`)
        .join("");
}

function createRoomCard(room, index) {
    const card = document.createElement("article");
    card.className = "room-card";

    const students = room.getStudents();
    const studentList = students
        .map((student) => {
            if (student && typeof student.getFullName === "function") {
                return `<li>${student.getFullName()}</li>`;
            }
            return `<li>${student}</li>`;
        })
        .join("");

    const availableSeats = room.getAvailableSeats();
    const totalSeats = room.getTotalSeats();
    const buttonLabel = availableSeats > 0 ? "Join Room" : "Room Full";
    const locationName = getRoomLocationName(room);
    const location = room.getLocation();
    const building = location && typeof location.getBuilding === "function" ? location.getBuilding() : (location && location.building ? location.building : "Unknown building");
    const floorName = location && typeof location.getFloorName === "function" ? location.getFloorName() : (location && location.floorName ? location.floorName : "Unknown floor");

    card.innerHTML = `
        <div class="room-card-top">
            <div>
                <p class="room-card-label">Course</p>
                <h3>${room.getPurpose()}</h3>
            </div>
            <span class="seat-pill">${availableSeats}/${totalSeats} seats</span>
        </div>

        <div class="room-meta">
            <p><strong>Building:</strong> ${building}</p>
            <p><strong>Floor:</strong> ${floorName}</p>
            <p><strong>Location:</strong> ${locationName}</p>
            <p><strong>Leader:</strong> ${getRoomLeaderName(room)}</p>
            <p><strong>Time:</strong> ${room.getSTime()}:00 - ${room.getETime()}:00</p>
        </div>

        <p class="room-description">${room.getDescription()}</p>

        <div class="room-attendees">
            <p>Attendees</p>
            <ul>${studentList}</ul>
        </div>

        <button type="button" class="join-room-btn" data-room-index="${index}" ${availableSeats > 0 ? "" : "disabled"}>
            ${buttonLabel}
        </button>
    `;

    return card;
}

function renderRoomList(selectedFloor = "All Floors") {
    const container = document.getElementById("room-list");
    if (!container) {
        return;
    }

    if (typeof dummyRooms === "undefined" || !dummyRooms.length) {
        container.innerHTML = "<p class='empty-state'>No rooms are currently available.</p>";
        return;
    }

    const filteredRooms = selectedFloor === "All Floors"
        ? dummyRooms
        : dummyRooms.filter((room) => getRoomLocationName(room) === selectedFloor);

    container.innerHTML = "";

    if (!filteredRooms.length) {
        container.innerHTML = `<p class='empty-state'>No rooms are available on ${selectedFloor}.</p>`;
        return;
    }

    filteredRooms.forEach((room, index) => {
        container.appendChild(createRoomCard(room, index));
    });
}

function joinSelectedRoom(roomIndex) {
    if (typeof dummyRooms === "undefined") {
        return;
    }

    const room = dummyRooms[roomIndex];
    if (!room || room.getAvailableSeats() <= 0) {
        return;
    }

    const guestStudent = typeof dummyStudents !== "undefined" && dummyStudents.length > 0
        ? dummyStudents[0]
        : { getFullName: () => "Guest User" };

    room.studentJoin(guestStudent);
    renderRoomList();
}

document.addEventListener("click", (event) => {
    const button = event.target.closest(".join-room-btn");
    if (!button) {
        return;
    }

    const roomIndex = Number(button.dataset.roomIndex);
    if (!Number.isNaN(roomIndex)) {
        joinSelectedRoom(roomIndex);
    }
});

document.addEventListener("change", (event) => {
    if (event.target && event.target.id === "floor-filter") {
        renderRoomList(event.target.value);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    populateFloorFilter();
    renderRoomList();
});
window.renderRoomList = renderRoomList;