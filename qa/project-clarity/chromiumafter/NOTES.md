# Chromium project media: bounded after verification

Date: 2026-11-16. Local site: http://127.0.0.1:8943/.
Read-only product review; only this QA directory was written. Chrome touch emulation, DPR 3; this is not a physical-device test.

## Scope and result

- 390 x 844: all five mobile previews, plus FKD desktop, request and summary.
- 393 x 620: FKD mobile preview.
- Main run: **44/44 checks passed across 9 settled views** (`report.json`, `review.cjs`).
- Forced Canvas2D fallback: **4/4 checks passed**, FKD request and mobile (`fallback-report.json`, `fallback.cjs`). WebGL context requests were denied to verify the fallback actually ran.
- Six exact camera returns; no page errors, document horizontal overflow, or live vertical DOM scrollbar found.

## Media findings

All five mobile SVGs now decode at **1170 x 2532**. FKD assets decode at **2880 x 2000** (desktop), **2880 x 2820** (request), and **2880 x 2620** (summary). Runtime frame aspect ratios match source ratios within 0.001; the changed FKD frames are not stretched.

Visual inspection confirms the baked FKD browser rails and large thumb are removed. The request image contains the updated radio cards. Mobile image edges and prominent lettering are cleaner; ANDRA, BTB, ORA and Bonanza retain their intended crop and proportions. Native project captions and fixed controls remain inside the viewport. Canvas2D fallback also displays the clean FKD mobile image and preserves navigation/return.

Representative evidence:

- `390x844-fkd-1.png`: updated request cards and clean image edge.
- `390x844-fkd-2.png`: summary aspect ratio and caption spacing.
- `390x844-fkd-3.png`: clean mobile preview.
- `393x620-fkd-3.png`: shorter viewport.
- `390x844-andra-2.png`, `390x844-btb-3.png`, `390x844-ora-3.png`, `390x844-bonanza-3.png`: remaining mobile previews.
- `canvas2d-fkd-1.png`, `canvas2d-fkd-3.png`: forced fallback.

## Limits

These are fit previews, not a full-size website reading view. The mobile source displays at about 212 x 459 CSS px on the normal viewport and 108 x 234 CSS px on the short viewport. Small text baked into the website screenshots is consequently not guaranteed readable; the separate View site link remains the full-site route. No enlarge mode or deployed build was tested here. The main renderer's existing DPR cap was not changed.

This is an after check for the same Modern Web Guidance responsive-media review; the retrieved guide and baseline evidence remain in `../chromium/guidance.txt` and `../chromium/NOTES.md`. No further full baseline matrix was repeated.
