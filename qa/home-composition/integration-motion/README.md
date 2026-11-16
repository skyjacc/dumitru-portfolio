# Integrated motion review

Local target: `http://127.0.0.1:8943/`. Tests use isolated headless Chrome contexts, not the user's browser.

`check.cjs` completed **40/40 checks** before the About extension, covering desktop, phone, reduced motion, three Home arrangements, Work navigation, exact composition restoration, Process returning to Home or the current native Work camera, direct `/work/process`, rapid cancellation, and browser errors. This is navigation/state evidence; it does not claim a measured FPS or absence of every visual defect.

`phone.cjs` covers the subsequent phone implementation: only the phone moves, upright centered bounds, exact source restoration, interrupted opening, responsive remeasurement, direct `/work/despre`, and 10–30% visible prop bounds at the Process perimeter. It also saves intermediate opening frames and final-state screenshots. Its machine-readable results are in `phone-report.json`.

An initial phone run exposed stale safe-area geometry after navigation mounted. The controller now reads fresh safe geometry at focus and listens for `portfolio:safearea`; pending phone flights retarget smoothly. The updated report supersedes that initial failure.

The expanded desktop/390px/320px/landscape/reduced suite completed 59 checks with one direct-route failure: a CSS-hidden native controls row produced an inverted safe area (`bottom: -12`). Root fixed the zero-rectangle handling; the controller also validates the safe bottom. A targeted `direct-phone-probe.cjs` confirmed the repaired 390px phone stays centered inside y142–764.

`phone-followup.cjs` tests the final direct route plus the actual top Back button during the first 100ms of About opening. This exposed the navigation layer ignoring Back while entry was pending (API interruption already worked). Its final report records the result after that navigation correction.

Final targeted follow-up: **10/10 passed** after both fixes and the larger About safe region. At 390×844 the enlarged phone is x24.7–364.6/y155.8–810.2 within the safe y142–824 region. At 1440×900 it is 389×749px at x525.5/y105.5. Clicking the actual Back button during `zooming-phone` restores all source poses/progress exactly and does not reopen About later. See `phone-followup-report.json` and `direct-phone-fixed-*.png`.

Root owns the final broad review of all projects, localized copy, navigation styling and content inside the phone. These checks do not edit product code outside the composition controller.
