# Final navigation integration

Production: https://dumitru-spatial-portfolio.vercel.app/

`integration.cjs` performs trusted desktop clicks and mobile taps at 1440×900 and 390×844. It waits for actual entry/camera readiness, records runtime state and checks resources. Product files were not changed during these checks.

| Run | Result | Evidence |
| --- | --- | --- |
| Local assembled UI | 70/70 | `integration.report.json` |
| Local project/menu Escape | 2/2 | `integration.menu-escape.json` |
| Anonymous production contexts | 70/70 | `integration.public.report.json` |

Coverage: initial Loading → Home; EN/RO/RU through the new language popover; Process → About → Work; all five projects; next/previous material; saved-gallery-camera return; early Back during About opening and About → Work; document overflow; JS/HTTP/request failures. No errors were recorded. No iframes were present, so iframe containment is not an embedded-content certification; the projects use the native canvas renderer.

The additional Escape check opens the language menu while ANDRA remains focused. Escape closes only the menu, returns keyboard focus to its trigger and keeps the project open on desktop and touch contexts.

Screenshots are `integration.[desktop|mobile]-*.png` and `integration.public.[desktop|mobile]-*.png`: Home, settled language menu, Process, About, Work, ANDRA/Bonanza materials and final Home. Public desktop menu and mobile Home/Process, plus local About/material compositions, were visually inspected. Selected content fits the viewport and the language popover is readable after its entry animation.

For future public checks: set `REVIEW_ORIGIN` (or `BASE_URL`) and `REVIEW_SUFFIX=public` before running the script. Reports record the origin and current product SHA256 values. These are Chrome desktop/emulated-touch checks; physical phones and other engines are not covered.
