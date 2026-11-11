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

const DEMO_ACCOUNT = Object.freeze({
    firstName: "John",
    lastName: "Doe",
    graduationYear: 2028,
    major: "Computer Science",
});
const BROWSER_DEMO_MODE_KEY = "norseNodeBrowserDemo";

const exploreButton = document.querySelector("#explore-norse-node");
const clock = document.querySelector("#login-clock");
const clockDigits = [...clock.querySelectorAll("[data-clock-digit]")];
const clockPeriod = document.querySelector("#clock-period");
if (new URLSearchParams(window.location.search).get("demo") === "1") {
    sessionStorage.setItem(BROWSER_DEMO_MODE_KEY, "1");
}
sessionStorage.removeItem("norseNodeUser");
sessionStorage.removeItem("norseNodeDemoServers");
sessionStorage.removeItem("norseNodeUserId");
const clockFormatter = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
});

function updateClock() {
    const now = new Date();
    const timeParts = Object.fromEntries(
        clockFormatter.formatToParts(now).map(({ type, value }) => [type, value]),
    );
    const digits = `${timeParts.hour}${timeParts.minute}${timeParts.second}`;

    clockDigits.forEach((digit, index) => {
        const nextValue = digits[index];

        if (digit.textContent !== nextValue) {
            digit.textContent = nextValue;
            digit.classList.remove("is-flipping");
            void digit.offsetWidth;
            digit.classList.add("is-flipping");
        }
    });

    clockPeriod.textContent = timeParts.dayPeriod;
    clock.dateTime = now.toISOString();
    clock.setAttribute(
        "aria-label",
        `Current local time ${timeParts.hour}:${timeParts.minute}:${timeParts.second} ${timeParts.dayPeriod}`,
    );
}

updateClock();
window.setInterval(updateClock, 1000);

exploreButton.addEventListener("click", () => {
    sessionStorage.setItem("norseNodeUser", JSON.stringify({
        firstName: DEMO_ACCOUNT.firstName,
        lastName: DEMO_ACCOUNT.lastName,
        graduationYear: DEMO_ACCOUNT.graduationYear,
        major: DEMO_ACCOUNT.major,
    }));
    window.location.assign("Main_Files/Pickbuild_Page.html");
});