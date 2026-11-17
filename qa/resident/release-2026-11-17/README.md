# Public release smoke — 2026-11-17

Published source commit: [`094712410bfb606222080f136d11c294691c4a36`](https://github.com/skyjacc/dumitru-portfolio/commit/094712410bfb606222080f136d11c294691c4a36).

- User-facing URL tested: [dumitru-spatial-portfolio.vercel.app](https://dumitru-spatial-portfolio.vercel.app/).
- Immutable deployment: [dumitru-spatial-portfolio-eidkgs632.vercel.app](https://dumitru-spatial-portfolio-eidkgs632.vercel.app/).
- Deployment ID: `dpl_pR89m6zv1e42fjiupvyHUpd4tmrR`.

The bounded public smoke began after Vercel reported Ready and the production alias was assigned. It ran against the user-facing alias, not the local server or an intercepted response.

## Result

**52/52 assertions passed**, with no browser exceptions:

| Browser | Viewport | Result |
| --- | --- | --- |
| Chromium / installed Chrome, desktop | 1440 × 900 | 26/26 |
| Playwright WebKit, mobile/touch, DPR 3 | 390 × 844 | 26/26 |

The existing `qa/resident/scene-scope.cjs` exercised:

- Loading and the original Home character; no public pause control.
- Work → About → Back and Work → Process → Back. Excluded sections yield SVG visibility, fixtures, input and scheduler/animation frames.
- ANDRA, BTB Mobilă, FKD Auto Service, ORA LENTĂ and Bonanza: opening each project, changing its material and returning to the saved Work camera.
- Decorative resident input ownership in Detail and no stale project/material association after selection.

The release coordinator separately verified 23 deployed-file hashes: 20 changed files through the public alias and three key files through the immutable host. The public tests here complement that byte-level check.

## Visual evidence

`capture.cjs` captured Home, About, Work and ANDRA on both browser sizes. The mobile About capture was inspected: its profile copy is crisp, the current black phone and bottom cracked-screen treatment are present, and the earlier oversized scrollbar is absent. The mobile ANDRA controls/caption fit the viewport. The desktop Work capture shows the existing five-project space and restored rear-material noise. Work captures allow its entry fade to settle before the screenshot.

Generated evidence stays local under the repository's QA ignore policy:

- `public-scene-scope.json` — the public 52-assertion report.
- `captures.json` — capture origin, date, browser configuration and state.
- `desktop-{home,about,work,andra}.png`.
- `mobile-webkit-{home,about,work,andra}.png`.

## Repeat

From the repository root in PowerShell:

```powershell
$env:REVIEW_ORIGIN = 'https://dumitru-spatial-portfolio.vercel.app/'
node qa/resident/scene-scope.cjs
node qa/resident/release-2026-11-17/capture.cjs
```

This was a bounded publication smoke, not a second complete motion audit. The detailed geometry, contacts, gaze, interruptions and full 1× / 0.5× recordings are documented in [the local motion-correction report](../motion-correction/README.md). Mobile checks use WebKit emulation, not a physical iPhone. The deployment was read and exercised only; this QA pass changed no production data, runtime source or deployment settings.
