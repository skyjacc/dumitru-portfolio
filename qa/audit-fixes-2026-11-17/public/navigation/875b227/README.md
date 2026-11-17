# Final release navigation smoke — 2026-11-18

Tested the production alias `https://dumitru-spatial-portfolio.vercel.app/` after runtime commit `875b227765ab53e584a35aa9b3d1974e32949b9c` was deployed. Immutable deployment: `https://dumitru-spatial-portfolio-7ipzrh9sl.vercel.app/`.

| Browser | Viewport | Result |
| --- | --- | --- |
| Chromium | 1440 × 900 | 35/35 passed; 0 page errors |
| WebKit, touch/DPR3 | 390 × 844 | 35/35 passed; 0 page errors |

Fresh browser contexts, reduced-motion functional smoke. Covered keyboard activation, five project descriptions across EN/RO/RU, section history/reload, rapid navigation, Work toggle and camera return. Existing normal-motion local evidence and earlier public evidence remain unchanged.

`asset-provenance.json` confirms byte-for-byte matches for four published runtime files. Final native `1l2px902fb04m.js` SHA-1 is `d02fe1cd9a9fbd180ce22778d8fceb160c05601e`, matching the requested final release. No runtime edits were made.

This is browser emulation, not a physical iPhone run. These functional checks do not establish video visual quality or normal-motion smoothness.
