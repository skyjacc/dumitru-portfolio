# Published navigation refinement

Production: https://dumitru-spatial-portfolio.vercel.app/

Vercel deployment `dpl_G1WPECwEzDoVqHnPy7nQqauj8cHf` is READY. Immutable URL: https://dumitru-spatial-portfolio-laqjqyocr.vercel.app/. The 262-file [manifest](manifest.json) matches the local snapshot at deployment. [48 public file hashes](public-file-check.json) match the served HTML/JS/CSS, vendor modules, original cloud, new desk art and About photographs.

## What changed

- The actual original `loading.webp` is back. English displays the untouched original image. RO/RU display the same bitmap contour and droplets, mask only the old lettering and overlay translated text; the rejected hand-traced outline is gone. [Loader screenshots and observations](loader/observations.json).
- Process now follows the original hover controller: resting angle 150 degrees, 720-degree inertial turn over 2.8 seconds, quintic easing, continued motion on leave. [Reference inspection and notes](NOTES.md).
- Each original pupil has its own stationary interior-eye clip. Each tracks the pointer from its current screen center, including after locale/layout changes. [Direction captures](desktop-eyes-contact.png), [69 checks](checks.json).
- One language nav pill matches the other controls and opens English / Română / Русский. Whole labels roll vertically using [Motion's ready rolling-label pattern](https://motion.dev/docs/text-animation#rolling-text-hover) and its actual self-hosted MIT animate library. [Implementation, alternatives and sources](language/README.md).

## Verification

- [Language component](language/report.json): 64/64 on desktop, mobile390, small320 and reduced motion; settled images and manual older-browser fallback checked separately.
- [Local integration](integration.report.json): 70/70 on desktop1440 and emulated touch390. Additional project/menu Escape checks: [2/2](integration.menu-escape.json).
- [Public integration](integration.public.report.json): **70/70**, anonymous browser contexts. Loading/Home, Process, About, language picker, all five projects, manual next/previous materials, exact Back and interrupted transitions passed. No JavaScript, HTTP or unexpected request errors observed.
- Public screenshots: [desktop Home](integration.public.desktop-home.png), [desktop menu](integration.public.desktop-language-menu.png), [mobile Home](integration.public.mobile-home.png).

These are Chromium/emulated-touch observations, not a guarantee for every physical device or browser. Prior split-flap, redrawn-cloud and combined-raster-eye reports describe superseded UI.

## Modern Web Guidance

- `shaped-cutouts`: I mask only the decorative source image, with translated text outside the mask: “text layers outside the mask entirely”. [Guide](loader-guide.md).
- `motion`: I retain the translated final content if rolling motion is interrupted: “Keep the final state”. [Language notes](language/README.md).
- `performance`: I coalesce eye input and read geometry before changing transforms: “DON'T cause layout thrashing”. [Navigation notes](NOTES.md).
- `declarative-dialog-popover-control`: I use one invoker mechanism with a conditional polyfill/fallback: “Do NOT combine `popovertarget` and `commandfor` on the same `<button>`”. [Guide](language/popover-guide.md).
