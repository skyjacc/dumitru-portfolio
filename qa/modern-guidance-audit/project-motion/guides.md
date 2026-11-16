--- Guide for motion ---
# Motion

- Use `clip-path` and `mask-image` for custom geometric reveals and smooth fade-outs. Both also clip the element's own focus outline, so when the clipped or masked element is focusable (for example, a scroll container with `tabindex="0"`), draw its focus indicator on a parent element that isn't clipped or masked.
- Use **Scroll-Driven Animations** (`animation-timeline: scroll()`) for non-essential scroll-bound effects instead of JS listeners.
- Use **View Transitions** to animate between complex layout states seamlessly.

## Performance

- Prefer to animate `opacity` and `transform` (including individual transform properties, e.g. `translate` instead of `left/right/top/bottom`) to ensure animations stay on the compositor thread.
- Use `transition-behavior: allow-discrete`, `@starting-style`, and (for top-layer elements like `<dialog>` or `[popover]`) `overlay` to animate discrete entry and exit states natively; see `animate-element-entry-exit` (via `npx -y modern-web-guidance@latest retrieve "animate-element-entry-exit"`) and `animate-to-from-top-layer` (via `npx -y modern-web-guidance@latest retrieve "animate-to-from-top-layer"`).

```css
.popover-reveal {
  /* Transition discrete display and top-layer overlay alongside opacity */
  transition:
    opacity ease-out,
    display,
    overlay;
  transition-duration: 0.2s;
  /* Separate after transition so the shorthand doesn't reset it or fail in older browsers */
  transition-behavior: allow-discrete;
}
```

## Accessibility

- **Provide a pause mechanism**: Allow users to stop auto-running carousels, banners, or other persistent animations. Any moving, blinking, or scrolling content that starts automatically, lasts more than five seconds, and is shown alongside other content needs a visible control to pause, stop, or hide it, such as a `<button>` next to the content that works with the keyboard (WCAG 2.2.2 Pause, Stop, Hide). `prefers-reduced-motion` doesn't replace the control, because users who haven't turned on that setting still need to stop the motion. If the button's label changes between "Pause" and "Play", don't also set `aria-pressed`, or screen readers announce a pressed "Play" button.
- **Default to static views**: Consider defaulting to static states and allowing users to opt in to motion.
- **Don't exceed flash limits (three per second)**: Never include rapid light-to-dark flashing. Such effects can cause seizures. This applies whatever the user's motion preference, so don't put flashing content inside `@media (prefers-reduced-motion: no-preference)` either (WCAG 2.3.1 Three Flashes or Below Threshold: nothing flashes more than three times in any one-second period).
- **Keep the final state**: When you turn off an animation, make sure the element still ends in its final state, so content isn't left hidden (for example, at `opacity: 0`) and focus and selection indicators still appear.

### Respect reduced motion

Always respect reduced motion preferences. Choose between `@media (prefers-reduced-motion: no-preference)` and `@media (prefers-reduced-motion: reduce)` based on whether reduced motion removes the animation entirely or only adjusts its parameters:
- Use `@media (prefers-reduced-motion: no-preference)` when the reduced-motion strategy is to **not have the animation at all** (apply the animation only where needed rather than declaring it broadly and canceling it with `animation: none`).
- Use `@media (prefers-reduced-motion: reduce)` when the reduced-motion strategy is to **change animation parameters** (such as slowing down `animation-duration`).

**DO NOT** globally apply `animation-duration: 0.01ms;` as it can cause certain animations to become _more_ jarring. Instead, handle reduced motion on a case-by-case basis by nesting the `@media` query inside the rule so both versions are kept together. Keep non-motion transitions (such as `color` or `background-color` changes on links and buttons) enabled; only dampen or disable spatial movement, scaling, rotation, or persistent animations.

#### Opt in to motion with `@media (prefers-reduced-motion: no-preference)`

When reduced motion should have no animation at all, default to the static state and enable the animation inside `@media (prefers-reduced-motion: no-preference)` instead of setting `animation` and overriding it with `animation: none`:

```css
/* Good: Default to static state and opt in to full motion */
.spinner {
  @media (prefers-reduced-motion: no-preference) {
    animation: spin 1s linear infinite;
  }
}
```

#### Adjust animation parameters with `@media (prefers-reduced-motion: reduce)`

When the animation should still run under reduced motion with gentler parameters, declare the base animation and override only the changed properties inside `@media (prefers-reduced-motion: reduce)`:

```css
/* Good: Slow down the animation for reduced motion instead of canceling it */
progress:not([value]) {
  animation: slide 1s infinite linear;
  @media (prefers-reduced-motion: reduce) {
    animation-duration: 20s;
  }
}
```

## Working with animation and transition events in JavaScript

On both the `AnimationEvent` (`animationstart`, `animationiteration`, `animationend`, `animationcancel`) and `TransitionEvent` (`transitionrun`, `transitionstart`, `transitionend`, `transitioncancel`) interfaces, `event.target` gives you the originating DOM element. To access the specific `Animation` object (`Animation`, `CSSAnimation`, or `CSSTransition`) that triggered the event, use the readonly `event.animation` property.

When `event.animation` is not available, you can usually find the `Animation` instance by calling `event.target.getAnimations()` and filtering by `event.animationName` (or `event.propertyName` for transitions). However, using `event.animation` directly is preferred, in order to avoid several scenarios where this fallback that filters `event.target.getAnimations()` does not work as expected:

- Web Animations API (`element.animate()`) animations do not have an `animationName`, so they cannot be matched by name when filtering `event.target.getAnimations()`.
- Filtering by `animationName` for `AnimationEvent`s is ambiguous when multiple animations with the same name are attached to the same element.
  - Note that filtering on `transitionProperty` for `TransitionEvent`s works as there is only one event per transition property. 
- `event.target` always points to the originating DOM element, so it does not distinguish between animations running on the element itself versus one of its pseudo-elements — whereas `event.animation.effect.pseudoElement` exposes the target pseudo-element directly.

```js
// Works in most basic CSS animation cases, but fails for WAAPI animations,
// duplicate animation names on the same element, or pseudo-elements.
document.addEventListener('animationstart', (event) => {
  const animation = event.target
    .getAnimations()
    .find((anim) => anim.animationName === event.animationName);
  console.log(animation);
});

// PREFERRED: Directly access the exact Animation object via event.animation
document.addEventListener('animationstart', (event) => {
  const animation = event.animation;
  console.log(animation);
});
```

You can feature-detect support using `'animation' in AnimationEvent.prototype` (or `'animation' in TransitionEvent.prototype`).

