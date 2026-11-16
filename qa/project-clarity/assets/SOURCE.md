# Retina mobile project previews

Captured on 2026-11-16 from the same existing public project pages linked in `site/portfolio-data.json`:

- ANDRA: https://andra-floral-concept.vercel.app/
- BTB Mobilă: https://btb-mobila-concept.vercel.app/
- FKD Auto Service: https://fkd-concept-cluj.vercel.app/
- ORA LENTĂ: https://ora-lenta-concept.vercel.app/
- Bonanza: https://bonanza-concept-cluj.vercel.app/

No page content or public site source was edited. No forms were submitted. These are fresh browser renders, not AI-generated or enlarged legacy images.

## Capture procedure

`capture-mobile.cjs` uses independent headless Chrome contexts at **390 × 844 CSS pixels, DPR 3**, mobile/touch enabled. It waits for the page load, web fonts, visible images and six seconds for source-site initialization. Reduced motion is requested from the initial load; this makes ANDRA use its real bouquet poster and avoids capturing a changing animation frame. Videos and any remaining document animations are paused only in the capture page. The page is at scroll position `(0, 0)`.

Native scrollbars are hidden with a temporary injected style **only for the screenshot**. The capture does not alter the live source. Screenshots are saved at **1170 × 2532 pixels** without resizing. CSS-size captures are also saved for composition comparison.

Each `*-capture.json` records timestamp, URL, response status, viewport, DPR, image/font/canvas state and request/page errors. All five sources returned HTTP 200, fonts loaded, and no failed requests or page errors occurred.

## Framing comparison

`before-sheet.png` shows the actual top-viewport composition of the former SVG wrappers. ANDRA's original embedded image was a 390 × 1897 full-page screenshot, cropped by its SVG to the top 844 pixels; the other four were already 390 × 844. `after-sheet.png` shows the new captures at the same CSS size.

The source compositions remain the same: same hero heading, page layout, principal photograph/illustration and scroll position. Relevant differences:

- **FKD:** the old 15 CSS-pixel native scrollbar is gone, so its layout now uses the full 390 CSS-pixel viewport. The text wraps naturally at that width; no pixels were painted over or stretched.
- **ORA:** the live site's date defaults currently show November 20–22, 2026 instead of the former November 13–15. Its native date control rendering also reflects the current mobile Chrome context. No dates were submitted or altered manually.
- **ANDRA:** captures the same front-facing bouquet poster with its paused/play control. The original full-page `mobile.webp` is preserved.
- **BTB:** its existing assembled kitchen pose is unchanged. The source site itself caps its WebGL canvas at **624 × 1350** (approximately DPR 1.6). The page's DOM/text is rendered at DPR 3; the capture cannot create absent WebGL detail. No runtime/source patch was made to the BTB site.

## Encoding and published files

`encode-mobile.py` encodes the source PNGs as **WebP quality 98, method 6** and embeds the results in only these existing published files:

| Asset | Embedded WebP bytes | Published SVG bytes |
|---|---:|---:|
| `site/assets/projects/andra/mobile-preview.svg` | 279,964 | 373,649 |
| `site/assets/projects/btb/mobile-preview.svg` | 170,180 | 227,267 |
| `site/assets/projects/fkd/mobile-preview.svg` | 407,176 | 543,253 |
| `site/assets/projects/ora/mobile-preview.svg` | 664,782 | 886,715 |
| `site/assets/projects/bonanza/mobile-preview.svg` | 410,994 | 548,325 |
| **Total** | **1,933,096** | **2,579,209** |

All wrappers have intrinsic size **1170 × 2532** and retain `viewBox="0 0 390 844"`, the existing image positioning, role, ARIA label and title. Runtime geometry remains 390 × 844. The `data-preview-capture="retina-3x"` marker prevents `scripts/adapt-data.cjs` from overwriting these authored previews with the original low-resolution files; unconverted previews keep the existing fallback behavior.

The lossless PNG captures and pixel-verified lossless WebP archival masters stay in this QA directory. They are not extra published payloads. Publishing the lossless embedded variants would have cost 9,053,249 bytes; Q98 reduces that to 2,579,209 bytes. Actual-pixel text-edge comparisons for **all five projects** were visually inspected in `q98-text-comparison-3x.png`; the Q98 previews retain sharp text at the native DPR 3 capture scale.

Existing `site/assets/projects/*/mobile.webp` originals were not modified; their original SHA-256 values are recorded and checked by the encoder. `encoded-metadata.json` records final asset hashes and dimensions.

## Verification and reproduction

From the portfolio project directory:

```powershell
node qa/project-clarity/assets/capture-mobile.cjs
# Visually compare the new screenshots with the stored before previews.
python qa/project-clarity/assets/encode-mobile.py
node qa/project-clarity/assets/check-assets.cjs
```

The encoder uses retained `*-before.svg` files as the label/framing authoring templates. Re-capture followed by encoding regenerates the authored previews; reapplying catalogue data alone deliberately preserves them.

`check-assets.cjs` independently verifies browser decoding of all five local SVGs as 1170 × 2532. It also runs the actual adapter's bounded preview function in an isolated QA fixture: marked Retina data stays byte-identical, legacy fallback still generates 390 × 844 wrappers, and `--about-only` does not overwrite previews. `node --check scripts/adapt-data.cjs` passes. The full data adapter was not run against the shared product while other agents were editing it. The root agent owns native gallery/WebKit integration checks.

### Modern Web Guidance

- **`performance`**: I retained explicit intrinsic dimensions and the existing logical aspect ratio, and used modern WebP encoding without resizing the fresh browser capture. The applicable rule was “DO apply explicit `width` and `height` attributes”; this avoids trading a sharper texture for changed layout geometry. Responsive `<picture>` markup is outside this canvas-backed asset change.
