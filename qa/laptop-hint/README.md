# Laptop hint and silhouette QA

Final local verification: **235 checks passed, zero failures and zero page errors**. See `report.json` and `check.cjs`.

Tested Chromium at 1440×900, 390×844 and 320×568, and Playwright WebKit at 854×480. Mobile and WebKit checks use touch emulation, not physical-device Safari. Each covered all three Home compositions and EN/RO/RU labels. Labels remain in the viewport without greeting overlap; final screenshots confirm handwritten copy beside the existing arrow, wrapping on small/short viewports.

Trusted pointer/touch checks cover three transparent-margin points, prompt and arrow, screen and keyboard, Enter/Space activation, and shared Back restoring the same composition. A separate desktop run verifies normal-motion click and Back; the repeated matrix uses reduced motion.

The initial WebKit run found touch adjustment moving a margin tap from (468,356) to a synthesized click at (455,343) on the laptop. `webkit-touch-before.json` records that failure; `webkit-touch-probe.json` confirms the final pointer-origin guard keeps the same tap on Home. Real laptop taps continue to open Work.

Screenshots: `{desktop,mobile,narrow,short-webkit}-home{0,1,2}-{en,ro,ru}.png` (36 final captures), plus `normal-motion-returned.png`.

Public verification at `https://dumitru-spatial-portfolio.vercel.app`: **11 smoke checks passed** with no page errors. Desktop Chromium verifies English copy, laptop click and Back; 390×844 WebKit verifies transparent margins, genuine laptop tap, Back and Russian copy. See `public-report.json`, `public-desktop.png` and `public-phone-webkit.png`.

Run locally with:

```powershell
node qa/laptop-hint/check.cjs
```
