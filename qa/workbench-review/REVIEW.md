# Workbench Home QA

Final result: **GO**, `personal-workbench-home-v2`.

- Reviewed full-size Home at 1440×900, 2560×1440, 390×844, 320×568 and 854×480 in EN / RO / RU. Intro, process note, laptop, sketchbook and proofs fit; no new text collisions. All navigation and language labels remain inside the viewport.
- The final targeted run records the same settled camera across all three locales at every viewport. All six Home layers stay at full scale over an eight-second idle sample; the inherited six-second scale pulse was removed after QA identified it.
- Desktop pointer movement changes layer positions. Reduced motion records zero position changes and full scale for all six layers.
- Initial interaction sweep: all five projects and About opened and returned to the exact captured overview camera at 1440, 390 and 320 widths (18 cycles). After the pulse fix, BTB open/return was rechecked at 1440 and 390; both pass.
- No page errors, HTTP errors or failed resource requests in either sweep. Desktop/mobile project and About screenshots were inspected visually.

`report.json` preserves the complete initial sweep. Its 15 bounds warnings are the preexisting rotated help/contact sticker hit rectangles extending beyond screen edges; screenshot text and usable artwork remain visible. `summary.json` separates these observations from actionable failures. `stable-home-report.json` is the final v2 sweep, with final source hash, locale camera comparison, idle motion samples and reduced-motion results. Screenshots named `*-stable-home-*.png` show the final full-size composition.

The 13 actual preloaded Home assets total **2,626,263 bytes (2.63 MB)**. Laptop and sketchbook WebP files contribute **1,747,992 bytes** combined; each is 2048×2048. All Home image dimensions together imply **43.68 MiB** of uncompressed RGBA pixel surfaces before browser-specific image storage optimizations.

Observed native-scene WebGL level allocations, estimated as width×height×4 bytes, start around **25.76 MiB** at 1440 and **12.83 MiB** at 390; peaks during the full project tour were **100.06 MiB** and **106.53 MiB** respectively. These figures include the existing entire native scene and projects, exclude mipmaps/driver/framebuffer overhead, and are estimates rather than resident GPU measurements. Asset lists and all viewport readings are in `summary.json`.

Only QA scripts and evidence in this directory were authored by the review agent. Product changes were made by the Home implementation agent. No deployment was performed by the review agent.
