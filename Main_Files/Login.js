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
    alias: "1234",
    graduationYear: 2028,
    major: "Computer Science",
});

const loginForm = document.querySelector("#login-form");
const demoFillButton = document.querySelector("#use-demo-account");
const loginError = document.querySelector("#login-error");
const loginErrorClose = document.querySelector("#login-error-close");
const clock = document.querySelector("#login-clock");
const clockDigits = [...clock.querySelectorAll("[data-clock-digit]")];
const clockPeriod = document.querySelector("#clock-period");
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

demoFillButton.addEventListener("click", () => {
    loginForm.elements.firstName.value = DEMO_ACCOUNT.firstName;
    loginForm.elements.lastName.value = DEMO_ACCOUNT.lastName;
    loginForm.elements.alias.value = DEMO_ACCOUNT.alias;
});

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const firstName = String(formData.get("firstName")).trim().toLocaleLowerCase();
    const lastName = String(formData.get("lastName")).trim().toLocaleLowerCase();
    const alias = String(formData.get("alias")).trim();
    const isDemoAccount = firstName === DEMO_ACCOUNT.firstName.toLocaleLowerCase()
        && lastName === DEMO_ACCOUNT.lastName.toLocaleLowerCase()
        && alias === DEMO_ACCOUNT.alias;

    if (!isDemoAccount) {
        loginError.showModal();
        return;
    }

    sessionStorage.setItem("norseNodeUser", JSON.stringify({
        firstName: DEMO_ACCOUNT.firstName,
        lastName: DEMO_ACCOUNT.lastName,
        graduationYear: DEMO_ACCOUNT.graduationYear,
        major: DEMO_ACCOUNT.major,
    }));
    window.location.assign("Login_Direction.html");
});

loginErrorClose.addEventListener("click", () => loginError.close());

loginError.addEventListener("click", (event) => {
    if (event.target === loginError) {
        loginError.close();
    }
});