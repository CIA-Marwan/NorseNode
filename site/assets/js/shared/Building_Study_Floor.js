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

(function initializeBuildingStudyFloor() {
    // Shared controls keep server creation and chat consistent across building floors.
    const buildingConfigs = {
        "fine-arts-center": {
            name: "Fine Arts Center",
            serverPath: "../buildings/fine-arts/servers",
            serverPrefix: "Fine_Serv",
        },
        "landrum-academic-center": {
            name: "Landrum Academic Center",
            serverPath: "../buildings/landrum/servers",
            serverPrefix: "Land_Serv",
        },
        "science-center": {
            name: "Dorothy Westerman Herrmann Science Center",
            serverPath: "../buildings/science/servers",
            serverPrefix: "Science_Serv",
        },
        "nunn-hall": {
            name: "Louie B. Nunn Hall",
            serverPath: "../buildings/nunn/servers",
            serverPrefix: "Nunn_Serv",
        },
    };
    const building = buildingConfigs[document.body.dataset.building];
    const floor = Number(document.body.dataset.floor);
    const main = document.querySelector(".griffin-floor-main");
    const floorCard = document.querySelector(".griffin-floor-card");

    if (!building || !Number.isInteger(floor) || floor < 1 || !main || !floorCard) {
        console.error("Unable to initialize the building floor page from its page data.");
        return;
    }

    document.title = `${building.name} Floor ${floor} | Norse Node`;
    const floorTitle = document.querySelector("#floor-title");
    if (floorTitle) floorTitle.textContent = `${building.name} — Floor ${floor}`;

    const floorLink = document.querySelector(".building-back-link");
    if (floorLink) floorLink.textContent = `‹ Back to ${building.name}`;

    const serversSection = document.createElement("section");
    serversSection.className = "study-servers-section";
    serversSection.setAttribute("aria-labelledby", "study-servers-title");
    serversSection.innerHTML = `
        <div class="study-servers-heading">
            <div>
                <p class="buildings-eyebrow">${building.name} · Floor ${floor}</p>
                <h2 id="study-servers-title">Floor ${floor} study servers</h2>
                <p>Create or join a study server on this floor.</p>
            </div>
            <button class="create-server-button" id="open-create-server" type="button">＋ Create Server</button>
        </div>
        <div class="server-search-row">
            <label class="sr-only" for="server-search">Search floor study servers</label>
            <input id="server-search" type="search" placeholder="Search servers by title or description..." autocomplete="off">
        </div>
        <p class="server-status" id="server-status" role="status" aria-live="polite">Connecting to study servers…</p>
        <div class="study-server-list" id="study-server-list" aria-live="polite"></div>
    `;

    const createDialog = document.createElement("dialog");
    createDialog.className = "server-dialog";
    createDialog.id = "create-server-dialog";
    createDialog.setAttribute("aria-labelledby", "create-server-title");
    createDialog.innerHTML = `
        <form class="server-dialog-content" id="create-server-form">
            <button class="server-dialog-x" type="button" data-close-dialog aria-label="Close create server">×</button>
            <p class="buildings-eyebrow">${building.name} · Floor ${floor}</p>
            <h2 id="create-server-title">Create Server</h2>
            <p class="server-dialog-intro" id="server-schedule-note">Choose today's start and end times. Sessions may last up to 10 hours.</p>
            <label for="server-title">Server title</label>
            <input id="server-title" name="title" type="text" maxlength="60" required>
            <label for="server-description">Description</label>
            <textarea id="server-description" name="description" rows="4" maxlength="300" required></textarea>
            <label for="server-max-members">Maximum users (including you)</label>
            <input id="server-max-members" name="maxMembers" type="number" min="1" max="25" step="1" value="25" required>
            <p class="server-dialog-intro">Each server supports up to 25 people.</p>
            <div class="server-time-fields">
                <div><label for="server-start">Start time</label><input id="server-start" name="startTime" type="time" step="60" required></div>
                <div><label for="server-end">End time</label><input id="server-end" name="endTime" type="time" step="60" required></div>
            </div>
            <p class="server-form-error" id="server-form-error" role="alert"></p>
            <button class="create-server-button server-form-submit" type="submit">Create Server</button>
        </form>
    `;

    const chatDialog = document.createElement("dialog");
    chatDialog.className = "server-dialog";
    chatDialog.id = "study-chat-dialog";
    chatDialog.setAttribute("aria-labelledby", "study-chat-title");
    chatDialog.innerHTML = `
        <section class="server-dialog-content study-chat-content">
            <button class="server-dialog-x" type="button" data-close-dialog aria-label="Close chat">×</button>
            <p class="buildings-eyebrow">Study server chat</p>
            <h2 id="study-chat-title"></h2>
            <div class="study-chat-messages" id="study-chat-messages" aria-live="polite"></div>
            <form class="study-chat-form" id="study-chat-form">
                <label class="sr-only" for="study-chat-input">Write a message</label>
                <input id="study-chat-input" type="text" maxlength="500" placeholder="Write a message…" required>
                <button class="create-server-button" type="submit">Send</button>
            </form>
            <p class="server-form-error" id="study-chat-error" role="status"></p>
        </section>
    `;

    main.insertBefore(serversSection, main.querySelector("dialog"));
    main.append(createDialog, chatDialog);

    const serverScript = `${building.serverPath}/${building.serverPrefix}${floor}.js`;
    import(serverScript).catch((error) => {
        const status = document.querySelector("#server-status");
        if (status) {
            status.textContent = `Could not load ${building.name} Floor ${floor} server controls.`;
            status.classList.add("is-error");
        }
        console.error(`Unable to load ${building.name} Floor ${floor} server controls:`, error);
    });
})();
