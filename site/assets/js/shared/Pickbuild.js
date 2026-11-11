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

const buildings = [
    { name: "Student Union", page: "../buildings/student-union/index.html", category: "Most common" },
    { name: "University Center", page: "../buildings/university-center/index.html", category: "Recommended" },
    { name: "Health Innovation Center", page: "../buildings/health-innovation-center/index.html", category: "Most common" },
    { name: "Griffin Hall", page: "../buildings/griffin/index.html", category: "Most common" },
    { name: "Mathematics, Education & Psychology Center", page: "../buildings/mep/index.html", category: "Most common" },
    { name: "A.D. Albright Health Center", page: "../buildings/albright/index.html", category: "Not common" },
    { name: "W. Frank Steely Library", page: "../buildings/steely/index.html", categories: ["Most popular", "Recommended"] },
    { name: "Business Academic Center", page: "../buildings/business-academic-center/index.html", category: "Recommended" },
    { name: "Fine Arts Center", page: "../buildings/fine-arts/index.html", category: "Not common" },
    { name: "Landrum Academic Center", page: "../buildings/landrum/index.html", category: "Recommended" },
    { name: "Dorothy Westerman Herrmann Science Center", page: "../buildings/science/index.html", category: "Recommended" },
    { name: "Louie B. Nunn Hall", page: "../buildings/nunn/index.html", category: "Recommended" },
];

const buildingList = document.querySelector("#building-list");
const buildingSearch = document.querySelector("#building-search");
const buildingCategory = document.querySelector("#building-category");
const buildingCount = document.querySelector("#building-count");
const buildingEmpty = document.querySelector("#building-empty");

function renderBuildings() {
    const searchTerm = buildingSearch.value.trim().toLocaleLowerCase();
    const selectedCategory = buildingCategory.value;
    const matchingBuildings = buildings.filter((building) =>
        building.name.toLocaleLowerCase().includes(searchTerm) &&
        (selectedCategory === "all" || building.categories?.includes(selectedCategory) || building.category === selectedCategory),
    );

    buildingList.replaceChildren(
        ...matchingBuildings.map((building) => {
            const link = document.createElement("a");
            link.className = "building-item building-link";
            link.href = building.page;
            link.setAttribute("aria-label", `View floors and study spots in ${building.name}`);

            const name = document.createElement("span");
            name.textContent = building.name;

            const arrow = document.createElement("span");
            arrow.className = "building-link-arrow";
            arrow.setAttribute("aria-hidden", "true");
            arrow.textContent = "›";

            link.append(name, arrow);
            return link;
        }),
    );

    buildingCount.textContent = `${matchingBuildings.length} ${matchingBuildings.length === 1 ? "building" : "buildings"}`;
    buildingEmpty.textContent = "No buildings match your search and category.";
    buildingEmpty.hidden = matchingBuildings.length > 0;
}

buildingSearch.addEventListener("input", renderBuildings);
buildingCategory.addEventListener("change", renderBuildings);
renderBuildings();
