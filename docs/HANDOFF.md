# Reviewer handoff

Latest scope override: the SVG character appears only in Work and opened projects. About/Process suspend it completely; Home/Loading retain the original walker. This supersedes the wider section ownership in the earlier implementation notes below.

This repository contains Dumitru's spatial portfolio and the **connected local resident-character implementation**. The articulated rig, scheduler and site coordinator are loaded by both local shells. Whole-site QA is ongoing; this is not a claim that every integration path is verified or that the rewrite is published. Start with [CHARACTER-SYSTEM.md](CHARACTER-SYSTEM.md) for current character ownership and debug tools.

Live reference: [dumitru-spatial-portfolio.vercel.app](https://dumitru-spatial-portfolio.vercel.app/). Publication history is in [DEPLOYMENT.md](../DEPLOYMENT.md); the live site may differ from unpublished work in this checkout.

## Run locally

From the repository root, Python 3 is sufficient for the static application:

```sh
python -m http.server 8943 --directory site
```

Open `http://127.0.0.1:8943/`. This basic server supports the root experience but does not rewrite direct `/work/*` or `/stories/*` requests. For direct-route testing, use the included server instead:

```sh
python scripts/serve.py
```

It binds to `127.0.0.1:8943`, adds route fallback and disables local caching. Do not run both servers on the same port.

The included server also provides `http://127.0.0.1:8943/__character/`: the real portfolio with developer-only resident controls injected from `qa/resident/viewer.js`. This route is not part of the static Vercel publication. Use the included server for current character review.

There is currently **no package.json, npm install step, or npm build**. The original React/Next authoring source was not supplied. The exported compiled runtime under `site/_next/` is required for the application to run; it is not a disposable build artifact. Authored browser JavaScript/CSS and bounded Node adapters extend that runtime. Only `site/` is served or deployed; [site/vercel.json](../site/vercel.json) configures a static deployment and route rewrites.

## Current experience

- Loading → Home: paper objects around the introduction; scrolling changes the composition. The laptop/Work control explicitly enters the project field.
- Work: five independent portfolio concepts with pan/zoom, manual project opening and material selection. Back restores the previous camera. New project placement uses expanding rings.
- About: the same Home phone approaches the camera and reveals HTML text and photos inside its screen. Process is a separate HTML panel in the desk composition.
- About closes to Home through Back on a complete blank-space tap outside the phone. Phone/photo gestures, navigation controls and drags are excluded. Work has no dropdown: it toggles Home/Work, and returns an open project to its saved gallery camera.
- English is the default, followed by Romanian and Russian. Contact opens a mail client; there is no contact submission backend.
- Loading and Home preserve the original raster walker and Home controls. `character-runtime.js` self-activates on Home and suspends elsewhere; normal navigation does not retire it. The articulated resident owns Work/About/Process and observes Detail decoratively; it is stopped, hidden and noninteractive on Home. Its Work position belongs to the board, with safe section anchors elsewhere. Detail has no tab stop or pointer interception. The user's latest clarification removes the public pause button and persisted pause preference; developer pause and reduced motion remain.
- The local rig has 32 drawing actions and the scheduler has 27 activities/reactions with preparation, performance, finish and rest. Scene availability still depends on section, space and preferences. The latest visual direction follows the original left-hand reference: irregular tilted head, bowed single-line limbs and muted graphite rather than bright beige geometry.
- The latest motion correction adds prone pushup preparation/exit, a clearer coffee grip, a two-handed horizontal ruler and subtle mouse head tracking in quiet poses. The resident yields during phone/Process motion and revalidates content clearance afterward. Current evidence and limits: [interaction corrections](../qa/resident/INTERACTION-CORRECTIONS.md).

## Code map

| File | Responsibility |
| --- | --- |
| [site/index.html](../site/index.html), [site/404.html](../site/404.html) | Served shells and runtime load order. |
| [site/portfolio-data.json](../site/portfolio-data.json) | Project content and material sources. |
| [portfolio-runtime.js](../site/_next/static/chunks/portfolio-runtime.js), `site/_next/` | Runtime bridge and supplied compiled native renderer/camera. |
| [site/entry-flow.js](../site/entry-flow.js) | Loading, Home mounting, scene navigation and interruption guards. |
| [site/studio-composition.js](../site/studio-composition.js) | Home recomposition, scatter, phone approach/retreat and resize retargeting. |
| [site/studio-about.js](../site/studio-about.js), [site/studio-process.js](../site/studio-process.js) | HTML About and Process content. |
| [site/portfolio-ui.js](../site/portfolio-ui.js), [site/studio-nav.js](../site/studio-nav.js) | Shared navigation, material controls, safe areas and navigation animation. |
| [site/portfolio-i18n.js](../site/portfolio-i18n.js), [site/studio-language.js](../site/studio-language.js) | Locale handling and short label transitions. |
| [site/studio-character-rig.js](../site/studio-character-rig.js) | Shared articulated SVG skeleton, contacts, props and 32 drawing actions. |
| [site/studio-character-life.js](../site/studio-character-life.js) | Weighted 27-activity scheduler, one scene clock, phase tokens, cancellation and pause. |
| [site/studio-companion.js](../site/studio-companion.js), [site/studio-companion.css](../site/studio-companion.css) | SVG resident outside Home: section/world anchors, input, masks, fixtures and developer pause. No public pause UI. |
| [site/character-runtime.js](../site/character-runtime.js) | Original Home raster controller; automatically activates on Home and suspends in other sections. Normal navigation does not call `retire()`. |
| [scripts/adapt-work-composition.cjs](../scripts/adapt-work-composition.cjs) | Bounded native edits for project rings, captions, material order and geometry exports. |
| [scripts/adapt-entry-shell.cjs](../scripts/adapt-entry-shell.cjs) | Reapplies authored script/style references and loader to both shells. |

Read [scripts/ENTRY.md](../scripts/ENTRY.md) before modifying native adapters. Do not blindly rerun every historical adapter or replace the current compiled bundle with the original mirror: several older directions are superseded. Applicable repository guidance is in [AGENTS.md](../AGENTS.md).

## Runtime contracts useful for review

- `portfolioEntry`: `mode`, `pending`, `ready`, `enterWork()`, `open(key)`, `showHome()`, `back()`.
- `portfolioComposition.getState()`: current phase, active motion, saved composition and object poses. Live Home anchors are `[data-desk-object]`; their `getBoundingClientRect()` reflects the animated transform.
- `portfolioAbout.getState()` and `portfolioProcess.getState()` expose their visible/content state. The About screen is `.about-phone-screen`; the Process panel is `#studio-process`.
- `portfolioRuntime`: native camera, focused project, material index and motion state.
- `portfolioWorkGeometry()`: board origin, `home`, `unitScale`, projected project bounds and selected material `front` rectangle, all based on the camera actually rendered.
- `portfolioCompanion.getState()` retains `mode`, `action`, `pose`, `worldPos`, `worldSize`, `position`, `dragging`, `frameScheduled`, project/material fields. It now also exposes `anchor`, `fixture`, `held`, `hiddenReason`, `legacyRetired`, `rig` geometry/contacts and `life` phase/token/effective-pause/timer state. These describe the local coordinator, not necessarily the currently deployed site.

| Event | Payload / purpose |
| --- | --- |
| `portfolio:entrystate` | `{mode}`; entry navigation state. |
| `portfolio:entryintent` | `{target}`; cancel stale scene intentions before a section transition completes. |
| `portfolio:loaderhandoff` | Loading has finished and the original Home controller has started; mark the SVG coordinator ready without retiring or replacing the Home walker. |
| `portfolio:compositionmotion` | `{active, phase}`; Home object motion. |
| `portfolio:projectstate` | `{key, materialIndex, moving, mode}`; discrete native selection updates. |
| `portfolio:boardframe` | `{camera, fitScale}`; synchronous notification after native draw, suitable for exact board-follow positioning. |
| `portfolio:safearea` | Measured viewport/control clearance; also available as `portfolioSafeArea`. |

## Local resident implementation

The full requested behavior is preserved in [CHARACTER-BRIEF.ru.md](CHARACTER-BRIEF.ru.md), with the appearance clarification in [CHARACTER-APPEARANCE.ru.md](CHARACTER-APPEARANCE.ru.md). These are requirements, not a list of completed features.

The former scheduler draft is now connected through `studio-companion.js`, alongside the new articulated SVG rig. Phase time belongs to the scheduler; boardframe events only update projection. Each scene has an owner token and abortable approach. Furniture uses a separate anchored host; wrist props remain attached during lift. Peeking masks the body against measured card/viewport geometry while the holding hand remains separate. The ANDRA sequence passes a flower from fetch to carry/placement; other project motifs use actual project keys.

Six-pose proof, full action silhouettes and numerical geometry/prop checks are in [qa/resident/rig/](../qa/resident/rig/README.md). The current drawing preserves stable joints with softly bowed rendered contours. The latest user correction rejected the first proof's straight beige diagram appearance; the updated graphite proof supersedes it. No generated video replaces the interactive rig.

Implementation and review boundaries:

1. Rig, life and coordinator are implemented and connected locally. About text/biography is unchanged; Contact remains immediate `mailto` without fictitious send-success behavior.
2. Work projection retains saved world position/size and uses the camera actually rendered. Parent/child coordinate transforms and Back restoration need their current integration evidence, not only older board-follow results.
3. Direct input, soft exits, navigation invalidation and token-owned cleanup are implemented. Review both held props and independently anchored furniture under interruption.
4. Native cards still share a canvas: the coordinator builds a geometric inverse mask rather than relying on DOM z-index alone. Check actual rounded contours during movement and resize.
5. Developer pause, reduced motion, hidden-page cancellation, keyboard control and stroke-only hit regions remain connected. The public pause button/persisted preference were removed at the user's request. Detail is decorative; Home input belongs only to the original controller. Verify safe placement at short/narrow viewports and enlarged text.
6. The local `/__character/` viewer exercises the actual page. [Scheduler checks](../qa/resident/life/README.md) and [integration reports](../qa/resident/integration/README.md) distinguish isolated assertions from assembled browser observations. [qa/resident/README.md](../qa/resident/README.md) separates historical results from the latest Home-preservation/no-public-pause checks; no production deployment or physical-device certification is implied.

The existing original walker frames are in `site/hero/walker/`; provenance is recorded in its `SOURCE.txt`. They remain the Loading and Home artwork and the SVG appearance reference. Motion mini is already vendored for language-label transitions; the resident uses authored SVG/JavaScript without a new animation dependency. The preserved [original brief](CHARACTER-IMPLEMENTATION-BRIEF.ru.md) predates the user's Home-preservation and no-public-pause overrides documented here.

## Verification boundaries

Earlier regression evidence is under `qa/board-follow/`, `qa/interactive-companion/`, and feature-specific QA folders. Current resident work is under `qa/resident/`; read each report's scope and run date. Isolated skeleton/scheduler/legacy-lifecycle passes do not certify the assembled coordinator. Some test launchers use machine-specific Playwright fallbacks; install Playwright and browser binaries or set the documented module path on another machine. Browser emulation is not a claim of testing on a physical iPhone.

The repository keeps QA scripts and written reports; large screenshot/video captures and most generated JSON results remain local and are excluded from Git. Links to those excluded captures in older reports are historical local evidence, not downloadable repository files. Credentials, local service configuration, dependencies and superseded unserved artwork are also excluded.

For an outside review, prioritize the native/adapted boundary, camera versus screen/object ownership, cancellation of approaches, unique scene tokens, actual card masks, input propagation and the Loading-to-resident ownership handoff. Scene tuning is centralized in `StudioCharacterLife.config`; see the system guide before changing timings or geometry.
