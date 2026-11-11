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
            "Snack locations / vending machines": null,
            Whiteboards: null,
            "Charging ports": null,
            "Extra monitors": null,
            Projectors: null,
            "Gym and recreation facilities": null,
            PCs: null,
        },
    },
    2: {
        features: {
            "Snack locations / vending machines": null,
            Whiteboards: null,
            "Charging ports": null,
            "Extra monitors": true,
            Projectors: null,
            "Gym and recreation facilities": true,
            PCs: true,
            Monitors: true,
        },
    },
    3: {
        features: {
            "Snack locations / vending machines": null,
            Whiteboards: null,
            "Charging ports": null,
            "Extra monitors": null,
            Projectors: null,
            "Gym and recreation facilities": null,
            PCs: null,
            Monitors: null,
        },
    },
};

const data = floorData[floorNumber];
document.title = `Albright Health Center Floor ${floorNumber} | Norse Node`;
document.querySelector("#floor-title").textContent = `Albright Health Center — Floor ${floorNumber}`;
document.querySelector("#floor-capacity").textContent = "Not provided";
document.querySelector("#floor-occupancy").textContent = "Not available";

const featureList = document.querySelector("#floor-feature-list");

for (const [feature, available] of Object.entries(data.features)) {
    const row = document.createElement("li");
    row.className = "griffin-floor-feature";

    const name = document.createElement("span");
    name.textContent = feature;

    const status = document.createElement("span");
    if (available === null) {
        status.className = "griffin-feature-status is-unknown";
        status.textContent = "Not provided";
    } else {
        status.className = available
            ? "griffin-feature-status is-available"
            : "griffin-feature-status is-unavailable";
        status.textContent = available ? "✓ Available" : "⊘ Not available";
    }

    row.append(name, status);
    featureList.append(row);
}
