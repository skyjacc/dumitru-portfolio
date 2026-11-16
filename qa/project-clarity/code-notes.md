# Native project clarity: code investigation

Read-only investigation of the five native case renderers. This is separate from the already-fixed DOM About phone. No product files changed. Source-line anchors below point into compiled chunks; function names, module IDs and short signatures are more precise than the long minified line alone.

## Entry points for browser verification

- `window.portfolioRuntime`: ready, focusedKey, moving, camera, fitScale, materialIndex, materialCount, materialMode, materialGeometry (room/reference/boxes), returnCamera.
- `dispatchEvent(new CustomEvent('portfolio:navigate', {detail:{key:'andra'}}))`; keys: andra, btb, fkd, ora, bonanza.
- Material: `{action:'material', index:2}` or `{action:'material', step:1}`; close: `{action:'return'}`.
- Wait for the portfolio loader to complete, the requested focusedKey, no moving flight, and at least 500ms of settled drawing before judging final texture quality. A high-resolution texture can intentionally arrive after the geometry flight.
- `scripts/adapt-behavior.cjs:54` defines the snapshot; `scripts/check-material-fit.cjs` demonstrates material geometry measurements. The selected material CSS dimensions are box.w/h × camera.zoom × fitScale.

## Canvas dimensions and DPR

`site/_next/static/chunks/0e9h3p1htk-po.js:344`, modules59270/96480:

- Fixed layout `SCREEN = {w:1512,h:982}`.
- `c()` / exported `fitScale`: max(viewportWidth/1512, viewportHeight/982).
- `h()`: min(devicePixelRatio || 1, 2).
- Content budget `u={gpu:6,canvas:2.2}` megapixels, chosen by `setContentRenderer`.
- `m()` / maxContentScale: sqrt(budgetMP × 1e6 / (1512 × 982)).
- `f()` / contentScale: max(1, min(fitScale × cappedDPR, maxContentScale)).
- `contentSize()` rounds SCREEN × contentScale.
- `physicalSize()` independently caps the final glass/output canvas at10MP, without the contentScale floor.

`site/_next/static/chunks/0n9xfy8bxft48.js:145`, signature `setContentRenderer(t?'gpu':'canvas')`: initializes GPU or Canvas2D fallback. The resize handler updates parent CSS `scale(fitScale)`, output size and source scene size; DPR changes are watched using a resolution media query and invoke the same resize path. GPU framebuffer allocation is in the same file:111, signature `let t=(0,s.contentSize)()`.

Calculated GPU examples (from code, not observed GPU allocations):

| Viewport / device DPR | Scene pixels | Effective scene samples per CSS pixel | Output canvas pixels |
| --- | --- | --- | --- |
| 1440×900 /1 | 1512×982 | 1.05 | 1440×935 |
| 1440×900 /2 | 2880×1870 | 2 | 2880×1870 |
| 390×844 /3 | 2599×1688 | 2 | 2599×1688 |
| 2560×1440 /2 | 3039×1974 | 1.187 | 3924×2548 |
| 3840×2160 /1 | 3039×1974 | 0.792 | 3840×2494 |

The scene and output use the fixed layout aspect ratio, so portions extend beyond the visible viewport. A larger final canvas does not recreate details missing from the lower-resolution scene. DPR3 is deliberately limited to2; high-resolution displays can also hit the6MP source budget. This is a real quality limit in code, not proof that it explains a particular screenshot without matching its viewport/DPR.

## Image decoding, texture levels and source limits

`0n9xfy8bxft48.js:2`, signature `let tM=(0,P.touchFirst)(),tk=tM?2048:3072,tR=tM?512:640`:

- Raster low-level longest edge:512 touch /640 desktop.
- Raster high-level longest edge:2048 touch /3072 desktop.
- `tF(image,level)` preserves aspect ratio, uses min(1, cap / naturalLongestEdge), so raster sources are never enlarged during this upload step.
- SVG uploads use a separate branch in `L()` at line111: they are rasterized to the level's longest-edge cap and can be enlarged. That cannot recreate details of a raster embedded in an SVG.
- High/low level selection is in the `get(image,requestedPixels)` object at line111. `image(...)` requests `max(drawWidth,drawHeight) × T()`, where `T()` uses current transform area scale × contentScale. Consequently camera/material size affects the requested level.
- Bitmap decoding uses `createImageBitmap` with resizeQuality high; WebKit uses image.decode and an element/canvas upload fallback. Resampling canvas sets imageSmoothingQuality high.
- Texture minification uses LINEAR_MIPMAP_LINEAR and generated mipmaps; magnification uses LINEAR.
- `tL` at line145 defers some full-resolution uploads during recent input (150ms) and `tC` defers background prewarming during a camera flight. The renderer schedules later redraws. A moving frame can legitimately show a low texture before the settled frame.
- Video takes a separate texture path based on videoWidth/videoHeight; the raster image's tF cap is not applied through that branch.

All five records in `1l2px902fb04m.js:117`, marker `OWN_PORTFOLIO_DATA_BEGIN`, are `kind:'screens'`. Kind maps to `shape:'screen'`; their materials are image/video textures, not live HTML sites or iframes.

Measured source-file dimensions:

| Case | Desktop materials | Mobile source |
| --- | --- | --- |
| ANDRA | desktop1920×1631; bouquet poster1672×941; bloom poster960×960; videos are separate sources |390×1897 embedded into a390×844 viewport |
| BTB | desktop/assembly/detail1440×900 |390×844 |
| FKD | desktop1440×1000; request/summary1440×1260 |390×844 |
| ORA | desktop/rooms1440×1000; planner1440×900 |390×844 |
| Bonanza | desktop/gallery/events1440×1000 |390×844 |

