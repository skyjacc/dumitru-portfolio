# Pills / phone interaction QA

Status: requested behavior passes after the Back and focused-arrow fixes.

Environment: local http://127.0.0.1:8943, Chrome, 1440 × 900 and touch/mobile 390 × 844. Existing `helpers.settle` used; camera comparisons use epsilon 1e-6. No per-frame instrumentation. The initial full run exposes the existing hit-test function only for one native About-grid check. Product files were not edited.

## Covered

- All five original cases (Andra, BTB, FKD, ORA, Bonanza) reached via Work list; About and Process reached via pills.
- Every opening records the prior camera. Escape from a focused bottom control returns to that saved camera.
- Wheel gestures in an open view preserve content selection and camera.
- About reports 7 states: Profile + 6 photos. All six desktop bottom photo controls work; all six mobile next-arrow selections work; Profile returns to state 0. Desktop native grid photo 2 also selects correctly.
- Process reports 5 states. All five steps select correctly on desktop and mobile.
- About/Process focused-control Left/Right change only the surface index; the native material index and both cameras remain stable.
- EN / RO / RU changes preserve view, selection, camera and saved return camera in all seven views. UI text and accessibility labels match each locale dictionary, including Process titles, Profile and all photo labels; no translation-key fallback was found.
- Help click-close and focused Escape stay closed, without reopening.
- Both full runs have zero JavaScript/console errors and zero failed resource requests.

## Fixes verified on fresh page contexts

1. **Repeated Back interrupted the return camera.** Initially reproduced in desktop Andra/FKD/Process and mobile ORA/About/Process. After the fix, all six combinations pass at both 45 ms and 180 ms between taps/clicks: 12/12 checks, exact saved-camera restoration within 1e-6, view remains closed.
2. **Original-case arrows ignored a focused UI button.** After the focused-arrow update, fresh desktop and mobile Andra tests pass Right and Left from `#next-material`: exactly one material changes, camera and return camera stay stable. The generic native-arrow path also passed all five cases with canvas focus.

Settled bottom Next buttons pass for all five cases on both sizes (10/10). A supplemental probe clicked Next only 350 ms after another material change and was ignored during transition; after allowing 1100 ms, all intended next selections pass. This timing probe is preserved in raw retest data and is not counted as a current failing requirement.

## Evidence

- `report.json`: initial complete matrix, 205 assertions, including the pre-fix failures.
- `retest.json`: 12 repeated-Back passes, 10 native-arrow passes, plus the 10 early-transition click probes described above.
- `final-controls.json`: 14/14 fresh-context checks pass (4 focused arrows, 10 settled Next buttons); no page errors.
- `review.cjs`, `retest.cjs`, `final-controls.cjs`: reproducible scripts.

SHA-256 source versions are stored in each JSON report. Root owns visual/layout screenshots; this pass focused on interaction state and camera invariants. Old unused About intro SVG assets were not exercised; the current surface paths were loaded by the actual UI.

At completion, portfolio-ui.js and both native JavaScript chunk hashes still match final-controls.json. portfolio.css changed while the final controls run was in progress; root is checking those visual/layout changes independently.

## Final return interruption follow-up

Root's final UI adjustment replaces the local close latch with a guard on the native focused key. This permits closing a project opened while an earlier return is in progress. `reopen-return.json` passes8/8 combinations: desktop/mobile, reopening ANDRA or opening BTB/About/Process180ms into return, then closing to the original saved camera. The12 double-Back45/180ms checks were repeated and still pass. The final UI hash is in `qa/surfaces-release/manifest.json`; it supersedes the earlier final-controls UI hash. Native chunks are unchanged. Final public verification is in `qa/surfaces-release/public-check.json`.
