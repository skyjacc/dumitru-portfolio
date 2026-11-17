# Actual video-frame presentation correction

Production verification of runtime `08e070a` found a visual failure missed by media-state assertions: WebKit advanced `currentTime` and reported `readyState=4`, while the detached player supplied transparent pixels to the native canvas. The selected card became blank. The preceding immutable release could also show a blank native card; attaching its player and restarting playback yielded visible pixels. The new release needed the same lifecycle correction. A positive playback clock alone was not adequate evidence.

The bounded native media adapter now attaches each selected player **before its first play** to an inert, aria-hidden, noninteractive offscreen host. The host clips a 2px box, while the player retains full natural backing dimensions and overrides the global `max-width:100%` rule. An initial 2px-player experiment produced an opaque flat-color texture in WebKit; preserving the full backing fixes that downsampling. No visible video element or new control is added.

The canvas renderer keeps the approved sharp poster until it sees a real video frame. After normal readiness/seeking checks, a 2×2 alpha probe tries at most eight times, no more often than every 200ms. Once a valid frame exists, no further pixel reads occur for that playback. Empty frames preserve the poster; a later fresh play can retry. This is capability-driven and does not sniff the browser or reduce the HD source resolution. Native visibility, selection and reduced-motion pause remain in force.

Local verification at 390×844/DPR3:

- Chrome: actual 16×9 frame sample contains 144 opaque pixels and more than 16 distinct colors; screenshot shows the rotating bouquet. Full backing width is 1916px while the inert host is 2px. About/reduced motion pause it.
- WebKit: the actual selected-video screenshot shows the detailed bouquet rotating rather than a blank or solid-color card. The same frame, backing, pause and no-early-download assertions are included in the rerun.
- Forced empty WebKit frames: exactly **8** 2×2 probe reads, `data-portfolio-frame="poster"`, no opaque video pixels. Screenshot shows the intact bouquet poster, not a blank card. Subsequent About and reduced motion still pause the media.
- No video fetches or media host on initial Home are introduced; rear mobile videos remain deferred until selected.

Runtime files: `site/_next/static/chunks/1l2px902fb04m.js` and its bounded `scripts/adapt-media-intent.cjs`. The enhanced `review.cjs` verifies real pixels, color variation, natural backing dimensions and a finite empty-frame fallback, rather than accepting `currentTime` alone.

All captures are browser emulation. Actual iPhone playback has not been claimed.
