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

const floorDetails = {
    1: [
        {
            name: "Student Support Services, University Connect and Persist, Testing Services, and Learning PLUS",
            location: "Located on floor 1",
        },
        {
            name: "Career Services, Norse Advising, Norse Tech Bar, First Year Programs, and Veterans Resource Station",
            location: "Included on floors 1–2; exact floor not specified",
        },
    ],
    2: [
        {
            name: "Career Services, Norse Advising, Norse Tech Bar, First Year Programs, and Veterans Resource Station",
            location: "Included on floors 1–2; exact floor not specified",
        },
    ],
    3: [
        {
            name: "Student lounge space, ballroom, exterior balcony, and upper-level offices",
            location: "Located on the upper levels; exact floor not specified",
        },
    ],
    4: [
        {
            name: "Student lounge space, ballroom, exterior balcony, and upper-level offices",
            location: "Located on the upper levels; exact floor not specified",
        },
    ],
};

document.title = `University Center Floor ${floorNumber} | Norse Node`;
document.querySelector("#floor-title").textContent = `University Center — Floor ${floorNumber}`;
document.querySelector("#floor-capacity").textContent = "Not provided";
document.querySelector("#floor-occupancy").textContent = "Not available";

const featureList = document.querySelector("#floor-feature-list");

for (const feature of floorDetails[floorNumber] ?? []) {
    const row = document.createElement("li");
    row.className = "griffin-floor-feature";

    const name = document.createElement("span");
    name.textContent = feature.name;

    const status = document.createElement("span");
    status.className = "griffin-feature-status is-unknown";
    status.textContent = feature.location;

    row.append(name, status);
    featureList.append(row);
}
