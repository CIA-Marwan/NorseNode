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

const highlights = [
    {
        name: "Theatre and bookstore",
    },
    {
        name: "Student support",
    },
    {
        name: "Floor 1 services",
    },
    {
        name: "Atrium and upper floors",
    },
];

const featureList = document.querySelector("#uc-feature-list");
const floorList = document.querySelector("#uc-floor-list");

if (featureList) for (const highlight of highlights) {
    const card = document.createElement("article");
    card.className = "building-feature-card";

    const title = document.createElement("h3");
    title.textContent = highlight.name;

    card.append(title);
    featureList.append(card);
}

for (let floor = 1; floor <= 4; floor += 1) {
    const floorLink = document.createElement("a");
    floorLink.className = "griffin-floor-link";
    floorLink.href = `../UC_Floors/UC_${floor}.html`;

    const floorNumber = document.createElement("span");
    floorNumber.className = "griffin-floor-number";
    floorNumber.textContent = `Floor ${floor}`;

    const floorDescription = document.createElement("span");
    floorDescription.className = "griffin-floor-description";
    floorDescription.textContent = "Study-server limit: 25 people";

    const floorArrow = document.createElement("span");
    floorArrow.className = "griffin-floor-arrow";
    floorArrow.setAttribute("aria-hidden", "true");
    floorArrow.textContent = "›";

    floorLink.append(floorNumber, floorDescription, floorArrow);
    floorList.append(floorLink);
}
