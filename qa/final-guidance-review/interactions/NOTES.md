# Final interaction review — 2026-11-16

Scope: latest local `http://127.0.0.1:8943/`; navigation, interruption, project/history restoration and motion lifecycle. Product was read-only until root authorized one confirmed fix in `site/studio-nav.js`. No redesign or geometry changes.

## Confirmed bug and bounded fix

Dynamic `prefers-reduced-motion: reduce` while Contact was hovered stopped the heartbeat but left the pupils at their last offsets (approximately13 and14 SVG units), rather than resetting them to neutral. This reproduced on a fresh browser after30,100 and500ms. Listener instrumentation in `media-listeners.json` showed the late nav change listener was not delivered while its MediaQueryList `.matches` was being polled by animation callbacks. Existing hidden-document reset correctly cleared the same state.

Fix: keep `reducedMotion` as a local value initialized before mount, refreshed when mounting, and changed by the media-query event handler. `canMove()` and Back feedback use that value. The handler performs the existing complete neutral reset. No new animation, selector geometry or styling was added.

Fresh `lifecycle.cjs` recheck: both pupil offsets remain `[0,0]` at30/100/500ms; heart, Process, eyes and Back report no running loops. Restoring no-preference and re-entering Contact starts the pulse again. `node --check site/studio-nav.js` passes.

## Passed interactions

`check.cjs`/`results.json`:
- 22 rapid or interrupted transition scenarios across desktop1440×960 and mobile390×844 emulation: repeated About/Process at80ms and settled; Work→Back at80ms; Work→About→Back; About→Work→Back; Process→About→repeat; Work→Process→Back; reduced-motion activation during About flight and return.
- All expected mode, pending, panel visibility, composition phase and inert states settle correctly. No late reopening observed.
- All five projects opened from Work and returned to Work: ANDRA, BTB, FKD, ORA, Bonanza. Camera delta at most2.3e-13 world units; zoom delta0.
- Browser Back returns from ANDRA detail to Work; Forward restores ANDRA detail. Screenshot `history-forward.png` visually confirms the correct scene.
- Fresh direct `/work/andra`, `/work/btb`, `/work/fkd`, `/work/ora`, `/work/bonanza` visits all open the requested detail and return inside the portfolio to Work at `/`.
- No pageerrors.

`touch-taps.cjs` additionally used real emulated touchscreen tap events for early repeated About, repeated Process, and Work→Back; all three return Home without pending state or late reopen. The larger22-case run used pointer clicks at mobile geometry.

## Hidden document limitation

Headless Chrome kept `document.hidden=false` and `visibilityState=visible` while activating a second tab and after a freeze/resume command; the tested CDP page-visibility override was unavailable. I did not treat those as a real background-tab test. A controlled document.hidden/visibilityState override plus `visibilitychange` event exercised the actual product handler: all nav motion stopped and pupils became neutral. The override existed only in the disposable test page, was removed afterward, and was never written to product code. Physical-phone and real background-tab behavior remain outside this run's evidence.

## Modern Web Guidance

Fresh skill search/retrieve completed for motion, stack-drill-down, directional-navigation-transitions. Full965-line guide output was read from `C:/Users/oblako/AppData/Local/Temp/mwg-guide-65708-1794803870630.md`.

- `motion` shaped the bounded reset fix: “Keep the final state” and “Always respect reduced motion preferences.” The updated preference event now settles every illustration at its resting state instead of retaining a partial eye offset.
- History/inert/restoration principles from stack-drill-down guided the tests; its scroll-snap implementation was not introduced into this existing spatial renderer.
- Directional transition principles were reviewed, with no unrequested replacement of the established camera mechanism.

Artifacts are confined to this folder. Browsers created by these scripts are closed. No machine shutdown or deployment was performed by this agent.
