# Language navigation and Motion rollover

Replaced the rejected split-flap implementation with Motion's documented whole-label rolling pattern. No per-character slicing, fixed viewport glyph overlay, or alphabet scrambling remains. Existing markup such as the handwritten `ideas` word moves as one complete label; semantic localized text remains present once, while the two temporary visual copies are aria-hidden. Normal cleanup restores the original child nodes. Navigation, resize, hidden-document, scrolling, reduced motion and a newer locale request cancel the decorative pass.

The selector is now one real `.nav-pill`: illustrated globe, current EN/RO/RU code and a small chevron. The dropdown lists English, Română and Русский in that order, with the current choice highlighted. Desktop font family, 13px size, weight 500, 44px height, border, radius and surface match Work. Native buttons preserve keyboard operation; Escape dismisses and restores the trigger, while arrows/Home/End move within the open choices. The popup is positioned within the viewport.

## Sources and choice

- [Motion rolling-label documentation](https://motion.dev/docs/text-animation#rolling-text-hover): the selected ready animation concept. The implementation adapts its complete-label rollover to a locale update and preserves the existing typography.
- [Motion JavaScript animate](https://motion.dev/docs/animate): the actual free library API used, imported from the self-hosted `motion/mini` 14.14.0 bundle. It drives transforms and opacity. MIT license is retained in `site/vendor/MOTION-LICENSE.md`.
- [Motion splitText](https://motion.dev/docs/split-text): researched but not used; that utility belongs to Motion+. No paid asset/access token is needed for the selected solution.
- [PQINA Flip](https://pqina.nl/flip/): researched as a literal split-flap board. Its fixed cell/card treatment would impose a counter-like visual on the mixed typography, so it was not chosen for the page's translated text.

Runtime files are `studio-language.js`, `studio-language.css`, and the language-control portion of `portfolio-ui.js`. Shell changes were unnecessary. The vendor is local, version pinned, and not fetched from a third-party service by visitors. `invokers-polyfill` 1.0.4 is conditionally imported only when Invoker Commands support is absent; its MIT license is retained. If the Popover API itself is absent, the narrowly scoped manual fallback uses the same visible buttons and outside/Escape dismissal. See `site/vendor/LANGUAGE-SOURCES.md` for package/CDN provenance.

## Verification

`review.cjs` passed **64/64** checks: desktop 1440×900, touch 390×844, narrow touch 320×568 and reduced motion. It checks actual trigger/option clicks, EN→RO→RU→EN, menu bounds, typography, finished text/cleanup, keyboard navigation, rapid last-selection-wins, Process localization, About→Back during a text transition and page errors. Full recordings are in `videos/` and referenced by `report.json`.

`final-visual.json` confirms settled popup opacity 1 and no remaining transition nodes on desktop/mobile; the narrow case disables the Popover IDL to exercise the manual fallback. `desktop-menu-settled.png`, `mobile-menu-settled.png` and `desktop-settled-ru.png` were visually inspected. Earlier `*-menu.png` files intentionally capture the entrance and can have partial opacity; they are not the settled appearance.

This is Chromium desktop/emulated touch evidence, not physical phone or cross-engine certification. Native project navigation is separately reviewed by the integration agent.

## Modern Web Guidance

I applied `motion`: animation uses whole-label transforms/opacity and cleanup restores semantic final text even if the visual effect is cancelled, following “Keep the final state”. Reduced motion bypasses the rollover.

I applied `declarative-dialog-popover-control`: the button uses only `commandfor` and `command`, without double invocation through `popovertarget`; “Do NOT combine `popovertarget` and `commandfor` on the same `<button>`”. Feature detection conditionally loads the Invoker polyfill, while missing Popover support takes the documented manual-fallback option. Retrieved guides are saved beside this report.
