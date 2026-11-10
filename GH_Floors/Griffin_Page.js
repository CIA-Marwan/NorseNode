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
    {
        name: "Vending machines",
    },
    {
        name: "Whiteboards",
    },
    {
        name: "Charging ports",
    },
    {
        name: "Extra monitors",
    },
    {
        name: "Projectors",
    },
];

const featureList = document.querySelector("#griffin-feature-list");
const floorList = document.querySelector("#griffin-floor-list");
const restrictionDialog = document.querySelector("#floor-restriction-dialog");
const restrictionClose = document.querySelector("#restriction-close");

if (featureList) for (const feature of features) {
    const card = document.createElement("article");
    card.className = "building-feature-card";

    const title = document.createElement("h3");
    title.textContent = feature.name;

    card.append(title);
    featureList.append(card);
}

for (let floor = 1; floor <= 5; floor += 1) {
    const floorLink = document.createElement(floor === 5 ? "button" : "a");
    floorLink.className = "griffin-floor-link";

    const floorNumber = document.createElement("span");
    floorNumber.className = "griffin-floor-number";
    floorNumber.textContent = `Floor ${floor}`;

    const floorDescription = document.createElement("span");
    floorDescription.className = "griffin-floor-description";

    const floorArrow = document.createElement("span");
    floorArrow.className = "griffin-floor-arrow";
    floorArrow.setAttribute("aria-hidden", "true");

    if (floor === 5) {
        floorLink.type = "button";
        floorLink.classList.add("is-restricted-floor");
        floorLink.setAttribute("aria-haspopup", "dialog");
        floorDescription.textContent = "Staff-only · study-server limit: 25 people";
        floorArrow.textContent = "!";
        floorLink.addEventListener("click", () => restrictionDialog.showModal());
    } else {
        floorLink.href = `../GH_Floors/floor${floor}_gh.html`;
        floorDescription.textContent = "Study-server limit: 25 people";
        floorArrow.textContent = "›";
    }

    floorLink.append(floorNumber, floorDescription, floorArrow);
    floorList.append(floorLink);
}

restrictionClose.addEventListener("click", () => restrictionDialog.close());

restrictionDialog.addEventListener("click", (event) => {
    if (event.target === restrictionDialog) {
        restrictionDialog.close();
    }
});
