# Board anchoring, material order and side controls

- The companion now projects its saved world position and proportional world size through the **rendered** camera, synchronously after native `drawBoard`. Passive camera movement no longer clamps it to the viewport or rewrites its world coordinates. Explicit drag/drop remains independent from board panning.
- The carousel's original alternating turn map `[0,1,-1,2]` caused Next to visit materials **1→2→4→3**. The bounded adapter now uses sequential turns for arrows, native swipe, neighbour selection and numbered thumbnails.
- Previous/Next retain their paper artwork and accessible native buttons, but sit at fixed viewport sides. Thumbnails and View site remain at the bottom; observers avoid the side controls.

## Local evidence

- `character/README.md`: **17/17** checks; 628 desktop and 498 trusted-touch rendered frames match an independent camera projection with 0 CSS px centre error. Pan, wheel, pinch, explicit character drag, resize and saved-position/camera return pass; detail observer is visible without overlapping artwork or arrows.
- `material-audit/README.md`: **67/67** checks across all five desktop projects, WebKit at390/320 and Chromium trusted touch. Next/Previous, wrap, direct third thumbnail, keyboard, rapid clicks and native swipe are sequential. Arrow positions remain fixed, icons clear the front image/header/footer, and screenshots assert real native pixels rather than only state indices.
- The first integration exposed a shadowed `fitScale` import in the new native event hook, which prevented canvas painting. Root moved notification to a module-scope helper; final runs have no browser errors and rendered screenshots were inspected. Initial failure reports remain labelled separately.
- `manifest.json` records the 268 publishable files. Only native1l2, `portfolio.css` and `studio-companion.js` changed; sources/adapters and QA stay local.

Browser emulation does not certify physical iPhone behavior.

## Published verification

https://dumitru-spatial-portfolio.vercel.app/ — deployment `dpl_SFrZALypCiFzuMTfDJHPY5rraZie` is READY with the production alias. `material-audit/public/after.json` records **19/19** public desktop/WebKit390 checks with no browser errors, including rendered-pixel assertions. `public-files.json` confirms **3/3** changed files match the tested manifest. The public desktop-third screenshot was visually inspected.

## Guidance

**carousel:** “The position is the slide's place in the original sequence, not its current visual position.” Native turn order now agrees with stable material numbers; HTML controls, existing names and focus handling are retained rather than replacing the spatial renderer with a scroll track.

**drag/motion:** The character retains pointer capture/grab offset and reduced-motion end states. Its transform is synchronized to the existing native draw event rather than a second permanent animation loop. Full applied quotes and verification are in `character/README.md`.
