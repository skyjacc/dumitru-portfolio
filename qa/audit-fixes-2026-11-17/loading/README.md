# Loading and media corrections — 2026-11-17

Scope: LOAD-01, PERF-01 and PERF-02 from `qa/full-audit-2026-11-17/loading/findings.md`. Existing paper artwork, loader animation, HD motion files, desk layout and project material order remain unchanged.

## Changes

- Both HTML shells contain an independent recovery bootstrap. A failed `entry-flow.js` resource/runtime error or an 18-second stalled bootstrap shows localized retry, email and the five verified external project destinations. It removes the original loading keyboard guard and preserves normal keyboard links. The normal `portfolio:loaderhandoff` removes the recovery state and timer. `scripts/adapt-entry-shell.cjs` embeds `scripts/entry-recovery.js`, so shell regeneration keeps the protection and refreshes destinations from the catalogue.
- The laptop density exports keep their original dimensions and **identical alpha pixels** while their RGB uses reviewed WebP quality 94. The original 1254px lossless artwork remains the authoring source. A new optimized 1254px density serves large/DPR screens; the existing responsive preload and `<img>` share the same `srcset`/`sizes`.
- Initial Home does not fetch the five hidden native project covers. Their existing media gates release on the explicit Work/scatter/detail intent, retaining native noise/reveal and direct case routes.
- A critical image task timeout still releases the loader after ten seconds, but never reveals partial pixels. The laptop holds a complete 192px preview until the full responsive image decodes, including a late decode after timeout. Successful decode removes failure/placeholder state. Other cutouts remain hidden until decoded, with the existing failed-resource treatment.
- Mobile/coarse-pointer ANDRA rear videos retain their existing posters until that material is selected. The selected HD video waits until its poster request settles, avoiding bandwidth starvation of the buffering image; a failed poster still allows video recovery. The existing same-dimension WebP posters replace duplicate JPEG requests (118,068 B versus 286,599 B for bouquet; 22,924 B versus 77,172 B for bloom), and are shared with the paper thumbnails. The full HD video is unchanged. Moving away, About and reduced-motion behavior retain their pause safeguards. Desktop retains its prior material playback policy.
- `scripts/adapt-media-intent.cjs --check` verifies the bounded native edits and syntax. This adapter must follow catalogue regeneration.

## Payload and visual result

Controlled Chrome mobile 390×844, DPR 3, cold contexts, identical local gzip and `max-age=0,must-revalidate` HTTP policy:

| Measure | Pre-fix | Corrected |
| --- | ---: | ---: |
| Home resource transfer, excluding HTML | 3,729,407 B | 1,840,315 B |
| Selected 1024px laptop file | 1,199,150 B | 368,264 B |
| Laptop timeout preview | — | 13,262 B |
| Hidden case cover requests on initial Home | 5 | 0 |
| MP4 requests before selecting a video in ANDRA on mobile | 2 | 0 |

Home resources fell **50.7%**; the 1024px laptop file fell **69.3%**. `compare-payload.cjs` serves pre-fix shell/entry/media/laptop files from commit `cc6e2db` against the corrected checkout, leaving the remaining resources common to isolate these changes. This is a lab transfer comparison, not field Core Web Vitals.

I inspected the original and q94 laptop at full density, the mobile before/after screenshots and the actual ANDRA poster/selected-video screenshots. The torn paper edge and keyboard detail remain clear. `check-alpha.py` confirms exact alpha equality at 256, 384, 512, 768, 1024 and 1254px. Only a slow/failed main-image download temporarily shows the intentionally lower-detail preview; the late-decode screenshot confirms replacement by the sharp full image.

The regular development server intentionally sends `no-store`, and can duplicate the image request when paper-fold CSS uses the decoded URL. Its uncompressed byte total must not be compared directly with Vercel. The controlled comparison uses the same revalidation/compression policy for both versions.

## Browser checks

`review.cjs` runs the actual site and records states/screenshots under this directory:

- Chrome mobile and WebKit mobile: Home, Work, ANDRA cover/posters, explicit HD bouquet selection, About pause, reduced-motion pause; no page errors.
- Chrome desktop: same sequence, preserving desktop media behavior; no page errors.
- Blocked entry controller: independent recovery, five destinations, email, Tab navigation, explicit retry to a successful normal loader handoff.
- Stalled entry script: independent 18-second watchdog and usable recovery.
- Held laptop response beyond the loader timeout: preview, hidden incomplete bitmap, then successful late-decode replacement.
- Slow-mobile test uses 150ms latency / 200,000 B/s downlink. Passed: the unchanged HD video buffers with its sharp poster visible, then plays when data arrives; About and reduced motion pause it. It does not require an 8.7MB file to start within a fixed 4.5-second window. The initial 4.5-second assertion was a test-harness assumption corrected to wait for actual playback. Visual inspection also caught the native JPEG poster competing with the MP4; the final poster-gated WebP run fixes that starvation and its capture shows the bouquet throughout buffering.

Reproduce from the repository root with the local server running:

```text
node qa/audit-fixes-2026-11-17/loading/review.cjs mobile
node qa/audit-fixes-2026-11-17/loading/review.cjs mobile webkit
node qa/audit-fixes-2026-11-17/loading/review.cjs desktop
node qa/audit-fixes-2026-11-17/loading/review.cjs fail-entry
node qa/audit-fixes-2026-11-17/loading/review.cjs stalled-entry
node qa/audit-fixes-2026-11-17/loading/review.cjs held-laptop
node qa/audit-fixes-2026-11-17/loading/review.cjs slow-mobile
node qa/audit-fixes-2026-11-17/loading/compare-payload.cjs
python qa/audit-fixes-2026-11-17/loading/check-alpha.py
node scripts/adapt-media-intent.cjs --check
```

`PLAYWRIGHT_PATH` can override the local Playwright installation. Captures and JSON are local evidence excluded by the repository's existing QA archive policy; this written result and runnable checks are tracked. WebKit emulation is not a physical iPhone/Safari performance measurement.

## Modern Web Guidance

- `optimize-image-priority`: I preserved the matching high-priority responsive laptop preload and delayed hidden native covers until Work intent: “Never use `loading="lazy"` on the LCP image.”
- `lazy-load-video-and-audio`: I kept detached canvas media on an explicit selected-material gate, since viewport lazy-loading cannot observe detached players and is unsupported in Safari: “Always respect `@media (prefers-reduced-motion: reduce)` before autoplaying motion media.”
- `performance`: I retained the HD file and sharp poster while deferring its bytes until actual selection: “DO use `preload="none"` for non-critical videos”.
