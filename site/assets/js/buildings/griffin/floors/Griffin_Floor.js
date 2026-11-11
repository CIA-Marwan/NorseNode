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
const floorData = {
    1: {
        features: {
            "Snack locations / vending machines": true,
            Whiteboards: true,
            "Charging ports": true,
            "Extra monitors": true,
            Projectors: true,
        },
    },
    2: {
        features: {
            "Snack locations / vending machines": false,
            Whiteboards: true,
            "Charging ports": true,
            "Extra monitors": true,
            Projectors: false,
        },
    },
    3: {
        features: {
            "Snack locations / vending machines": true,
            Whiteboards: false,
            "Charging ports": true,
            "Extra monitors": false,
            Projectors: true,
        },
    },
    4: {
        features: {
            "Snack locations / vending machines": false,
            Whiteboards: true,
            "Charging ports": false,
            "Extra monitors": true,
            Projectors: false,
        },
    },
};

const data = floorData[floorNumber];
document.title = `Griffin Hall Floor ${floorNumber} | Norse Node`;
document.querySelector("#floor-title").textContent = `Griffin Hall — Floor ${floorNumber}`;
const floorCapacity = document.querySelector("#floor-capacity");
if (floorCapacity) {
    floorCapacity.textContent = "25 people";
}
const floorOccupancy = document.querySelector("#floor-occupancy");
if (floorOccupancy && floorNumber !== 1) {
    floorOccupancy.textContent = "Not available";
}

const featureList = document.querySelector("#floor-feature-list");

for (const [feature, available] of Object.entries(data.features)) {
    const row = document.createElement("li");
    row.className = "griffin-floor-feature";

    const name = document.createElement("span");
    name.textContent = feature;

    const status = document.createElement("span");
    status.className = available ? "griffin-feature-status is-available" : "griffin-feature-status is-unavailable";
    status.textContent = available ? "✓ Available" : "⊘ Not available";

    row.append(name, status);
    featureList.append(row);
}
