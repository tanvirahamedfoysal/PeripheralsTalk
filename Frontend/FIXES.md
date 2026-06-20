# PeripheralsTalk Frontend — Fixes in this version

- Fixed the React warning caused by updating `PublicShell` from inside the state updater of `PeripheralSidebar`.
- Converted the sidebar to a controlled component with a single source of truth.
- Added `public/logo.png` and configured it as the browser-tab favicon.
- Replaced “Category API data” with the actual category name.
- Removed visible REST endpoint paths from category pages.
- Removed duplicate raw backend-error JSON blocks.
- Added a single clean unavailable/error message for category and article requests.
- Corrected availability badges so placeholder or failed responses show `Unavailable`, not `Available`.
- Preserved the supplied API whitelist and did not add any undocumented endpoint.
