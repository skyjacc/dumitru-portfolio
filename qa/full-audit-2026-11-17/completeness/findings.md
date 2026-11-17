# Product / content / authoring completeness audit

Audited 2026-11-17 at `cc6e2dbea485005ad838ae0c950b64498b304f0b`, branch `codex/portfolio-review`. Read-only: no application, Git or deployment changes. Public alias used for semantic checks while the local server was unavailable; local source is the same published implementation recorded in the release report. This is one slice of the whole audit, not a physical-device or screen-reader certification.

## Confirmed issues

### C1 — P2: Opened projects do not update the semantic page content

**Evidence:** `site/_next/static/chunks/portfolio-entry.js:3` (authored by `scripts/create-shell.cjs:15`) always mounts `React.createElement(Portfolio)` without `project` or `caseText`. The native `rw({project:e,text:t})` renderer in `site/_next/static/chunks/0n9xfy8bxft48.js:1` only emits the selected project's h1 and description when both values exist. The authored runtime updates the document title and visual/material controls in `site/portfolio-ui.js:154`, `:181-214`, but does not update this semantic content.

**Reproduction:** Open Home, enter Work, open ANDRA, wait for the camera flight to finish, inspect the accessibility tree or headings. The URL is `/work/andra` and document title is `ANDRA | Dumitru`, but the main h1 is still `Hello, I’m Dumitru. Web design and development.` followed by the generic biography and all five project links. `Flowers, animation and direct contact with the atelier.` is only rendered on the canvas. The semantic content is unchanged between overview and detail. The material controls and View site link are correctly named, so this is not a claim that the entire canvas has no accessible alternative.

**Impact:** A reader navigating by headings does not receive the selected case, its description, or the same change of context as a sighted visitor. The empty first-selection status in `portfolio-ui.js:212` does not fill that gap. Browser reading/translation features also miss the canvas description.

**Suggested correction:** Keep the semantic project list for Work, and synchronize a real selected-case heading and description with the existing `focusedKey`/locale update. Avoid restoring the rejected visible Work dropdown. Verify both in-app opening and direct `/work/*` loading, all five projects, locale changes, and Back. This does not require the experimental canvas-html API.

### C2 — P2 authoring gap: The repository cannot regenerate its catalogue by itself

**Evidence:** `scripts/adapt-data.cjs:14` requires the checkout folder to be named `portfolio-ntch`; `:17-18` reads `../portfolio-lab/projects.js` unconditionally. That input is outside this repository and is absent from its tracked files. The GitHub repository's usual clone directory is `dumitru-portfolio`, so it hits the folder-name check first; merely renaming the checkout still leaves the external input missing. `README.md:61` acknowledges this external source; the documented preparation sequence in `scripts/ENTRY.md:165-176` nevertheless includes `node scripts/adapt-data.cjs --about-only` without a supplied portable source.

**Impact:** The committed static site runs, but a new collaborator or a fresh machine cannot follow the documented project-update workflow from this repository alone. This matters to the accepted requirement that projects will continue to be added. Hand-editing generated `portfolio-data.json` would also diverge from the compiled catalogue and the next regeneration.

**Suggested correction:** Commit one canonical authoring catalogue in this repository and have the adapter read it, with explicit optional overrides if needed. Base the safety guard on known repository files/target scope rather than the checkout basename. Document Node/Python/Pillow requirements for catalogue generation. Verify from a clean clone without the sibling `portfolio-lab` folder. Do not replace the supplied working compiled runtime with original mirror bundles.

### C3 — P3: Current authoring instructions contradict the shipped scope and release

**Evidence:** `scripts/ENTRY.md:3` says the SVG only owns Work/Detail, but `:25` still says About and Process use it in safe space. `README.md:3` records the 2026-11-17 production release, while `README.md:53` says the resident changes are local and not a new deployment; `scripts/ENTRY.md:201` also says not yet a production release. These are current workflow paragraphs, not merely dated historical QA evidence.

**Impact:** An outside reviewer can misidentify what is live or reintroduce explicitly rejected About/Process character placement by following the middle of the architecture guide.

**Suggested correction:** Update those current paragraphs to the Work/Detail-only scope and point to the one release record in `DEPLOYMENT.md`. Retain genuinely historical reports with their dates and scope; no need to rewrite historical evidence.

### C4 — Code cause supporting the parent reviewer's keyboard reproduction

The parent reviewer observed Home Tab focus staying on BODY and native Process materials appearing during Work Tab traversal without Enter. The code explains both:

