# Work input hint verification

20 November 2026, local `http://127.0.0.1:8943/`. Targeted validation of the input-aware Work hint in `site/entry-flow.js`; no application files changed by this QA task.

**Result: 113/113 assertions, 32 captured states, zero browser page errors.** This count includes exact copy, geometry, visibility, persistence and revision checks; it does not represent 113 distinct navigation routes. Both application file and QA script pass `node --check`.

Tested through the real language popover, with normal motion enabled:

| Browser | Viewport | Locales and persistence |
| --- | --- | --- |
| Chromium desktop | 1440×900, DPR1 | EN / RO / RU; each selected through UI and retained after reload |
| WebKit touch | 390×844, DPR3 | EN / RO / RU; each retained after reload |
| WebKit touch | 320×568, DPR3 | EN / RO / RU; each retained after reload |
| WebKit touch landscape | 844×390, DPR3 | EN / RO / RU; each retained after reload |
| WebKit touch landscape | 667×375, DPR3 | EN / RO / RU; each retained after reload |

Fine-pointer copy stays unchanged: `Scroll to zoom`, `Scroll pentru zoom`, `Колесо меняет масштаб`. Coarse-pointer copy uses `Pinch to zoom`, `Zoom cu două degete`, `Масштаб двумя пальцами`, with the same drag prefix in each locale.

On the same Chromium page, CDP `Emulation.setTouchEmulationEnabled` changes `(pointer: coarse)` from false → true → false. The Russian hint updates from wheel → two fingers → wheel without reload. This validates live media-query changes, not merely startup detection.

Every captured hint stays fully inside the viewport, with no text or document overflow and no interception of pointer events. The existing bottom-centre placement, colour and font treatment remain: 10px on desktop/844 landscape; 9px in portrait/667 landscape. Russian hint dimensions are 269.19×14px on desktop, 250×13px on portrait/667, and 276.88×14px at 844 landscape. The longest localized string fits all selected widths.

Screenshots inspected: desktop RU, mobile390 RU, mobile320 RU, landscape844 RU and landscape667 RU. Black spatial background, paper navigation, five project previews and the resident remain present. QA captures and JSON are ignored by Git; the runnable script and this report are retained.

## Separate visual observation

In both landscape overview screenshots, the lower ORA LENTĂ and BTB Mobilă labels visually touch/overlap while the overview projects are very small. This concerns the existing Work overview geometry, not the hint's text box. It is recorded outside the three selected input corrections; this QA did not establish that the hint patch created it and did not modify the layout. The hint itself remains clear of those labels and within its measured bounds.

## Reproduction and limits

```powershell
node --check site/entry-flow.js
node --check qa/input-fixes-2026-11-20/hints/review.cjs
node qa/input-fixes-2026-11-20/hints/review.cjs
```

`ORIGIN` can select another preview. `PLAYWRIGHT_MODULE` can select the local installed Playwright package. Results live under `captures/`.

Served `entry-flow.js` SHA-256 stayed unchanged throughout this run: `88e5f1e1cdbbbb858e90cb3b6e6d2b8506950ae3cb124a19cf3587fb2b9bf85f`. Browser emulation is not a physical-phone gesture test. Pinch mechanics, all scene transitions and all project layouts were not recertified by this bounded hint check.

An initial harness assertion incorrectly required a localStorage write when selecting already-default English. The application intentionally treats an unchanged locale as a no-op. The final test first changes to Romanian, then verifies English as an actual UI selection; no runtime correction was needed for that harness issue.
