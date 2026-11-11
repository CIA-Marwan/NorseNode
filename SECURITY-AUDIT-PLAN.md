# Norse Node security audit plan

## Scope inspected

- Audit the current original-layout branch and compare it with the deployed
  `main` revision.
- Inspect all tracked HTML, CSS, JavaScript, Python, assets, build tooling,
  GitHub Actions workflows, and documentation.
- Trace login and user-controlled data through browser storage, local APIs,
  navigation, and external requests.
- Inventory external domains and identify what the Pages workflow publishes.
- Verify that the independent student-project disclosure is visible and that
  demo access cannot be mistaken for official NKU authentication.

## Findings and remediation

1. The login form can fall back to a browser GET submission if its JavaScript
   handler is unavailable, exposing the demo names and alias in the URL.
2. Keep the existing login layout and demo behavior, but remove native form
   submission as a fallback, use a visible text field for the public demo alias,
   and clearly warn visitors not to enter real NKU credentials.
3. Keep the Pages workflow, directory structure, local backend, demo
   functionality, and MIT license unchanged unless further evidence identifies
   a concrete security defect.

## Validation plan

- Build the existing static Pages artifact and inspect its contents for backend,
  database, configuration, or credential leakage.
- Check every local HTML link, stylesheet, script, image reference, and
  generated route for missing targets under a repository subpath.
- Exercise valid and invalid demo sign-in, including a no-JavaScript check that
  credentials are not submitted or placed in the URL.
- Run the available building, floor, and study-server browser flows and review
  console/network failures where browser tooling permits.
- Confirm the original folder layout, `LICENSE`, and deployment workflow remain
  unchanged. Do not commit or push; Google Safe Browsing status and review are
  controlled externally and must be checked in Search Console by the site owner.
