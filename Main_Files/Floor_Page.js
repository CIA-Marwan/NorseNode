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
    const body = document.body;
    const floorNumber = body.dataset.floor;
    let capacityDisplay = document.querySelector("#floor-capacity");
    let occupancyDisplay = document.querySelector("#floor-occupancy");
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

    if (buildingName && pageHeader && floorNumber) {
        const title = pageHeader.querySelector("h1");
        const subtitle = pageHeader.querySelector("p:last-child");
        if (title) title.textContent = `${buildingName} — Floor ${floorNumber}`;
        if (subtitle) {
            subtitle.textContent = body.dataset.building === "mep-center"
                ? "Study-space information and floor-wide study servers."
                : "Study-space information and room capacity for this floor.";
        }
    }

    let floorCard = document.querySelector(".griffin-floor-card");
    if (!floorCard && pageHeader) {
        floorCard = document.createElement("section");
        floorCard.className = "griffin-floor-card";
        pageHeader.after(floorCard);
    }

    function setLabel(display, label) {
        const paragraph = display?.closest("p");
        if (paragraph && display.parentElement === paragraph) {
            paragraph.replaceChildren(`${label}: `, display);
        }
    }

    if (floorCard) {
        let capacityGrid = floorCard.querySelector(":scope > .griffin-capacity-grid");
        if (!capacityGrid) {
            capacityGrid = document.createElement("div");
            capacityGrid.className = "griffin-capacity-grid";
            for (const id of ["floor-capacity", "floor-occupancy"]) {
                const paragraph = document.createElement("p");
                const display = document.createElement("strong");
                display.id = id;
                paragraph.append(display);
                capacityGrid.append(paragraph);
            }
        }

        let featureHeading = floorCard.querySelector(":scope > h2");
        if (!featureHeading) {
            featureHeading = document.createElement("h2");
        }
        featureHeading.textContent = "Floor features";

        let featureList = floorCard.querySelector(":scope > #floor-feature-list");
        if (!featureList) {
            featureList = document.createElement("ul");
            featureList.className = "griffin-floor-feature-list";
            featureList.id = "floor-feature-list";
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

        const notes = [...floorCard.querySelectorAll(":scope > .griffin-data-note")];
        if (notes.length === 0) {
            const note = document.createElement("p");
            note.className = "griffin-data-note";
            note.textContent = "Each study server supports up to 25 participants. This is not a verified physical floor capacity; feature availability has not been provided.";
            notes.push(note);
        }

        const preservedContent = [...floorCard.children].filter((child) =>
            child !== capacityGrid
            && child !== featureHeading
            && child !== featureList
            && !notes.includes(child),
        );
        floorCard.replaceChildren(capacityGrid, featureHeading, featureList, ...preservedContent, ...notes);
        capacityDisplay = floorCard.querySelector("#floor-capacity");
        occupancyDisplay = floorCard.querySelector("#floor-occupancy");
    }

    setLabel(capacityDisplay, "Participant limit per server");
    setLabel(occupancyDisplay, "Active study-server occupancy");
    if (capacityDisplay) capacityDisplay.textContent = "25 people";
    if (occupancyDisplay) occupancyDisplay.textContent = "0/25";

    const serversSection = document.querySelector(".study-servers-section");
    if (serversSection) {
        const eyebrow = serversSection.querySelector(".study-servers-heading .buildings-eyebrow");
        const heading = serversSection.querySelector("#study-servers-title");
        const description = serversSection.querySelector(".study-servers-heading p:last-child");
        const createButton = serversSection.querySelector("#open-create-server");
        const searchLabel = serversSection.querySelector('label[for="server-search"]');
        const searchInput = serversSection.querySelector("#server-search");

        if (eyebrow && buildingName) eyebrow.textContent = `${buildingName} · Floor ${floorNumber}`;
        if (heading) heading.textContent = "Study servers";
        if (description) description.textContent = "Start a study session, join other students, and chat while you work.";
        if (createButton) createButton.textContent = "＋ Create Server";
        if (searchLabel) searchLabel.textContent = "Search study servers";
        if (searchInput) searchInput.placeholder = "Search servers by title or description...";
    }
})();