- `site/_next/static/chunks/0n9xfy8bxft48.js:1`, native window `keydown` function `R` (approximately byte 83,950), builds `i=u.BOARD_PROJECTS.filter(tJ.canOpen)`. This contains the legacy native `despre` and `process` surfaces, not just `portfolioCase` entries.
- Its Tab branch calls `e.preventDefault()` and then `p(i[next].key)`; local `p` invokes `s(e)`, wired as `commitTo:rL`. Tab therefore commits an opening instead of merely moving focus. It bypasses the authored About/Process entry flow.
- There is no authored-section guard around this window listener. `site/entry-flow.js:82` makes the native root inert on Home, but that does not disable its window-level keyboard handler.
- `rX()` and `rK()` still target retired sticker/help elements; a Tab/Shift+Tab branch can try to focus a hidden/inert retired control. The real project fallback anchors are explicitly `tabIndex:-1` in the same native `rw` renderer.

The parent's functional reproduction owns the final severity and browser evidence. Recommended bounded correction: gate native keyboard ownership by active section, keep Tab as ordinary focus traversal through actual project links/controls, and open only on explicit Enter/Space. Ensure native keyboard project candidates exclude the retired personal surfaces. Do not restore hidden Help/Work-dropdown controls to make old handlers happy.

## Deliberate prototype boundaries / launch-readiness items

- **Search discovery is disabled:** `site/index.html:5` and `site/404.html:5` have `noindex,nofollow`; `site/robots.txt:2` disallows the entire site. The shell generator repeats this at `scripts/create-shell.cjs:22`. This is a review portfolio and publishing was authorized for sharing, so this is **not classified as an accidental regression**. Before using it as an indexed business portfolio, decide to remove the review restriction, add intended canonical/share metadata and verify real public URLs. Current `<title>` and description name Dumitru correctly; there are no leftover Ilnaz/Josh public page titles.
- **No contact submission backend:** About/Contact intentionally use actual `mailto:andrusciac.dumitru@gmail.com`, Instagram and copy-email. There is no false form-success UI; lack of a backend is an agreed boundary, not an unfinished button.
- **The five case sites are concepts:** FKD's request and ORA LENTĂ's stay planner are explicitly described as demo/local or imaginary. No claim of commissioned client work was found in the active wrapper.
- **About images have generic alt text:** `site/studio-about.js:48` and `:55` label them as numbered Instagram photos. Useful next polish would be short factual per-photo descriptions in EN/RO/RU; this is not related to raster blur and was not treated as a failed functionality requirement.

## Checks completed / non-findings

- All five current View site URLs returned HTTP 200 and the expected brand title: ANDRA, BTB Mobilă, FKD, ORA LENTĂ, Bonanza. No localhost destination is used by these project links.
- The Work canvas has a semantic HTML navigation list with all five case names and real `/work/*` hrefs. It is inaccurate to call the entire gallery canvas-only/inaccessible. Keyboard traversal is audited separately by the parent reviewer.
- Active About and Process copy no longer contains the rejected first-person AI-tool sales pitch. ANDRA material tooltips still attribute generated animation (`Bouquet in motion · AI`, `Blooming · AI animation` in EN, equivalent RO/RU); this is truthful asset attribution, not the removed biography, and is not reported as a regression.
- The active phone is actual HTML, with real email/Instagram actions and bounded photo navigation. Current About personal text matches the user's confirmed interests rather than fabricated hobbies.
- No public character Pause button, old Work dropdown, or new About/Process SVG character is requested by this report. Existing legacy modules/assets are not automatically defects merely because the earlier implementation remains in the export.
- Project screenshots keep their original Romanian content intentionally; the portfolio's navigation/captions/controls have EN/RO/RU dictionaries. No inconsistent live project destination was found.

## Guidance and limits

Read `AGENTS.md`, architecture/handoff documents, active shell/content modules and adapters. Applied the installed Modern Web Guidance search/retrieve workflow for semantic canvas content and accessibility. The canvas-html guide is gated as volatile, so no opt-in or experimental API was used. The ordinary accessibility guide supports keeping real heading/description semantics ("Structure main content with headings"). Browser evidence here is a Chromium accessibility-tree snapshot, not a test with NVDA/VoiceOver. Functional races, physical motion quality, failed-network loading, responsive overlap and keyboard behavior are covered by the other audit slices.

## Additional bounded character continuity check

