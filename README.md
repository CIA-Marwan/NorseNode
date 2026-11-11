# Norse Node

**Live website:** <https://CIA-Marwan.github.io/NorseNode-NKU/>

Norse Node is a Northern Kentucky University campus study-location directory and
portfolio demonstration. Browse the current building directory, inspect
building and floor information, and try temporary study servers.

## Features

- NKU building search and category filters.
- Building information, photographs, floor details, and study locations.
- A fixed, public demo sign-in and the existing animated welcome screen.
- Study-server creation, chat simulation, and deletion on supported server pages.
- Up to three active demo servers at a time, saved only in the current browser
  tab's `sessionStorage`.
- Server titles and descriptions retain their existing word limits and language
  checks; user-provided text is rendered as text rather than HTML.

This is a portfolio demonstration, not an authentication system. The demo
credentials are public and must not protect sensitive information. The static
GitHub Pages demo does not connect to a shared database: one visitor cannot see
or change another visitor's demo servers. Demo servers and chat messages are
cleared when the visitor signs out or closes the browser tab.

## Demo access

Use the public demo details below to continue:

- **First Name:** John
- **Last Name:** Doe
- **Alias:** `N0rseNode!Study#2026`

The Alias is public demo text, not a password or authentication secret. Do not
reuse it or enter real account credentials. A fixed sample profile and demo
activity are kept in the current browser session; this is not authentication
and must not be used to protect sensitive information.

## Technologies

- HTML, CSS, and vanilla JavaScript.
- Browser `sessionStorage` for isolated public demo state.
- Python standard-library HTTP server and SQLite for optional local development.
- GitHub Actions and GitHub Pages for static deployment.

No frontend package manager or external runtime dependency is required.

## Repository layout

- `index.html` is the stable GitHub Pages entry point.
- `site/pages/` contains the sign-in flow, building directory, building and floor
  pages, and study-server pages.
- `site/assets/` contains shared styles and scripts alongside building-specific
  floor and study-server scripts.
- `backend/study_server.py` is the optional local API; it is not included in the
  public static site.
- `scripts/build_pages.py` copies only the root entry point and frontend files
  from `site/` into `_site/`.

## Local development

### Try the isolated static demo

From the project root, build the Pages-ready static files and serve them:

```sh
python3 scripts/build_pages.py
cd _site
python3 -m http.server 8001
```

Open `http://localhost:8001/?demo=1` to use the browser-only demo. On local
addresses, `?demo=1` explicitly selects the isolated demo; without it, the
frontend can connect to the optional local API described below. Demo data is
private to the current tab and is not written to the SQLite database.

### Run the optional local API

The local API is for development only. In a separate terminal, run:

```sh
python3 backend/study_server.py
```

It binds to `127.0.0.1:8000` by default and stores local data in
`backend/norse_node.sqlite3`, which is excluded from Git and Pages builds. An
existing `Main_Files/norse_node.sqlite3` is reused in place to preserve local
data from the old layout; no database file is moved or published.
When using the local API, serve the frontend from `http://localhost:8001/` as
above. Do not expose this unauthenticated development API to a public network.

The optional `NORSE_NODE_HOST`, `NORSE_NODE_PORT`, and `NORSE_NODE_DB`
environment variables override the local API's bind address, port, and database
path. Keep the API bound to loopback; these settings are not used by GitHub
Pages.

## GitHub Pages deployment

The Pages build contains only `.html`, `.css`, and `.js` files. It deliberately
does not publish the Python API, SQLite database, virtual environment, or local
configuration. Relative links are retained so the site works under a repository
subpath.

1. Create a GitHub repository and add this project to it.
2. Push the `main` branch. The workflow at
   `.github/workflows/pages.yml` builds `_site` and deploys it to GitHub Pages.
3. In the repository's **Settings → Pages**, select **GitHub Actions** as the
   build and deployment source.
4. Wait for the **Deploy to GitHub Pages** workflow to complete. The public URL
   remains `https://CIA-Marwan.github.io/NorseNode-NKU/`.

For a new local Git repository, replace the placeholders below with your
repository details. These commands create a commit and publish it; review the
files and obtain any required approval before running them.

```sh
git init -b main
git add .
git commit -m "Prepare Norse Node for GitHub Pages"
git remote add origin https://github.com/<OWNER>/<REPOSITORY>.git
git push -u origin main
```

GitHub Pages hosts a static site only. It cannot run `Study_Server.py`, SQLite,
or shared real-time sessions; the public study-server experience is therefore a
browser-only simulation.

## Images and screenshots

No project screenshots are currently included. Building and background images
already referenced by the site are loaded from their existing external hosts;
those hosts must remain reachable for the images to display. The image assets
are third-party materials and are not claimed as Norse Node source code.

## Copyright and licensing

See [COPYRIGHT.md](./COPYRIGHT.md). Norse Node's original source code is
proprietary and all rights are reserved. No open-source license is provided.
Third-party assets and code remain subject to their respective owners' rights
and license terms.
