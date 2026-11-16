# Independent eye diagnosis

Read-only product investigation. Root owns implementation.

## Evidence

- `geometry.json`: actual localhost and live Kernjosh pointer positions, rendered rectangles and transforms; ten near/far directional poses each.
- `comparison.png`: paired original captures before root's correction.
- `pupil-metrics.json`: alpha-weighted source pupil geometry and clipping retention for original bounds.
- `proposed-radii.json`, `recommended-radii.json`:72-angle raster sweeps with0.925 pupil scale.
- `compare.cjs`, `metrics.cjs`, `radii.cjs`, `radii-more.cjs`: reproducible diagnosis.

## Findings

1. The animation timer is reset in each dirty pointer frame before progress is evaluated. With an event each rAF, progress is zero every frame; eyes move only after the pointer stops. Root independently reproduced continuous-trace ranges0/0. Bounds-only tests do not detect this.
2. Source files are byte-identical to the supplied320w reference WebPs; both320x252. There is no aspect stretch caused by the current SVG320x252 viewBox. Reference uses a25.75x20.72 outer image with `contain`, and a23.797px square inner image box also with `contain`; it shifts the entire inner bitmap together with an eight-direction percentage table.
3. Current motion radius13/14 native horizontal units means only0.93–1CSSpx movement, with48CSSpx distance falloff making close hover almost static. Reference horizontal change is about2.4px and does not diminish near the icon.
4. Current neutral calibration is good: raw alpha centers L(77.391,135.961), R(248.540,123.342); leftbase(-5,-9) yields(72.391,126.961), rightbase(0,0) yields(248.540,123.342). No neutral clipping. Original far-right clipping retains96.85%left/97.21%right; current masks are not the main cause.
5. Per-eye aim makes the eyes look in opposing directions when the pointer is between their centers. Reference aims the combined bitmap from the whole icon center. Use shared aim for its visual character.

## Recommendation supplied to root

- Replace restarting150ms interpolation with frame-rate-independent smoothing that advances every input frame; inverse SVG screen CTM is a robust coordinate mapping.
- Match outline width25.75px, scale each pupil0.925 around its own RAW alpha centroid, then apply existingbase and motion. Do not scale both around the320x252 image center.
- Aim both eyes from icon center; reduce near falloff from48 to18CSSpx.
- Both ellipses[19,40] native units give strong movement with minimum91.14%left /90.21%right retained silhouette across72 directions. At25.76px rendered width this is1.53px horizontal /3.22px vertical. Both[20,34] are a more conservative alternative (90.26% /90.40%).
- Proposed L[21,30],R[23,30] are too broad for the same threshold: minimum88.8% /86.3% at diagonal angles.
- Keep individual clips and reduced-motion/touch neutral behavior. Validate continuous movement, near-center gaze and signed movement while the pointer moves, not just final bounds after stopping.

Fresh Modern Web Guidance search `animate pointer interaction`; full `natural-interactions` read (`guides.md`). No product changes made from this agent.
