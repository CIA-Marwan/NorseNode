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

const floorNumber = Number(document.body.dataset.floor);
const floorTitle = document.querySelector("#floor-title");
const floorCapacity = document.querySelector("#floor-capacity");
const floorOccupancy = document.querySelector("#floor-occupancy");
const featureList = document.querySelector("#floor-feature-list");

document.title = `Student Union Floor ${floorNumber} | Norse Node`;
floorTitle.textContent = `Student Union — Floor ${floorNumber}`;
floorCapacity.textContent = "25 people";
floorOccupancy.textContent = "Not available";

const featureNames = [
    "Snack locations / vending machines",
    "Whiteboards",
    "Charging ports",
    "Extra monitors",
    "Projectors",
];

for (const feature of featureNames) {
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
