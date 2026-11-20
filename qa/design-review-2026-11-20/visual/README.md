# Visual and content review — 20 November 2026

Reviewed production runtime `875b227`, checkout `5ae0bd5`. These are design observations, not newly proven functional defects. The black paper desk, illustrated navigation, original Home walker, broken phone and native spatial project mechanism are the approved design. They remain the baseline.

## Inspected evidence

- `desktop-home-settled.png`: nine props, short introduction, paper laptop arrow and restrained header at 1440×900.
- `desktop-process.png`: five steps, handwritten titles and plain-language body copy; selected row is brighter.
- `desktop-about.png` / `desktop-contact.png`: sharp DOM type, real photos and actual contact actions in the paper phone. Lower cracks are intentional.
- `desktop-work.png` / `desktop-ora.png`: the five-case overview and opened ORA material, stable shared navigation, paper thumbnails and View site action.
- `../accessibility/webkit-home-key-result.png` and `webkit-copy-fallback.png`: settled 390×844 Home and phone Contact, normal text size. The focused Contact ring in the first capture is keyboard focus, not an unwanted permanent border.
- Enlarged text and normal mobile About/Process evidence are recorded by the accessibility reviewer separately.
- Normal mobile About/Process/Work screenshots `../accessibility/webkit-normal-{about,process,work}.png` were also inspected after the follow-up. They have no font-size override.

`desktop-home.png` was taken immediately after `portfolioEntry.ready`. It captures the intentional loader-to-paper reveal before the props have entered. It is **not** evidence of missing artwork. The settled capture and loading code explain the timing. One independent Node REPL mobile browser attempt timed out; it is not counted as a passed test or a site defect.

## Keep

The personal objects and handwritten accents give the introduction a recognizable identity. Shared navigation remains understandable without relying only on icons. About/Contact use readable HTML instead of enlarged screenshot text. The case description is short, and concept status is visible beside the external destination. No generic card grid, extra effects library, new font or redesign is justified by this pass.

## Optional polish, after confirmed defects

### V1: Make the first sentence more specific about the service

“Hey, I’m Dumitru. I turn ideas into websites.” identifies the person and activity, but gives a potential customer little information about fit. This is a copy recommendation, not a broken flow. A possible equally short alternative for the original local-business audience is “I’m Dumitru. I design and build websites for local businesses.” Confirm the intended audience before committing that narrower positioning. Keep the handwritten emphasis and existing composition; do not add paragraphs or claims about client results.

### V2: Reveal what the selected material represents on touch

The paper thumbnails show a number and small preview. Their descriptive labels already exist as `title` and `aria-label` in `site/portfolio-ui.js:213`, so accessibility naming is not missing. A touch visitor, however, does not have a dependable hover title and may not know whether a screenshot is a mobile layout, planner or demo form.

Consider one small, stable label for the selected material, using the existing localized `materialLabels`, such as “Mobile layout” or “Stay planner · demo.” It should not move the title, reduce the image area, replace the paper thumbnails, or add an unnecessary paragraph. This is a presentation option, not authorization to rewrite the carousel.

### V3 / P3: Work's touch instruction describes a mouse wheel

At 390×844 on a touch context, Work still says “Drag to explore · Scroll to zoom.” The visible evidence is `../accessibility/webkit-normal-work.png`. The string is unconditional in `site/entry-flow.js` (EN/RO/RU `hint` copy). The existing board supports pinch; the instruction should describe the actual input method, e.g. “Drag to explore · Pinch to zoom” for touch. This is a small usability/content mismatch, not a broken zoom interaction. Localize the same distinction in RO/RU and preserve the quiet footer styling.

### V4: Process emphasis is a polish question, not an automatic contrast failure

Inactive rows are deliberately dimmed. Keep the moving marker and active-row emphasis. If testing with prospective clients shows that they read those rows as disabled, increase resting emphasis slightly; do not claim an accessibility failure from a screenshot alone. Computed contrast is approximately 4.50:1 for large headings and 5.30:1 for descriptions, meeting their respective thresholds in the measured desktop state. Full evidence is in the accessibility report.

## Guidance used

Modern Web Guidance `form-factor-adaptation` and `natural-interactions` were retrieved in full for touch targets, clear focus, container fit and input ownership. Useful anchors: “Label icon-only buttons” and “Make every action reachable without a mouse.” These informed the review only; no runtime CSS/API changes were made.

The external source selection is in `../sources/README.md`: Vercel for controls/focus, Emil for interruptible motion, and Jakub for typography and optical polish. Their general preferences do not override this project's approved spatial/paper direction. Images and generated measurements are local evidence, not deployed assets.
