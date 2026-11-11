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

(function initializeFloorPage() {
    const floorCard = document.querySelector(".griffin-floor-card");
    const capacityDisplay = document.querySelector("#floor-capacity");
    const occupancyDisplay = document.querySelector("#floor-occupancy");
    const body = document.body;
    const floorNumber = body.dataset.floor;
    const buildingNames = {
        "student-union": "Student Union",
        "health-innovation-center": "Health Innovation Center",
        "w-frank-steely-library": "W. Frank Steely Library",
        "mep-center": "Mathematics, Education & Psychology Center",
        "university-center": "University Center",
        "business-academic-center": "Business Academic Center",
        "albright-health-center": "Albright Health Center",
        "fine-arts-center": "Fine Arts Center",
        "landrum-academic-center": "Landrum Academic Center",
        "science-center": "Dorothy Westerman Herrmann Science Center",
        "nunn-hall": "Louie B. Nunn Hall",
    };
    const buildingName = buildingNames[body.dataset.building]
        || (body.classList.contains("griffin-page") ? "Griffin Hall" : "");
    const pageHeader = document.querySelector(".building-detail-header");
    const roomInput = document.querySelector("#room-name");

    if (buildingName && pageHeader && floorNumber) {
        const title = pageHeader.querySelector("h1");
        const subtitle = pageHeader.querySelector("p:last-child");
        if (title) title.textContent = `${buildingName} — Floor ${floorNumber}`;
        if (subtitle) subtitle.textContent = "Study-space information and room capacity for this floor.";
    }

    if (floorCard && roomInput) {
        const roomPanel = document.createElement("section");
        roomPanel.className = "griffin-floor-card room-selection-panel";
        const roomHeading = floorCard.querySelector(":scope > h2");
        const roomSearch = roomInput.closest(".server-search-row");
        const roomDescription = [...floorCard.querySelectorAll(":scope > .griffin-data-note")]
            .find((note) => !note.textContent.toLowerCase().includes("limit"));

        if (roomHeading) roomPanel.append(roomHeading);
        if (roomDescription) roomPanel.append(roomDescription);
        if (roomSearch) roomPanel.append(roomSearch);

        for (const note of floorCard.querySelectorAll(":scope > .griffin-data-note")) {
            note.remove();
        }
        for (const grid of floorCard.querySelectorAll(":scope > .griffin-capacity-grid")) {
            if (grid !== floorCard.querySelector(":scope > .griffin-capacity-grid")) grid.remove();
        }

        const serversSection = document.querySelector(".study-servers-section");
        if (roomPanel.childElementCount && serversSection) {
            serversSection.before(roomPanel);
        }
    }

    function setLabel(display, label) {
        const paragraph = display?.closest("p");
        if (paragraph && display.parentElement === paragraph) {
            paragraph.replaceChildren(`${label}: `, display);
        }
    }

    setLabel(capacityDisplay, "Participant limit per server");
    setLabel(occupancyDisplay, "Active study-server occupancy");
    if (capacityDisplay) capacityDisplay.textContent = "25 people";
    if (occupancyDisplay) occupancyDisplay.textContent = "0/25";

    if (floorCard) {
        let featureList = floorCard.querySelector("#floor-feature-list");
        if (!featureList) {
            const heading = document.createElement("h2");
            heading.textContent = "Floor features";
            featureList = document.createElement("ul");
            featureList.className = "griffin-floor-feature-list";
            featureList.id = "floor-feature-list";
            floorCard.append(heading, featureList);
        }

        if (featureList.childElementCount === 0) {
            for (const feature of [
                "Snack locations / vending machines",
                "Whiteboards",
                "Charging ports",
                "Extra monitors",
                "Projectors",
            ]) {
                const row = document.createElement("li");
                row.className = "griffin-floor-feature";
                const name = document.createElement("span");
                name.textContent = feature;
                const status = document.createElement("span");
                status.className = "griffin-feature-status is-unknown";
                status.textContent = "Not provided";
                row.append(name, status);
                featureList.append(row);
            }
        }

        if (!floorCard.querySelector(".griffin-data-note")) {
            const note = document.createElement("p");
            note.className = "griffin-data-note";
            note.textContent = "Each study server supports up to 25 participants. This is not a verified physical floor capacity.";
            floorCard.append(note);
        }
    }
})();
