# Accessibility and input review, 20 November 2026

Read-only review of production `https://dumitru-spatial-portfolio.vercel.app/`, runtime `875b227`, repository HEAD `5ae0bd5`. No application files changed. Public `entry-flow.js` matches the checked-out file (SHA-1 `9f7381522f6454c95449aefd194de89a65fd3d55`).

## Confirmed finding

### A1 / P2: Home key closes Contact while selecting the fallback email address

1. Open Contact.
2. Let Clipboard API fail or be unavailable, then activate Copy email. The app correctly exposes its readonly email field, focuses it and selects the address.
3. Press the unmodified Home key to move the caret to the beginning of that field.
4. Instead, the phone closes and the whole application returns Home; focus moves to the outer Contact button.

Reproduced independently in Chromium and WebKit against the public deployment. The only injected condition is Clipboard API rejection in the test browser; production code and assets are untouched. State evidence is `chromium-probe.json` / `webkit-probe.json`, entries `copy-denied` and `home-key-in-email`. Before/after screenshots are `*-copy-fallback.png` and `*-home-key-result.png`.

Cause: `site/entry-flow.js:354` captures every unmodified Home key on `document` without excluding inputs, textareas, editable elements, or other widgets that own this key. The actual fallback is created/focused by `site/studio-about.js:152–161`. A bounded correction should yield to text-control/native key behavior before executing the global scene shortcut. No redesign or new dependency is required.

## Smaller semantic improvement

### A2 / P3: Home, About and Process have no exposed main landmark

The Chromium browser accessibility tree (CDP `Accessibility.getFullAXTree`, not a DOM-derived approximation) has one `main` in Work, but zero in Home/About/Process. `setMode()` makes `#portfolio-root` inert on those sections (`site/entry-flow.js:146–151`), while the active content lives in the sibling `section#studio-home` (`site/entry-flow.js:14`). About and Process retain meaningful headings/regions, so content is reachable; this is a landmark-navigation improvement, not a blocked flow. Assigning the active scene an appropriate main landmark would restore a consistent jump-to-main target without changing the visible composition.

## What was verified / ruled out

- Real Tab traversal over Home, About, Process and Work never focuses an inert descendant and does not auto-open the old native About/Process. Work exposes the five real case links.
- Actual Chrome accessibility tree excludes inactive scenes correctly. An initial Playwright `locator.ariaSnapshot()` appeared to include inert content, but CDP accessibility data and real Tab input disproved that. **No stale Work/Home heading leak is reported.** `focus.json` records the browser tree and traversal.
- Clipboard denial produces a usable selected-address fallback before the Home-key defect; this is not a broken copy fallback itself.
- At 390×844, a 200% root text-size override leaves About/Contact inside the viewport and retains internal vertical scrolling. Screenshots show readable HTML text and no giant scrollbar. This is a targeted text-resize stress probe, not a claim of testing all OS text settings.
- A 720×450 CSS viewport (layout equivalent to a 1440×900 desktop content area at 200% browser zoom) retains Process content with its internal scroller. This is a reflow proxy, not an actual physical zoom gesture.
- Document titles update to Home/About/Contact/Process appropriately. No page JavaScript errors in either browser probe.
- Follow-up: Work → Home leaves Work white only while the pointer remains over it. `aria-current=false`; moving the pointer away restores the dark background. This is hover styling, not an active-state defect (`visual-followup.json`).
- Settled desktop Process inactive headings composite from rgb(232,231,226) at opacity .5 over #080808 to approximately rgb(120,119.5,117): contrast 4.4996:1 at 27.36px/500, meeting the large-text 3:1 threshold. Inactive 14px descriptions at opacity .62 give 5.30:1. No contrast failure is reported; perceived handwritten-font legibility can still be considered visual polish.
- Normal-size 390×844 WebKit screenshots are `webkit-normal-home.png`, `webkit-normal-about.png`, `webkit-normal-process.png`, and `webkit-normal-work.png`; unlike `font200` captures, these have no text-size override.

## Guidance and limits

Modern Web Guidance was searched with `audit keyboard focus`, then `accessibility` was retrieved and read. The relevant rules include “Provide a logical tab order” and “Use one `<main>` landmark per page.” They informed the input and landmark checks; runtime code was not changed in this review. The current guide explicitly warns: “Don't rely purely on scores.” No numeric accessibility score or compliance certification is claimed.

Tests used desktop Chromium and Chromium/WebKit touch viewport emulation, not a physical iPhone or a Narrator/VoiceOver session. Font-only resizing is separate from page zoom. The broad prior regression matrix was not relabeled as a fresh pass. No hidden-content finding was accepted solely from static markup or a Playwright ARIA snapshot.

## Reproduce

```powershell
node qa/design-review-2026-11-20/accessibility/probe.cjs
$env:ENGINE='webkit'
node qa/design-review-2026-11-20/accessibility/probe.cjs
node qa/design-review-2026-11-20/accessibility/focus.cjs
node qa/design-review-2026-11-20/accessibility/visual-followup.cjs
```

`probe.cjs` intentionally captures the current Home-key failure; its `settled('home')` after that key is a reproduction observation, not an expectation for a corrected release. Images and JSON are local evidence; only report and runnable scripts are source artifacts.