Each active `mobile-preview.svg` has width390, height844, and one embedded WebP with `preserveAspectRatio='xMidYMin slice'`. These are raster screenshot wrappers, not vector text. ANDRA's taller source is cropped by this viewport. Resampling the SVG texture at2048/3072 does not make the embedded390px-wide screenshot more detailed.

The media module15389 in `1l2px902fb04m.js:97` exposes `OPEN_MAX_UPSCALE=1`, `maxWidth(image,multiplier)`, and source size metadata. Its width cap is used by the native layout; the selected portrait fit is additionally adapted by `eL()` / marker `portfolio-portrait-room-fit-v7` (same line, source in `scripts/adapt-material-fit.cjs`). This adaptation fits selected portrait material within the reserved caption room. It changes geometry, not asset resolution.

## Native text rendering

Native names, types and descriptions are not the About DOM typography. Their renderer is a Canvas2D text-to-WebGL sprite cache:

- `1l2px902fb04m.js:114`, module66658: `setFont` assigns the requested canvas font, centered alignment and middle baseline; `stampText` calls fillText, with optional stroke/offset.
- Module67458, exported `loadCanvasFonts`, waits for document.fonts.ready and loads weights400/500/650. `0n9xfy8bxft48.js:111` calls it during scene asset initialization.
- `0n9xfy8bxft48.js:111`, `text(e,t,r,n)`: density is `2 ** (ceil(4 * log2(max(T()*b[M],.25))) / 4)`. T includes the current transform and scene contentScale; b[M] is the settling factor used by animated comic transforms.
- `sprite:function(l,i,s)` on the same line caches by text/font/style/density, measures actual glyph bounds, and paints at the requested density. It allows up to4096px per sprite dimension. After a density change it can reuse an existing sprite until4 stable draw frames have passed, subject to per-frame rasterization budgets.
- This is not a permanently tiny fixed sprite stretched at every zoom, although a temporarily reused lower-density sprite can be visible during motion. Global scene budget and source display scale still constrain final appearance.
- Current native Manrope fonts come from `site/portfolio.css:1`; canvas CSS variables map condensed/walsheim/display to PersonalManrope. OPEN_ZONES base settings in `0e9h3p1htk-po.js:344` are phone name26/type14/description14 at360px glass and design name38.88/type20/description20 at882px glass. `openColumn()` scales these with the measured glass size and fitScale. Caption layout/rendering is `1l2px902fb04m.js:114–117`, `openColumn`/`function M(e,r,a,o,s,l,p,u,g)`.
- Work overview names have a separate adaptation:13CSSpx portrait or15CSSpx desktop, divided by fitScale before drawing (`scripts/adapt-behavior.cjs:94`).

## Scrollbars and enlargement

- `site/portfolio.css:4` keeps html/body overflow hidden. The native scene itself does not expose a browser scrollbar.
- `site/portfolio-ui.js:20` creates only Return, material previous/next/dots, and external Visit controls. The historical Mărește/fit control is not present in this current UI. Camera wheel/pinch zoom is handled by the native renderer/controller instead.
- The mobile material selector is a real DOM horizontal scroller, but its scrollbar is explicitly hidden (`portfolio.css:81–82`). The Work index can scroll with overflow:auto (`portfolio.css:24`) and uses fixed DOM UI sizes, independent of world camera scale.
- The native `scrollMax` / `ew()` functions at `1l2px902fb04m.js:117` belong to the old teletext/Info/help panel (`j.on`, `j.help`), not the five screenshot materials. Its opening paths are retired by `adapt-behavior.cjs`.
- No project-material DOM scroller, scrollbar CSS or live embedded website was found. Any scrollbar painted inside an image material would be part of the source pixels; this last case should be confirmed against the specific source image before treating it as the reported issue.

## Browser checks justified by the code

Separate native caption text from text already baked into screenshots; inspect the current DPR and renderer fallback; compare settled image quality after the upload delay; compare actual selected-material CSS/device-pixel dimensions to its source dimensions. No speculative renderer changes are proposed by this read-only investigation.

## Follow-up: higher-resolution mobile screenshots and fallback QA

The source-dimension table above records the inputs before the separate asset worker's refresh. Root subsequently confirmed a baked scrollbar in the FKD screenshot and requested new DPR3 captures. For the proposed intrinsic SVG size1170×2532 with viewBox390×844, keep the explicit BOARD_IMAGE_SIZES entry390×844: media aspect() and layout maxWidth() read that metadata, while GPU upload reads the SVG's naturalWidth/naturalHeight. This separates layout size from raster density without enlarging the card itself. The touch high-level SVG texture becomes approximately946×2048; desktop approximately1420×3072. The embedded screenshot must actually be replaced with DPR3 pixels, as planned; changing SVG dimensions alone would not improve detail.

The loader's low-level512/640 texture can remain briefly visible during motion; the high-level upload is requested when rendered pixel demand exceeds that tier and the movement/flight upload gate is released. This should be confirmed in root's settled screenshot QA after the replacement.

No public force-Canvas2D switch was found. For one isolated fallback QA page, an init script before navigation can make HTMLCanvasElement.getContext return null for webgl2/webgl/experimental-webgl and delegate all other types to the original method. This causes `tq(canvas)` in `0n9xfy8bxft48.js:111` to return null, selecting the existing Canvas2D branch at line145 with the2.2MP budget. It is a browser-test override, not a product change. Native text uses direct Canvas2D text stamping in this fallback, rather than the GPU sprite cache.

The active caption constants have zero stroke/shadow, the actual canvas family is Manrope, and initialization waits for its relevant weights. No separate repeatable native-caption raster defect was established by this code-only review. Raising DPR or the global memory budget is not justified solely by the mobile source screenshot defect.
