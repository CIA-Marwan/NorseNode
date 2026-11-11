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
        name: "Study spaces",
    },
    {
        name: "Academic programs",
    },
    {
        name: "Early Childhood Center",
    },
    {
        name: "Leadership Walk of Fame",
    },
];

const featureList = document.querySelector("#mep-feature-list");

if (featureList) for (const highlight of highlights) {
    const card = document.createElement("article");
    card.className = "building-feature-card";

    const title = document.createElement("h3");
    title.textContent = highlight.name;

    card.append(title);
    featureList.append(card);
}
