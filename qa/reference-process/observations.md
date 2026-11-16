# Reference Process / navigation inspection

Source: https://webdesign.kernjosh.com/ — inspected 2026-11-16 at 1440 × 1000, Chrome via Playwright. Research captures only; no original artwork was downloaded for reuse and no product files were edited.

## Grounded observations

1. **Five individual navigation pills, upper right.** Labels are Work, Process, Template, About, Contact. Each has a small expressive monochrome icon and text, an approximately 42 px height, fully rounded corners, 8 px gaps, and a soft cream fill. Hover and open Process use a darker fill. The useful pattern is a compact icon + label control with a clearly visible active state; the handmade icons and texture belong to this specific visual identity.
2. **Process is a spatial mode on the same URL.** Clicking it fades the home sentence, then moves surrounding objects toward the viewport edges and reveals a roughly 700 px wide central process list. The navigation remains in place. A Back pill is inserted to the left of Work; Process keeps the darker selected fill. Screenshot 03 captures the early fade; 04 captures the scene change.
3. **Five numbered rows remain visible together.** Short heading on the left, explanatory paragraph on the right. Labels: Getting to know you; Designing the site; Building the site; Handover & going live; After launch. The selected number gains an outline circle and its text is dark; the other rows fade. Clicking row 3 and row 5 changes that emphasis, without routing or replacing the entire list. Screenshots 06 and 07 show those states.
4. **Desktop wheel is not the selection mechanism.** A wheel gesture of +850 over the open scene left window.scrollY at 0 and left step 1 selected. Rows respond to click. Small content position changes during row interactions are presentation animation rather than document scrolling. This test does not establish small-screen behavior.
5. **Back reverses the scene transition.** Clicking the visible Back pill restores the original home composition and sentence, removes Back, and clears Process selection. The URL is unchanged throughout. Screenshot 08 verifies the return.

## Adaptation for the existing dark spatial portfolio

Keep the existing dark background and spatial objects. Use quiet charcoal pills with light text and simple custom line icons; brighten the fill/border on hover and selection. Add Process alongside the existing useful navigation items (do not add Template just to match the reference). Clicking Process can gently move or dim the portfolio objects and open a centered ordered list with 4–5 original stages and concise original copy. Use a small numbered marker and clearer opacity contrast than the reference so inactive rows remain readable. Keep navigation visible, expose a Back control, restore focus on close, support Escape, and provide an ordinary vertically scrollable layout on narrow screens / reduced motion.

## Captures

- 01-closed.png — home and navigation
- 02-pill-hover.png — Process hover fill
- 03-opening.png — opening fade (approximately 120 ms after click, subject to capture timing)
- 04-open.png — open Process
- 05-after-scroll.png — wheel gesture, active step unchanged
- 06-third-step.png — selected third step
- 07-fifth-step.png — selected fifth step
- 08-back.png — restored home
- states.json — measured navigation geometry, active states, URL and window scroll position

Limits: desktop layout only; exact animation timing was not measured; mobile menu and keyboard semantics were not audited. Automated role lookup for Back initially missed its accessible name; selecting its observed CSS class then successfully exercised the actual button. No general site failure encountered.
