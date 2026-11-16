# Navigation and About reference evidence

Source: supplied local mirror and https://webdesign.kernjosh.com/, inspected 2026-11-16.

## Observed in Chrome

The standalone `probe.cjs` captures Home → About, About → Work, and Work → About. `browser.json` stores intermediate DOM bounds/transforms and timestamps. The phone grows from the original prop; switching between desk and phone modes returns through Home. Browser console errors: none during these runs. At 1440×900 the final phone frame is 405×750 at x517.5/y75.

## Verified in the supplied source

- `phone-source.js` (`ou`): fit the original prop to the final 540:1000 ratio, carry its rotation into a fixed floating DOM element, then move to the final frame in 0.85s (`power3.inOut`). Content fade starts at 0.4675s and lasts 0.35s. Close darkens contents for 0.18s then restores the prop in 0.7s.
- `coordinator-source.js` (`ad`): different modal groups await the previous close before opening. This is why Work→About visibly passes through Home. The phone prop has no About-click binding; the navigation owns that action.
- `hammer-source.js` (`Td`): exact hammer raster artwork, rotation −25° for the 0.22s lift, 80° at the 0.13s strike, back to 0° over 0.18s, 0.08s rest. Repeated taps gradually move the Work letters and stop after 14 strikes. Leave restores the label.
- `eyes-source.js` (`bd`): exact two layered raster eye drawings. Pupils interpolate the eight recorded direction offsets with 0.15s settling.
- `back-source.js` (`cd`): actual SVG path morph, not a rotated stock arrow. Eight normalized cubic segments morph into a 254-unit-long handwritten arrow in 0.55s. Idle rotation 13°, extended rotation 0°. Raster arrowhead is placed in an SVG marker. Exact path/marker geometry is preserved locally.
- `press-source.js` (`Ed`): source press/release values recorded for reference. Local press/release remains the responsibility of existing `studio-clicks.js`, to avoid competing animations.

Local `studio-nav.js` uses no additional animation library. Back SVG endpoints, artwork, eye offsets and hammer phase timing match the reference. GSAP named easing is approximated with cubic-bezier/WAAPI. Process and Contact currently reuse the exact illustrations without extra hover loops. Artwork and source attribution are recorded in `site/assets/nav-reference/SOURCE.md`.

## Local verification

`check-local-nav.cjs` checks desktop hover, restored idle, Process Back expansion, Home return, all three locales at 320px with touch, and reduced motion. `local-nav-check.json` records bounds/states. Screenshots: `local-nav-hammer.png`, `local-nav-back.png`, `local-nav-mobile-ru.png`.

Targeted visual corrections: Back's extended line stays light against the black canvas (dark hover pill); Work's measured label width is retained during letter splitting, avoiding a tiny kerning-driven navigation shift. Existing project/navigation handlers are preserved. The mounting observer disconnects after the UI appears. Eyes and path animation stop requesting frames when settled, and pointer-driven motion is disabled for touch/reduced motion.

Integration correction: Back delegates to the entry controller even while an opening transition is pending, so the controller can cancel its token. `check-early-back.cjs` sends trusted mouse/touch clicks 119–131ms after opening About or Process. All four combinations return Home with both panels hidden and remain there after three seconds. No delayed reopen or console error. Full event timestamps/states: `early-back-results.json`.

## Modern web guidance applied

Searched `animate interactive controls`, then retrieved `motion`, `accessibility`, and `performance` with skill version `2026_11_09-5bcc021b`; read retrieved guides in full.

- `motion`: “Always respect reduced motion preferences.” Runtime preference changes stop hover motion and restore a visible final state.
- `motion`: “Prefer to animate `opacity` and `transform`.” The hammer/eye/letter effects use transforms; only the specifically requested Back SVG morph changes its small path.
- `performance`: “DON'T cause layout thrashing.” Eye bounds are cached and invalidated on layout changes; there are no frame-loop bounding-box reads.
- `accessibility`: “Use `:focus-visible` when styling focus indicators.” Back is a native button with a visible focus outline, all artwork is decorative, and Work retains its translated accessible name while individual letters move.

This is a targeted browser check, not a claim of full assistive-technology certification.
