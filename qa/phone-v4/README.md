# V4 physical phone smoke — 2026-11-17

Bounded local review of the new powered-off phone photograph, aligned glass/island layers and updated screen geometry. No runtime changes or permanent test harness were added for this review.

| Environment | Functional/geometry checks passed |
| --- | ---: |
| Chromium 1440×900 | 11/11 |
| Chromium touch 390×844 | 11/11 |
| WebKit touch 320×640 | 11/11 |
| Chromium touch landscape 844×390 | 11/11 |

The Home phone uses a responsive **v4** export, and About upgrades to the full-size **v4** photograph as intended. The physical glass and opaque island both use the current image source; `mix-blend-mode:lighten` is active on the glass and both layers have `pointer-events:none`.

About → photo → Back → Contact → Home passed in each context. Footer and contact actions remained reachable, screen content had no horizontal overflow, the island avoided the handle/Back/footer controls, and the return restored the saved Home phone rectangle within 1 CSS pixel. No uncaught browser errors occurred.

Reviewed Home, profile, photo and Contact screenshots: bottom-left fractures stay aligned to the body and rotate with it in landscape; the island remains opaque and the text stays readable. Short landscape retains its fixed footer and internal scroll area. About↔Contact changes the inner screen without relocating the phone.

Local ignored evidence: `<environment>-home.png`, `-profile.png`, `-photo.png`, `-contact.png`; `reviewed-report.json` contains the 44 functional/geometry results. `report.json` retains the raw first-pass observations. Its exact-URL assertion was too strict because the expected responsive-to-full upgrade changes the URL; the reviewed report evaluates the recorded sources as the same v4 image family instead.

A raw desktop RAF velocity threshold also produced an outlier during shared-host scheduling. One bounded replay (`desktop-flight-probe.json`) showed animation progression without a position reset; callback velocity is retained as informational evidence, not a frame-rate guarantee. No additional performance benchmark was run. This is browser emulation on localhost, not physical-device or deployment verification; scratch scripts are in the OS Temp directory.
