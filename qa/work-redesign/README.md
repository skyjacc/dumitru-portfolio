# Work field and project presentation

2026-11-16. Existing portfolio and camera engine retained. Changes are bounded adapters and authored UI modules; reference copies remain untouched.

## Result

- One continuous #080808 field in Home/Work/Process/Detail. No outer rounded display mask in WebGL or Canvas2D; individual material masks remain.
- Compositor opacity handoffs replace the snapping opaque desk background. Process entry overlaps the outgoing scene, exit has a guarded 300ms fade. Work → Process → Work restores the existing camera, and cancelled transitions cannot hide the next panel.
- Deterministic case-only diamond placement. Five current projects surround the centre. Completed eight/eighteen-case fields form 2/4/2 and 2/4/6/4/2 rows; adding a case keeps earlier pins. Hidden legacy About/Process no longer affect spacing.
- The old centre wordmark becomes an original pencil character. Three finite SVG poses—thinking, sketching, laptop—cycle on returning to Work. It is decorative, ignores input, follows world pan/zoom, and sleeps when idle/hidden. Reduced motion shows the same final poses without animation.
- Paper photo thumbnails and an active pencil mark replace the old numbered selector. View site is a paper tag with a compact concept/fictional-brand note. The upper shared Back is the only visible return control. Names and concise descriptions remain; no automatic material change.
- Portrait media use the available width and the space left by the removed top heading. Native captions reserve the paper footer height, including 320px Russian. Gated rear materials use a quiet dark placeholder while retaining lazy loading.

## Verification and limits

- `transitions/README.md`: 36/36 final transition checks, 4/4 interrupted handoffs, uniform RGB(8,8,8) outer corners in four renderer/device configurations.
- `layout/README.md`: stable layout generation for 5/8/18/32 cases, fifteen exact open/return camera checks on three viewports. Final portrait follow-up: 127/127 checks across 1440×900, 390×844, 393×620 and 320×640 RU, every material in all five projects, no JavaScript errors.
- `controls/README.md`: 66/66 main material/control checks, 26/26 final narrow-layout checks, 3/3 keyboard checks and 1/1 Romanian word-wrap check. The identified 320px RU native caption overlap is fixed; final screenshots show the caption and paper footer separated.
- `integration-local/report.json`: 40/40 composed checks on 1440×900, 390×844, WebKit393×620 and 2560×1440. These check scene flow, character positioning and pose changes, paper controls, manual material selection, exact camera return and reduced motion. This first integration run precedes the final portrait refinement.
- `integration-public/report.json`: the same 40/40 checks passed against the final published code on all four viewport/browser configurations, after the portrait and compact-label refinement. No JavaScript or HTTP errors were recorded. `public-file-check.json`: all 10 changed public files match the release manifest by SHA1 and byte length.
- No physical iPhone or assistive-technology certification is claimed. Whole-page screenshots remain fit previews; the link opens the full project site.

Published at https://dumitru-spatial-portfolio.vercel.app/; immutable deployment https://dumitru-spatial-portfolio-fegm7ywx2.vercel.app/ (`dpl_CpHXWTC5xnnXutUtqeVKvVmhMVYY`, READY). Only `site/` is deployed; authoring scripts, source data and QA remain local.

## Guidance used

- **motion:** “Prefer to animate `opacity` and `transform`”. The canvas remains in charge of camera geometry; DOM opacity handles scene handoffs and finite character poses. Reduced motion finishes immediately without waiting on absent animation events.
- **natural-interactions:** “Use `<button>` for actions and `<a>` with an `href` for navigation.” Material controls retain normal activation and focus feedback; the decorative character does not intercept gestures.
- **carousel:** “The active slide's control must not communicate that it is active through color alone”. The selected paper photograph has a pencil marker and pressed state; selection stays manual.
- **accessibility:** “Don't attach keyboard handlers to native interactive elements”. The remaining Back receives keyboard opening focus, and native button Enter/Space activation is preserved. Existing gallery arrow/Escape handling is scoped separately.

## Reapply

Use the working bundles and bounded adapters. `adapt-data.cjs` reapplies `adapt-work-composition.cjs`; `adapt-unframed-work.cjs --check` verifies all-state framing, and `adapt-project-media-frames.cjs --check` protects logical Retina frame dimensions. `adapt-entry-shell.cjs` includes the companion assets. Do not restore an old export over these files.
