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

const floorList = document.querySelector("#su-floor-list");

for (let floor = 1; floor <= 3; floor += 1) {
    const floorLink = document.createElement("a");
    floorLink.className = "griffin-floor-link";
    floorLink.href = `../SU_Floors/su_floor${floor}.html`;

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
