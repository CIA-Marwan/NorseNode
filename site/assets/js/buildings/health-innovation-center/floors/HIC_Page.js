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
        name: "Health programs",
    },
    {
        name: "Labs and clinical care",
    },
    {
        name: "Study and dining",
    },
    {
        name: "Connected design",
    },
];

const featureList = document.querySelector("#hic-feature-list");
const floorList = document.querySelector("#hic-floor-list");

if (featureList) for (const highlight of highlights) {
    const card = document.createElement("article");
    card.className = "building-feature-card";

    const title = document.createElement("h3");
    title.textContent = highlight.name;

    card.append(title);
    featureList.append(card);
}

for (let floor = 1; floor <= 5; floor += 1) {
    const floorLink = document.createElement("a");
    floorLink.className = "griffin-floor-link";
    floorLink.href = `floors/HIC_${floor}.html`;

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
