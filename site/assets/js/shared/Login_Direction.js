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

const userData = sessionStorage.getItem("norseNodeUser");

const DEMO_PROFILE = Object.freeze({
    firstName: "John",
    lastName: "Doe",
    graduationYear: 2028,
    major: "Computer Science",
});
let signedInUser;

try {
    signedInUser = JSON.parse(userData || "null");
} catch (error) {
    console.error("Unable to read the Norse Node demo profile:", error);
}

if (
    !signedInUser
    || signedInUser.firstName !== DEMO_PROFILE.firstName
    || signedInUser.lastName !== DEMO_PROFILE.lastName
) {
    window.location.replace("login.html");
} else {
    const welcomeName = document.querySelector("#welcome-name");
    const welcomeGraduation = document.querySelector("#welcome-graduation");
    const welcomeMajor = document.querySelector("#welcome-major");
    const redirectCountdown = document.querySelector("#redirect-countdown");

    welcomeName.textContent = `${DEMO_PROFILE.firstName} ${DEMO_PROFILE.lastName}!`;
    welcomeGraduation.textContent = DEMO_PROFILE.graduationYear;
    welcomeMajor.textContent = DEMO_PROFILE.major;

    let secondsRemaining = 3;
    const countdownTimer = window.setInterval(() => {
        secondsRemaining -= 1;
        redirectCountdown.textContent = secondsRemaining;

        if (secondsRemaining === 0) {
            window.clearInterval(countdownTimer);
            window.location.replace("../directory/index.html");
        }
    }, 1000);
}
