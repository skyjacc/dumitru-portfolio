# Input and landmark fix verification — 2026-11-20

Target: local `http://127.0.0.1:8943`, current `site/entry-flow.js` patch.
Served entry-flow SHA-256: `88e5f1e1cdbbbb858e90cb3b6e6d2b8506950ae3cb124a19cf3587fb2b9bf85f`.

Results: **Chromium desktop 20/20 checks; WebKit touch viewport 11/11 checks; zero page JavaScript errors.** Only QA scripts/reports were authored by this review; runtime belongs to the parent task.

## Confirmed corrections

- **A1 — Home inside Contact email:** Clipboard API rejection exposes the selected readonly fallback address. After moving the selection to the end and pressing Home, Contact remains open, the input keeps focus, and the event reaches the window without `preventDefault`. Its selection exactly matches an isolated native readonly input in the same browser configuration.
- The native result differs by engine: Chromium moves the caret to zero; this WebKit build leaves it at the end (28). The portfolio matches both. An initial test assumed Chromium behavior for both engines; the corrected test uses the actual native control as its oracle. No runtime change was requested to force WebKit's caret position.
- Ephemeral `textarea` and `contenteditable` probes inside Contact retain the native Home behavior and scene/focus. These controls are test-only DOM additions and are removed before navigation or screenshots.
- Home focused on the external Contact navigation button still performs the global return to the studio.
- **A2 — main landmark:** Actual Chromium CDP `Accessibility.getFullAXTree` exposes exactly one nonignored `main` in Home, About, Contact, Process, Work and ANDRA Detail. Repeat checks after Contact → Home, Detail → Work and About toggle → Home also pass (nine observations). DOM-derived `ariaSnapshot()` was not used as evidence of inert filtering.

## Adjacent regressions

Both engines also pass: About photo 1 → 2; Escape returns to profile; About → Process → Work → ANDRA; material 1 → 2; Back returns to Work; Work → About and repeated About → Home; document horizontal overflow check. No design or asset changes were made.

Desktop 1440×900 and touch WebKit 390×844 at DPR2 were used. Tests use reduced motion to make settled-state assertions deterministic; they do not certify full-speed animation quality, physical iPhone Safari, or a screen-reader session. Touch hint/locales are verified separately by the parent task.

## Reproduce and evidence

```powershell
node qa/input-fixes-2026-11-20/accessibility/review.cjs
```

Optional `ORIGIN` chooses another server. `OUT` chooses a separate evidence directory (created automatically), preserving this local run. `PLAYWRIGHT_MODULE` can override the local package path.

`chromium-results.json` and `webkit-results.json` contain individual checks, native baselines, scene states, source hash and errors. `*-email-home.png`, `*-about.png`, `*-process.png`, `*-work.png`, and `*-detail.png` capture the settled UI. Contact screenshots were visually inspected: input text/focus remain visible within the phone; the existing torn-paper bezel and lower-screen cracks are unchanged.

The review follows the already retrieved Modern Web Guidance accessibility guide's native input and semantic landmark principles. This targeted pass validates the parent's bounded corrections rather than introducing a new design or accessibility subsystem.
