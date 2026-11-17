# Functional interactions audit — 2026-11-17

Read-only review of `cc6e2db` and the current production alias. No runtime, Git, deployment or external messaging changes. Evidence files live beside this report; scripts can be rerun from the repository root with Node. The installed Modern Web Guidance `stack-drill-down` guide was searched/retrieved to check browser-history, active-view and focus consistency; no implementation was changed.

## Verified defects

### I1 — P1: Tab opens projects instead of moving keyboard focus, including retired About/Process carousels

**Confirmed on production with isolated Playwright WebKit at 1440 × 900.**

Reproduce:

1. Open the portfolio fresh, wait for Home, then press Tab several times without Enter.
2. The focused element stays BODY; each key is `defaultPrevented=true`. Meanwhile hidden native `focusedKey` cycles ANDRA, BTB, FKD, ORA even though `portfolioEntry.mode` remains Home.
3. Enter Work with its visible pill and press Tab repeatedly.
4. Tab alone navigates `/work/andra` → `/work/btb` → `/work/fkd` → `/work/ora` → `/work/bonanza` → `/work/despre` → `/work/process`. Entry mode is `detail`, so the last two bypass the approved phone and authored Process. Native material strips are exposed, and visible canvas content can disagree with the selected surface. There is no Enter/Space activation.

Expected: Tab visits visible navigation, project and material controls. Activation explicitly opens the chosen item. Home should not navigate the hidden native scene, and retired personal surfaces must not be keyboard candidates.

Cause: the native window key handler `R` in `site/_next/static/chunks/0n9xfy8bxft48.js:1` (around byte 83950) prevents Tab, iterates `BOARD_PROJECTS.filter(canOpen)`, and calls `commitTo`. That list includes `despre` and `process`. Setting the native root inert in `site/entry-flow.js:82` does not stop its window listener. This matches the independent code diagnosis in `../completeness/findings.md` C4.

Evidence: `tab-repro.cjs`, `tab-repro.json`, `public-home-tabs.png`, `public-tab-opened-despre.png`, `public-tab-opened-process.png`. The screenshots include the unintended native control strips; the JSON records real key events, URL, focus and entry/native states. This was browser keyboard testing, not a screen-reader certification.

Suggested correction: scope native input ownership to the active section; preserve ordinary Tab focus traversal; require explicit activation; exclude retired native personal surfaces. Keep the approved visible navigation and do not restore the rejected project dropdown.

### I2 — P2: Browser Back changes the hidden project under Process, leaving the visible section out of sync

**Confirmed locally and on the public deployment in bundled Chromium at 1440 × 900.**

Reproduce:

1. Home → Work → ANDRA → Process.
2. Wait for the complete Process entrance; URL remains `/work/andra`, `mode=process`, native `focusedKey=andra`.
3. Press the browser Back button.
4. Process remains fully visible, but URL becomes `/` and native `focusedKey` is cleared.
5. Click the site's Back pill. It returns Work instead of the ANDRA detail that opened Process.

Expected: browser/OS Back and the in-app Back sequence should agree on the current scene and its return location. An invisible underlying project must not change while the Process screen remains unchanged.

Cause: `site/entry-flow.js:139-151` saves only a local `processReturnMode` and opens the DOM section without a corresponding history entry. `:153-160` restores that saved mode without reconciling native route changes. The reconciliation loop at `:284-290` explicitly skips Process and About; there is no custom-state popstate reconciliation. Native popstate still changes the hidden gallery.

Related observed phone behavior: ANDRA → About resets URL to `/`; browser Back leaves the site (about:blank in the isolated fresh-tab run), and browser Forward restores Home rather than the phone. This is the same missing custom-section history integration, not counted as a separate defect.

Evidence: `history-repro.cjs`; `local-history-repro/report.json`; `public-history-repro/report.json`; screenshots `01-process-over-andra.png`, `02-browser-back-while-process.png`, `03-app-back-after-browser-back.png` in both directories. Initial phone/browser-history evidence is in `probe.json` and `04-about-after-project.png` through `06-browser-forward-about.png`. Process rows were visually inspected and had opacity 1 after settling, so this is not merely an early screenshot of its entrance.

Suggested correction: reconcile authored and native state through one navigation/history boundary, preserving the opening context. Check Back, Forward, reload and deep-link entry for Home/Work/Detail/Process/About/Contact before releasing the fix.

## Usability observation, not a hard defect

### I3 — Different navigation requests during a scene flight are silently discarded

At 320px WebKit, pressing a different section 90ms after the first one always leaves the first destination selected, except About↔Contact, which correctly updates the requested phone view. Examples: Home → About → Work remains About; Home → Work → Contact remains Work. The page does not deadlock, and another press after the transition works.

This follows explicit pending guards in `entry-flow.js:124`, `:139`, `:163`, `:209`, and `portfolio-ui.js:112`. The behavior is stable, but the pills look available and give click feedback despite ignoring the action. Consider queuing/canceling to the latest requested destination, or making temporary unavailability clear. Do not count the 12 stable-race checks as proof that the latest requested destination is honored.

## Passing coverage

`races-phone.json` contains **38 checks passed in WebKit**, initially 320 × 640 with touch/DPR3, then resized to 844 × 390 landscape:

- Twelve real touch sequences across About/Contact/Process/Work with a 90ms overlap settle without deadlock or an inert visible section; the ignored-last-click usability limitation is recorded above.
- All six profile photos open individually and inner Back restores the profile.
- Contact copy succeeds and reports a result; inner Back restores profile. No email, Instagram message or form submission was sent.
- A rapid RU → RO → EN change ends with EN.
- Portrait → landscape while the phone is open preserves inner Contact/Profile navigation and outer Back.
- Every case, ANDRA/BTB/FKD/ORA/Bonanza, cycles material indices `0,1,2,3,0` using the visible next arrow, with no skipped third material.
- For all five cases, opening Process and using the site's Back restores the same detail when browser history is not involved.
- No page errors in the completed WebKit run.

Separate bundled Chromium desktop checks confirmed project browser Back/Forward, direct `/work/andra` and reload working. Direct `/work/despre` opens the approved phone. Invalid indexed legacy paths such as `/work/despre/1` and `/work/process/1` fall back inconsistently to Home or Work, but no current UI links to them; this is not escalated as a user-facing defect.

## Limits

- This is browser emulation, not an actual iPhone/iOS Safari run.
- The installed Chrome channel exited immediately in this environment; bundled Chromium and Playwright WebKit were used instead.
- The Chromium390 harness had repeated navigation/loader-wait timeouts even when its failure screenshot showed a usable Home. It did not complete the touch matrix. Those timeouts are recorded in `races-phone-chromium390.json` and are not asserted to be production failures. The parent audit separately owns mobile Chromium/visual checks.
- No new wheel/pinch/swipe quality claim is made from this slice; next-arrow sequence checks are specifically identified. Parent audit owns broader visual/keyboard checks, and other agents own performance/character motion/completeness.
- No code fixes were made as part of this audit.
