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

const buildingName = document.body.dataset.building;
const floorCount = Number(document.body.dataset.floorCount);
const floorPathPrefix = document.body.dataset.floorPathPrefix;

document.title = `${buildingName} | Norse Node`;
document.querySelector("#building-title").textContent = buildingName;

const floorCountLabel = document.querySelector("#building-floor-count");
if (floorCountLabel) {
    floorCountLabel.textContent = `${floorCount} Floors`;
}

const floorList = document.querySelector("#building-floor-list");
if (floorList && Number.isInteger(floorCount) && floorCount > 0 && floorPathPrefix) {
    // Keep each building's original floor filenames configurable from its page data.
    for (let floor = 1; floor <= floorCount; floor += 1) {
        const floorLink = document.createElement("a");
        floorLink.className = "griffin-floor-link";
        floorLink.href = `${floorPathPrefix}${floor}.html`;

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
}
