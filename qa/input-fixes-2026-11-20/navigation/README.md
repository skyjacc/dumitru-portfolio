# Navigation regression after input fixes — 2026-11-20

Local origin: `http://127.0.0.1:8943`. Existing test executed unchanged: `qa/audit-fixes-2026-11-17/navigation/review.cjs`.

Tested working-tree `site/entry-flow.js` SHA256: `88e5f1e1cdbbbb858e90cb3b6e6d2b8506950ae3cb124a19cf3587fb2b9bf85f` (base commit `5ae0bd5`). Runtime was not modified by this regression pass.

| Browser | Configuration | Result |
| --- | --- | --- |
| Bundled Chromium | Desktop 1440 × 900, DPR 1, normal motion | 35/35 passed; no page errors |
| Bundled WebKit | Touch viewport 390 × 844, DPR 3, normal motion | 35/35 passed; no page errors |

## Coverage

- Tab navigation in Home/Work and Enter activation of a project.
- All five projects' semantic heading/description in English, Romanian and Russian.
- Process, About and Contact state/URL restoration with browser Back, Forward and reload.
- Rapid About → Work, Work → Contact, Process → About, About → Process, Work → Process changes: final intent wins.
- Second Work activation cancels the pending approach.
- Returning from a project preserves the saved Work camera.

Reports and screenshots are in `chromium-desktop/` and `webkit-phone/`. Each contains `report.json`, `keyboard-focus.png`, and `work-final.png`. WebKit final Work screenshot was visually reviewed: all five project fronts, navigation, and character remain visible in the touch viewport.

## Reproduce

PowerShell, from the repository root:

```powershell
$env:ENGINE='chromium'
$env:PHONE='0'
$env:REDUCED='0'
$env:OUT='qa/input-fixes-2026-11-20/navigation/chromium-desktop'
$env:ORIGIN='http://127.0.0.1:8943'
node qa/audit-fixes-2026-11-17/navigation/review.cjs

$env:ENGINE='webkit'
$env:PHONE='1'
$env:OUT='qa/input-fixes-2026-11-20/navigation/webkit-phone'
node qa/audit-fixes-2026-11-17/navigation/review.cjs
```

Limits: these are browser automation and touch-viewport results, not a physical iPhone run or measured device frame-rate claim. Error collection covers `pageerror`, not a full console/network audit. Specific A1/A2/V3 fix assertions are covered by the separate input/accessibility verification; this pass checks adjacent navigation regressions.
