# Navigation corrections — 2026-11-17

Implemented I1, I2, I3 and C1 from the full audit, retaining the existing visual layout and section transitions.

- Native keyboard input is owned only by Work/Detail, yields to buttons/links/inputs and the focused character, leaves Tab unhandled, and excludes retired `despre`/`process` entries. Real project links participate in the normal focus order. Their compact focus-visible label appears only for keyboard focus; no Work dropdown was added.
- The entry controller owns browser history for Home, Work, Detail, Process, About and Contact. Work/Process/About/Contact use `/?view=...`; cases retain `/work/<key>`. Process stores its return scene, camera and selected material. Popstate restores the visible scene and focus without adding entries. Reload/direct routes and legacy About/Process aliases resolve to their authored interfaces. The native history writer **and native popstate callback** explicitly yield to this owner; stopping propagation alone was insufficient because the retained runtime can defer an event callback.
- Different section requests during a flight are retained as the latest intent and replayed after the current handoff. Repeating the active section remains a toggle. Back and new history traversals invalidate stale asynchronous work with the existing generation token.
- The real selected-case h1 and description follow the native selection and EN/RO/RU, including on section settle. The five-link HTML list is retained in Work. It is hidden/inert in Detail so the selected case is the meaningful main content.
- History snapshots are deduplicated and throttled; a stable page does not continually write history. Exact outgoing state is saved before authored navigation and canvas pointer activation.

## Verification

Local public-equivalent app at `http://127.0.0.1:8943`, own isolated browser processes:

| Run | Result |
| --- | --- |
| Bundled Chromium, 1440×900, normal motion | 35 checks passed, no page errors |
| Playwright WebKit, 390×844, touch/DPR3, normal motion | 35 checks passed, no page errors |
| WebKit history interruption/direct-route suite | 27 checks passed, no page errors |
| Application Back during initial About/Process restoration | 2 checks passed; subsequent Contact updates URL and settles |
| Selected material → Process → reload → Back | ANDRA material 4 restored; actual h1 ANDRA |

The first two runs exercise actual Tab/Enter, all five case descriptions in all three languages, Process Back/Forward/reload, About/Contact Back/Forward/reload, five rapid cross-section requests, repeated Work toggle and saved camera return. Cases in the locale loop are opened through the same entry API; the initial ANDRA opening specifically uses real keyboard activation of its HTML link.

The extra suite exercises browser Back during all four section approaches, new navigation during Forward, Back→Forward during phone retreat, application Back during Process entrance, the four query routes, two legacy aliases, all five direct case URLs and their return. Direct-route checks use reduced motion after the normal-motion interruption cases.

`selected-case.aria.txt` is the browser accessibility snapshot of the main content: selected-case h1 and description, not the former generic Home biography. `material-history.json` records the additional material restoration check. Keyboard screenshots were visually inspected; the focus label is legible and does not require a persistent menu.

`app-back-during-restore.json` verifies cancellation of the initial About or direct Process flight with the application Back button. Both return Home; a subsequent Contact request settles with `?view=contact`, confirming cancellation clears the history-restoration guard rather than suppressing later URL changes.

Some early harness iterations were corrected (reload waits initially read a not-yet-created global; a Forward Work test initially expected activation instead of the approved same-button toggle). A real Chromium failure exposed the delayed native popstate callback; the explicit ownership guard fixed it, and the completed Chromium report is the successful rerun. Do not count those exploratory failures as passing checks.

## Reproduce

```
node scripts/adapt-navigation.cjs --check
node qa/audit-fixes-2026-11-17/navigation/review.cjs
```

`ENGINE=webkit PHONE=1` selects the mobile run. `history-races.cjs` defaults to WebKit. Both accept `ORIGIN` and `OUT`; `review.cjs` also accepts `REDUCED=1` for a quicker post-publication smoke without overwriting this normal-motion evidence. Playwright is resolved from an installed package or `PLAYWRIGHT_MODULE` (the current host fallback is in the harness).

## Guidance and limits

Applied Modern Web Guidance `search "manage browser history"` → `stack-drill-down` and `search "navigate with keyboard"` → `accessibility`; retrieved/read both guides. Relevant principles: one history/active-view boundary, no pushState inside popstate, inert inactive scenes, preventScroll focus restoration, ordinary native link activation, and real headings for selected content. The guide's scroll-snap stack was not substituted for the approved spatial camera.

This is browser keyboard/accessibility-tree checking, not physical iPhone testing or VoiceOver/NVDA certification. Performance measurements, complete motion choreography and responsive fit are owned by the other review slices. The authored source is `entry-flow.js`/`portfolio-ui.js`; durable native changes are in `scripts/adapt-navigation.cjs`, reapplied by `adapt-behavior.cjs` after rebuilding its public bridge.
