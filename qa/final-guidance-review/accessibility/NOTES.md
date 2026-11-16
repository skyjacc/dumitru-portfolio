# Final guidance review — keyboard and accessibility

Completed 2026-11-16 on http://127.0.0.1:8943/. Product files were not edited by this reviewer. Root fixed the three issues below; this review independently reproduced and rechecked them.

## Result

- **282/282 assertions pass** across desktop 1440×900, mobile 390×844 and 200% reflow-equivalent 720×450 at DPR 2.
- **39 axe-core 4.14.0 audits**, WCAG 2A/2AA/2.1AA/2.2AA tags: no reported violations.
- Keyboard opening, materials, popup isolation and return for all five projects pass in all contexts.
- EN/RO/RU update HTML language, titles and controls. Escape/Home/End and arrows stay owned by the active menu/photo/scene.
- Hidden/inert scenes do not retain keyboard focus. About content Tab order is six photos → Instagram → Home.
- Portrait-mobile controls meet 24 CSS px minimums in the audited DOM bounds. The reflow equivalent now uses the sideways phone layout with 14 CSS px biography and 44 CSS px controls.
- No JavaScript errors during the final matrix.

## Findings fixed by root and verified

1. **P2 — fast Enter→Escape closed the About photo under an open language popup.** Ten consecutive attempts reproduced it. `aria-expanded` lagged native `:popover-open` because the toggle event is asynchronous. Root changed the photo guard to actual popup state. Ten immediate Enter→Escape attempts now keep the photo open, close only the popup and restore its trigger.
2. **P2 — removed Help remained a dead keyboard action.** `[data-help-link]` remained focusable in Work, but Enter opened no help. Root added it to the existing legacy-control guard. Recheck: hidden=true, inert=true, tabIndex=-1 and aria-hidden=true.
3. **P2 — Home intro flashed during Work→project fade.** Work set intro opacity 0, but Detail removed that rule while its parent was still fading for 600 ms. Root keeps intro/desk labels hidden in Detail. Recheck caught parentOpacity 1 with introOpacity 0 at the start of Detail: no flash.

No remaining substantiated issue from this scoped pass.

## Evidence

- `report.json`: final 282 assertions, 39 axe outputs, bounds, labels and Tab stops.
- `review.cjs`: reproducible final matrix.
- `escape-race-recheck.json`: ten immediate popup dismissals after the fix.
- `last-fixes-recheck.json`: hidden Help and intro opacity during transition.
- `about-content-tab-order.json`: real sequential photo/Instagram navigation.
- `focus-return-recheck.json`: all five cases on desktop/mobile restore Work focus within the 100 ms UI update cycle; observations at 300 ms all pass. Initial immediate assertions were timing artifacts, not additional bugs.
- `mobile-no-ghost-intro.png`: corrected transition. Current matrix screenshots show final states.
- `before-final-fixes-report.json`: earlier audit retained for traceability.

## Modern Web Guidance

Fresh searches: `review keyboard accessibility`, `support zoom reflow`. Retrieved and fully read `accessibility` and `responsive-design`, saved to `guidance.md`. No legacy-scan.

Rules used to assess findings:
- accessibility: “Manage focus correctly to and from updated content.”
- accessibility: “Don't apply `tabindex="0"` to static, non-interactive, and hidden elements.”
- responsive-design: “Viewport units don't grow when users zoom”.

Limits: headless Chrome with actual DOM keyboard events and mobile emulation. No NVDA/VoiceOver or physical phone. Axe supplements interaction checks; it does not certify complete accessibility. 200% was emulated by halving CSS viewport dimensions and using DPR 2 for a 1440×900 screen, not by controlling Chrome's browser zoom setting.
