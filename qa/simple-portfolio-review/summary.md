# Simple portfolio integrated review

Read-only review at 1440×900, 390×844, and 320×568.

All five projects opened through the actual Lucrări menu. One alternate material was selected for each project at every size. Project camera and controls remained stable; focused wheel input did not switch the project/material; visible controls stayed inside the viewport. ANDRA additionally remained on the selected material during a 4.5-second idle interval at every size.

About contains one concise visible biography. Its material controls are hidden. The E-mail anchor resolves to the user's actual address; the test prevented the default mail-client action. Return restores the saved camera. No page errors, failed HTTP requests, or obsolete generated hero object/video requests were observed.

## Resolved test-sampling discrepancy

The initial full report marked the first 320×568 ANDRA return as false because it compared against an earlier sample taken while drag inertia was still progressing. The native snapshot is taken later, when the project opens.

Only that scenario was repeated. `short-return-report.json` confirms the actual opening snapshot, returned camera, and later stable camera are identical:

- x: 309.1700861126351
- y: 808.2498205496057
- zoom: 0.55

This was a test baseline error, not an application return bug. The reusable test now compares against `returnCamera`. The original `report.json` is preserved unchanged for traceability; use it together with `short-return-report.json`.

Screenshots of selected ANDRA, the short-screen BONANZA view, and About were visually inspected. Selected content and controls fit; side materials are intentional previews.

No product files changed during this review.
