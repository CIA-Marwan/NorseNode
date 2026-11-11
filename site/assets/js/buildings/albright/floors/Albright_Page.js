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

const features = [
    {
        name: "Live occupancy",
    },
    {
        name: "Room capacity estimate",
    },
    { name: "Vending machines" },
    { name: "Whiteboards" },
    { name: "Charging ports" },
    { name: "Projectors" },
    { name: "Gym and recreation facilities" },
];

const featureList = document.querySelector("#albright-feature-list");
const floorList = document.querySelector("#albright-floor-list");

if (featureList) for (const feature of features) {
    const card = document.createElement("article");
    card.className = "building-feature-card";

    const title = document.createElement("h3");
    title.textContent = feature.name;

    card.append(title);
    featureList.append(card);
}

for (let floor = 1; floor <= 3; floor += 1) {
    const floorLink = document.createElement("a");
    floorLink.className = "griffin-floor-link";
    floorLink.href = `floors/floor${floor}_albright.html`;

    const floorNumber = document.createElement("span");
    floorNumber.className = "griffin-floor-number";
    floorNumber.textContent = `Floor ${floor}`;

    const floorDescription = document.createElement("span");
    floorDescription.className = "griffin-floor-description";

    const floorArrow = document.createElement("span");
    floorArrow.className = "griffin-floor-arrow";
    floorArrow.setAttribute("aria-hidden", "true");
    floorArrow.textContent = "›";

    if (floor === 2) {
        floorDescription.textContent = "Study-server limit: 25 people";
        floorLink.classList.add("is-recreation-floor");
    } else {
        floorDescription.textContent = "Study-server limit: 25 people";
    }

    floorLink.append(floorNumber, floorDescription, floorArrow);
    floorList.append(floorLink);
}
