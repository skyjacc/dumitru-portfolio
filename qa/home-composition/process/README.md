# Process composition

Owned implementation: `site/studio-process.js` and `site/studio-process.css`.

## Integration

Load the stylesheet after the existing scene styles, and load the script after the i18n controller and before the entry controller. The parent provides `/studio-fonts.css` (`StudioSans` and `StudioHand`) and the existing Manrope fallback.

```js
portfolioProcess.mount(document.getElementById('studio-home'));
// Once the home props have moved to their Process edge positions:
portfolioProcess.show({ onBack: returnToHome });
// Before another scene becomes interactive:
portfolioProcess.hide();
```

The entry controller owns `body[data-entry=process]`, scene gestures, Escape, navigation transitions and focus restoration. `show` focuses the panel's Back button without scrolling. `hide` immediately makes the component hidden/inert and does not restore focus. `getState()` returns visibility, selected step, mobile open step, breakpoint state and locale.

All five desktop descriptions stay in place. Hover/focus/click only change emphasis and the circled number. The mobile presentation is a single-open accordion; its active item may also be collapsed. Language changes preserve the selected item. Only the panel can scroll; its passive wheel/touch propagation guards preserve normal scrolling without moving the parent scene.

Copy is original EN/RO/RU, with no fixed delivery duration, pricing, guaranteed SEO result or implied automatic CMS/support service.

## Verification

`node qa/home-composition/process/review.cjs` ran against the local asset server at `http://127.0.0.1:8943/` in headless Chrome. It uses an isolated page retaining that origin, so real font files load rather than silently falling back.

**80 checks, zero failures** across 1440×900, 390×844, 320×568 and 844×390, in English, Romanian and Russian:

- All five step interactions; desktop body visibility and mobile disclosure state.
- Panel bounds and document horizontal overflow.
- Back receives focus, callback fires once, hiding sets hidden/inert.
- No JavaScript page errors.
- StudioSans and StudioHand font faces actually loaded, including a Cyrillic text request.

Screenshots and structured results are adjacent to this document. `1440-en.png`, `390-ro.png` and `320-ru.png` were inspected visually. This validates the component in isolation; root still needs to verify surrounding prop/header overlap and transitions in the assembled scene. At short heights, lower rows remain accessible by the panel's vertical scroll.

## Modern Web Guidance

Applied `modern-web-guidance` skill version `2026_11_09-5bcc021b`. Searched `responsive accordion` and retrieved `accordion` plus `html`; the complete retrieved guide text is saved as `guides.md`.

Relevant instructions applied:

- **accordion:** “Use a custom accordion only when each item is a section of the page that needs its own heading”. Each step uses a real heading and native button.
- **accordion:** “Place the `button` inside the heading so the heading keeps its semantics”.
- **accordion:** “Do not add arrow key navigation, roving `tabindex`, or `Home`/`End` handling.” Native button keyboard behavior is retained.
- **html:** “DO use `<button>` for triggered actions”.
- **html:** “DO use the global `inert` attribute for entire hidden sections”.
- **html:** “DO maintain focus—moving it to a logical adjacent element or returning it to the trigger control—when the currently focused element is hidden or removed.” Opening focuses Back; returning focus is explicitly delegated to the scene controller.

The mobile bodies use `hidden="until-found"` with `beforematch` to open a found step. Browsers without this feature retain ordinary hidden behavior. Reduced-motion users receive immediate emphasis changes without the entrance transition.
