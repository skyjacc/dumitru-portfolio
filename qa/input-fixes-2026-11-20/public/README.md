# Published release verification — 2026-11-20

Runtime release: `00c2c46a74b3aec8328b89c86e01068b8580a0fa`.
Tested alias: https://dumitru-spatial-portfolio.vercel.app/
Release deployment: https://dumitru-spatial-portfolio-f7yhek1xz.vercel.app/

The targeted browser pass used the public alias. Both engines downloaded `entry-flow.js` with SHA-256 `88e5f1e1cdbbbb858e90cb3b6e6d2b8506950ae3cb124a19cf3587fb2b9bf85f`, matching the locally verified runtime.

**Result: 37/37 assertions pass — Chromium desktop 23/23, touch WebKit 14/14. No page JavaScript errors.**

## Verified on the public site

- Contact → denied clipboard → selected readonly email fallback → Home: Contact stays open, input keeps focus, event propagates without `preventDefault`, and caret behavior matches a separate native control. Chromium moves to zero; this WebKit leaves the caret at the end, exactly as its isolated input does.
- Ephemeral textarea/contenteditable probes retain native Home behavior. Home outside an editor still returns to the studio. Test-only editors and the clipboard rejection exist only in the automation contexts.
- Chromium's actual accessibility tree contains exactly one exposed `main` in Home, Contact, About, Process, Work and ANDRA Detail, including three repeat return checks (nine observations). This uses CDP, not a DOM-derived ARIA snapshot.
- About photo 1 → 2, Escape back to profile, About → Process → Work → ANDRA, material 1 → 2, Detail Back → Work, Work → About and repeated About → Home all pass.
- Work hints are correct in EN/RO/RU for both mouse and touch: desktop text describes scroll zoom; mobile text describes pinch/two-finger zoom. Locale returns to EN before screenshots.
- No document horizontal overflow at the tested dimensions.

## Evidence

`accessibility/chromium-results.json` and `accessibility/webkit-results.json` contain individual assertions, source hashes, scene states and native input baselines. Both engines saved `*-email-home.png`, `*-about.png`, `*-process.png`, `*-work.png`, and `*-detail.png` into this directory's `accessibility/` subfolder. Desktop Work and mobile Contact captures were visually inspected; the approved composition, bezel and lower-screen cracks remain intact.

The run used desktop Chromium 1440×900 and WebKit touch emulation 390×844/DPR2 with reduced motion. It is not a physical iPhone/Safari or VoiceOver session and does not independently certify full-speed animation quality. The immutable deployment was identified by the release owner; this targeted interaction pass ran against the public alias.

## Reproduce

```powershell
$env:ORIGIN='https://dumitru-spatial-portfolio.vercel.app/'
$env:OUT='qa/input-fixes-2026-11-20/public/accessibility'
node qa/input-fixes-2026-11-20/accessibility/review.cjs
```

This public pass writes to a separate evidence directory; the prior local results remain intact. No runtime files, Git history, or deployment settings were changed by the reviewer.
