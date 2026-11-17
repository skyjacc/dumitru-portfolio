# Current entry: Loading → Home → Work

Current character scope: `studio-companion.js` owns only `work` and `detail`. CSS immediately hides the SVG/fixtures in all other sections and the controller stops clocks/input there. Home/Loading retain their original walker. Earlier About/Process resident-placement notes below are superseded by this user override.

## Shared About / Contact phone

`portfolioEntry.open('despre')` and `.open('contact')` share the `about` spatial state. `body.dataset.phoneView` identifies the profile/contact selection for header highlighting and title. From Work/Process the desk restores first, then the same phone approaches; switching the two views while enlarged only changes the HTML screen. Repeating the selected header button closes the phone. `studio-about.js` owns profile, manually selected photos and Contact, including inner Back/Escape and photo swipe. Its `portfolio:phoneview` event updates the outer navigation; `show({view,onBack})`, `setView(view)` and `back()` preserve the boundary between inner navigation and the desk camera.

The phone uses real local photos and confirmed biography, without fake social counters. The decorative blue check follows the user's supplied Instagram profile screenshot. Contact provides actual email/Instagram links and copy-email, without a fictitious send-success flow. The existing counter-scaled DOM screen and short-landscape layout remain required for readable text. The physical phone's noninteractive glass overlay adds cracks/grain above all inner views. New phone UI and labels support English, Romanian and Russian.

This guide describes the active entry implemented in `site/entry-flow.js`, `site/entry-flow.css` and the authored `studio-*` modules. It supersedes the Home instructions in `WORKBENCH.md` and the older workbench reapply note in `SURFACES.md`. The earlier sigil and Y2K props are inactive. Home now uses a nine-object paper desk with three scroll compositions; see `PAPER-HOME.md` for current art and motion. Current publication is recorded in `../DEPLOYMENT.md`.

All paths below are relative to the `portfolio-ntch` root unless stated otherwise. The supplied mirror and `site_recon` are reference sources, not edit targets.

## Project capture density and frame dimensions

The five current `assets/projects/*/mobile-preview.svg` wrappers are authored DPR 3 captures (1170 × 2532 intrinsic pixels; 390 × 844 viewBox). `adapt-data.cjs` preserves wrappers marked `data-preview-capture="retina-3x"`; do not replace these with the old 390 px raster sources. Capture provenance is in `qa/project-clarity/assets/SOURCE.md`.

`scripts/project-media-frames.json` records CSS frame dimensions separately from source pixels for those five previews and the three refreshed FKD desktop materials. `adapt-data.cjs` applies this map after measuring assets. For the existing working bundle, use `node scripts/adapt-project-media-frames.cjs`; `--check` verifies the eight values and module syntax without editing. This bounded adapter changes frame metadata only, preserving the native renderer and camera. FKD capture evidence is in `qa/project-clarity/fkd-desktop/README.md`.

## Work field and paper controls

`adapt-work-composition.cjs` owns deterministic project-only ring pins, compact native captions, portrait overview sizing and `window.portfolioWorkGeometry()`. The first five pins surround an open centre; new cases fill larger rings. The geometry bridge uses the camera actually painted by native `drawBoard`, and includes projected `projects[].bounds` and selected-material `front` bounds. A synchronous `portfolio:boardframe` event at the end of that draw exposes `{camera, fitScale}` so the character follows the same frame, including gesture inertia. The adapter also preserves sequential carousel turns: arrows, swipes and thumbnails share the original material order 1→2→3→4. `adapt-data.cjs` reapplies it after a catalogue refresh. Its `--check` checks existing anchors without replacing a bundle. `adapt-unframed-work.cjs` keeps the outer native mask disabled in all states and retires the old centre wordmark. Do not restore the earlier Work/leaving-only mode predicate.

The current local SVG resident is split across `studio-character-rig.js` (one articulated 120×200 skeleton, contacts and props), `studio-character-life.js` (27 finite activities/reactions and selection), and `studio-companion.js/.css` (site anchors, input and masks). Work retains world coordinates, pointer capture, focused keyboard movement and click-to-place. About and Process use the SVG in safe available space; Detail stays decorative with no pointer interception or tab focus. Loading and Home retain the original raster walker. Its `character-runtime.js` self-activates only on Home and suspends elsewhere; it is not retired at handoff. The SVG is stopped/hidden on Home and does not capture its movement keys. No public pause button or persisted character-pause preference remains; internal developer pause and reduced motion are retained. See [CHARACTER-SYSTEM.md](../docs/CHARACTER-SYSTEM.md).

