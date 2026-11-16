# Phone, Process and fixed navigation

16 November 2026. The existing ntch camera, world and five-project carousel remain intact.

## Navigation

`site/portfolio-ui.js` and `site/portfolio.css` own the fixed Work / Process / About / Contact pills and original SVG icons. Language order is EN / RO / RU. The Help and contact corner stickers remain. Dumitru at bottom-left returns Home; project/surface focus replaces it with Back. On short screens the focused surface hides the top row to leave room for content. Return and content controls retain fixed positions.

The Back hit region remains present during its return flight. A second close is ignored when the native focused key has cleared; a newly opened project can immediately be closed again. This avoids both double-click interruption and a stale local close lock.

## Single native planes

About and Process each have one native image slot, so screen changes do not spread a second phone or change the camera. `surfaces-runtime.js`, inserted by `adapt-i18n.cjs`, preloads localized images, swaps the selected image, and rejects stale asynchronous loads. Locale changes retain the chosen state. `adapt-material-fit.cjs` fits the planes inside reserved navigation space. `adapt-personal-interactions.cjs` maps native image coordinates to photo tiles and process rows; taps on surface content do not trigger the normal project-centre close action.

Controller: `window.portfolioSurfaces.getIndex(key)`, `count(key)`, `getState(key)`, `setIndex(key,index)`, `subscribe(listener)`, `preload(key)`. UI event: `portfolio:surface` with `{key,index}` or `{key,step}`. Keys are `despre` and `process`. About has profile index0 and six photos at1–6. Process has indices0–4. Back/Escape uses the existing native return.

## Content and provenance

- `make-phone-assets.py` generates localized 540×1000 SVG phones, with outlined Manrope and embedded JPEGs. `instagram-sources.json` records the public profile/post URLs. The user explicitly selected their profile, photos and stories; no direct messages were accessed. These assets are public profile photographs, presented as a local story-style gallery, not current or automatically synchronized Stories.
- `make-process-assets.cjs` generates five selected-step states in each language. All steps are visible; selection highlights one. Copy comes from `make-i18n-data.py`.
- Kernjosh inspired rounded icon buttons, scene-based Process and physical personal objects. Its icon/image assets were not copied. The screenshots and interaction observations are under `qa/reference-process/`.

## Reapply

Generate dictionaries with `python scripts/make-i18n-data.py`, phone artwork with `python scripts/make-phone-assets.py`, and Process artwork with `node scripts/make-process-assets.cjs`. Then run `adapt-data.cjs` (which invokes i18n), `adapt-material-fit.cjs` and `adapt-personal-interactions.cjs`. Apply the workbench Home adapter last only if a base Home adapter was run. Do not restore original bundles.

Current checks are recorded in `qa/surface-native-review/`, `qa/pills-phone-review/`, `qa/pills-visual/` and the deployment report. Browser mobile emulation is not a physical-device test.
