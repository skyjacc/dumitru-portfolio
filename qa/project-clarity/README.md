# Project media clarity review

2026-11-16 · local build at http://127.0.0.1:8943/ · five portfolio projects.

The confirmed defects were low-resolution mobile screenshot sources and browser scrollbars baked into the FKD images. The sources were recaptured; gallery geometry and renderer memory limits were kept separate from source-image density.

## Changes verified

- **Five mobile previews:** fresh captures of the existing project sites at 390 × 844 CSS px, DPR 3, produce real **1170 × 2532** pixel screenshots. These replace the former 390 px-wide raster sources inside the SVG wrappers; they are not AI-generated or upscaled old images. WebP Q98 encoding reduces the five published wrappers to about 2.58 MB total.
- **Mobile layout stays 390 × 844:** SVG `viewBox`, logical runtime dimensions, labels and top-viewport framing remain intact. Intrinsic dimensions increase image density without enlarging the cards. The adapter preserves the authored Retina wrappers.
- **FKD desktop material refresh:** new DPR 2 captures of desktop **2880 × 2000**, request **2880 × 2820**, and summary **2880 × 2620** remove the baked scrollbar rails. The cover is regenerated from desktop at its existing **1400 × 972** size. Runtime logical frames are desktop 1440 × 1000, request 1440 × 1410, summary 1440 × 1310; the latter heights follow the complete current form layout, avoiding clipping or stretch.
- The current FKD request uses radio tiles and a model selector. Its demonstration data was retained; no form was submitted. Capture-only styles hide scrollbars without editing the public source sites. ORA's displayed dates reflect its current defaults. BTB's source WebGL illustration still has its own resolution cap, although surrounding DOM text is captured at DPR 3.

## Validation

| Run | Scope | Result |
| --- | --- | --- |
| Chromium baseline | All 20 materials at 390 × 844 and 393 × 620, touch/DPR 3 | 132/132 interaction/layout checks; confirmed baked FKD rails before correction |
| Chromium after | Five mobile materials and three FKD desktop materials at 390 × 844; FKD mobile at 393 × 620 | 44/44 checks across 9 settled views; six exact camera returns |
| Forced Canvas2D fallback | FKD request and mobile; WebGL contexts deliberately unavailable | 4/4 checks; navigation and exact return retained |
| WebKit local | All 20 materials at both mobile viewports | **52 UI checks pass.** Ten bitmap-instrumentation assertions have empty observations and are inconclusive, not evidence of a product rendering failure |
| WebKit targeted follow-up | Five native Retina decodes, ANDRA/FKD mobile views and exact return | 10/10 locally and 10/10 on the public production alias |
| Public release files | Ten changed files from the exact 266-file release inventory | 10/10 match by SHA1 and size |

After screenshots show clean FKD edges and improved mobile image detail. Chromium source decoding confirms the dimensions above; frame/source aspect ratios agree within 0.001. Captions and fixed controls remain in the viewport. No page errors, document horizontal overflow, or live vertical DOM scrollbar was found in the checked project scenes. The horizontal material selector intentionally scrolls.

WebKit's ten unsupported bitmap observations remain recorded in `webkit-local/report.json`. The targeted follow-up `retina-local.json` passes 10/10: all five SVGs decode at 1170 × 2532 in WebKit, ANDRA/FKD mobile materials render without live vertical scrollbars, exact return is preserved, and no JavaScript/HTTP errors occur. This report **does not claim complete high-resolution GPU texture validation** from that instrumentation. It also does not claim every assertion in the original WebKit report passed.

## Limits and guidance

These are browser-emulated tests, **not a physical iPhone test**. The fit preview still makes whole-page text small: mobile cards display at roughly 212 × 459 CSS px on 390 × 844, or 108 × 234 CSS px on 393 × 620. More source pixels cannot make every small letter readable at that display size. No separate enlarge viewer is present; `View site` remains the route to the full website.

Native canvas captions were readable but softer than DOM navigation. No separate repeatable caption defect was established. The existing DPR 2 / renderer allocation limits were not raised speculatively. Code-derived texture limits are documented separately and are not presented as measured GPU allocations.

Modern Web Guidance was consulted for responsive media/images, explicit intrinsic dimensions, aspect ratios and performance. Its guidance informed preserving layout size while improving source density and choosing modern image encoding. Publication is recorded in `../../DEPLOYMENT.md`; the exact release inventory is `manifest.json`, with the ten changed public assets checked in `public-file-check.json`.

## Evidence

- [Chromium baseline](chromium/NOTES.md), [after verification and screenshots](chromiumafter/NOTES.md).
- [Mobile capture provenance, encoding and adapter checks](assets/SOURCE.md).
- [FKD capture sizes, source changes and provenance](fkd-desktop/README.md).
- [Renderer/source investigation](code-notes.md); its original source-size table is explicitly pre-refresh.
- [WebKit UI/instrumentation results](webkit-local/report.json).
- [Targeted WebKit source decode and interaction check](retina-local.json).
- [Public WebKit smoke](retina-public.json), [public file hashes](public-file-check.json).
- [Retrieved responsive-design guidance](chromium/guidance.txt).

The initial WebKit runner's unsupported bitmap probe is retained in its original report for audit. The runner now checks intrinsic decoding instead; that correction was exercised by the targeted follow-up, without rerunning the unchanged full UI matrix.