`portfolio-ui.js` emits `portfolio:projectstate` only when its existing UI signature changes, with `{key, materialIndex, moving, mode}`. The coordinator uses it for context, and `portfolio:boardframe` for projection against the camera already drawn. Projection does not advance the rig clock or mutate the saved Work position. The scheduler owns phase time; the coordinator owns finite travel/drag/landing outside Home. Original Home motion stays in `character-runtime.js`. Work size and position stay on the board, including offscreen panning. `portfolioCompanion.getState()` retains the old observation fields and adds anchor, fixture owner, held prop, hidden reason, legacy retirement, rig joints/contacts and scheduler phase/token/pause/timer state. Current evidence is under `qa/resident/`; `qa/board-follow/` records the earlier projection regression.

`portfolio-ui.js` keeps the material navigation API but renders paper thumbnails and a paper View site link. The concept type is a compact DOM label by that link; native project name and description remain. The old lower return button is hidden and unfocusable for compatibility; keyboard entry focuses the shared upper Back. Safe-area measurements include the whole footer and caption clearance. Latest evidence: `qa/work-redesign/`.

The previous/next paper arrows sit at the viewport sides, separate from the bottom thumbnail strip. Their screen positions remain stable when selected materials have different dimensions. Mobile uses compact edge targets; project observers avoid their rectangles.

Unloaded rear materials retain the native snow texture, restored at the user's request. The existing interaction clock wakes it on hover changes and freezes it after about 4.1 seconds of idle; reduced motion uses a fixed seed. Image reveal replaces the placeholder normally. `adapt-work-composition.cjs` preserves this backing independently of the disabled card jitter/parallax. Evidence: `qa/noise-hover/`.

## States and transitions

| State | Visible content and behavior |
| --- | --- |
| Loading | Black curtain with the five-frame reference character and Loading bubble. Actual image/font/native readiness; no visible counter or headline. |
| Home | Nine paper photo cutouts around the introduction. Wheel/touch changes between three cyclic compositions. Laptop opens Work and notebook Process; the phone is decorative until About is selected in navigation. The cable has been removed. The underlying native root is inert. |
| Work | Native spatial overview of the five portfolio cases, with readable native labels and the original pins. A full-canvas `#080808` background replaces the outer rounded display frame. Inert Home props remain partly visible at the viewport perimeter; the introduction is hidden. |
| Process | Authored DOM content in the middle of the same desk, with objects at its perimeter. Five readable steps on desktop; accordion on mobile. Back restores the opening context and Home composition. |
| About | Navigation zooms into the same paper phone in Home. Its DOM screen contains the existing profile/photos; manual photo navigation stays inside the device. |
| Detail | Native project. Return restores its saved native camera; the entry controller restores Home or Work according to the opening origin. |

The laptop and Work pill explicitly enter Work: the objects scatter to the edges over 900ms before the DOM desk hands off to the existing native gallery. Home wheel/touch only recomposes the desk; it never opens Work. PageUp/PageDown also change its composition. Return restores the exact saved interpolated arrangement over 700ms. Reduced motion removes these flight durations. Work is a section toggle with no dropdown: pressing it in the gallery returns Home; from Detail it restores the saved gallery camera through native return. Work wheel, drag and pinch gestures only pan/zoom; they never select Home or a project. Explicit Home controls or Home/Escape return to the DOM introduction. The former central Home hit area is removed. Existing project materials, Back/Escape, history reconciliation and interrupted-return handling continue through the native engine and portfolio UI.

Direct `/work/*` and `/stories/*` routes wait for readiness and hand off to the native route, without requiring a visit to the introduction. The entry controller intercepts About/Process for their DOM experiences. Process leaves the underlying native camera untouched, reveals its content after 650ms of the edge flight, and restores the opening context/focus on Back/Escape. About from Work first restores Home, then moves and enlarges only the existing phone; the other Home props stay put. About → Work retreats from the phone before the normal edge scatter. Entry owns these transitions; normal navigation never calls native About, whose route/assets remain legacy data.

