# FKD desktop material refresh

Captured the actual public concept at https://fkd-concept-cluj.vercel.app/ on 2026-11-16. Only the four assigned WebP files in `site/assets/projects/fkd/` were replaced. No public website changes or form submissions were made.

## Result

| Asset | Browser CSS viewport | Encoded pixels | WebP bytes |
|---|---:|---:|---:|
| desktop.webp | 1440×1000 | 2880×2000 | 392,982 |
| request.webp | 1440×1410 | 2880×2820 | 295,044 |
| summary.webp | 1440×1310 | 2880×2620 | 300,504 |
| cover.webp | derived from desktop | 1400×972 | 161,492 |

The native layout metadata should retain desktop `[1440,1000]` and use request `[1440,1410]`, summary `[1440,1310]`; intrinsic image pixels contain DPR2 density. The cover keeps its original size/aspect. Product metadata changes belong to the parent/other worker and are not made here.

All three previous screenshots had a visible baked native scrollbar on their right edge. Capture-only CSS hides native scrollbars in the new actual browser snapshots. CSS viewport width is now fully 1440px instead of 1425px content plus a 15px scrollbar. No content is cloned, composited, artificially enlarged or sharpened.

## Current source difference

The public FKD form now uses large brand radio tiles and a model selector; the old request image used a brand dropdown. The parent was informed before replacement and approved using the current actual layout. Keeping the original demonstration sample `Volkswagen Golf 7 / 2018` requires the existing `Alt model` + custom model field. No live UI was redesigned for this capture.

The original 1260px-high request viewport would cut off the year/helper/footer button. The capture therefore uses1410px, showing the full form with27px clear space below its bottom. The summary uses1310px, showing the complete card with31px below. Header and section positioning match the prior composition: section begins at80px, form at374px. Main hero retains the previous1000px height.

## Verification

- All page images loaded and decoded, fonts ready before capture; zero broken images.
- Both form states contain the original demonstration data; no actual appointment is booked.
- All browser requests other than GET/HEAD were blocked as a capture guard; none were attempted.
- Full request and summary borders/controls are visible; right edges have no baked scrollbar.
- Desktop, request and summary were visually inspected via their review PNGs.
- The four originals were preserved unmodified under `original/` before overwrite.

## Reproduction

Run `node qa/project-clarity/fkd-desktop/capture.cjs`, then `python qa/project-clarity/fkd-desktop/export.py` from the portfolio root. The encoder uses Pillow WebP quality94/method6 and only downsamples the cover. `current/provenance.json` records viewports, DPR, positions and sample inputs; `current/export.json` records final sizes and SHA256 hashes. Review PNGs are smaller viewing derivatives of the browser captures, not the production source.