When reduced motion means an animation or transition never runs (it's only applied inside `@media (prefers-reduced-motion: no-preference)`, set to `none`, or given a zero duration and no delay), `animationend` and `transitionend` never fire. If your code waits for these events to remove or hide an element, continue immediately when `element.getAnimations()` returns an empty array, or keep a short opacity transition instead of removing it.


--- Guide for identify-inp-causes ---
# Identify causes of poor INP

Poor responsiveness to interactions leads to a poor impression of a page being slow or even completely broken. Interaction to Next Paint (INP) is a metric based on the Event Timing API. It measures the worst interaction (minus some outliers) as a measure of the page's responsiveness.

Identifying root causes of an unresponsive web page can be tricky especially as it depends on user interactions and environmental conditions such as device capabilities and network conditions. This makes it even more difficult to diagnose compared to a more repeatable and predictable scenario like page load. Lab data only replicates a small subset of real user scenarios so measuring the causes of slow INP in the field is essential.

The Event Timing API allows for splitting the INP duration into three subparts: Input Delay (processing that is already happening when the interaction happens), Processing Duration (delays due as a direct result of the interaction), and Presentation Delay (delays that are due to rendering the next frame after the interaction). This helps identify if the issue is in other code, the interaction JavaScript code, or browser processing rendering updates respectively rather than jumping straight to the interaction code.

It is possible to gather further insights into JavaScript, style recalculation, and layout work delaying an interaction. A full performance trace using the JS Self-Profiling API is a heavyweight solution that is liable to cause performance problems. The Long Animation Frames API is a lightweight API that can be used in the field to identify slow-running JavaScript and distinguish between style recalculation and layout costs during INP interactions:

- **Script-level forced style and layout (`forcedStyleDuration` and `forcedLayoutDuration`):** Reports synchronous style recalculations (such as calling `getComputedStyle()` after DOM mutations) and forced layouts/reflows (such as reading `getBoundingClientRect()` or `offsetWidth` after mutations) inside a running script during **Input Delay** or **Processing Duration**.
- **Frame-level rendering style and layout (`styleDuration` and `layoutDuration`):** Reports time spent recalculating styles versus updating layout during the frame's rendering update, helping explain high **Presentation Delay**.

Distinguishing style recalculation from layout is critical because they have different root causes and fixes: high style duration points to expensive CSS selector matching or broad style invalidation (remediated by simplifying selectors or reducing rule scope), whereas high layout duration points to expensive geometry calculations or synchronous layout thrashing (remediated by batching DOM reads before writes, simplifying DOM structure, or using CSS containment).

## How to implement

Calculating INP from the raw Event Timing API is complicated and has several nuances. You are advised to use a RUM tool or library to gather this data.

`web-vitals` is an open-source library from Google that calculates the Core Web Vitals including INP, and also includes subparts and long animation frame data for the INP interaction.

## Get attributions for INP interactions using web-vitals library

The `web-vitals` library is a tiny library used to measure Core Web Vitals and other performance metrics. The `onINP()` function can be used to identify the slowest interaction and includes information about the INP subparts, scripts that were executed during the interaction, and style and layout durations using the Long Animation Frames API.

```javascript
// Use the attribution build to get Long Animation Frame data
// alongside the INP metric value.
import { onINP } from 'web-vitals/attribution';

onINP((metric) => {
  const { attribution } = metric;
  const longestScript = attribution.longestScript;

  // Sum rendering-phase style and layout durations across all LoAF entries
  // intersecting the INP interaction (primarily explains presentationDelay).
  let renderStyleDuration = 0;
  let renderLayoutDuration = 0;
  for (const entry of attribution.longAnimationFrameEntries) {
    renderStyleDuration += entry.styleDuration ?? 0;
    renderLayoutDuration += entry.layoutDuration ?? 0;
  }

  // Beacon script, style, and layout attribution for the INP interaction,
  // so you can identify the root cause in production.
  navigator.sendBeacon(
    '/analytics',
    JSON.stringify({
      name: 'INP',
      value: metric.value,
      // These fields give the INP subparts:
      inputDelay: attribution.inputDelay,
      presentationDelay: attribution.presentationDelay,
      processingDuration: attribution.processingDuration,
      interactionTarget: attribution.interactionTarget,
      // These fields identify which script function was responsible
      // for the longest processing during the INP interaction.
      invokerType: longestScript?.entry?.invokerType,
      sourceURL: longestScript?.entry?.sourceURL,
      sourceFunctionName: longestScript?.entry?.sourceFunctionName,
      sourceCharPosition: longestScript?.entry?.sourceCharPosition,
      // subpart indicates which phase (input delay, processing, or
      // presentation delay) the longest script overlapped with most.
      subpart: longestScript?.subpart,
      intersectingDuration: longestScript?.intersectingDuration,
      // Synchronous style and layout work forced inside the longest script
      // (with forcedStyleAndLayoutDuration as a combined fallback):
      forcedStyleDuration: longestScript?.entry?.forcedStyleDuration,
      forcedLayoutDuration: longestScript?.entry?.forcedLayoutDuration,
      forcedStyleAndLayoutDuration: longestScript?.entry?.forcedStyleAndLayoutDuration,
      // Rendering-phase style and layout work across the interaction's frames
      // (with totalStyleAndLayoutDuration as a combined fallback):
      renderStyleDuration,
      renderLayoutDuration,
      totalStyleAndLayoutDuration: attribution.totalStyleAndLayoutDuration
    })
  );
});
```

## Best Practices

- **DO** use INP subparts initially to identify whether the delay is already running JavaScript (input delay), the event handlers JavaScript for the interaction (processing duration), or the subsequent rendering (presentation delay).
- **DO** attempt to identify the biggest blocking JavaScript as additional detail, particularly for input delay, and processing duration.
- **DO** distinguish between style recalculation (`styleDuration`, `forcedStyleDuration`) and layout (`layoutDuration`, `forcedLayoutDuration`) when diagnosing high processing duration or presentation delay: high style times indicate expensive CSS selectors or broad invalidations, while high layout times indicate DOM geometry bottlenecks or synchronous layout thrashing.
- **DO** prefer the Long Animation Frames API for providing this further detail over alternatives like the JS Self-Profiling API, which carries higher runtime overhead.
- **DO** use the `web-vitals` library if no other RUM solution is in place. It can identify the INP interaction and includes information about the subparts and the scripts that were executed during the interaction (using the Long Animation Frames API).
- **DO** beacon back the required information to an analytics service rather than just log it locally.

## Browser support and fallback strategies

Baseline status for Event timing performance entries: Newly available. It's been Baseline since 2025-12-12.
Supported by: Chrome 76 (Jul 2019), Edge 79 (Jan 2020), Firefox 89 (Jun 2021), and Safari 26.2 (Dec 2025).

The Event Timing API is available in most modern browsers and is necessary to calculate INP and the INP subparts. For browsers that do not support this API INP cannot be measured.

Browser support for Long animation frames performance entries: Limited availability.
Supported by: Chrome 123 (Mar 2024) and Edge 123 (Mar 2024).
Unsupported in: Firefox and Safari.

The Long Animation Frames API provides optional, additional details. It can be safely used without fallbacks. In most cases the performance opportunities it identifies will apply to other browsers as well.

If your Baseline target supports the Long Animation Frames API (`long-animation-frames`) but does not support separate style and layout duration properties (`styleDuration` and `layoutDuration` on `PerformanceLongAnimationFrameTiming`, or `forcedStyleDuration` and `forcedLayoutDuration` on `PerformanceScriptTiming`), fall back to the combined style-and-layout timings:
- Use `script.forcedStyleAndLayoutDuration` on `PerformanceScriptTiming` for synchronous forced style and layout work inside scripts.
- Use `metric.attribution.totalStyleAndLayoutDuration` in `web-vitals/attribution` (or compute `(entry.paintTime || entry.startTime + entry.duration) - entry.styleAndLayoutStart` on each `PerformanceLongAnimationFrameTiming` entry) for combined style and layout work.


--- Guide for accessibility ---
# Accessibility Coding Guidelines

This guide provides actionable DOs and DON'Ts for AI coding agents to ensure web applications are accessible to all users, including those using assistive technologies.

Keep these principles in mind throughout:

- **Accessibility is the minimum, not the ceiling.** Conformance to standards is the floor; aim for genuine usability.
- **Patterns are use-case specific.** No checklist replaces real testing — including testing with disabled users — to confirm a given implementation is actually accessible in context.

Contents:

- [1. Content Navigability and Structure](#1-content-navigability-and-structure)
  - [Landmarks](#landmarks)
  - [Headings](#headings)
  - [Lists](#lists)
  - [Tables](#tables)
  - [Skip links](#skip-links)
  - [Code example: good use of landmarks, headings, lists, tables, and a skip link](#code-example-good-use-of-landmarks-headings-lists-tables-and-a-skip-link)
- [2. Semantic HTML and ARIA](#2-semantic-html-and-aria)
  - [Prefer native HTML](#prefer-native-html)
  - [ARIA roles and states](#aria-roles-and-states)
- [3. Accessible Names and Descriptions](#3-accessible-names-and-descriptions)
  - [Naming mechanisms](#naming-mechanisms)
  - [Choosing the name](#choosing-the-name)
  - [Descriptions](#descriptions)
  - [Code Example: Visually Hidden Utility](#code-example-visually-hidden-utility)
- [4. Document Metadata and Language](#4-document-metadata-and-language)
  - [Language](#language)
  - [Titles](#titles)
  - [Iframes](#iframes)
  - [Code Example: using the `<title>` and `<iframe>` elements](#code-example-using-the-title-and-iframe-elements)
- [5. Keyboard and Focus Management](#5-keyboard-and-focus-management)
  - [Tab order and focusability](#tab-order-and-focusability)
  - [Keyboard handlers](#keyboard-handlers)
  - [Focus indicators](#focus-indicators)
  - [Target sizes](#target-sizes)
- [6. Alternate Text and Media](#6-alternate-text-and-media)
  - [Images](#images)
  - [Inline SVGs](#inline-svgs)
  - [Complex images and charts](#complex-images-and-charts)
  - [Audio and video](#audio-and-video)
  - [CSS generated content](#css-generated-content)
  - [Content Visibility Decision Matrix](#content-visibility-decision-matrix)
- [7. Forms and Input Controls](#7-forms-and-input-controls)
  - [Labels and hints](#labels-and-hints)
  - [Input assistance and validation](#input-assistance-and-validation)
- [8. Live Regions](#8-live-regions)
  - [Live Region Urgency Table](#live-region-urgency-table)
  - [When to announce](#when-to-announce-live-regions)
  - [Managing announcements](#managing-announcements)
- [9. Color](#9-color)
- [10. Typography](#10-typography)
- [11. Motion and Preferences](#11-motion-and-preferences)
- [12. Modals and Native Dialogs](#12-modals-and-native-dialogs)
  - [Native `<dialog>`](#native-dialog)
  - [Custom overlays](#custom-overlays)
- [13. Testing Validations](#13-testing-validations)
  - [Automated checks](#automated-checks)
  - [Manual testing](#manual-testing)

## 1. Content Navigability and Structure

### Landmarks

- **Place all content within landmarks:** Wrap each relevant part of the page in `<header>`, `<nav>`, `<main>`, `<aside>`, and `<footer>` elements so assistive-tech users can jump between regions. (1.3.6 Identify Purpose (Level AAA))
- **Use the correct landmark:** Use the `<header>` element as a container for introductory content, the `<nav>` element as a container for site-wide or in-page navigation links, the `<main>` element as a container for the main content of the page, the `<aside>` element as a container for content that is tangentially related to the main content, and the `<footer>` element as a container for information about the related content, such as the author, copyright information, and links to related documents. (1.3.1 Info and Relationships (Level A))
- **Use one `<main>` landmark per page:** Avoid using multiple `<main>` elements on a single page. (1.3.1 Info and Relationships (Level A))
- **Provide distinguishable accessible names for navigation regions:** If a page contains multiple `<nav>` elements, apply the `aria-label` attribute to each element and set its value to a distinguishable accessible name for the region. For example: `<nav aria-label="Primary">`, `<nav aria-label="Secondary">`, and so on. (Best practice)
- **Don't overuse landmarks:** Too many landmarks dilute their value. In particular, avoid labeling a `<section>` (which turns it into a `region` landmark) — `region` should be a last resort when no other landmark fits. (Best practice)

### Headings

- **Structure main content with headings:** Use `<h1>`–`<h6>` elements sequentially so screen reader users get a navigable outline. (1.3.1 Info and Relationships (Level A))
- **Mandatory - Don't use "fake" headings:** Never use `<div>` or `<span>` elements to look like headings without standard `<h1>`–`<h6>` elements. (1.3.1 Info and Relationships (Level A))
- **Avoid nesting headings incorrectly:** Make sure that, if a sub-heading is visually less important than its parent heading, its heading level is lower in the heading hierarchy. (1.3.1 Info and Relationships (Level A))
- **Use one `<h1>` element per page:** Use the `<h1>` element for the page's main heading. Having more than one `<h1>` element on a page makes it difficult for screen reader users to identify the actual main heading. (Best Practice)
  - **Caveat:** If a page includes a modal dialog that is marked up using the `<dialog>` element, `role="dialog"`, or `role="alertdialog"`, it is fine to mark up its main heading using the `<h1>` element because the dialog is a new window that is separate from the page.
- **Avoid "skipped" heading levels:** Avoid jumping directly from (for example) `<h1>` → `<h4>` to avoid breaking the logical hierarchy. (Best Practice)
- **Avoid placing headings inside the `<summary>` element:** Some browsers still expose this element as a button, which removes all roles from its children including headings. If a heading must act as a disclosure trigger, use an accordion or a disclosure implemented with ARIA where the heading element wraps the button, rather than use the `<details>` and `<summary>` elements. (Best Practice)

### Lists

- **Use lists for repeated, contiguous content:** `<ul>`/`<ol>` give assistive tech a count of listitems up front and let users skip the entire list. (1.3.1 Info and Relationships (Level A))
- **Use the correct list element:** Use the `<ul>` element for unordered lists where the order of the items is **not** important (such as a list of related products), and use the `<ol>` element for ordered lists where the order of the content **is** important (such as a list of instructions). (1.3.1 Info and Relationships (Level A))
- **Don't use lists for non-list content:** Do not use list markup to mark up separate paragraphs of text, as screen readers will announce list information when they encounter lists, therefore leading to a screen reader hearing potentially confusing and redundant information about the related content. (1.3.1 Info and Relationships (Level A))
- **Don't use lists for checkboxes and radio buttons:** When marked up correctly, screen readers will already announce the number of checkboxes or radio buttons, as well as the number of the currently focused checkbox / radio button in the set, even though there is no list markup. Additional list markup will lead to duplication. (1.3.1 Info and Relationships (Level A))

### Tables

- **Do use the correct table elements:** Use the `<table>` element to identify the table, the `<caption>` element to provide a title and accessible name for the description, the `<tr>` element to identify individual rows in the table, and the `<th>` and `<td>` elements to identify header and data cells respectively. (1.3.1 Info and Relationships (Level A))
- **Do use the `scope` attribute on `<th>` elements:** The `scope` attribute indicates whether the `<th>` element represents a row header (`<th scope="row">`) or a column header (`<th scope="col">`). (1.3.1 Info and Relationships (Level A))
- **Mandatory - Don't use tables for layout:** Screen readers will announce redundant information about the layout, which may be confusing for screen reader users, while the use of tabular markup has an impact on the reading and keyboard focus order of content. Use CSS Grid/Flexbox for visual layouts instead. (1.3.1 Info and Relationships (Level A))
- **Avoid overly-complex tables:** Spanned rows, spanned columns, nested tables, and expandable / collapsible rows can make sense visually and meet the related WCAG success criterion, but the overall structure can be disorienting and difficult to navigate for screen reader users. In such cases, break tables up into smaller tables that are easier and more efficient to navigate. (Best Practice)

### Skip links

- **Provide skip links** prior to repeated content like site headers with navigation or long/infinite lists, so that keyboard users can easily bypass them. (2.4.1 Bypass Blocks (Level A))
  - **Caveat:** Sometimes screen magnifiers do not follow the focus when a skip link’s target is not normally focusable.
    The recommended workaround is to make the target programmatically focusable, but not a part of the tab order, using `tabindex="-1"`.
    If the target contains focusable elements, this creates another usability issue as clicking within the target will always set the **sequential focus navigation start point** to the target rather than at a point between focusable elements.
    A solution that satisfies both user expectations is to make the first meaningful element within the intended target the actual target of the skip link with `tabindex="-1"`, for example a heading (`<h1 id="content" tabindex="-1">`).
    Beware that any content prior to such an element will be skipped, including other relevant content within the targeted section, and this creates usability gaps for other assistive tech users.
- **Avoid using skip links where they are not needed:** A set of pages whose only common element is a single link to the Home page does not need a skip link. (Best Practice)
- **Avoid overusing skip links:** A single skip link, or two skip links to cover the primary and secondary sets of common navigation links, is usually sufficient on a single page. Multiple unnecessary skip links add to the number of <kbd>Tab</kbd> stops to a page, which causes frustration for people who use the keyboard alone for navigation. (Best Practice)

```html
<!-- Good: Skip to main content -->
<a href="#content" class="skip-link">Skip to main content</a>
<main id="content">...</main>
```

### Code Example: good use of landmarks, headings, lists, tables, and a skip link

```html
<!-- Good: Semantic landmarks, heading hierarchy, skip link -->
<header>
  <a href="#platform-dashboard" class="skip-link visually-hidden">Skip to content</a>
  <nav aria-label="Primary">
    <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </nav>
</header>
<main>
  <h1 id="platform-dashboard" tabindex="-1">Platform Dashboard</h1>
  <section>
    <h2>User Statistics</h2>
    <table>
      <caption>Monthly active users</caption>
      <thead>
        <tr>
          <th scope="col">Month</th>
          <th scope="col">Users</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>January</td>
          <td>12,000</td>
        </tr>
      </tbody>
    </table>
    <h3>Notes</h3>
    <ul>
      <li>Results do not include users without active subscriptions</li>
      <li>Results are accurate as of 31 December 2025</li>
    </ul>
  </section>
</main>
```

## 2. Semantic HTML and ARIA

### Prefer native HTML

- **Prefer HTML elements and attributes to ARIA:** Avoid `<div role="button">` or `<a role="button">` and use `<button>` instead. Native HTML elements and attributes already have the correct role and behavior, including keyboard support, built-in by default. `<button>` already implies `role="button"`, `required` already implies `aria-required`, and no additional JavaScript is required to ensure the correct role and behavior is supported. (Best Practice)
  - **Caveat:** ARIA is required when the related feature is not available in HTML, for example there are no HTML elements explicitly intended for building a tabbed navigation widget, but ARIA includes appropriate role and state properties for this purpose.
- **Don't add redundant ARIA roles or properties:** Avoid `<ul role="list">`, `<nav role="navigation">`, and `<input required aria-required="true">`. (Best Practice)
  - **Caveat:** Safari removes list semantics from `<ul>`/`<ol>` outside `<nav>` when `list-style: none` or `display: flex`/`grid` is applied. In that case `role="list"` is required to restore them.
- **Don't apply interactive ARIA roles to structural HTML elements:** Use `<li><span role="button">Button in a list</span></li>`, not `<li role="button">Button in a list</li>`, to avoid breaking the container list semantics. (4.1.2 Name, Role, Value (Level A))
  - **Caveat:** It is acceptable to apply ARIA roles to structural HTML elements that have similar semantics, for example a tree view: `<ul role="tree"><li role="treeitem">…</li>…</ul>`.

### ARIA roles and states

- **Match ARIA implementations to actual behavior:** When applying `role="tab"` to an element, it must then behave like a tab — including keyboard interactions. Many ARIA patterns can't be implemented in CSS alone and need JavaScript. (4.1.2 Name, Role, Value (Level A))
- **Manage toggle states:** Utilize `aria-expanded` and `aria-pressed` to communicate toggle states for custom controls. (4.1.2 Name, Role, Value (Level A))
- **Be deliberate about `disabled` vs `aria-disabled`:** `disabled` removes the element from the focus order entirely (and `tabindex="0"` won't bring it back), which is often wrong for toolbar buttons or links. `aria-disabled="true"` keeps the element focusable so users can land on it and learn it's disabled, but because it only communicates state to assistive technologies, you must also prevent activation (such as pointer clicks and keyboard triggers) in JavaScript. (4.1.2 Name, Role, Value (Level A))
- **Mandatory - Don't hide interactive elements from screen readers:** Do not apply `aria-hidden="true"` to interactive elements that receive focus, or to their parent elements. (4.1.2 Name, Role, Value (Level A))
- **Mandatory - Don't suppress the roles of interactive elements:** Applying `role="presentation"` or `role="none"` to an interactive element strips its semantics. The element will still be exposed to assistive technologies and announced by screen readers, but its role and any state information will not be, which results in confusion and potentially unexpected behavior. (4.1.2 Name, Role, Value (Level A))
- **Don't assume custom elements have no ARIA:** Custom elements can attach ARIA via `ElementInternals`, which some automated test tools can't see — so the absence of `role`/`aria-*` attributes in markup doesn't prove the element has no semantics. Verify with the browser's accessibility-tree inspector. (Best Practice)

## 3. Accessible Names and Descriptions

Every interactive element and some landmarks need an accessible name, and many benefit from an accessible description. Names are short and identify the element; descriptions add context.

### Naming mechanisms

- **Prefer native naming mechanisms:** `<label>` for form controls, `<caption>` for `<table>`, `<legend>` for `<fieldset>`, `<figcaption>` for `<figure>`. (Best Practice)
- **Explicitly associate `<label>` with its control via `for`/`id`:** As well as ensuring the control is appropriately labeled by the contents of the `<label>` element, this results in a larger target area for people to activate the label _or_ its related control to move focus to the control, which isn't globally supported with other forms of labeling (such as using the `aria-labelledby` attribute). Additionally, some assistive technologies, particularly voice recognition software, require the `for`/`id` relationship to be explicitly set, even if an equivalent accessibility-supported approach (such as nesting an `<input>` inside a `<label>`) is taken. (4.1.2 Name, Role, Value (Level A))
- **Prefer `aria-labelledby` over `aria-label` when a visible label exists:** This avoids duplication, improves maintainability, and translates better. (Best Practice)
- **Don't use `title` as a naming mechanism:** The value of this attribute is only displayed on mouse hover, and cannot be displayed or otherwise accessed using the keyboard in any browser. (Best Practice)
  - **Caveat:** `<iframe>` is an exception, as the `title` attribute is the standard way of providing an accessible name for this element.
- **Don't use `placeholder` as a naming mechanism:** While the value of this attribute is initially displayed inside an `<input>` or `<textarea>`, it disappears as soon as the user enters text into the field, meaning that there is no longer a visual cue as to what the field represents. The contrast between `placeholder` text and its background in most browsers is very low, and therefore is difficult for people to perceive. (3.3.2 Labels or Instructions (Level A))
- **Don't put `aria-label`/`aria-labelledby` on elements that shouldn't be named:** Examples include plain `<div>`, `<span>`, and other custom elements without a role. These attributes are only intended for providing accessible names for elements that have explicit or implicit widget (for example, button, link, and tab), landmark, image, or iframe roles. (1.3.1 Info and Relationships (Level A))
  - **Caveat:** Custom elements may have an implicit role set via `ElementInternals`, so the absence of a `role` attribute isn't conclusive.

### Choosing the name

- **Avoid inconsistent link text:** If multiple hyperlinks direct users to the same target page, make sure each link has the same accessible name, which should typically be the same as its visible link text. For example, if the target page for a link is `profile.html`, make sure that all links have an accessible name of "My Profile" **or** "Profile"; do not use "My Profile" in one instance, and "Profile" in the other. (Best Practice)
- **Disambiguate controls that look visually identical but which perform different actions by their accessible name:** For example, a page may include multiple "Edit" buttons, each of which triggers functionality to perform a different action, such as edit the user's name, edit the user's password, and edit the user's address. While it may be visually obvious from the surrounding content what the purpose of these buttons might be, screen reader users may only hear "Edit, button". Techniques to resolve this include the following: (4.1.2 Name, Role, Value (Level A))
  - **Use visually hidden text:** The text is included in the DOM but is visually hidden using CSS. For example `<button>Edit <span class="visually-hidden">first name</span></button>`. Refer to the [code example: visually hidden utility](#code-example-visually-hidden-utility) for the full CSS.
  - **Apply the `aria-label` attribute to the control:** The value of this attribute should then include the visible text as well as important contextual information, for example `<button aria-label="Edit name">Edit</button>`, `<button aria-label="Edit address">Edit</button>`, and so on.
  - **Use the `aria-labelledby` or `aria-describedby` attribute to associate the control with the content it relates to:** Chaining IDs in `aria-labelledby` appends the related text to the control's accessible name (for example, `<p id="firstName">First name</p> <button id="editFirstName" aria-labelledby="editFirstName firstName">Edit</button>`), whereas `aria-describedby` provides the context as an accessible description (`<p id="firstName">First name</p> <button aria-describedby="firstName">Edit</button>`).
- **Do include a control's visible text in its accessible name:** Any visible text used to label a control must be included exactly as written in the control's accessible name. The accessible name can include additional information before or after the visible text, but the visible text itself must not differ. For example, the accessible name for a link containing the link phrase "Read more" can be "Read more about [subject]", because the visible text is included without modification. However, the accessible name cannot be "Read some more about [subject]", because the term "some" appears between the words "Read" and "more", which is not reflected in the visible text. (2.5.3 Label in Name (Level A))
- **Don't reuse an accessible name across controls with different effects in the same view:** Make sure that each accessible name is disambiguated. (4.1.2 Name, Role, Value (Level A))
  - **Caveat:** Having two separate buttons with the accessible name of "Close" in two separate dialog boxes is fine, because only one dialog box is reachable at a time; however, multiple "Edit" buttons for different effects in the same dialog box is not.
- **Don't reuse an accessible name across hyperlinks that point to different `href` targets:** For example, avoid `<a href="annualreport2025.html">Annual Report</a>` and `<a href="annualreport2026.html">Annual Report</a>`. Use `<a href="annualreport2025.html">Annual Report 2025</a>` and `<a href="annualreport2026.html">Annual Report 2026</a>` (or an equivalent technique for disambiguating controls) instead.
- **Don't pack descriptions, error messages, or instructions into the label:** Verbose labels confuse and frustrate people who use screen readers. Instead, use the `aria-describedby` attribute to programmatically associate any additional content with the field. For example: `<label for="yourComments">Your comments</label><p id="yourCommentsWarning">Please do not include any personal information in this field.</p><textarea id="yourComments" aria-describedby="yourCommentsWarning"></textarea>`. Screen readers will then announce the label first, followed by the control type, and only then announce additional information that a user can skip if they are already aware of it. (Best Practice)
- **Don't repeat state information already exposed by ARIA inside the label:** Examples include information exposed via the `aria-expanded`, `aria-checked`, `aria-selected`, `aria-pressed`, and similar attributes. This creates duplication, redundancy, and ambiguity. (Best Practice)
- **Don't include the role name in the label:** This will lead to duplication. For example, `<nav aria-label="Primary navigation">` will be read by screen readers as "Primary navigation, navigation". (Best Practice)

### Descriptions

- **Identify instructions, error messages, and any other important information explicitly related to a control as a description:** Examples of descriptions include: (1.3.1 Info and Relationships (Level A))
  - A list of password requirements when creating an account
  - An error message related to a field in a previously submitted form
  - Additional instructions, such as "You must agree to the terms and conditions before you can submit the form"
- **Make sure the description is available to assistive technologies when the related element receives focus:** Take one of the following approaches (1.3.1 Info and Relationships (Level A)):
  - If the description is already visible on the page, programmatically associate it with the element using the `aria-describedby` attribute.
  - If the description is not visible on the page and is explicitly for screen reader users (in other words, when providing a visible description is not appropriate or useful), apply the `aria-description` attribute to the element and use it to provide an appropriate description.
- **Avoid including a description for every element:** if the primary label already provides sufficient information (such as "First name"), any additional description is likely to be redundant. (Best Practice)
  - **Caveat:** Inline error messages associated with controls, such as error messages below / above text fields, as well as secondary labels that should be announced when the element receives focus, are exceptions.
- **Avoid including information in the description that is already provided by attributes applied to the element:** For example, including "This is a required field" as a description for an `<input>` element that already includes the `required` attribute will lead to duplicate announcements. (Best Practice)
  - **Caveat:** `aria-invalid="true"` is an exception; many screen readers announce "invalid" when they reach an `<input>` that includes this attribute set to `true`, which indicates that the field is in error. However, it does not indicate what the error is. In such cases, a description (the actual human readable error message) is required. This attribute should only be applied and set to true when the error message is present.
- **Avoid including interactive elements in an `aria-describedby` target** unless the content of the element reads sensibly as a description on its own. For example: (Best Practice)
  - This is acceptable, as the entire text string makes sense when announced: `<p id="description">I understand the <a href="tandc.html">terms and conditions</a>.</p>`
  - This is not appropriate, as the description will be announced as "Please don't include personal information in this field. Learn more.", where "Learn more" will be announced out of its intended context: `<p id="description">Please don't include personal information in this field. <a href="…">Learn more</a></p>`. Instead, only include the plain text in the referenced description: `<p><span id="description">Please don't include personal information in this field.</span> <a href="…">Learn more</a></p>`.

### Code Example: Visually Hidden Utility

A `.visually-hidden` utility provides text for screen readers without rendering it visually. It's commonly used for skip links, additional context on icon-only buttons, and supplementary labels.

```css
/* Hides content visually but keeps it in the accessibility tree.
   :focus-within / :active opt elements out — useful for skip links and
   any focusable content wrapped in this class. */
.visually-hidden:where(:not(:focus-within, :active)) {
  position: absolute !important;
  clip-path: inset(50%) !important;
  overflow: hidden !important;
  width: 1px !important;
  height: 1px !important;
  margin: -1px !important;
  padding: 0 !important;
  border: 0 !important;
  white-space: nowrap !important;
}
```

When the hidden content is focusable (skip links, focus-receiving wrappers), the `:focus-within`/`:active` exception lets it become visible. Style the visible state per situation, e.g. a skip link to the main content typically wants fixed positioning at the top-left of the viewport so the rest of the page doesn't shift.

## 4. Document Metadata and Language

### Language

- **Do declare the page's human language:** Always apply the `lang` attribute to the page's `<html>` element, and always set it to the primary human language of the page's content. For example, `<html lang="en">`. (3.1.1 Language of Page (Level A))
- **Do declare changes in the page's human language:** If there is a language change on the page, apply the `lang` attribute to the parent/container element for the affected content, and set the value of this attribute to the shortcode for the language of the affected content. For example: `<p>In Germany, you may be greeted by someone saying <span lang="de">Guten Morgen</span>.</p>`. (3.1.2 Language of Parts (Level AA))
- **Don't set the value of the `lang` attribute to a value that doesn't match the human language of the content:** This causes screen readers and other text-to-speech software to announce the content in a non-understandable manner. (3.1.1 Language of Page (Level A), 3.1.2 Language of Parts (Level AA))

### Titles

- **Do include the `<title>` element in the `<head>` section for all pages:** This includes pages embedded into a document using an `<iframe>`. (2.4.2 Page Titled (Level A))
- **Provide unique page titles:** Every page should have its own title that unambiguously reflects the page's purpose or content. (2.4.2 Page Titled (Level A))
- **Front-load the page's `<title>` with unique content:** For example, `<title>Page Topic | Site Name</title>`. (Best Practice)
- **Update single-page application (SPA) titles during page transitions:** For example, if the page title is `<title>Contact Us</title>` when a contact form is displayed, update the title to `<title>Thank you for contacting us!</title>` when the form is successfully submitted. (2.4.2 Page Titled (Level A))
- **Don't include an empty `<title>` element in the `<head>` section of a page:** No matter how short or inconsequential a page appears, do not use `<title></title>`. Page titles appear in the browser tab, so pages are distinguishable when users have multiple tabs open, and are typically announced by screen readers when the page is opened. (2.4.2 Page Titled (Level A))
- **Avoid using the same title for multiple pages, or using ambiguous page titles:** In such cases, pages are indistinguishable without reviewing the actual page content itself. (2.4.2 Page Titled (Level A))

### Iframes

- **Do provide a descriptive `title` for `<iframe>` elements:** All `<iframe>` elements should include a `title` attribute set to a value that unambiguously describes the contents of the `<iframe>`. (4.1.2 Name, Role, Value (Level A))
- **Don't disable iframe scrolling** using `scrolling="no"` (deprecated) or `overflow: hidden` on iframes. Users who zoom in or enlarge text need to scroll to reach content that overflows. (1.4.4 Resize Text (Level AA), 1.4.10 Reflow (Level AA))

### Code Example: using the `<title>` and `<iframe>` elements

```html
<!-- Good: Distinct title and language declaration -->
<html lang="en">
<head>
  <title>Analytics Reports | Guidance Platform</title>
</head>
<body>
  <p>The motto is <span lang="la">"Carpe diem"</span>.</p>
  <iframe title="Interactive Sales Chart" src="/chart"></iframe>
</body>
</html>
```

## 5. Keyboard and Focus Management

### Tab order and focusability

- **Provide a logical tab order:** Make sure that the order in which elements receive focus follows an appropriate sequence. (2.4.3 Focus Order (Level A))
  - **Caveat:** In left-to-right reading languages, the tab order is logical when focus moves from top-to-bottom and left-to-right. However, in right-to-left reading languages, the tab order is logical when focus moves from top-to-bottom and right-to-left.
- **Use `tabindex` only when necessary:** Apply `tabindex="0"` to elements requiring focus where an appropriate interactive role has been applied but the element isn't focusable by default; for example, `<span role="button" tabindex="0">Print</span>` (2.4.3 Focus Order (Level A))
- **Manage focus correctly to and from updated content:** For example, if a dialog box appears on the page, make sure that focus immediately moves to the dialog box, is restricted to the contents of the dialog box, and (when dismissed) returns to the element that originally triggered the dialog box. (2.4.3 Focus Order (Level A))
- **Don't apply `tabindex="0"` to interactive elements that are already focusable by default:** Native elements like the `<button>`, `<a>` (only with the associated `href` attribute), and `<input>` elements are already keyboard focusable, and therefore do not require `tabindex="0"`. (2.4.3 Focus Order (Level A))
- **Don't apply `tabindex="0"` to static, non-interactive, and hidden elements:** Only elements that (when activated) perform a specific action should be included in a page's tab order. Static, non-interactive, and hidden elements (whether hidden temporarily or permanently) must not be focusable. (2.4.3 Focus Order (Level A))
- **Mandatory - Don't use positive `tabindex` values:** Never apply `tabindex="1"` (or any value > 0) to elements, as doing so imposes a tab order on the page that bears no resemblance to the intended or expected tab order. (2.4.3 Focus Order (Level A))

### Keyboard handlers

- **Attach <kbd>Enter</kbd>/<kbd>Space</kbd> handlers for custom simulated interactive elements:** When implementing a custom keyboard handler for button-like elements, <kbd>Enter</kbd> should be a `keydown` handler and <kbd>Space</kbd> should be a `keyup` handler (matching native `<button>` behavior where <kbd>Enter</kbd> repeats and <kbd>Space</kbd> triggers on release). (2.1.1 Keyboard (Level A))
- **Don't attach keyboard handlers to native interactive elements:** Native elements such as the `<button>`, `<input>`, and `<a>` (with the required `href` attribute) elements already support the <kbd>Enter</kbd> and (except for the `<a>` element) the <kbd>Space</kbd> keys by default, so adding these keyboard handlers is redundant. (Best Practice)
  - **Caveat:** if the `<a>` element is repurposed as a button through the inclusion of `role="button"`, a `keyup` handler is still required to support the <kbd>Space</kbd> key to match native `<button>` behavior.

#### Code Example: Keyboard handlers

```javascript
// Good: Keyboard handlers for complex custom widgets (e.g., Tree items, tabs).
// NOTE: This pattern applies ONLY to non-standard UI where no native HTML tag exists.
// Always prioritize native <button> or <input> elements for standard interactions.
// Elements MUST have the appropriate ARIA role (e.g., role="treeitem" or role="tab").
customWidget.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    toggleWidgetState();
  }
  if (e.key === ' ') {
    e.preventDefault(); // Prevent page scrolling on Spacebar keydown
  }
});

customWidget.addEventListener('keyup', (e) => {
  if (e.key === ' ') {
    toggleWidgetState();
  }
});

function toggleWidgetState() {
  // E.g., Manage toggle/expanded states for custom controls
  const isExpanded = customWidget.getAttribute('aria-expanded') === 'true';
  customWidget.setAttribute('aria-expanded', !isExpanded);
}
```

### Focus indicators

- **Use `:focus-visible` when styling focus indicators:** When defining custom focus indicators, always style the `:focus-visible` state (not `:focus`) explicitly. (Best Practice)
- **Prefer browser native focus indicators over custom focus indicators:** Leave focus indication to the browser unless custom focus styling is needed to meet contrast or design requirements. (Best Practice)
- **Mandatory - Don't disable browser native focus indicators without providing a replacement custom focus indicator:** When using `outline: none;` to suppress the browser native focus indicator, provide an equivalent custom focus indicator that has a contrast ratio of at least `3:1` against adjacent content (2.4.7 Focus Visible (Level AA), 1.4.11 Non-text Contrast (Level AA)).
- **Prefer `outline` over other properties for focus rings:** If `box-shadow` must be relied on for focus rings, provide an `outline`-based fallback for High Contrast Mode using the `forced-colors` media query. (Best Practice)
- **Pair custom focus outlines with `outline-offset`:** This visually separates the ring from the element. (Best Practice)

#### Code Example: Custom focus indication

```css
/* Good: High contrast focus border */
:where(a:any-link, button):focus-visible {
  outline: 3px solid #ff0055;
  outline-offset: 3px;
}
```

### Target sizes

- **Do size interactive elements to have a target of at least 24x24 CSS pixels:** Enforce the target size of elements using `min-block-size` / `min-inline-size` or through padding rather than `width` / `height` so that content grows the target but not shrink it. (2.5.8 Target Size (Minimum) (Level AA))
  - **Caveat:** Interactive elements _may_ have a target of less than 24x24 CSS pixels _as long as_ they are positioned in such a way that if a 24 CSS pixel diameter circle is centered on the bounding box of each element, the circles do not intersect nearby targets or circles for other targets that are less than 24x24 CSS pixels.
- **Bump targets up on coarse pointers:** `@media (pointer: coarse) { … }`. (2.5.8 Target Size (Minimum) (Level AA))
- **Don't use `touch-action: none;` for custom gestures:** This disables page scrolling through the element. Scope to the axis you actually need - `pan-y` for horizontal swipes (the page still scrolls vertically), and `pan-x` for vertical swipes. Reserve `none` for elements where no native touch behavior makes sense, such as a drawing canvas. (2.1.1 Keyboard (Level A))

## 6. Alternate Text and Media

### Images

- **Mandatory - Apply the `alt` attribute to all `<img>` elements:** browsers replace the image with the value of this attribute for people who use screen readers. (1.1.1 Non-text Content (Level A))
- **Do provide informative visual descriptions:** Describe the purpose of the image (for example, "Search", not "Magnifying glass"). (1.1.1 Non-text Content (Level A))
- **Do apply `alt=""` to decorative visuals:** This prevents screen readers from announcing them. (1.1.1 Non-text Content (Level A))
- **Don't use clichéd prefixes:** Avoid terms like "Image of…" and "Picture of…". (Best Practice)
- **Don't use underscores in filenames:** Use dashes if the filename might be announced as fallback. (Best Practice)

#### Code Example: Providing a text description for `<img>` elements

```html
<!-- Decorative -->
<img src="divider.png" alt="">

<!-- Informative (Functional) -->
<a href="/search">
  <img src="glass.png" alt="Search the platform">
</a>
```

### Inline SVGs

- **Do apply `role="img"` to the `<svg>` element for non-decorative SVGs:** This is so that they are globally exposed as images. (4.1.2 Name, Role, Value (Level A))
- **Do provide a text description for non-decorative SVGs:** Use one of the following techniques: (1.1.1 Non-text Content (Level A))
  - Include a nested `<title>` element as a child of the `<svg>` element that includes the text description. **or**
  - Apply the `aria-label` attribute to the `<svg>` element and set its value to an appropriate text description.
- **Do hide decorative SVGs from assistive technologies:** Apply `aria-hidden="true"` to decorative `<svg>` elements to prevent screen readers from announcing them. (1.1.1 Non-text Content (Level A))

#### Code Example: Providing a text description for non-decorative SVGs using the `<title>` element

```html
<!-- Inline non-decorative SVG: example that uses the <title> element -->
<svg role="img" viewBox="0 0 24 24">
  <title>Home</title>
  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
</svg>
```

#### Code Example: Providing a text description for non-decorative SVGs using the `aria-label` attribute

```html
<!-- Inline non-decorative SVG: example that uses the aria-label attribute -->
<svg role="img" viewBox="0 0 24 24" aria-label="Home">
  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
</svg>
```

#### Code Example: Identifying decorative SVGs

```html
<!-- Inline Decorative SVG (hide from assistive technologies) -->
<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
</svg>
```

### Complex images and charts

- **Provide long descriptions for complex images:** Use `<figure>`/`<figcaption>` or `aria-describedby` for charts and infographics. (1.1.1 Non-text Content (Level A))
- **Provide semantic data tables as alternatives:** Provide semantic data tables as accessible alternatives for charts and other complex visualizations. (1.1.1 Non-text Content (Level A))

#### Code Example: Complex graph with figcaption

```html
<!-- Complex graph with figcaption -->
<figure>
  <img src="chart.png" alt="Sales growth graph 2024.">
  <figcaption>Sales grew 20% in Q3 due to new platform launch.</figcaption>
</figure>
```

### Audio and video

- **Mandatory - Provide a transcript for audio-only content and combined video & audio content:** The transcript should be verbatim, and include all of the dialogue as well as text descriptions of important non-speech sounds such as sound effects. (1.2.1 Audio-only and Video-only (Prerecorded) (Level A), 1.2.3 Audio Description or Media Alternative (Prerecorded) (Level AA))
- **Mandatory - Provide a text description or an audio track for video-only content:** Examples include text-based instructions for an animation on how to use a particular product, and a separate audio track that includes a description of the action in the video. (1.2.1 Audio-only and Video-only (Prerecorded) (Level A))
- **Mandatory - Provide synchronous captions for videos:** Supply WebVTT captions for audio tracks within video content. The captions should be verbatim and synchronous with the audio track, and include all of the dialogue as well as meaningful non-speech content such as sound effects and other important information conveyed within the soundtrack (for example, "Ominous music plays"). (1.2.2 Captions (Prerecorded) (Level A))
  - **Caveat:** Captions are not required if the video is a decorative alternative for text that is already present and is clearly identified as such.
- **Do provide an audio description for videos:** Include an additional audio track within the video that augments the visual content displayed on-screen. The audio description should convey information about the scene that is not described or spoken in the main audio track, and should be conveyed during existing pauses in the dialogue. (1.2.3 Audio Description or Media Alternative (Prerecorded) (Level A), 1.2.5 Audio Description (Prerecorded) (Level AA))

#### Code Example: Video and audio content with captions and transcript

```html
<!-- Video with Captions tracks -->
<video controls>
  <source src="intro.mp4" type="video/mp4">
  <track src="caps.vtt" kind="captions" srclang="en" label="English">
</video>

<!-- Audio with expandable transcript details -->
<audio controls src="podcast.mp3" aria-details="podcast-transcript"></audio>
<details id="podcast-transcript">
  <summary>View Transcript</summary>
  <div class="transcript-content">
    Welcome to the show...
  </div>
</details>
```

### CSS generated content

- **Alt text for CSS generated content:** Use the alternative text argument of `content` (e.g. `content: url(icon.svg) / "Save";`) and keep meaningful text in the DOM. See `accessible-generated-content` (via `npx -y modern-web-guidance@latest retrieve "accessible-generated-content"`) for more details. (1.1.1 Non-text Content (Level A))

### Content Visibility Decision Matrix

| Intent | Visual | Screen Reader | Focusable | Structural Pattern |
| :--- | :--- | :--- | :--- | :--- |
| **Visible to all** | Yes | Yes | Yes | Standard rendering |
| **Screen Reader only** | No | Yes | Yes (if interactive) | Visually hidden utility (e.g. `.visually-hidden`) |
| **Visual only** | Yes | No | No | `aria-hidden="true"` |
| **Hidden for all** | No | No | No | `hidden` attribute / `display: none` |

**Heuristic Rule:** If an element can receive keyboard focus, it must not be hidden via `aria-hidden="true"`.

**Note:** only use screen reader only content as a last resort. If content is important, it should be visible for everyone.

## 7. Forms and Input Controls

### Labels and hints

- **Mandatory - Provide a label for all form controls:** Do not rely on the currently selected input or value as a way of labeling the control. (3.3.2 Labels or Instructions (Level A))
- **Connect Labels Programmatically:** Use `<label for="id">` linked to `<input id="id">`. (1.3.1 Info and Relationships (Level A))
- **Don't use placeholders as primary labels:** Placeholders are not persistent labels. Only use placeholders to provide  brief hints, such as an example of an appropriate input. (3.3.2 Labels or Instructions (Level A))
- **Link hints to inputs via `aria-describedby`:** Associate help text with inputs, and place the hint above the input so autocomplete popovers don't cover it during editing. (1.3.1 Info and Relationships (Level A))

#### Code Example: A labeled form control with a hint for passwords

```html
<!-- Good: Semantic forms with hints for passwords -->
<form>
  <label for="pwd">Password:</label>
  <span id="pwd-hint">Must contain at least 8 characters.</span>
  <input id="pwd" type="password" aria-describedby="pwd-hint" autocomplete="current-password" required>
</form>
```

### Input assistance and validation

- **Mandatory - Use the `autocomplete` attribute:** Apply the `autocomplete` attribute to `<input>`, `<textarea>`, and `<select>` elements that explicitly collect personal information about the user, and set it to the correct value (for example `"email"` or `"given-name"`). (1.3.5 Identify Input Purpose (Level AA))
- **Provide form validation constraints:** Use `required` (or `aria-required="true"` only when `required` isn't applicable) to signal mandatory inputs. (4.1.2 Name, Role, Value (Level A))
- **Don't trigger context shifts on focus changes:** Avoid auto-submitting forms or jumping pages on focus change events alone. (3.2.1 On Focus (Level A), 3.2.2 On Input (Level A))

## 8. Live Regions

Live regions let assistive tech announce content updates that aren't tied to navigation or focus changes. They're easy to misuse — too many regions, or noisy ones, quickly become spam for screen-reader users.

### Live Region Urgency Table

| Urgency | Visual Analogue | `aria-live` Value | Behavioral Impact | Example |
| :--- | :--- | :--- | :--- | :--- |
| **Critical** | Modal / Alert | `assertive` (or `role="alert"`) | Interrupts immediately, clears speech queue | Session timeout, API failure |
| **Standard**| Toast / Banner | `polite` | Announces at next graceful break | Search results, "Saved" status |
| **Passive**  | Silent text | `off` | Only if user navigates to it | Live character count |

**Heuristic Rule:** Use `assertive` only for critical, time-sensitive updates that require immediate attention or prevent safe continuation (e.g., data loss, session timeouts, or network drops).

### When to announce live regions

- **Announce dynamic errors via live regions:** Use `aria-live` or shift focus to error lists (4.1.3 Status Messages (Level AA)).
- **Don't use live regions for interstitial states** like "Loading…" or "Updating…" unless they're meaningfully informative — they usually just create noise. Use the HTML `<progress>` element or the ARIA `progressbar` role for this purpose instead. (Best Practice)

```html
<!-- Session Timeout Warning with controls -->
<div role="alert" class="timeout-warning">
  Your session will expire in 2 minutes.
  <button type="button" onclick="extendSession()">Extend Session</button>
</div>
```

### Managing announcements

- **Centralize live regions for non-visible announcements:** A single `polite` region and a single `assertive` region per page (with whatever `aria-atomic` configuration you need) keeps announcements consistent and easier to maintain. Many frameworks ship their own announcer abstraction — use it. (Best Practice)
- **Debounce frequently-changing regions:** If a region can update many times per second (e.g. a combobox's result count as the user types), debounce so users aren't spammed. (Best Practice)
- **Delay slightly when other announcements may collide:** When the user is typing or focus is being managed, a small delay before announcing keeps live-region updates from overlapping other speech. (Best Practice)
- **Don't add live-region updates to inert DOM:** When dialogs open or sections become `inert`, queued or debounced messages will be unannounced — or announced from DOM the user can't reach. Coordinate live-region updates with dialog/inert state changes. (4.1.3 Status Messages (Level AA))

## 9. Color

See `color` (via `npx -y modern-web-guidance@latest retrieve "color"`) for accessible color (contrast requirements, light and dark color schemes, Forced Colors Mode, etc).

## 10. Typography

See `typography` (via `npx -y modern-web-guidance@latest retrieve "typography"`) for readable typography.

## 11. Motion and Preferences

See `motion` (via `npx -y modern-web-guidance@latest retrieve "motion"`).

## 12. Modals and Native Dialogs

Modern browsers provide native solutions for creating modal dialogs which avoid the need for focus traps, managing the accessibility of outside content, ensuring the content is on top, and dimming the background content — all of which are error prone and require heavy JavaScript event tracking to maintain.

### Native `<dialog>`

- **Use the native `<dialog>` element:** Invoke the dialog using the `.showModal()` method to open it in a modal state. When in a modal state, the browser sets outside content as inert (i.e. the outside content is hidden from the accessibility tree and cannot be interacted with nor be focused). (1.3.2 Meaningful Sequence (Level A), 2.4.3 Focus Order (Level A), 4.1.2 Name, Role, Value (Level A))
  - **Note:** it is still possible to navigate to the browser chrome when using the `<dialog>` element.
- **Don't implement focus traps for native modal dialogs:** When a `<dialog>` element is opened in a modal state, browsers set outside content as inert which is sufficient for ensuring only the dialog’s content can be focused. (Best Practice)

#### Code Example: HTML & JavaScript: Native `<dialog>` with standard close events

```html
<!-- Dialog opens natively with showModal() and locks focus -->
<button id="open-btn">Open Dialog</button>

<dialog id="accessible-modal" aria-labelledby="title-id">
  <h2 id="title-id">Account Settings</h2>
  <p>Update your details here.</p>
  <button onclick="this.closest('dialog').close()">Close Dialog</button>
</dialog>

<script>
  document.getElementById('open-btn').addEventListener('click', () => {
    document.getElementById('accessible-modal').showModal();
  });
</script>
```

### Custom overlays

- **Use the `inert` attribute for custom overlays:** When `<dialog>` cannot be used (e.g., some non-modal overlays, framework constraints, or layouts where `<dialog>`'s top-layer/positioning behavior conflicts with the design), apply `inert` to outside content to ensure it cannot be interacted with by keyboard, pointer, or assistive technology. This requires structuring elements in such a way that the custom overlay is not a descendant of the element with `inert` set on it. (1.3.2 Meaningful Sequence (Level A), 2.4.3 Focus Order (Level A))
- **Apply `role="dialog"` to the custom overlay:** When applied to the element used as the container for the custom overlay, it ensures that it is exposed as a dialog box to assistive technologies. (4.1.2 Name, Role, Value (Level A))
- **Move focus to the overlay:** Ensure keyboard and screen reader focus moves to the container for the overlay so that people using a screen reader and people using the keyboard alone can start navigating its contents. Don't leave focus in outside content. (1.3.2 Meaningful Sequence (Level A), 2.4.3 Focus Order (Level A))

## 13. Testing Validations

### Automated checks

- **Run Automated checks via axe-core or Lighthouse audits:** Catch missing alt texts or low contrasts (e.g., via Lighthouse in Chrome DevTools MCP).
- **Don't rely purely on scores:** A 100% score does not guarantee real usability.

### Manual testing

- **Validate Sequential Navigations using keyboards alone:** Using only keyboard shortcuts, such as <kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd>, arrow keys, <kbd>Enter</kbd>, <kbd>Space</kbd>, and <kbd>Esc</kbd>, confirm every interactive element is reachable and operable, and that focus never gets stuck.
- **Test on Screen Readers with calibrated browsers:** Rely on standard bindings (e.g., JAWS with Chrome, NVDA with Firefox, Narrator with Edge, VoiceOver with Safari on macOS and iOS, TalkBack with Chrome for Android).


--- Guide for performance ---
# Performance

## Critical Rendering Path (CRP) Optimization

The Critical Rendering Path dictates how quickly the browser converts HTML, CSS, and JavaScript into painted pixels. 

### DOs
*   **DO inline critical CSS**: Extract styles necessary for above-the-fold content and inject them directly into the HTML `<head>`. Defer the rest of the stylesheet.
*   **DO use `async` or `defer` for all non-critical scripts**: Prevent JavaScript from blocking the DOM parser. Use `defer` for scripts that depend on the DOM or each other, and `async` for independent scripts. `type="module"` is preferred for modern JavaScript and is deferred by default so no need to have an explicit `defer` attribute but you can use `async` on independent module scripts.
*   **DO split CSS by media queries**: Use the `media` attribute on `<link>` tags so the browser downloads unused stylesheets (e.g., print styles or desktop styles on mobile) without blocking the render.
*   **DO utilize resource hints**: Add `preconnect` or `dns-prefetch` for essential third-party domains (e.g., font foundries or API endpoints) to establish early TLS handshakes.

### DON'Ts
*   **DON'T use `@import` in CSS**: This creates sequential request chains that delay the CSS Object Model (CSSOM) construction.
*   **DON'T place large, non-critical JavaScript in the `<head>`**: This halts DOM construction until the script is downloaded, parsed, and executed.
*   **DON'T load invisible or unreachable CSS/JS**: Ensure build tools apply tree-shaking and CSS minification to drop unreachable code before deployment.

### Code Examples

**HTML: Deferring Non-Critical CSS & Scripts**
```html
<!-- Inline critical styles directly in head -->
<style>
  body { margin: 0; font-family: system-ui; }
  .hero { min-height: 100vh; }
</style>

<!-- Defer non-critical CSS -->
<link rel="preload" href="non-critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="non-critical.css"></noscript>

<!-- Load CSS conditionally based on viewport -->
<link rel="stylesheet" href="mobile.css" media="(max-width: 768px)">

<!-- Defer JavaScript execution -->
<script defer src="app-bundle.js"></script>
```

### The Resource Hint Navigator

| Hint | Tool Use Case | Example |
| :--- | :--- | :--- |
| `preconnect` | Resolve TLS/DNS for known third-party APIs | API endpoints, font services |
| `dns-prefetch` | Lean fallback for non-critical third-party origins | Ad servers, analytics fallbacks |
| `preload` | Same-origin asset needed *now* for rendering | Hero images, render-blocking fonts |
| `prefetch` | Assets needed for next-page navigation | Next-page bundle, detail views |

**Single-Sentence Mental Model**: "Preconnect for domains, Preload for viewport, Prefetch for futures."

## Largest Contentful Paint (LCP) & Resource Fetching

LCP measures the time required to render the largest visible text or image block within the viewport. Optimize LCP by prioritizing visible elements and prepolishing.

### DOs
*   **DO declare the LCP image in standard HTML**: Ensure LCP images are present in the raw HTML response so the preload scanner discovers it immediately. This can be be via an `<img>` element (preferred) or a `<link rel="preload" as="image">` (where the image resource is loaded due to JavaScript or CSS). Avoid relying on JavaScript or CSS to be the only source of the image resource.
*   **DO use `fetchpriority="high"` on the LCP images**: Images are not downloaded initially while the browser prioritizes render-blocking resources like CSS and JavaScript and can perform layout to discover if the images are in the viewport or not. Use `fetchpriority="high"` to signal to the browser's heuristic engine to start downloading the LCP image earlier. This should be on the `<img>` element (`<img fetchpriority="high">`) and any preload (`<link rel="preload" as="image" fetchpriority="high">`).
*   **DO use `fetchpriority="low"` to demote competing elements that are not in the initial viewport**: Lower the priority of large images or carousels that are *not* the primary LCP element and do *not* appear in the initial viewport, but may still be downloaded if near the viewport or hidden with CSS (for example `overflow:scroll` for carousels). Images with `fetchpriority="low"` will still be downloaded but start after higher-priority resources the browser has queued.
*   **DO use `loading="lazy"` to avoid loading competing elements that are far out of the initial viewport**: Images, iframes, and video and audio media which are well outside of the viewport should be lazy-loaded to avoid fetching these at all. Images with `loading="lazy"` will not be downloaded at all when well outside the viewport but will download when in, or near, the viewport (depending on browser heuristics and connection settings),.

### DON'Ts
*   **DON'T lazy-load the LCP image**: Never apply `loading="lazy"` to above-the-fold images. This purposefully delays the fetch until layout calculation is complete, severely degrading LCP.
*   **DON'T overuse `fetchpriority="high"`**: Prioritization is a zero-sum mechanism. Elevating too many resources creates network contention and negates the benefit.
*   **DON'T implement complex JavaScript loaders for the hero section**: Client-side rendering of the LCP element introduces substantial request chains (HTML -> JS -> Execution -> Image Request).

### Code Examples

**HTML: LCP Image Optimization**
```html
<!-- Standard LCP Image -->
<img 
  src="/images/hero.webp" 
  alt="Hero Product" 
  fetchpriority="high" 
  width="1200" 
  height="600"
>

<!-- Preloading a CSS-based LCP background -->
<link rel="preload" as="image" href="/images/bg-hero.webp" fetchpriority="high" type="image/webp">

<!-- Demoting an offscreen non-LCP carousel image -->
<img src="/images/carousel-2.webp" fetchpriority="low" loading="lazy" alt="Slide 2">
```

## Interaction to Next Paint (INP) & Main Thread Unblocking

INP measures the latency of all interactive events across the page's lifecycle. Poor INP is caused by long-running JavaScript tasks blocking the main thread. 

### DOs
*   **DO break up long tasks**: Any JavaScript execution exceeding 50ms should be split. Yield to the main thread frequently so the browser can process pending user inputs.
*   **DO use `scheduler.yield()` with a fallback**: Utilize the modern `scheduler.yield()` API to place task continuations at the *front* of the queue, falling back to `setTimeout` wrapped in a Promise for unsupported browsers.
*   **DO debounce or throttle rapid event listeners**: Limit the execution frequency of handlers attached to `scroll`, `resize`, or rapid `input` events.
*   **DO separate UI updates from heavy computations**: Update the UI synchronously to provide immediate visual feedback, then push background processing to a Web Worker or deferred task.

### DON'Ts
*   **DON'T rely solely on `setTimeout(..., 0)` for continuous yielding**: Standard `setTimeout` places continuations at the *back* of the task queue, potentially causing long delays if other tasks are pending. Use `scheduler.yield()` where available.
*   **DON'T cause layout thrashing**: Avoid interleaving DOM reads (`offsetHeight`, `getBoundingClientRect`) and writes (`style.height`) within the same loop. Batch DOM reads, then batch DOM writes.
*   **DON'T block the thread with recurring timers**: Avoid heavy polling with `setInterval` that starves the main thread.

### Code Examples

**JS: `scheduler.yield` Polyfill and Usage**
```javascript
// Polyfill for yielding to main thread
async function yieldToMain() {
  if ('scheduler' in window && 'yield' in scheduler) {
    return await scheduler.yield();
  }
  return new Promise(resolve => setTimeout(resolve, 0));
}

// Processing a large array without blocking user input
async function processLargeList(items) {
  for (let i = 0; i < items.length; i++) {
    processItem(items[i]);
    
    // Yield every 50 iterations to allow rendering/interaction
    if (i % 50 === 0) {
      await yieldToMain();
    }
  }
}
```

### Main Thread Task Slicing Heuristic

**The 50ms Rule for INP**:
- **< 50ms**: Execute synchronously.
- **50ms - 250ms**: Slice tasks and yield with `scheduler.yield()`.
- **> 250ms**: Offload to a Web Worker.

## Third-Party Script Management

Third-party scripts (analytics, ads, chat widgets) are the primary source of main thread congestion.

### DOs
*   **DO avoid third-party scripts blocking main content**: Use `defer` with all third-party scripts unless critical to the page load and load them in the footer of the page, rather than the `<head>`.
*   **DO self-host critical third-party dependencies**: Reduce DNS lookups and enforce custom `Cache-Control` logic by hosting third-party libraries on the origin domain.

### Code Examples

**HTML: Third-Party Script Execution**
```html
<!-- 1. Place third-party scripts near the end of the page with the defer attribute -->
<script defer src="https://www.example.com/third-party.js"></script>
```

## CSS Rendering & Containment Optimization

Rendering involves Layout, Style, Paint, and Compositing calculations. CSS Containment limits the scope of these calculations which is useful on large, complex pages where such calculations can cause performance problems.

### DOs
*   **DO use `content-visibility: auto` on off-screen sections on large, complex pages**: Instruct the browser to skip layout and paint calculations for entire subtrees until they approach the viewport.
*   **DO pair `content-visibility` with `contain-intrinsic-size`**: Prevent layout shifts and scrollbar jumping by providing a placeholder height/width for unrendered containers.
*   **DO derive `contain-intrinsic-size` from the content**: When setting `contain-intrinsic-size` use the `auto` keyword and a value that's derived from what is known about the contents (i.e. text size, spacing, size of graphics, character count). Preferably use units such as `rem`, `lh`, `cap`, or `ch` that match values used for the elements within the contents rather than `px`. If the content for items in a group is not consistently sized, then use an average size.
*   **DO apply explicit CSS containment (`contain`)**: For isolated UI components (like modals or widgets), use `contain: layout style paint` to prevent internal changes from triggering page-wide reflows.

### DON'Ts
*   **DON'T apply `content-visibility: auto` on smaller, simpler pages**: The gains will be negligible and there are risks of side effects with content jumping.
*   **DON'T apply `content-visibility: auto` to above-the-fold content**: The browser will still evaluate it, but forcing it through the containment engine unnecessarily adds slight overhead to visible elements.
*   **DON'T overuse `will-change` globally**: Indiscriminately applying `will-change: transform` to multiple elements consumes excessive VRAM, causing GPU crashes or sluggish rendering.
*   **DON'T forget accessibility when hiding elements**: `content-visibility: auto` keeps elements in the DOM for screen readers. If content should be truly hidden from assistive technology when off-screen, manage `aria-hidden` attributes manually.

### Code Examples

**CSS: Content Visibility and Containment**
```css
/* Optimize a long list of articles below the fold */
.article-list-item {
  content-visibility: auto;
  contain-intrinsic-size: auto 600px; /* Provides a 600px placeholder */
}

.row {
  --row-gap: .4rem;
  --title-height: 1lh;
  --description-height: 0.85lh;

  display: grid;
  row-gap: var(--row-gap);
  content-visibility: auto;
  /* The sum of the title height, row gap, and description height should be the size of the contents when skipped for rendering. */
  contain-intrinsic-block-size: auto calc(var(--title-height) + var(--row-gap) + var(--description-height));
}

/* Scope a complex widget to prevent layout thrashing */
.isolated-widget {
  contain: layout style paint;
}

/* Hardware accelerate an animation only on hover */
.interactive-button:hover {
  will-change: transform;
  transform: scale(1.05);
}
```

## Modern Image & Media Optimization

Images typically represent the largest payload on a given web page. Optimization requires format negotiation, responsive sizing, and layout stabilization.

### DOs
*   **DO serve modern formats (AVIF / WebP / JPEG XL)**: Use the `<picture>` element to offer AVIF or JPEG XL (best compression), falling back to WebP, and finally JPEG/PNG for legacy browsers.
*   **DO apply explicit `width` and `height` attributes**: Setting native attributes allows the browser to compute the aspect ratio immediately, reserving space and eliminating CLS. Image dimensions may be set either as HTML attributes or CSS properties.
*   **DO utilize `loading="lazy"` on all below-the-fold images**: Utilize native browser lazy loading to defer network requests for images outside the initial viewport.
*   **DO implement responsive images with `srcset` and `sizes`**: Serve tailored resolutions based on screen density and viewport width to prevent mobile devices from downloading desktop-sized images.

### DON'Ts
*   **DON'T lazy load above-the-fold images**: This directly harms LCP. Visible images must use `loading="eager"` (the default).
*   **DON'T delete necessary dimensions**: Failing to specify width/height on lazy loaded images causes layout shifts.
*   **DON'T omit the `sizes` attribute when using `srcset`**: Without `sizes`, the browser assumes `100vw` and downloads the largest available image.

### Code Examples

**HTML: Comprehensive Responsive Image Component**
```html
<picture>
  <!-- Modern Formats with Source Negotiation -->
  <source type="image/avif" srcset="hero-400w.avif 400w, hero-800w.avif 800w" sizes="(max-width: 600px) 100vw, 50vw">
  <source type="image/webp" srcset="hero-400w.webp 400w, hero-800w.webp 800w" sizes="(max-width: 600px) 100vw, 50vw">
  
  <!-- Fallback + Dimensions + Priority for Above-The-Fold -->
  <img 
    src="hero-800w.jpg" 
    alt="Descriptive text" 
    width="800" 
    height="600"
    fetchpriority="high"
    loading="eager"
  >
</picture>

<!-- Below-The-Fold Image -->
<img 
    src="footer-icon.png" 
    alt="Footer Logo" 
    width="100" 
    height="100"
    loading="lazy"
>

<!-- DO: Use native lazy loading for below the fold iframes -->
<iframe src="https://example.com/map" width="800" height="600" loading="lazy" title="Example Map"></iframe>
```

## Service Workers & Caching Strategies

Client-side caching via Service Workers allows applications to bypass the network entirely, serving resources from disk/memory.

### DOs
*   **DO use a `CacheFirst` strategy for static, versioned assets**: Immutable files (fonts, JS/CSS bundles with hash strings) should be served directly from the cache to guarantee instant loading.
*   **DO use `StaleWhileRevalidate` for dynamic, non-critical resources**: For API calls where slight staleness is acceptable, serve immediately from cache while silently updating the cache in the background.
*   **DO implement a `NetworkFirst` strategy for HTML documents**: Ensure the user always receives the latest application shell and manifest, falling back to cache only if offline.
*   **DO restrict cache sizes and expiry**: Use expiration plugins to prevent the Service Worker from exhausting the device's storage quota.

### DON'Ts
*   **DON'T cache opaque responses blindly**: Responses from third-party domains lacking CORS headers are "opaque". Caching them heavily consumes quota and fails silently. Only cache them using `NetworkFirst` or `StaleWhileRevalidate`.
*   **DON'T cache POST requests**: Service workers cannot cache non-GET requests natively. Implement background sync queues for offline submissions.
*   **DON'T bypass versioning**: Failing to update asset hashes/versions will trap users in infinite cache loops.
*   **DON'T use `Cache-Control: no-store` for non-sensitive resources**: This directive prevents the browser from storing the page in the **Back-Forward Cache (bfcache)**, leading to significantly slower perceived performance. Use it only for truly private data, and use `Cache-Control: no-cache` or `Cache-Control: max-age=0` for pages that simply need to serve up-to-date content.

### Code Examples

**JS: Service Worker Caching via Workbox**
```javascript
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// 1. HTML Documents: Network First
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({ cacheName: 'pages-cache' })
);

// 2. Static Assets (JS, CSS, Fonts): Cache First
registerRoute(
  ({ request }) => ['style', 'script', 'font'].includes(request.destination),
  new CacheFirst({
    cacheName: 'static-resources',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 })
    ]
  })
);

// 3. API Responses: Stale While Revalidate
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/v1/content'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] })
    ]
  })
);
```

## Web Fonts Optimization

Web fonts are a common source of render blocking. Optimizing them reduces the Flash of Invisible Text (FOIT) and speeds up initial rendering.

### DOs
*   **DO preload critical fonts**: Use `<link rel="preload" as="font" type="font/woff2" crossorigin>` for fonts seen above the fold. Do include the `crossorigin` attribute for all fonts (even same origin fonts).
*   **DO subset fonts**: Trim font weights and glyph variations to include only the characters your application requires.

### DON'Ts
*   **DON'T preload all fonts**: Over-preloading leads to network contention that starves other critical assets.
*   **DON'T use `fetchpriority="high"` on fonts**: Fonts are loaded with a high priority by default so there is no need to specify `fetchpriority="high"`.

### Code Examples

**CSS: Font Loading Face**
```css
@font-face {
  font-family: 'Modern Sans';
  src: url('/fonts/modern-sans.woff2') format('woff2');
}
```

**HTML: Critical Font Preload**
```html
<!-- Always use crossorigin for fonts even if on the same origin -->
<link rel="preload" href="/fonts/modern-sans.woff2" as="font" type="font/woff2" crossorigin>
```

## Video Performance & Metrics

Video payloads are among the heaviest assets. Optimization focuses on reducing bandwidth stall and preserving Cumulative Layout Shift (CLS) stability.

### DOs
*   **DO specify explicit `width` and `height` attributes**: Setting native dimensions reserves layout space and prevents CLS.
*   **DO provide a `poster` image fallback**: Display a lightweight image placeholder while the video buffers to improve perceived performance.
*   **DO use `<link rel="preload" as="image" fetchpriority="high">` for poster images where the video is the LCP element**: This ensures the image is downloaded as quickly as possible.
*   **DO use `preload="none"` for non-critical videos**: Delay bandwidth consumption for below-the-fold or non-autoplaying videos.
*   **DO serve modern formats via source negotiation**: Offer WebM (better compression ratio) alongside standard MP4 formats.
*   **DO use `loading="lazy"` for offscreen videos**: Lazy-loading videos allow `poster` and `preload` downloads to be deferred until the video is in or near the viewport.

### DON'Ts
*   **DON'T auto-play video files blindly**: Rely on user intent or use progressive enhancement streams.
*   **DON'T auto-play large video files at all**: Rely on user intent before downloading large files.

### Code Examples

**HTML: Accessible and Dynamic Video Loader**
```html
<video 
  controls 
  width="1200" 
  height="675"
  poster="/images/video-poster.webp" 
  preload="none"
  loading="lazy"
>
  <source src="/videos/intro.webm" type="video/webm">
  <source src="/videos/intro.mp4" type="video/mp4">
  <!-- Include accessibility tracks -->
  <track src="/video-caps.vtt" kind="captions" srclang="en" label="English">
</video>
```

## JavaScript Code-Splitting

Heavy monolithic bundles block main thread parse times on low-end devices. Splitting ensures we only download bytes required for the immediate viewport.

### DOs
*   **DO use dynamic imports**: Split routes or heavy UI libraries using standard `import()` specifications.
*   **DO configure bundler asset chunking**: Use Vite or Webpack rollup directives to split third-party vendors from runtime application logic.

### DON'Ts
*   **DON'T ship a single, enormous `app.js` bundle**: It increases parse time and memory consumption for initial views.

### Code Examples

**JS: Route based Dynamic Splitting**
```javascript
// Dynamic import of heavy module only when button is clicked
document.getElementById('heavy-btn').addEventListener('click', async () => {
  const { heavyFunction } = await import('./heavy-module.js');
  heavyFunction();
});
```

