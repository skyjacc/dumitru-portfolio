# Work gesture regression

Run from the repository root with `node qa/work-gesture-regression/review.cjs` while the local site is served on port 8943. `--quick` selects the former Home marker cases at 700/1400 ms and the explicit controls.

After the final native cleanup, `node qa/work-gesture-regression/review.cjs --quick --output final-controls-report.json` passed **20/20 checks**, with zero page errors or failed resource requests. This separate report verifies that explicit Home clears focus after high-zoom Work on desktop and phone, reveals the DOM Home screen, and keeps the header Home control visible. The original 52-check `report.json` was preserved byte-for-byte.

The pre-fix reproduction was a real Explore click at 1440×900, a 900 ms wait, then the pointer at **(634, 444)** with **deltaY −200 repeated 12 times, 70 ms apart**. After release, Work changed to Home. The preserved baseline in `report.json` includes the first `portfolio:nativehome` event stack: native gesture `settle` called the Home commit, then the entry shell emitted a second Home event while reconciling. The native magnet target still included Home, so a wheel/pinch settle could select it without a click.

Work gestures now must only pan or zoom: final `mode === 'work'`, `focusedKey === null`, and `workOverviewActive === true`, with no Home event or intervening project focus. Settled drag, wheel zoom-in, and pinch-out must also change the camera. Explicit case clicks must still open the case and return to the exact saved camera. The old native Home hit area and retired Help keyboard/bridge actions must stay inactive; the visible Home button must still reveal the DOM Home screen.

The completed full run passed **52/52 checks**, with zero page errors and no failed resource requests:

- 24 desktop wheel cases: delays 0/200/700/1400 ms after Explore, center/former Home marker/top-left canvas corner, and both signs of 12-event bursts.
- 20 phone cases: CDP touch drags and both pinch directions at those four delays, with extra settled cases covering all four drag directions and a second pinch position.
- 8 controls across desktop and phone: retired Home hit, retired Help, explicit BTB click and exact return, and the visible Home button.

The script freezes local JS/CSS/HTML/JSON/SVG source buffers at startup and serves those buffers through browser request routes for a consistent run. It records hashes of the entry/UI and both relevant native chunks, camera frames, navigation/entry/Home events, and native GESTURE/SETTLE/OPEN/HOME debug messages. Instrumentation is confined to the browser response; source files are not modified. Phone gestures are synthetic Chrome DevTools Protocol input in a touch-enabled mobile viewport, not physical-device measurements. Early input intentionally overlaps the entry transition; the 1400 ms cases verify settled camera changes. This is a behavior regression check, not a performance benchmark.