The parent requested a final 4–5 minute numerical slice outside the recently corrected coffee/pushups/work/game/peek/controller movements. Executed the actual current `StudioCharacterRig.render()` in Node `vm` with minimal SVG DOM stubs (attribute/child methods only; no alteration of pose, IK or rendering math). Loaded `StudioCharacterLife.activities` to check action coverage. Scanned the other **21 scheduler activities × variants 0/1/2 × prepare/perform/finish × 1001 samples**. Inputs used `repeats:4`, 7000 ms perform and 900 ms preparation/finish, stable token, neutral initial pose. Subsequent focused probes used normal 30/60 frame sampling and explicit phase boundaries. This is deterministic geometry evidence, not a visual judgment or a complete choreography/prop/contact audit.

Reproducible harness: [character-continuity.cjs](character-continuity.cjs). Machine-readable measured output at the audited commit: [character-continuity-results.json](character-continuity-results.json). Run `node qa/full-audit-2026-11-17/completeness/character-continuity.cjs` from the repository root. This saved harness repeats the already executed dense and focused probes, with no additional runtime tests or application changes.

### C5 — P2: Stretch variant 0 still has a very large hand snap during preparation

**Source:** `site/studio-character-rig.js:221` switches the raised-arm bend sides; the per-frame shortest-angle interpolation at `:414-418` wraps the angle again for each changing solved target. Around prepare progress 0.58 it chooses the other half-turn, so the FK arm changes sides abruptly despite smooth input progress.

**Reproduction with a fresh rig:** render `{action:'stretch',phase:'prepare',progress:n/1000,elapsed:900*n/1000,variant:0,repeats:4,token:1}` for n=0..1000. Between progress **0.580 and 0.581**, rightHand moves **50.1922543069 local units**. The entire rig is 120×200.

**Ordinary-frame confirmation:** with a 1000 ms prepare, at 30 samples/second the right hand goes from `(110.5462,70.3365)` at p=0.566667 to `(61.4328,69.4083)` at p=0.600000: **49.1222 units**. At 60 samples/second, p=0.566667→0.583333 moves **50.1984 units**. This is not a threshold exposed only by extreme oversampling.

**Correction direction:** retain one continuous unwrapped joint-angle branch for the whole transition, or give this raise a deliberate FK arc. A per-frame shortest-path calculation against a moving target is not enough. Recheck mirrored facing, prepare/finish and interrupted exits; do not just lower FPS or lengthen the duration.

### C6 — P2: Seated leg motion starts with a phase-boundary jump

**Source:** `site/studio-character-rig.js:228-230`. `sit` prepare ends with rightFoot `(91,188)`, but odd variants switch to `y=179-sin(time/1100)*4` immediately when phase becomes perform. At elapsed 0 that is already nine units above its preparation position.

**Measured:** fresh rig → sit variant 1 prepare from p=0..1 → perform at p=0,elapsed=0. rightKnee changes from `(80.79894,151.39483)` to `(82.88489,141.87663)`: **9.74410 units**, while the foot is suddenly raised. The finish boundary is continuous thanks to the existing capture logic.

**Correction direction:** introduce a finite leg-lift entry before the relaxed swing, preserving the final prepare joint pose at perform p=0.

### C7 — P2: Flower placement has uncaptured entry and return jumps

**Source:** `site/studio-character-rig.js:270`, `:276-278`; carryFlower is excluded from the generic captured finish/neutral interpolation at `:405` and `:412`. Perform has angle `.09`, head tilt `.13`; finish p=0 overwrites both with zero. Finish p=1 restores the carry hand `(86,98)`, not the neutral hand `(89,107)`.

**Measured:** carryFlower variant 0, complete prepare and perform, then finish p=0 moves head from `(66.73478,42.41332)` to `(59,42)`: **7.74582 units**. Finish p=1 → idle p=0 moves rightHand **9.48683 units**. Variants 1 and 2 produce the same entry result. These are actual phase-edge differences, independent of frame rate.

**Correction direction:** start placement from the captured current pose and end at the same neutral pose used by the scheduler's idle frame, while retaining the planted flower fixture.

**Coverage result and limits:** All **27** scheduler activity action names exist in the rig's 32-action list; no unsupported mapping was found. The scan does not certify other motions: smaller phase-edge differences were seen in juggling/balance, but were not classified without a focused user-visible/contact check. Transport-only walk/turn/lift/land, arbitrary interruptions, every prop transfer, mirror directions and full-site safe placement were outside this final bounded slice.
