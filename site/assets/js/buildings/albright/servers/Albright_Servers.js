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

(function initializeAlbrightFloorServers() {
const floorNumber = Number(document.body.dataset.floor);
const main = document.querySelector(".griffin-floor-main");
const floorCard = document.querySelector(".griffin-floor-card");

if (main && floorCard) {
    const template = document.createElement("template");
    template.innerHTML = `
        <section class="study-servers-section" aria-labelledby="study-servers-title">
            <div class="study-servers-heading">
                <div>
                    <p class="buildings-eyebrow">Albright Health Center · Floor ${floorNumber}</p>
                    <h2 id="study-servers-title">Study servers</h2>
                    <p>Start a study session, join other students, and chat while you work.</p>
                </div>
                <button class="create-server-button" id="open-create-server" type="button">＋ Create Server</button>
            </div>
            <div class="server-search-row">
                <label class="sr-only" for="server-search">Search study servers</label>
                <input id="server-search" type="search" placeholder="Search servers by title or description..." autocomplete="off">
            </div>
            <p class="server-status" id="server-status" role="status" aria-live="polite">Connecting to shared study servers…</p>
            <div class="study-server-list" id="study-server-list" aria-live="polite"></div>
        </section>
        <dialog class="server-dialog" id="create-server-dialog" aria-labelledby="create-server-title">
            <form class="server-dialog-content" id="create-server-form">
                <button class="server-dialog-x" type="button" data-close-dialog aria-label="Close create server">×</button>
                <p class="buildings-eyebrow">Albright Health Center · Floor ${floorNumber}</p>
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
        </dialog>
        <dialog class="server-dialog" id="study-chat-dialog" aria-labelledby="study-chat-title">
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
        </dialog>`;
    main.insertBefore(template.content, main.querySelector("dialog"));

    import("../../griffin/servers/GH1_Servers.js?albright-health-center-v1").catch((error) => {
        const status = document.querySelector("#server-status");
        if (status) {
            status.textContent = "Could not load Albright Health Center floor server controls.";
            status.classList.add("is-error");
        }
        console.error("Unable to load Albright Health Center floor server controls:", error);
    });
}
})();
