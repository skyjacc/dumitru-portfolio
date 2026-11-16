# Walking loader local verification

Run `node qa/walking-loader/review.cjs` from the repository root with the local site on port 8943. The six scenarios run sequentially: desktop, phone with Work wheel smoke, reduced-motion phone, failed Home image, native readiness blocked with the seven-second Enter button and keyboard guards, and 320 px viewport bounds.

Final corrected-source verification: **6/6 scenarios and 67/67 assertions passed**, with zero page errors and zero requests for the old paper-cut MP4/WebP.

The initial run found a transient frame −1 in every animated scenario: the first animation-frame timestamp could precede the loader's start timestamp. The implementation now clamps elapsed animation time and frame delta to zero. That initial report was overwritten before a separate baseline copy was requested; no reconstructed baseline JSON is provided. `report.json` records the subsequent full rerun against the corrected source hashes.

The check records resource readiness, the two-second minimum, all five poses and their cadence, walking speed, the static parked figure over 650 ms, delayed Enter behavior, and old paper-cut media requests. Browser response overrides are limited to the Home image failure and blocked native-readiness scenarios. No runtime files are changed or deployed.
