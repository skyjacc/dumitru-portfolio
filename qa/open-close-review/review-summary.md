# Opening and closing review — 2026-11-16

## Functional result

- Actual mouse/canvas review at 1440×900 and actual touch/canvas review at 390×844 covered ANDRA, BTB, FKD, ORA, Bonanza and the single About material. Each project had two opening/closing cycles, manual material changes, native central-plane close, UI Return, focused-wheel hold and direct-route entry/return.
- Normal canvas/UI return paths preserved the actual camera snapshot taken at opening. No unintended reopen occurred in the completed cycles. Camera values remained finite; no JavaScript errors were observed. Controls remained stationary across material changes.
- 320×568 covered the fragile ANDRA and About paths, their direct routes, route/history behavior and Info/X. About copy and Email/Return fit the viewport; selected materials and native side previews did not cover the own fixed controls.
- The original frozen matrix found Escape only blurred focused buttons. The subsequent UI-only fix passed 24/24 checks across 1440, 390 and 320: material buttons, site link, Return, About Email, Info priority and Index priority. Exact camera restoration was checked after the flight actually settled.
- The earlier actual 390 touch bug (tap a pin during Return overwrote the saved overview) is documented in interrupt-probe.json. The implementation agent's fix-interactions.json confirms successful physical repeat at 390/1440, deliberate pan handling, and route synchronization/Back/Forward. Desktop full-matrix repeat also passed.
- Later 390/320 moving-pin attempts were misses, not regressions: the event-time hit in hit-verified-return.json is `empty` throughout pointerdown/up/click, triggering normal empty-field pan. Do not count these as successful reopen tests or snapshot failures. Info/X passed in the 390 hit-audit run.

## Motion conclusion and limits

Functional navigation is verified. A blanket “no freezes” claim is not supported.

The original 513ms ANDRA interval crossed the measurement boundary and is excluded. In one isolated run, first/warm material 04 changes had max complete rAF intervals 8.4/5.2ms, no long tasks, and first native-present gap 44ms. In a later lightweight run (no per-frame deep geometry snapshot), real outliers recurred:

- About opening: active-flight rAF max 204.3ms cold and 158.4ms warm. Both surrounding camera samples were moving; these are not the renderer sleeping after settling. No JS long tasks were reported for these intervals.
- ANDRA material 04: first transition had a 328ms long task and a 385.1ms native-present interval; warm revisit max present interval 109.1ms.
- The long task starts at 16639.9ms, 311.9ms after that measurement window starts. Video readyState/currentTime and a JS stack were not collected, so decode versus texture readback is unproven.
- Renderer: ANGLE / NVIDIA GeForce RTX 4070 Laptop GPU / Direct3D11, not SwiftShader. Timing varies between runs. Headless desktop measurements do not certify performance on a physical phone.

Trailing idle time without native presents must not be counted as a stall. `active-motion-summary.json` distinguishes active camera intervals. Root owns any subsequent targeted performance mitigation.

## Evidence

- final-report.json: frozen desktop/mobile matrix, including the original Escape failure and later moving-target test interruption; its raw findings remain unchanged.
- short-report.json: 320×568 checks; the one moving-target miss is not a product failure.
- escape-verified.json: current UI fix, 24/24 passed after settled-camera comparison.
- fix-interactions.json: implementation agent's physical interruption/history verification.
- hit-verified-return.json: event-time hit audit proving the last tap missed, plus Info/X pass.
- targeted-final.json: first isolated media timing and premature fixed-delay return samples; the latter are superseded by escape-verified.json.
- isolated-motion.json, active-motion-summary.json, light-*.json: bounded motion measurements and renderer identification.
- {width}-{key}-selected.png: settled visual evidence. Main, UI and renderer hashes are recorded in final-report.json and escape-verified.json.

Only QA files were changed by this agent during this review.

## Follow-up: minimal motion instrumentation

Root requested a separate measurement without per-frame runtime/geometry snapshots, screenshots or polling during the two-second observation windows. `profile-clean.cjs` recorded only numeric rAF timestamps and buffered performance entries on the same RTX 4070 / ANGLE D3D11 renderer. Results in `profile-clean-clean.json`: About cold max 4.9 ms, About warm max 5.3 ms, first ANDRA material 04 max 16.6 ms; no long tasks, long-animation-frame entries or JavaScript errors. A separate short CPU capture also did not reproduce the earlier stalls. No application performance changes were made.

The earlier instrumented outliers remain recorded above; their cause was not proven. The clean follow-up supports smooth behavior in that run, not a universal device guarantee. Functional fixes and typography are unchanged after their verification.

### Verified source hashes

- `C:\Users\oblako\Documents\ChatGPT\New project\portfolio-ntch\site\portfolio-ui.js` — `fa5c78cef16f259c59d31b811e5f11a4264cd60360d5fbf6f3752c7fecd5e26c`
- `C:\Users\oblako\Documents\ChatGPT\New project\portfolio-ntch\site\_next\static\chunks\0n9xfy8bxft48.js` — `517b2281c9493a8f01bfccd770949cc1a4c2852b0854c5045d40be577994774d`