An actual blank-space click/tap outside the enlarged About phone uses the existing Back sequence to Home. Pointer down/up must remain outside the phone, avoid controls, and move at most 8px; scrolling, dragging and phone/photo actions do not dismiss it. The resulting compatibility click is consumed to prevent opening an object revealed underneath.

## Loader readiness and fallback

The Loading walker uses the original `loading.webp` contour and droplets at the same dimensions and animation in EN/RO/RU. English renders the untouched original. RO/RU mask only its interior lettering and overlay the translation (Se încarcă / Загрузка); readable text remains outside the image mask. All five character frames remain unchanged. Their markup is authored in `adapt-entry-shell.cjs` for both served shells. The original Home walker keeps its existing controls and hints. The separate SVG resident shows no Drag-me labels or visible movement instructions; its accessible instructions remain available to assistive technology.

The internal readiness snapshot counts current Home images, character art, document fonts and the native runtime. It is not downloaded-byte progress and no percentage is shown. Image decode and font waits are bounded at 10 seconds; the native readiness wait is bounded at 12 seconds. An image error/timeout completes its task and records a loading failure rather than blocking forever.

At 7 seconds, a localized slow-loading message and “Enter the studio” button become available. Normal loading finishes automatically when the tasks settle. The normal minimum presentation is 2 seconds; reduced motion removes that minimum and transition delays. A native timeout leaves an accessible Home with direct project links, and the controller can recover when the runtime becomes ready. Generation tokens and pending-state guards prevent overlapping Home/Work/detail transitions.

`adapt-entry-shell.cjs` installs the initial loader, stylesheet and script references in both `site/index.html` and `site/404.html`. The rig and life modules load before `studio-companion.js`; the studio modules remain before `entry-flow.js`, which remains before `portfolio-ui.js`. Entry starts the original Home controller when Loading completes. `portfolio:loaderhandoff` marks the SVG coordinator ready without calling `portfolioCharacter.retire()` or inheriting its geometry. The original controller's section listener/observer manages activation and suspension; the SVG separately yields Home, including input, timers and fixtures. No world coordinate is derived from the loader's CSS `walkerX`. The adapter's noscript rule removes the blocking loader. Editing already-installed loader markup still requires updating the served shells or regenerating them before reapplying the adapter.

## Ownership and public bridge

| File | Responsibility |
| --- | --- |
| `site/entry-flow.js` | DOM Home, local EN/RO/RU entry copy, readiness/fallback, origin state and transitions. |
| `site/entry-flow.css` | Loader/Home presentation, responsive layouts, transitions and reduced-motion styles. |
| `site/studio-home.css` | Current nine-object geometry, intro typography, Process/Work desk presentation and click-burst styling; overrides the base entry styles. |
| `site/studio-composition.js` | Three cyclic Home layouts, wheel/touch input, saved composition, edge scatter and restore. No routing or native camera ownership. |
| `site/studio-process.js`, `site/studio-process.css` | Original EN/RO/RU five-step copy, transparent DOM panel, desktop emphasis and mobile accordion. |
| `site/studio-about.js`, `site/studio-about.css` | Accessible DOM profile/photo screen attached to the paper phone, localized copy and manual photo controls. |
| `site/studio-clicks.js` | Brief press/release and one-shot paper click feedback; no continuous jitter. |
| `site/studio-nav.js`, `site/studio-nav.css` | Reference navigation artwork, deliberate Work hammer/letter hover, tracking eyes and shared morphing Back control. Existing navigation handlers are retained. |
| `site/studio-language.js`, `site/studio-language.css` | Matching language nav pill/popover and cancellable whole-label rolling text via vendored Motion mini. |
| `site/studio-fonts.css` | Local StudioSans (DM Sans) and StudioHand (Caveat), with existing Manrope fallback. |
| `site/studio-character-rig.js` | Articulated pencil drawing, 32 actions, fixed bone lengths, hand/foot contacts and local prop geometry. No own clock. |
| `site/studio-character-life.js` | Finite scene clock, 27 activities/reactions, weighted selection, priorities, tokens and effective pause. |
| `site/studio-companion.js`, `site/studio-companion.css` | SVG resident outside Home; real anchors, projection, input, masks and developer pause. No public pause UI. |
| `site/character-runtime.js` | Original Home walker, started after Loading; self-activates only on Home and suspends elsewhere without retirement. |
| `site/portfolio-ui.js`, `site/portfolio.css` | Shared navigation, project/surface controls and their entry integration. |
| `scripts/adapt-entry-shell.cjs` | HTML inclusion and initial loader markup. Run after shell generation. |
| `scripts/adapt-entry-home.cjs` | Small localized native Home marker and retirement of workbench prop preloads. Run last among Home transformations. |
| `scripts/adapt-behavior.cjs` | Overview fitting/flight, pan/zoom-only Work gestures, labels/filtering, public snapshots/events, saved return/history, and retirement of native Home hits and Info stickers. |
| `scripts/adapt-studio-render.cjs --hover-only` | Bounded calm-hover changes in the current native modules. |
| `scripts/adapt-unframed-work.cjs` | Bypasses only the outer native display mask/vignette in Work and entry scatter; preserves project masks and camera/layout helpers. Includes `--check`. |

