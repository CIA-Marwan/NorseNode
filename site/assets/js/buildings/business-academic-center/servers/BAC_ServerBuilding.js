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

import("../../griffin/servers/GH1_Servers.js?bac-server-scopes-v1").catch((error) => {
    const status = document.querySelector("#server-status");
    if (status) {
        status.textContent = "Could not load Business Academic Center building-wide server controls.";
        status.classList.add("is-error");
    }
    console.error("Unable to load the BAC building-wide server client:", error);
});
