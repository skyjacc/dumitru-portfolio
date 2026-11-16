# Project clarity — Chromium mobile baseline

Chrome/Chromium, touch emulation, DPR 3, 390×844 and 393×620. These are browser-emulated viewports, not physical-phone tests. All captures wait for loader completion, scene settling, and material animation settling. Only QA files changed by this reviewer.

## Baseline checks

`baseline-report.json`: **132/132 interaction/layout checks passed** across 40 material views (five projects × four materials × two viewports). All ten project returns restore the saved camera. No page errors, document horizontal overflow or live vertical DOM scrollbars in the project scenes. The horizontal material selector is intentionally scrollable and reveals the selected tab.

Native click on the front material closes the current project and returns to Work. There is no separate enlarge control or larger viewer in the current UI; screenshots are the maximum standard carousel presentation. The `View site` link remains available. No external sites were opened or modified by this reviewer.

## Confirmed visual finding

**FKD assets contain baked browser scrollbars.** The clearest case is `390x844-fkd-3.png`: a light vertical rail and gray thumb are inside the mobile screenshot. The same source artifact is visible more subtly in FKD desktop, request and summary screenshots (`393x620-fkd-2.png`). The runtime reports no scrollable DOM element in these scenes, and the rails move with their image plane. Fix the image captures, not portfolio scrollbar CSS. Root and asset owner have been notified.

## Quality observations and limits

- Native canvas captions are softer than the DOM navigation in settled screenshots, but remain readable. The main canvas has a 2× backing buffer at emulated DPR 3; caption rasterization also records 2× texture transforms. This alone does not prove a rendering defect or justify raising the allocation cap. Renderer diagnosis remains with root.
- Desktop screenshots display at approximately 221–222 CSS px wide; they are whole-layout previews, not readable live pages. Tiny text inside them must not be reported as accessible/readable merely because the original image is large.
- Mobile previews display at approximately 212×459 CSS px on 390×844, and 108×234 CSS px on 393×620. Fine text on the short-screen preview is consequently too small to read as page content. This is the fit-preview size limit, separate from the source-resolution issue. No zoom was available to verify a larger rendering.
- Project-control DOM fonts are 11 CSS px. Their bounds remain inside the viewport in all tested materials. This is a recorded size, not an invented accessibility minimum/failure.
- Draw logs record internal font sizes in renderer coordinates; these are not directly claimed to be final CSS text sizes.

## Evidence

`review.cjs` uses the actual navigation/material buttons and native runtime geometry. Its read-only draw instrumentation records font texture transforms, media dimensions where exposed and main canvas backing size; it does not modify application source. Screenshots are named `{width}x{height}-{project}-{materialIndex}.png`.

Modern Web Guidance `responsive-design` was freshly searched/retrieved (`guidance.txt`). The review distinguishes fit scale from image resolution and checks the viewport bounds; no product implementation was changed by this reviewer.