The authored entry exposes:

```js
window.portfolioEntry.mode;  // home, work, process, about or detail
window.portfolioEntry.ready; // loader handoff completed
window.portfolioEntry.enterWork();
window.portfolioEntry.open('btb');
window.portfolioEntry.open('process');
window.portfolioEntry.closeProcess();
window.portfolioEntry.showHome();
```

`body[data-entry]` additionally uses `loading` and `leaving` during transitions. State changes emit `portfolio:entrystate` with `{mode}`.

Navigation intent is published synchronously as `body[data-entry-target]` and `portfolio:entryintent` with `{target}`. Back appears as soon as an approach begins and can cancel it. About and Process pills are toggles: pressing the active pill again returns Home, even if its approach is still running. Back from Process retains its original opening context. Generation checks also guard the asynchronous phone retreat, preventing a cancelled transition from starting a late restore.

The introductory sentence shares the composition controller's eased layout clock and saved progress. It moves with Home scrolling rather than using a second CSS position transition. The laptop's visible Work caption is replaced by `/hero/desk/work-arrow.webp`; its native button keeps a translated accessible name. The corner Home control uses a small handwritten Dumitru wordmark without an arrow. Language-menu keyboard handling owns Escape and navigation keys while the popup is open, before either the photo viewer or scene shortcuts.

`window.portfolioComposition` exposes `mount(host)`, `setEnabled(value)`, `scatter({duration})`, `restore({duration})`, `focusPhone({duration})`, `restorePhone({duration})` and read-only `getState()`. Flights resolve `true` on completion or `false` when superseded; scatter saves even a partially scrolled arrangement. `portfolio:compositionmotion` emits `{active, phase}`. `window.portfolioProcess` exposes `mount(host)`, `show({onBack})`, `hide()` and `getState()`. Entry owns the transition and return context; the panel owns selection, locale changes, internal mobile scrolling and its Back control. Hidden panels are inert.

Edge placement retains approximately 15% of each rotated bounding-box dimension inside the viewport on mobile, 20% on larger screens; this is not a promise about visible opaque-pixel area. `studio-nav` supplies the shared top Back button, so the Process panel's internal Back is hidden when navigation is ready. Its Work hammer deliberately repeats on desktop hover, moving letters and resetting on leave; Back morphs its SVG path. Original pupil pixels remain separately clipped, but share one aim direction from the icon center. Client coordinates use the inverse SVG screen transform; frame-time smoothing keeps them moving during continuous pointer input. Leave/blur restores neutral. The Process navigation star uses the reference's 150-degree resting angle and 720-degree inertial turn over 2.8 seconds on hover. Touch and reduced motion keep pupils neutral. Navigation animations stop for reduced motion/touch/hidden documents; desk props retain calm hover.

The Process content panel now also uses the reference's single moving circle, row entry stagger, 35px content drift and animated mobile accordion. Its navigation star was already correct. A 35px top reserve keeps the drifting heading inside its scroll viewport. Continuous-eye and reference-panel evidence: `qa/nav-correction/README.md`.

Composition flights use fourth-power easing. A resize or safe-area change preserves the current screen center/rendered size and retargets the remaining flight using the unused part of its original curve. It does not finish the animation immediately or restart its easing. About retreat restores other props over 600ms after the screen's 180ms content fade; intended navigation state prevents simultaneous About/Work selection during handoff.

