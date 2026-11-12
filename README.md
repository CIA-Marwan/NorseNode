# Norse Node Live Website Access

**Live Website Link :** https://norsenode.dev/

# 🚀 Introducing Norse Node

One campus. Countless study spaces. Endless opportunities to connect.

Norse Node is a campus-focused study discovery and student networking web application developed during a hackathon at Northern Kentucky University (NKU).

Built collaboratively using HTML, CSS, JavaScript, and Python. Norse Node was designed to simplify how students discover study locations, explore campus buildings, and connect with fellow Norse.

Whether you're searching for a quiet corner to concentrate, a collaborative environment to tackle assignments, or a place to connect with students who share your academic interests, Norse Node brings the experience together in one accessible platform.

# Our mission is simple:

🎯 Make studying more accessible, campus navigation more convenient, and student connections more meaningful.

At Norse Node, our mission is to transform the way Northern Kentucky University students discover study spaces, connect with their peers, and collaborate across campus.

We believe that a university is more than a collection of classrooms and buildings. It is a network of individuals, ideas, and opportunities waiting to be connected.

Inspired by the concept of a node in computer networking, we envision every student as an essential part of a larger academic community. By bringing campus discovery and student networking together in one accessible platform, we aim to make finding the right study environment easier, encourage meaningful academic connections, and create new opportunities for collaboration.

 # 💡 The Meaning Behind Norse Node : 
 
🔗 In our Perception Every Student Is a Node. Together, We Form a Network.

The name Norse Node combines two ideas that define the project's identity:

**⚔️ NORSE — Our University Identity** 

Inspired by NKU's Norse identity, representing the students, community, and university that brought this project to life.

**🌐 NODE — The Power of Connection**

In computer networking, a node represents a device or point connected to a larger network, capable of communicating and exchanging information.

We applied this concept to the student experience within Norse Node.

Imagine every NKU student as an individual node. When students discover shared study locations, join study groups, and communicate with their peers, they begin forming a connected academic network.

**🔗 Individual Students → Shared Spaces → Meaningful Connections → Stronger Community**

Norse Node is more than a building directory. It's a concept built around connecting students through the places where they learn.

## Features

- NKU building search and category filters.
- Building information, photographs, floor details, and study locations.
- One-click demo entry with a fictional John Doe profile.
- Study-server creation, chat simulation, and deletion on supported server pages.
- Up to three active demo servers at a time, saved only in the current browser
  tab's `sessionStorage`.
- Server titles and descriptions retain their existing word limits and language
  checks; user-provided text is rendered as text rather than HTML.

This is a portfolio demonstration, not an authentication system. The static
GitHub Pages demo does not connect to a shared database: one visitor cannot see
or change another visitor's demo servers. Demo servers and chat messages are
cleared when the visitor resets the demo or closes the browser tab.

## Demo profile

Selecting **Explore Norse Node** initializes the fictional John Doe demo profile
in the current browser session and opens the building directory. No sign-in or
Alias is required.

## Technologies

- HTML, CSS, and vanilla JavaScript.
- Browser `sessionStorage` for isolated public demo state.
- Python standard-library HTTP server and SQLite for optional local development.
- GitHub Actions and GitHub Pages for static deployment.

No frontend package manager or external runtime dependency is required.

## Local development

### Try the isolated static demo

From the project root, build the Pages-ready static files and serve them:

```sh
python3 scripts/build_pages.py
cd _site
python3 -m http.server 8001
```

Open `http://localhost:8001/?demo=1` and select **Explore Norse Node** to use
the browser-only demo. Demo data is private to the current tab and is not
written to the SQLite database.

### Run the optional local API

The local API is for development only. In a separate terminal, run:

```sh
python3 Main_Files/Study_Server.py
```

It binds to `127.0.0.1:8000` by default and stores local data in
`Main_Files/norse_node.sqlite3`, which is excluded from Git and Pages builds.
When using the local API, serve the frontend from `http://localhost:8001/` as
above. Do not expose this unauthenticated development API to a public network.

The optional `NORSE_NODE_HOST`, `NORSE_NODE_PORT`, and `NORSE_NODE_DB`
environment variables override the local API's bind address, port, and database
path. Keep the API bound to loopback; these settings are not used by GitHub
Pages.

## GitHub Pages deployment

The Pages build contains `.html`, `.css`, and `.js` files, plus the root
`CNAME`, `favicon.png`, `robots.txt`, and `sitemap.xml` files needed for the
custom domain, site icon, and search indexing. It deliberately does not publish
the Python API, SQLite database, virtual environment, or local configuration.
Relative links are retained so the site works under a repository subpath.

1. Create a GitHub repository and add this project to it.
2. Push the `main` branch. The workflow at
   `.github/workflows/pages.yml` builds `_site` and deploys it to GitHub Pages.
3. In the repository's **Settings → Pages**, select **GitHub Actions** as the
   build and deployment source.
4. Wait for the **Deploy to GitHub Pages** workflow to complete and verify
   `https://norsenode.dev/` is configured under **Settings → Pages** and points
   to this deployment.

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
