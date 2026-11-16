# Reference navigation artwork

These exact assets were supplied in the user's local reference mirror and reused at the user's explicit request. They were not generated or represented as original artwork.

Source: https://webdesign.kernjosh.com/
Local source: the user-supplied `site_recon/webdesign.kernjosh.com/assets/` mirror.

- `hammer.png`: `thickesthammer-Cf_rLkFR.png`
- `eyes-outer.webp`: `outereyes-320w-BBzT1jIP.webp`
- `eyes-inner.webp`: `innereyes-320w-BGec3zfU.webp`
- `arrowhead.png`: `arrowheadmain-BA9iU38T.png`
- `process.webp`: `processnew-320w-CTuGiEND.webp`
- `heart.webp`: `heart-39-320w-Ug5zDg89.webp`
- `click-burst.png`: `imagesnow/assets/09. Bursts/small/Burst (21).png` in the supplied mirror.

The Back SVG path, normalized morph endpoints, hammer timing/letter fall, Process rotation and press proportions were studied from supplied `main-CwptEoZ4.js` and pasted navigation DOM. The implementation uses WAAPI and scoped requestAnimationFrame, without shipping GSAP/MorphSVG. Process follows the original `wd()` behavior: initial rotation 150 degrees, then 720 degrees over 2.8 seconds with quintic ease-out on pointer entry; leaving preserves its inertia. Heart uses the original artwork. Dark/light inversion adapts the drawings to the existing theme. Press/release feedback belongs to `studio-clicks.js`.

Each original pupil is separately clipped beneath the original outline. Both share one aim from the icon center; pointer coordinates use the inverse SVG screen transform and frame-time smoothing. The pupil rasters are scaled to .925 about their measured centers, preserving their drawings. Pointer leave restores neutral and touch/reduced motion remains static. This supersedes the earlier combined raster/rectangular crop and restarted eye tween. Evidence: `qa/nav-correction/README.md`.

The subsequent navigation polish follows `xd()` for the two-beat heart pulse, `Ed()` for press/release proportions and `Od()`/`kd()` for the global one-shot bitmap click burst. Process keeps the verified rotation curve with the original intrinsic image aspect ratio. These animations stop for reduced motion; touch receives the one-shot click feedback without hover loops. The separate paper arrow beside the laptop is original generated artwork, not a reference asset.

- `process-circle.webp`: original `assets/Mittel (Circle (30))-320w-BvM2wnBR.webp` from the supplied Kernjosh mirror; the shared Process selection ring. Motion follows `vd()` (550ms spring transform, +/-30 degrees per changed step) and `md()` (0 to -35px panel drift, 1.2s power2.out) in `main-CwptEoZ4.js`. Adapted only by inversion for the existing black theme.