`window.portfolioAbout` exposes `mount(host)`, asynchronous `show()`/`hide()` and `getState()`. Its `.about-phone-screen` is appended inside `.desk-phone`. `phonePoses()` supplies `--about-focus-scale` in portrait and landscape; the screen lays out at its final displayed dimensions and cancels the parent zoom with an inverse transform. Container-relative text therefore uses normal font sizes instead of typesetting at 1–5px and magnifying it with the phone. The sideways layout also retains upright, native-size type. Phone geometry, approach/retreat and the DOM relationship are unchanged. About's EN/RO/RU introduction describes design/build work without the former AI tagline. Existing `assets/about/instagram/` images load on first opening; entry requests the phone cutout at `sizes="1254px"` during About for a clear zoom. All six photos are manual, with previous/next and profile return; Escape from a photo returns to profile before entry receives a close action. There is no live Instagram connection or separate modal. Entry handles the approximately 850ms phone approach, 180ms screen fade and 700ms retreat, with reduced-motion alternatives. Focused text and interaction evidence: `qa/about-clarity/README.md`.

About font-size limits use rem, with container-relative preferred sizes; the screen's final corner radius is a CSS-pixel value calculated from its focused geometry. Standard thin scrollbars are styled on the profile itself, with a guarded legacy WebKit fallback. Only a fresh About opening resets the profile scroll; returning from a photo preserves it. Narrow screens and enlarged text use the existing internal vertical scroller.

The native overview action is:

```js
window.dispatchEvent(new CustomEvent('portfolio:navigate', {
  detail: { action: 'overview' }
}));
```

It safely clears native focus and uses the existing camera flight to fit the five `portfolioCase` pins, adding 300 world units around their extents and reserving viewport space for the controls. It does not rearrange the pins or hard-set the camera. `window.portfolioRuntime` provides read-only snapshots including `workOverviewCamera`, `workOverviewActive`, `camera`, `focusedKey` and `returnCamera`.

Work gestures retain their clamped camera rather than snapping zoom back to the initial overview. All automatic magnet selection is disabled while the Work overview context is active and no object is focused. Resize still refits through a native flight. Explicit project opening saves the current camera; Return restores it exactly. Native Home clears the overview context and native focus, then emits `portfolio:nativehome` for the DOM entry. Home is excluded from magnet candidates and generic object commits, and its old canvas hit rectangle is removed.

The scroll regression came from gesture settlement magnetizing to the old Home pin and routing that implicit selection through GO HOME. At 1440×900, Explore → wait 900ms → pointer `(634,444)` → twelve wheel events of `deltaY=-200`, 70ms apart, reproduced the unwanted return. The fix changes native selection/settlement; it does not disable wheel, drag or pinch. Focused-project wheel protection remains in place.

While `workOverviewActive && !focusedKey`, the renderer and hit test omit non-case objects (`despre` and `process`). Those objects remain accessible from navigation and render when focused. Native case labels use viewport-sized type: 13px portrait and 15px otherwise. Existing object positions and hit regions stay intact.

The earlier `window.portfolioSurfaces` native phone/Process planes remain legacy catalogue data; see `SURFACES.md` for their historical API/assets. Active About and Process navigation use the authored DOM modules instead, without changing the native project renderer.

## Calm native motion

The quiet-hover adapter changes the native drawing inputs, not a generic CSS animation rule:

- World look offsets and project/group/screen/inside pointer parallax coefficients are zero.
- Comic random position/angle noise, hover growth/fanning and label overshoot are disabled.
- The historical sticker motion adapter freezes breathing, peel and text jitter; the current Help/contact sticker components are no longer mounted.

Camera flights, deliberate pan/zoom, manual material navigation and explicit project controls remain operational. Native Help/Info and contact corner canvases are retired. Hidden Help entry points, `?`/closed teletext entry and the public `help` action cannot reopen the panel. Contact remains available through the shared navigation. The authored Home has no continuous pointer parallax; reduced motion is still handled by the entry and native navigation mechanisms.

## Reapply order

These are bounded updates to the current working export, not a clean build from the supplied mirror. Do not copy original minified modules over the working bundles: that would discard later interaction and history fixes. Adapters with anchor/concurrent-edit checks should fail visibly rather than guess at changed code.

For entry or calm-motion work alone, edit the authored entry files as needed, then apply the relevant native slices in this order:

