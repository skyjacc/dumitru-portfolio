# About clarity: independent WebKit verification

Installed only Playwright WebKit 27.2 (build 2388). All checks used actual WebKit on Windows with iPhone user-agent, touch enabled and mobile viewport emulation. This is not physical iPhone Safari or the original in-app browser.

## Final result

- **142/142 checks pass** after the font minima patch: 390×844 and 393×620, each at DPR 1 and DPR 3, EN/RO/RU.
- Effective biography size: **15.31px** at 390×844; **14.00px** at 393×620.
- Tagline: **11px**; secondary copy: **12px**; name: **24.50px / 20px**.
- Combined ancestor/inner transform scale is approximately **1.000001**, with text laid out at its displayed size rather than tiny glyphs magnified afterward.
- HTML screen stays within the paper phone. Key copy does not overflow horizontally. No document horizontal overflow.
- Short profile content remains reachable through its native scroll container. Photo tap, photo Back and scene Back pass in all locales/viewports/DPRs.
- No AI mention in the profile copy. No JavaScript errors.

## Additional issue fixed and verified

At 393×620 in RO, scrolling to Instagram and then Home→About retained scrollTop 66, clipping the name/handle at the top. Root reset only the new scene entry to scrollTop 0.

Focused recheck: **6/6 pass**. New About entry starts at 0 with handle/name visible. Photo 6 is loaded (640px source), displays inside the phone, and its Back preserves the previous profile scrollTop 66. The photo Back target is about 44.5×44.5 CSS px.

## Evidence

- `webkit-report.json`: final full matrix and measured geometry/font sizes.
- `webkit-check.cjs`: reproducible main verification.
- `webkit-baseline-report.json`: earlier staged run, including the old 12.99px short-view text. Superseded by the final report.
- `webkit-390x844-dpr1-en.png`: normal-scale profile screenshot.
- `webkit-reopen-fixed-profile.png`: final short RO profile after reopening.
- `webkit-reopen-fixed-photo.png`: actual photo 6 and controls in the short phone.
- `webkit-reopen-fixed.json`: focused 6/6 recheck.
- Earlier `webkit-reopen-scroll.json/png` document the corrected scroll issue.

Screenshots from the full matrix preceded the final entry-scroll reset; use the `webkit-reopen-fixed-*` pair as the final short-view reopening evidence. No further product changes were made by this reviewer. All WebKit sessions closed.
