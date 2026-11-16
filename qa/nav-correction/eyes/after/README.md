# Final independent verification

Current root implementation verified read-only in Chrome at 1600×900, device scale factor 4. No product files changed by this agent.

`check-after.cjs` uses real mouse input after the loader is complete, captures nine directional poses, follows a continuous 72-point path, and dynamically toggles reduced motion. `validation.json` records each sample. All six checks pass.

- Continuous movement now advances while the pointer moves: pupil range 36.55×20.29 SVG units. The original implementation stayed at zero during continuous input.
- At ±6 CSS pixels from the shared center, left/right offsets are approximately −6.65/+6.62 SVG units; up/down approximately −11.29/+11.24. Both pupils move together, without crossing each other near the center.
- Distant horizontal positions approach ±20 SVG units; vertical positions approach ±34. The near/far screenshots show a clear change in gaze, with pupils contained within the outlined eyes.
- Dynamic reduced motion resets both offsets to zero and stops the animation frame. Returning to no preference resumes tracking after the next pointer event.
- A dedicated `reduced-visual.cjs` run confirms both the neutral SVG transforms and the painted neutral result, before and after another repaint. See `reduced-confirm.png` and `reduced-repaint.png`.

Timing detail: Playwright's `emulateMedia` completion does not mean the page's media-query `change` handler has run. The test awaits that actual event before testing resumed motion. An immediate pointer event could otherwise be reset by the subsequently delivered change handler. This was a test-ordering issue, not a persistent tracking failure.

The original reference uses a hand-tuned eight-direction translation table; this implementation intentionally has a bounded shared vector instead. Its directional behavior is clearer and its pupil silhouette remains over 90% retained across the earlier 72-angle raster sweep. This is not a claim of pixel-identical motion to Kernjosh.