```powershell
node scripts/adapt-behavior.cjs
node scripts/adapt-studio-render.cjs --hover-only
node scripts/adapt-entry-home.cjs
node scripts/adapt-unframed-work.cjs
node scripts/adapt-entry-shell.cjs
```

After regenerating native media/surface modules, run `node scripts/adapt-media-loading.cjs` as well. It preserves current geometry and interactions while requesting secondary case materials on first opening, keeping surface photos/stages on demand, and reusing loaded image data for native bitmaps. It has exact-anchor, syntax and concurrent-edit guards. `scripts/surfaces-runtime.js` is the authored source of the surface-loading changes.

The seven retained v2 Home images use variants from `python scripts/prepare-desk-responsive.py`; the new v3 notebook/brush and scissors/film exports use `python qa/home-composition/assets/export.py`. The old v2 notebook and cable are not loaded by Home. `entry-flow.js` selects versioned paths and defines matching `sizes`/`srcset`; `adapt-entry-shell.cjs` derives the head laptop preload from those functions so preload and image selection cannot drift. Keep full-resolution source assets. The local server's `no-store` policy remains deliberate; performance QA uses cold-cache conditions.

`adapt-entry-home.cjs` must follow any older `adapt-personal-home.cjs` or `adapt-workbench-home.cjs` run. It restores the current marker, maps old localized workbench introductions to `work-index-{en,ro,ru}.svg`, and replaces old prop preload paths with the small blank asset. Do not run legacy Home adapters afterward. Archived artwork may remain on disk, but it is not active.

If also regenerating current localized surface data and images, run this preparation first:

```powershell
python scripts/make-i18n-data.py
python scripts/make-phone-assets.py
node scripts/make-process-assets.cjs
node scripts/adapt-data.cjs --about-only
node scripts/adapt-material-fit.cjs
node scripts/adapt-personal-interactions.cjs
```

Then run the five-command entry/native sequence above. `--about-only` preserves existing case preview/poster files while updating the catalogue and surfaces; `adapt-data.cjs` invokes `adapt-i18n.cjs` itself. The catalogue has five cases plus About and the legacy Process object, seven objects total. The legacy `make-process-assets.cjs` step does not update the active DOM Process panel: edit its copy in `site/studio-process.js`. If only dictionary copy changes, regenerate the data and apply `adapt-i18n.cjs`; entry-specific copy also lives in `entry-flow.js`.

If base presentation adapters are intentionally reapplied, do so before the final behavior, calm-hover and entry-Home passes. `adapt-typography.cjs` belongs after those base presentation changes. The `--hover-only` mode avoids replaying unrelated legacy render/copy transformations.

If `create-shell.cjs` is run, it regenerates the HTML and must be followed by:

```powershell
node scripts/adapt-i18n.cjs
node scripts/adapt-entry-shell.cjs
```

Do not rerun the shell generator for an ordinary edit to `entry-flow.js` or `entry-flow.css`. Publication details remain in `DEPLOYMENT.md`.

## Provenance

The Loading/Home/Work separation was studied in the local Kernjosh reference at `C:/Users/oblako/Desktop/ячс/site_recon/webdesign.kernjosh.com/`. That mirror was read-only. Desk props are original generated assets. The subsequently requested exact navigation illustrations are reused from that mirror and attributed in `site/assets/nav-reference/SOURCE.md`; the walking character has its separate source note. Current Home asset provenance is documented separately from these native mechanics. Original runtime provenance remains with the supplied `ntch-mirror` engine.

`qa/new-entry/reference-notes.md`, `source-anchors.json` and `reference-browser.json` contain the reference observations and exact source anchors. They describe the reference, not a claim that the portfolio implements every reference effect. Its tremble/idle-float mechanisms were deliberately excluded from the stable current behavior.

English is the default. The language nav pill opens English / Română / Русский; options retain `data-locale` for localization, while `#language-toggle` opens the picker. Home/loader copy, the native marker and shared dictionaries retain explicit localized sources. `studio-language` uses the vendored Motion mini rolling-label pattern for short text roots (up to 120 characters, 18 roots), preserving original markup and semantic content. Longer paragraphs update normally. New locale requests, scene changes, resize, wheel/touchmove, visibility and reduced motion clear temporary visual copies; reduced motion skips animation. The obsolete per-glyph split-flap is removed.

