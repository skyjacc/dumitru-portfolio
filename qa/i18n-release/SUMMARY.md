# EN / RO / RU release check

Result: **81 / 81 passed**, 27 checks at each viewport: 1440×900, 390×844 and 320×568.

Evidence: `report.json`, `release-qa.cjs`, matching screenshots in this directory.

Checks include English default regardless of browser locale; EN/RO/RU selector order; Romanian/Russian changes and persistence; all five projects and exact return; live locale changes without changing selected BTB material or camera; translated control labels; single-material About and stable camera; Escape return; Info closing without immediate reopening. No JavaScript errors or failed asset requests.

Root reviewed desktop English Home and narrow Russian About screenshots. The release file snapshot was compared against recorded hashes before upload/deployment. Public deployment verification is recorded separately in `../vercel-release/public-check.json`.
