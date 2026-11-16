# Reviewer handoff

This repository contains Dumitru's running spatial portfolio and an **unfinished, unconnected resident-character rewrite**. The running experience remains the existing Home/Work/About/Process implementation. Do not assume that the new character modules are enabled or integration-tested.

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

There is currently **no package.json, npm install step, or npm build**. The original React/Next authoring source was not supplied. The exported compiled runtime under `site/_next/` is required for the application to run; it is not a disposable build artifact. Authored browser JavaScript/CSS and bounded Node adapters extend that runtime. Only `site/` is served or deployed; [site/vercel.json](../site/vercel.json) configures a static deployment and route rewrites.

## Current experience

- Loading → Home: paper objects around the introduction; scrolling changes the composition. The laptop/Work control explicitly enters the project field.
- Work: five independent portfolio concepts with pan/zoom, manual project opening and material selection. Back restores the previous camera. New project placement uses expanding rings.
- About: the same Home phone approaches the camera and reveals HTML text and photos inside its screen. Process is a separate HTML panel in the desk composition.
- English is the default, followed by Romanian and Russian. Contact opens a mail client; there is no contact submission backend.
- The existing small SVG companion can be dragged in Work, moved with the keyboard, and reacts to project/material changes. Its Work position belongs to the board. It is hidden in Home/About/Process; the loading/Home walker is separate. This is the implemented version, not the planned autonomous resident.

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
| [site/studio-companion.js](../site/studio-companion.js), [site/studio-companion.css](../site/studio-companion.css) | Currently connected Work/detail character. |
| [scripts/adapt-work-composition.cjs](../scripts/adapt-work-composition.cjs) | Bounded native edits for project rings, captions, material order and geometry exports. |
| [scripts/adapt-entry-shell.cjs](../scripts/adapt-entry-shell.cjs) | Reapplies authored script/style references and loader to both shells. |

Read [scripts/ENTRY.md](../scripts/ENTRY.md) before modifying native adapters. Do not blindly rerun every historical adapter or replace the current compiled bundle with the original mirror: several older directions are superseded. Applicable repository guidance is in [AGENTS.md](../AGENTS.md).

## Runtime contracts useful for review

- `portfolioEntry`: `mode`, `pending`, `ready`, `enterWork()`, `open(key)`, `showHome()`, `back()`.
- `portfolioComposition.getState()`: current phase, active motion, saved composition and object poses. Live Home anchors are `[data-desk-object]`; their `getBoundingClientRect()` reflects the animated transform.
- `portfolioAbout.getState()` and `portfolioProcess.getState()` expose their visible/content state. The About screen is `.about-phone-screen`; the Process panel is `#studio-process`.
- `portfolioRuntime`: native camera, focused project, material index and motion state.
- `portfolioWorkGeometry()`: board origin, `home`, `unitScale`, projected project bounds and selected material `front` rectangle, all based on the camera actually rendered.
- Current `portfolioCompanion.getState()`: `mode`, `action`, `pose`, `worldPos`, `worldSize`, `position`, `dragging`, `frameScheduled`, project/material fields. Proposed rewrite fields must not be mistaken for this live API.

| Event | Payload / purpose |
| --- | --- |
| `portfolio:entrystate` | `{mode}`; entry navigation state. |
| `portfolio:compositionmotion` | `{active, phase}`; Home object motion. |
| `portfolio:projectstate` | `{key, materialIndex, moving, mode}`; discrete native selection updates. |
| `portfolio:boardframe` | `{camera, fitScale}`; synchronous notification after native draw, suitable for exact board-follow positioning. |
| `portfolio:safearea` | Measured viewport/control clearance; also available as `portfolioSafeArea`. |

## Unfinished resident rewrite

The full requested behavior is preserved in [CHARACTER-BRIEF.ru.md](CHARACTER-BRIEF.ru.md), with the appearance clarification in [CHARACTER-APPEARANCE.ru.md](CHARACTER-APPEARANCE.ru.md). These are requirements, not a list of completed features.

The new [studio-character-life.js](../site/studio-character-life.js) is an **unfinished scheduler draft**. It is not loaded by the current shell or wired into `studio-companion.js`. Its public interface may still change. The proposed articulated SVG rig (`studio-character-rig.js`) has not been written; only its design was discussed before work was paused for this handoff. No six-pose visual proof or rig verification exists. Standalone scheduler checks, if present, do not establish application integration readiness.

The requested direction is a thin, slightly irregular pencil figure with a consistent oval head, single-line torso and long limbs. It should appear to inhabit the same workspace rather than float over the screen. The first visual milestone is six coherent poses: idle, walking, laptop work, coffee, sword practice and peeking. Broader activities follow only once those poses work.

Outstanding integration work:

1. Connect the rig and scheduler through the existing companion lifecycle. Add context-aware behavior for Home, Work, About, Process and project detail without inventing biography or fake contact-success states.
2. Preserve world coordinates in Work. Pan, zoom and resize must not relocate the character or make it lag behind the board.
3. Make actions interruptible: grabbing takes priority over short reactions, contextual behavior and autonomous activity. Drop preserves the grab offset; furniture stays in place; rapid navigation must cancel obsolete reactions.
4. Add believable planted feet, hand/prop contact and held-object behavior. Card-edge peeking needs true occlusion: native cards share a canvas, so z-index alone cannot put the body behind a card while the hand remains in front.
5. Keep text, photos and controls usable on narrow screens. Provide keyboard interaction, a pause control, reduced-motion alternatives and suspension while the document is hidden. Avoid perpetual idle RAF work and unnecessary visible instructions.
6. Add a debug-only scene/rig viewer, then verify desktop, trusted touch and mobile WebKit. Planned regression checks cover camera anchoring, drag cancellation, prop persistence, rapid state changes, resize, occlusion and hidden/reduced-motion behavior. This integration pass has not run.

The existing original walker frames are in `site/hero/walker/`; provenance is recorded in its `SOURCE.txt`. Motion mini is already vendored for language-label transitions, but the resident does not require a new animation dependency or generated video to become an articulated SVG character.

## Verification boundaries

Existing regression evidence is under `qa/board-follow/`, `qa/interactive-companion/`, and the feature-specific QA folders. It applies to the earlier connected implementation. Some historical test launchers use machine-specific Playwright paths; adjust those locally before running them. No resident integration test was started before this review handoff. Browser emulation is not a claim of testing on a physical iPhone.

The repository keeps QA scripts and written reports; large screenshot/video captures and most generated JSON results remain local and are excluded from Git. Links to those excluded captures in older reports are historical local evidence, not downloadable repository files. Credentials, local service configuration, dependencies and superseded unserved artwork are also excluded.

For an outside review, prioritize the native/adapted boundary, ownership of camera versus screen coordinates, cancellation of asynchronous transitions, input propagation, and how the new scheduler can be connected without regressing the current navigation.