The current reference study, original v3 asset prompts/masters, font sources and focused component checks are in `qa/home-composition/{reference,assets,fonts,motion,process}/`. The Home and Process sans is local DM Sans (`StudioSans`); handwritten words and headings use local Caveat (`StudioHand`), including Cyrillic. Native case captions keep their existing Manrope typography. This turn adds no deployment.

## Verification

The resident rewrite is connected in the current local shells; it is not yet a production release. Use `http://127.0.0.1:8943/__character/` with `python scripts/serve.py` for the real-site developer viewer. `qa/resident/viewer.js` stays outside the static publication root. It exposes scene/variant, speed, interrupt, pause, reduced motion, contacts, seed and context controls; scene availability and safe-space checks still apply. Standalone geometry proof is in `qa/resident/rig/`, scheduler checks in `qa/resident/life/`, and ongoing integrated captures/checks in `qa/resident/integration/`. Older counts below describe their original scoped suites, not a passing count for this new character implementation.

Current composition checks are in `qa/home-composition/motion/`; Process component checks are in `qa/home-composition/process/` (80 passing checks across four viewport sizes and EN/RO/RU, with real font loading). These scoped reports do not replace assembled-scene review for prop/header overlap, native transitions or physical-device testing. Earlier motion captures still include the now-removed cable; older nine-object and native Process screenshots document previous versions.

The rounded dark frame was native canvas presentation, not an About leak. `adapt-unframed-work.cjs` now bypasses the outer display mask in every scene: the presentation shader in `0e9h3p1htk-po.js` receives `uUnframedWork`, while `0n9xfy8bxft48.js` updates the uniform #080808 background and equivalent Canvas2D fallback. Individual project-card masks and camera calculations remain. DOM opacity handles the Home/Work/Process handoff with cancellation guards. Reapply after replacing these chunks, then run `node scripts/adapt-unframed-work.cjs --check`. See `qa/work-redesign/README.md` for the final all-state framing and portrait material checks.

The latest assembled refinement evidence is indexed in [qa/new-refinement/README.md](../qa/new-refinement/README.md): bounded eyes in three input/preference modes, 85 language checks plus 12 final visual checks, 41 resize/flight checks, and 10 Work checks with identical before/after cameras and a forced Canvas2D fallback. [Motion comparison](../qa/new-refinement/motion/review.html) presents reference and final local captures with action seeking. These reports are local browser observations, not physical-device certification or hardware-independent FPS claims.

With `python scripts/serve.py` running at `http://127.0.0.1:8943`, the native suites are:

```powershell
node qa/work-overview-review/check.cjs
node qa/work-overview-review/home-pin.cjs
node qa/work-gesture-regression/review.cjs
```

The updated overview report has **79 passing checks**, including retained gesture zoom, fit margins, flights, exact returns, resize and Home signaling. The **2 passing Home checks** now verify that the central native hit is absent and the explicit header Home control works with desktop mouse and phone touch. Their former assertion that clicking the central Home pin should navigate is superseded.

The real-input scroll regression suite has **52 passing checks**: 24 desktop wheel cases at four timings/three positions/both directions, 20 phone drag/pinch cases, and 8 explicit controls. Across 44 gesture cases it records no native Home event or implicit object selection; camera movement remains functional. Real case clicks, exact return, retired Home hits/Help and explicit Home pass. The report preserves the pre-fix failure stack and frozen-source hashes; see `qa/work-gesture-regression/README.md`.

After removing the native sticker canvases and making explicit Home always clear native focus, the final targeted rerun passed **20/20 checks**, with zero page errors or failed requests. `final-controls-report.json` includes Home after high zoom on desktop and phone, with `focusedKey=null`, overview inactive and both DOM Home/header control visible. The original 52-check report is preserved unchanged.

The earlier calm-hover report preserves **24 passing captures and 10,954 forced native draw frames**, at 1440×900 and 390×844 with normal/reduced motion. All recorded within-capture geometry ranges were zero. Its four Help-open/close assertions and sticker captures describe the prior visible-sticker iteration and are superseded by current retirement checks; do not treat that old suite as the current Help contract.

Forced native draws establish motion stability, not frame rate. Phone gesture coverage uses CDP touch input; mobile hover coverage used synthetic mouse input. Neither claims physical-device certification. Native suites do not by themselves certify every loader fallback or DOM focus path; keep separate entry-flow checks with `qa/new-entry/`.
