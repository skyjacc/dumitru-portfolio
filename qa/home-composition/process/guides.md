--- Guide for accordion ---
# Accordion

Build accordions from a set of adjacent `details` elements.

If the accordion is a distinct section of the page, group its items in an element with an accessible name, such as a `section` labeled by the group heading.

```html
<section class="accordion" aria-labelledby="faq-heading">
	<h2 id="faq-heading">Frequently Asked Questions</h2>
	<details>
		<summary>Lorem ipsum dolor sit amet?</summary>
		<!-- answer 1 -->
	</details>
	<details>
		<summary>Consectetur adipiscing elit?</summary>
		<!-- answer 2 -->
	</details>
</section>
```

**Warning:** Do not put headings inside `summary`. JAWS and TalkBack expose `summary` as a button and drop any heading inside it, so their users cannot move between items by heading.
If each item needs its own heading, build a custom accordion instead (see below).

Accessibility notes:
- Do not wrap every small accordion in a landmark or `region`; that adds navigation noise for screen reader users.
- Do not add arrow key navigation, roving `tabindex`, or `Home`/`End` handling.
Accordion contents are often long enough to need scrolling, and arrow keys on a focused trigger are how keyboard users scroll.
- If a heading for the entire accordion is not desirable, use an `aria-label` on the container element to provide an accessible name for the group.

## Exclusive accordions

An exclusive accordion only allows one item to be open at a time.

To make an accordion exclusive, add the same `name` to each `details` element that should be part of the exclusive group.
Ensure that `name` is not used elsewhere on the page unless it is intended to be part of the same exclusive accordion group.

```html
<section class="accordion" aria-labelledby="faq-heading">
	<h2 id="faq-heading">Frequently Asked Questions</h2>
	<details name="faq-question">
		<summary>Lorem ipsum dolor sit amet?</summary>
		<!-- answer 1 -->
	</details>
	<details name="faq-question">
		<summary>Consectetur adipiscing elit?</summary>
		<!-- answer 2 -->
	</details>
</section>
```

Avoid exclusive accordions, as they can produce suboptimal user experience:
- Sometimes users want to reference between the contents of multiple items, which exclusive accordions prevent.
- They also can cause content to shift out of the user’s view which can cause significant problems for those using screen magnifiers.

### Keeping one item always open

To require that one item is always open, stop the open item’s `summary` from closing it and expose it as disabled. Opening another item still closes it through `name`. This compounds the downsides above, since users can never reclaim the space, so only use it when the layout depends on an item being open.

```html
<section class="accordion always-open" aria-labelledby="plans-heading">
	<h2 id="plans-heading">Plans</h2>
	<details name="plan" open>
		<!-- Mirrors the open state; the script keeps it in sync -->
		<summary aria-disabled="true">Basic</summary>
		<!-- Basic plan -->
	</details>
	<details name="plan">
		<summary>Pro</summary>
		<!-- Pro plan -->
	</details>
</section>
```

```javascript
// Enter and Space on a summary also dispatch click, so this covers keyboard too
document.addEventListener("click", event => {
	if (event.target.closest(".accordion.always-open details[open] > summary")) event.preventDefault();
});

// toggle does not bubble, hence capture
document.addEventListener("toggle", event => {
	if (!event.target.matches(".accordion.always-open details")) return;
	event.target.querySelector(":scope > summary").setAttribute("aria-disabled", event.target.open);
}, { capture: true });
```

Keep the disabled `summary` focusable so focus is not lost when the item a user just opened becomes disabled, but exclude it from hover and pointer styles so it does not look clickable:

```css
/* :where() keeps the guard from raising specificity */
summary:where(:not([aria-disabled="true"])) {
	cursor: pointer;

	&:hover {
		background: var(--color-hover);
	}
}
```

## Optional: Expand/Collapse All button

For non-exclusive accordions, a single button that expands or collapses every item can improve user experience.
Give it `aria-expanded` and keep it in sync with the items, so screen readers announce the change (VoiceOver does not reliably announce a label change on its own).
Mark it expanded only once every item is open; in a mixed state it reads "Expand all" and pressing it opens everything.

```html
<section class="accordion" id="support-accordion" aria-labelledby="support">
	<h2 id="support">Support</h2>
	<button type="button" commandfor="support-accordion" command="--toggle-all" aria-expanded="false">
		<span class="expand">Expand all</span>
		<span class="collapse">Collapse all</span>
	</button>
	<!-- Accordion items -->
</section>
```

```css
/* Show the label for the action the button will perform */
[command="--toggle-all"][aria-expanded="true"] .expand,
[command="--toggle-all"][aria-expanded="false"] .collapse {
	display: none;
}
```

```javascript
document.addEventListener("command", event => {
	if (event.command !== "--toggle-all") return;
	const expand = event.source.getAttribute("aria-expanded") !== "true";

	// Command events fire on the commandfor target
	for (const details of event.target.querySelectorAll(":scope > details")) {
		details.open = expand;
	}
}, { capture: true }); // Command events do not bubble, hence capture

// Items also open and close individually, so derive the button state from them
document.addEventListener("toggle", event => {
	if (!event.target.matches(".accordion > details")) return;
	const accordion = event.target.parentElement;
	const button = accordion.querySelector(':scope > [command="--toggle-all"]');
	if (!button) return;

	const items = accordion.querySelectorAll(":scope > details");
	button.setAttribute("aria-expanded", Array.prototype.every.call(items, details => details.open));
}, { capture: true }); // toggle does not bubble, hence capture
```

Separate buttons are also possible and improve discoverability, at the cost of _feedback_: there are states where one of the buttons will produce no visible result, and disabling it accessibly introduces challenges and increases complexity.

## Styling

The disclosed content lives in the `::details-content` pseudo-element. While closed it is hidden with `content-visibility: hidden`, not `display: none`, which is what keeps it findable and lets its size animate. Style the item on `details`, the trigger on `summary`, and the content on `details::details-content`.

### Customizing the marker

`summary` renders as a list item, so its disclosure triangle is a `::marker`. Remove it with `list-style: none` and draw your own with `::before`, which unlike `::marker` can be sized, positioned, and animated.
Render the icon as a mask so it follows the text color, and rotate it for the closed state so one icon serves both states and both writing directions.
See `icons` (via `npx -y modern-web-guidance@latest retrieve "icons"`) for more details on including and customizing icons via CSS.

Prefer keeping the marker directly next to the label text, not pushed to the opposite edge of the summary, especially for accordions that can get wide.
A marker far from its label makes it harder for users to associate with the correct label, and falls outside the field of view of users with low vision or screen magnification.
Right before the label text is preferable to right after, as it facilitates vertical scanning.

```css
summary {
	/* Removes the default triangle */
	list-style: none;
	display: flex;
	align-items: center;
	gap: 0.5ch;

	&::before {
		content: "";
		inline-size: 1em;
		block-size: 1em;
		flex-shrink: 0;
		background-color: currentColor;
		/* Example chevron pointing down, the open state; any single-color SVG works */
		mask: url("icons/chevron-down.svg") no-repeat center / contain;
		/* Closed: point toward the inline end */
		rotate: -90deg;
	}

	&:dir(rtl)::before {
		rotate: 90deg;
	}

	/* Rotate rather than swap icons, so the change can animate */
	details[open] > &::before {
		rotate: 0deg;
	}

	@media (prefers-reduced-motion: no-preference) {
		&::before {
			transition: rotate 0.2s;
		}
	}
}
```

### Slide up/down animation

To animate opening and closing, transition `block-size` between `0` and its intrinsic size, and transition `content-visibility` discretely so the content stays rendered until the collapse finishes.

```css
details::details-content {
	/* Lets block-size transition to and from its intrinsic auto size */
	interpolate-size: allow-keywords;
	overflow: clip;
	/* Keeps layout containment constant across states; otherwise content-visibility toggling it
	   makes the transition jitter when the content has outward margins (e.g. a nested p) */
	contain: layout;
}

details:not([open])::details-content {
	block-size: 0;
}

/* Only animate for users who have not asked for reduced motion */
@media (prefers-reduced-motion: no-preference) {
	details::details-content {
		transition: block-size, content-visibility, display;
		/* Example duration; match the surrounding motion design */
		transition-duration: 0.3s;
		transition-timing-function: ease-in-out;
		/* Defers content-visibility: hidden until the collapse ends */
		transition-behavior: allow-discrete;
	}
}
```

See `animate-to-intrinsic-sizes` (via `npx -y modern-web-guidance@latest retrieve "animate-to-intrinsic-sizes"`) for more details.

## Excluding a `details` element’s contents from find-in-page

If it’s undesirable for a `details` element’s contents to be included in what’s matched with the browser’s find-in-page feature, hide the closed contents with `display: none`. To keep the slide animation, set the collapsed size in `@starting-style`. See `animate-element-entry-exit` (via `npx -y modern-web-guidance@latest retrieve "animate-element-entry-exit"`) for more details.

```css
.accordion.unsearchable > details {
	/* Excludes the contents from find-in-page */
	&:not([open])::details-content {
		display: none;
	}

	/* Where the opening transition starts from, since display: none has no size */
	&[open]::details-content {
		@starting-style {
			block-size: 0;
		}
	}
}
```

## Custom accordion

Use a custom accordion only when each item is a section of the page that needs its own heading, such as a FAQ or a long reference page where screen reader users move between items by heading.
It costs JavaScript for every behavior, including exclusivity, so prefer `details` everywhere else.

Place the `button` inside the heading so the heading keeps its semantics, and put the content element immediately after the heading.
Hide the content with `hidden="until-found"` so it stays findable, or with plain `hidden` to exclude it from find-in-page.
`aria-controls` on the trigger is optional; screen readers gain nothing from it.

```html
<section class="accordion" aria-labelledby="faq-heading">
	<h2 id="faq-heading">Frequently Asked Questions</h2>
	<h3>
		<button type="button" commandfor="answer-1" command="--toggle" aria-expanded="false">How do I reset my password?</button>
	</h3>
	<div id="answer-1" hidden="until-found"><!-- Answer --></div>
</section>
```

```javascript
document.addEventListener("command", event => {
	if (event.command !== "--toggle") return;
	const content = event.target;

	content.hidden = content.hidden ? false : "until-found";
	event.source.setAttribute("aria-expanded", !content.hidden);
}, { capture: true }); // Command events do not bubble, hence capture

// Find-in-page reveals the content directly, so mirror that into the trigger
document.addEventListener("beforematch", event => {
	document.querySelector(`[commandfor="${CSS.escape(event.target.id)}"]`)?.setAttribute("aria-expanded", "true");
});
```

To make it exclusive, hide the other items' content and reset their triggers in both handlers, since find-in-page can also open an item.
See `custom-button-actions` (via `npx -y modern-web-guidance@latest retrieve "custom-button-actions"`) for more details on custom commands and `search-hidden-content` (via `npx -y modern-web-guidance@latest retrieve "search-hidden-content"`) for `hidden="until-found"`.

## Fallback strategies

### Mutually exclusive `details`

Baseline status for Mutually exclusive <details> elements: Newly available. It's been Baseline since 2024-09-03.
Supported by: Chrome 120 (Dec 2023), Edge 120 (Dec 2023), Firefox 130 (Sep 2024), and Safari 17.2 (Dec 2023).

In browsers that don't support `name` on `details`, several items stay open, which is still a working (non-exclusive) accordion.
If the exclusivity is crucial to the user experience, you can implement a fallback. It also keeps always-open accordions working, since the open item still closes when another opens:

```javascript
// Only needed where the name attribute is unsupported
if (!Object.hasOwn(HTMLDetailsElement.prototype, "name")) {
	document.addEventListener("toggle", event => {
		const details = event.target;
		if (!(details instanceof HTMLDetailsElement) || !details.open || !details.hasAttribute("name")) return;

		const name = CSS.escape(details.getAttribute("name"));
		for (const other of document.querySelectorAll(`details[name="${name}"]`)) {
			if (other !== details) other.open = false;
		}
	}, { capture: true }); // toggle does not bubble, hence capture
}
```

### Expand all and Collapse all

Baseline status for Invoker commands: Newly available. It's been Baseline since 2025-12-12.
Supported by: Chrome 135 (Apr 2025), Edge 135 (Apr 2025), Firefox 144 (Oct 2025), and Safari 26.2 (Dec 2025).

If your Baseline target does not support invoker commands, the button does nothing. Feature-detect with `Object.hasOwn(HTMLButtonElement.prototype, "commandForElement")` and fall back to a `click` listener that runs the same loop. See `custom-button-actions` (via `npx -y modern-web-guidance@latest retrieve "custom-button-actions"`) for more details.

### Open and close animation

Baseline status for ::details-content: Newly available. It's been Baseline since 2025-09-16.
Supported by: Chrome 131 (Nov 2024), Edge 131 (Nov 2024), Firefox 143 (Sep 2025), and Safari 18.4 (Mar 2025).

Browser support for interpolate-size: Limited availability.
Supported by: Chrome 129 (Sep 2024) and Edge 129 (Sep 2024).
Unsupported in: Firefox and Safari.

Baseline status for transition-behavior: Newly available. It's been Baseline since 2024-08-06.
Supported by: Chrome 117 (Sep 2023), Edge 117 (Sep 2023), Firefox 129 (Aug 2024), and Safari 17.4 (Mar 2024).

The animation is a progressive enhancement and needs no fallback. Without `interpolate-size`, items open and close instantly. Without `transition-behavior`, the content hides at the start of the collapse and the height animates empty, while opening still animates.

### Custom accordion

Browser support for hidden="until-found": Limited availability.
Supported by: Chrome 102 (May 2022), Edge 102 (May 2022), and Firefox 148 (Feb 2026).
Unsupported in: Safari.

Where `until-found` is unsupported, the attribute behaves as plain `hidden`: the content is hidden but not findable, and the accordion still works.


--- Guide for html ---
# HTML

## Table of Contents

1. Fundamental Semantics and Validation
2. Content Grouping and Attribution
3. Resource Prioritization and Performance
4. Native Overlays: Dialogs and Popovers
5. Disclosures: Details and Summary
6. Focus Boundaries and Visibility
7. HTML APIs and Forms Grouping
8. Native Media Elements
9. Dynamic Styles and Interactivity

## 1. Fundamental Semantics and Validation

### Guidelines

- **DO** use the standard HTML5 doctype `<!DOCTYPE html>` to prevent quirky rendering modes.
- **DO** set the `lang` attribute on the `<html>` element set to the primary document language and on any element that uses a language that differs from the primary language, for screen reader pronunciation and translation tools, and any locale-sensitive features (e.g. CSS `hyphens`).
- **DO** use the `<meta name="viewport">` element with the `content` attribute set to `"width=device-width, initial-scale=1.0"` to ensure page responsiveness.
- **DO** use a single `<h1>` per page/view representing the main topic. Exceptions can be made for modal dialogs, which can also use a single `<h1>`.
- **DO** maintain a sequential, non-skipping heading hierarchy (`<h2>` to `<h3>`, but not `<h2>` to `<h4>`).
- **DO** use semantic landmarks (`<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`) to create regional navigation for assistive technologies.
- **DO** use `<search>` to enclose search and filtering mechanisms (eliminates the need for `role="search"`).
- **DO** use `<button>` for triggered actions (JS, Modals, Forms) and `<a>` strictly for URL navigation. Set `type="button"` for non-submit buttons in forms to prevent unintended submission.
- **DO** use `<ul>`, `<ol>`, and `<dl>` elements for list content.
- **DO** ensure that all interactive elements like links and buttons have accessible names.
- Ensure that all interactive elements have a role that matches the interaction that they facilitate, whether that is their implicit role, or via the `role` attribute. Controls that trigger an interaction on the same page/in the same view should have a role of `button`, controls that redirect people should have a role of `link`.
- **DO** hide purely decorative SVG images from assistive technology using `aria-hidden="true"`. If using a decorative `<img>`, always include an empty `alt` attribute (e.g. `alt=""`).
- **DO** ensure that informative SVGs like logos, data visualizations, or icon buttons have a proper accessible name, and for more complex visuals, an accompanying text alternative, providing the same information as that conveyed visually.

- **DON'T** use generic `<div>` or `<span>` when semantic elements exist, for instance for interactive elements, headings, or independently reusable self-contained content.
- **DON'T** use boolean attributes with redundant values (e.g., use `disabled`, not `disabled="disabled"`).
- **DON'T** use generic elements with added ARIA roles or states when native elements with built-in semantics and behavior exist.
- **DON'T** change the native semantics of elements with ARIA unless it is a critical requirement. 
- **DON'T** use `role="presentation"` or `aria-hidden="true"` on focusable elements or their parents and ancestors.
- **DON'T** disable page zooming capabilities.
- **DON'T** use more than one `banner`, `main`, or `contentinfo` landmark per page

### Code Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard | Platform</title>
</head>
<body>
  <header>
    <nav>
      <ul>
        <li><a href="#">About</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </nav>
  </header>
  <main>
     <h1>Analytics</h1>
    <search>
      <form action="/filter" method="GET">
        <label for="search-input">Scan items:</label>
        <input type="search" id="search-input" name="q">
        <button type="submit">Search</button>
      </form>
    </search>
    <article>
      <h2>First post</h2>
    </article>
  </main>
  <footer>
    Platform - Policies and legal information
  </footer>
</body>
</html>
```

## 2. Content Grouping and Attribution

### Guidelines

- **DO** use `<blockquote>` for extended quotations from another source, and use the `cite` attribute to provide a machine-readable URL for that source.
- **DO** use `<figure>` to group self-contained content (images, code snippets, or quotes) that is referenced from the main flow but could be moved to an appendix or sidebar without affecting the document's meaning.
- **DO** use `<figcaption>` as the first or last child of a `<figure>` to provide a human-readable caption or attribution.
- **DO** use the `<cite>` element inside a caption or attribution to identify the **title** of a work (e.g., a book or website name), not the author's name.
- **DO** use the `<code>` element for short fragments of computer code (e.g., variable names, file paths, or inline snippets).
- **DO** wrap `<code>` inside a `<pre>` element when displaying blocks of code to preserve whitespace and line breaks.
- **DO** ensure that code blocks are accessible by adding `tabindex="0"` to the `<pre>` element if it becomes scrollable, allowing keyboard users to reach the content.
- **DO** ensure that scrollable code blocks are accessible by adding `role="region"` to the `<pre>`, along with an accessible name using either `aria-labelledby` (referencing the ID of the element that titles the block) or `aria-label`.

- **DON'T** use `<blockquote>` for purely visual indentation of non-quoted text.
- **DON'T** use `<figure>` for every single image; use it only when a caption is required or when the content is a distinct, referenced unit.
- **DON'T** use `<pre>` without `<code>` for code blocks; `<pre>` alone only preserves formatting but doesn't convey that the content is a computer language.

### Code Example

```html
<!-- Quote with attribution using Figure -->
<figure>
  <blockquote cite="https://html.spec.whatwg.org/">
    <p>The figure element represents some flow content, optionally with a caption, that is self-contained and is typically referenced as a single unit from the main flow of the document.</p>
  </blockquote>
  <figcaption>
    Definition of the &lt;figure&gt; element from the <cite>HTML Living Standard</cite>
  </figcaption>
</figure>

<!-- Image with caption -->
<figure>
  <img 
    src="architecture-diagram.webp" 
    alt="Diagram showing the flow between Client, API Gateway, and Microservices"
    width="800"
    height="450"
    loading="lazy"
  >
  <figcaption>Figure 1: High-level system architecture overview.</figcaption>
</figure>

<!-- Code block with accessibility and language hint -->
<figure>
  <figcaption id="code-block-caption">Example configuration:</figcaption>
  <pre role="region" aria-labelledby="code-block-caption" tabindex="0"><code class="language-json">
{
  "name": "gemini-cli",
  "version": "1.0.0",
  "private": true
}
  </code></pre>
</figure>

<!-- Inline code -->
<p>To initialize the project, run the <code>npm install</code> command.</p>
```

## 3. Resource Prioritization and Performance

### Guidelines

- **DO** use `fetchpriority="high"` for the Largest Contentful Paint (LCP) element (e.g., hero image) to elevate network priority.
- **DO** use `<link rel="preload" as="image">` with `fetchpriority="high"` for LCP background images defined in CSS.
- **DO** apply `loading="lazy"` to off-screen images and iframes to defer bandwidth.
- **DO** specify `width` and `height` on all `<img>` tags to preserve aspect ratio and prevent Layout Shifts (CLS).
- **DO** use the `srcset` attribute on `<img>`s for adding multiple versions of the same image at different sizes.
- **DO** use the `<picture>` element with a fallback `<img>` for more fine-grained image control like switching between image formats, image sizes, and cropping images at different device sizes. 

- **DON'T** apply `loading="lazy"` to above-the-fold or hero images. This delays LCP.
- **DON'T** overuse `fetchpriority="high"`; prioritization is a zero-sum mechanism. Use `fetchpriority="low"` to demote non-critical trackers or later carousel items.

### Code Example

```html
<!-- High-priority hero image with responsive sizes -->
<img 
  src="hero-large.webp" 
  srcset="hero-small.webp 480w, hero-medium.webp 800w, hero-large.webp 1200w"
  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 80vw, 70vw"
  alt="Main product view" 
  fetchpriority="high" 
  width="1200" 
  height="600"
>

<!-- Art direction and format switching with <picture> -->
<picture>
  <!-- Mobile Art Direction: Different aspect ratio (square) and format (AVIF) -->
  <source 
    media="(max-width: 600px)" 
    srcset="hero-mobile.avif 1x, hero-mobile-2x.avif 2x" 
    type="image/avif"
    width="600" 
    height="600"
  >
  <source 
    media="(max-width: 600px)" 
    srcset="hero-mobile.webp 1x, hero-mobile-2x.webp 2x"
    width="600" 
    height="600"
  >
  
  <!-- Desktop: Modern format for primary layout -->
  <source srcset="hero-desktop.avif" type="image/avif">

  <!-- Fallback img defines the default aspect ratio (2:1) -->
  <img 
    src="hero-desktop.webp" 
    alt="Platform dashboard overview" 
    width="1200" 
    height="600"
    loading="lazy"
  >
</picture>

<!-- Low-priority decorative footer image -->
<img 
  src="footer-art.png" 
  alt="" 
  loading="lazy" 
  width="200" 
  height="100"
>
```

## 4. Native Overlays: Dialogs and Popovers

### Guidelines

See `declarative-dialog-popover-control` (via `npx -y modern-web-guidance@latest retrieve "declarative-dialog-popover-control"`) for more info on fallback strategies for using the Popover API in a cross-browser way.
- **DO** use `<dialog>` for modal overlays (requires JS `.showModal()`) to automatically trap focus, dim backgrounds, and support dismissing via `Esc`. Use the `closedby="any"` attribute to enable native "light-dismiss" (closing on backdrop click) without custom JavaScript.
- **DO** provide a visible control for closing modal overlays, so that people using voice control software can easily determine how to dismiss the modal dialog.
- **DO** utilize the Popover API (`popover` attribute) for non-modal UI (menus, tooltips) that do not require focus traps.
- **DO** use `::backdrop` to style modal backgrounds.
- **DO** use `<form method="dialog">` to dismiss dialogs without manual JS handlers. Combined button `formmethod="dialog"` yields the button's value to the dialog `.returnValue`.

- **DON'T** use `show()` for modals where keyboard traps are expected (use `showModal()`).
- **DON'T** call `showModal()` on elements possessing a `popover` attribute (they are mutually exclusive programmatic states). However, `<dialog popover="auto">` is a valid declarative architecture to combine dialog semantics with light-dismiss mechanics.

### Code Example

```html
<!-- Popover (No JS required for toggle) -->
<button popovertarget="help-menu">Info</button>
<div id="help-menu" popover="auto">
  <p>Standard help text.</p>
</div>

<!-- Modal Dialog with Form-based closing -->
<button id="show-dialog">Open dialog</button>
<dialog id="fav-modal">
  <!-- method="dialog" closes the dialog natively and sets the returnValue -->
  <form method="dialog">
    <p>Confirm action?</p>
    <button value="cancel">Cancel</button>
    <button value="confirm">Confirm</button>
  </form>
</dialog>

<script>
  const dialog = document.getElementById("fav-modal");
  const openModal = document.getElementById("show-dialog");
  
  // Show modal dialog
  openModal.addEventListener('click', () => dialog.showModal());
  
  // Listen for the 'close' event to retrieve the user's choice (returnValue)
  dialog.addEventListener('close', () => {
    console.log(dialog.returnValue); // "confirm" or "cancel"
  });
</script>
```

### Native UI Overlay & Disclosure Matrix

| Feature | Modality | Focus | Dismiss Mechanism | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **`<dialog>`** | Modal / Non-modal | Automatic trap (Modal) | Esc / Form / `closedby` | Critical Actions, Settings |
| **`[popover]`** | Non-modal | Standard Tab flow | Light-dismiss (Click outside) | Menus, Tooltips, Toasts |
| **`<details>`** | Inline Disclosure | Standard Tab flow | Toggle summary | Accordions, FAQs |

**Heuristic Rule**: Use `<dialog>` for interruptions requiring user action, `popover` for transient info, and `<details>` for inline content expansion.

## 5. Disclosures: Details and Summary

### Guidelines

- **DO** use `<details>` and `<summary>` for a native disclosure pattern without JS.
- **DO** use `<details>` and `<summary>` for native accordion patterns without JS. For exclusive accordions, use the `name` attribute on the `<details>` elements. Wrap the entire accordion in a `<section>` element with an accessible name provided using either `aria-labelledby` (referencing the `id` attribute of the element that names this accordion) or `aria-label`
- **DO** place `<summary>` as the *first* child of `<details>`.
- If headings must be used within a `<summary>`, consider if the heading is essential for understanding or navigating the document structure. If it is, use a more robust disclosure approach that allows wrapping the disclosure trigger with the heading (e.g. `<h2><button type="button" aria-expanded="false" aria-controls="significant-section-content">Significant section</button></h2>`). This ensures the heading semantics aren’t lost, and the button and its state are announced.
- **DO** use `details[open]` attribute for styling expanded states.
- **DO** use `details::details-content` for styling the contents of the `<details>` element.

- **DON'T** nest other interactive elements (links, buttons) directly inside `<summary>` text as it may break expected focus behavior and screen reader announcements.
- **DON'T** hide visible triangles via `list-style: none` without providing explicit directional cues (via `::before`/`::after` pseudo-elements).
- **DON'T** use the `title` attribute to create tooltip effects, as these cannot be accessed using a keyboard. Instead, use accessible tooltip patterns that can be triggered using a keyboard, and are consistently announced by screen readers.
- **DON'T** provide text alternatives for custom state indicator icons (implemented using `<img>` or `<svg>` elements), as state should be communicated by the `<summary>` element, and a text alternative would duplicate this information

### Code Example

```html
<!-- Exclusive Accordion Set -->
<section aria-label="Frequently asked questions">
  <details name="faq">
    <summary>Item 1</summary>
    <p>Contents...</p>
  </details>
  <details name="faq">
    <summary>Item 2</summary>
    <p>Contents...</p>
  </details>
</section>
```

## 6. Focus Boundaries and Visibility

### Guidelines

- **DO** use the global `inert` attribute for entire hidden sections (off-screen menus, background while custom modal is open) to remove them from tab flows and accessibility trees.
- **DO** pair `[inert]` with CSS (`opacity: 0.5`) to visually signify inactivity.
- **DO** rely on natural DOM order for sequential navigation.
- **DO** ensure that focusable elements aren't obscured by anything when they receive focus (for example, focus should move to modal dialogs and be constrained in them, rather than being able to access obscured content behind the modal).
- **DO** maintain focus—moving it to a logical adjacent element or returning it to the trigger control—when the currently focused element is hidden or removed.
- **DO** move focus to the start of newly injected content when it is added in direct response to a user action that shifts the workflow into that content (e.g., opening a dialog or navigating to a new view), rather than for background or live-region updates.

- **DON'T** use positive `tabindex` values (e.g., `1`, `2`). Use `0` to add element to tab flow, or `-1` for JS program focus.
- **DON'T** alter focus flow using CSS properties (`flex-flow: row-reverse`, `order`) without aligning the DOM structure.
- **DON'T** use `node.focus({ preventScroll: true })` without usability validation; it can hide the focused element off-screen.

### Code Example

```html
<!-- De-tabbing a background app shell while custom drawer is open -->
<main id="app-shell" inert>
  <a href="/">Dashboard</a>
</main>
<aside id="drawer">
  <button>Close</button>
</aside>
```

```css
[inert], [inert] * {
  opacity: 0.5;
  cursor: default;
  user-select: none;
}
```

## 7. HTML APIs and Forms Grouping

### Guidelines

See `forms` (via `npx -y modern-web-guidance@latest retrieve "forms"`) for more details on creating modern web forms.

- **DO** utilize the `form="form-id"` attribute to decouple inputs from the physical `<form>` tree.
- **DO** use `<datalist>` coupled with `<input list="id">` for lightweight auto-suggestions (note: visually unstylable and has screen-reader quirks).
- **DO** use the `autocomplete` attribute and appropriate value on input fields that request personal information (for combined name fields use `autocomplete="name"`, for a given name use `autocomplete="given-name"`, for a family name use `autocomplete="family-name"`.)
- **DO** distinguish `autocomplete="current-password"` (sign-in) from `autocomplete="new-password"` (registration / password change) so password managers offer the right action.
- **DO** match `autocomplete` tokens with appropriate `inputmode` and `type` (`type="email"` + `inputmode="email"` + `autocomplete="email"`). They control different things — keyboard, validation, and autofill respectively — and reinforce each other.

- **DON'T** use `autocomplete="off"` on credential, address, payment, or contact fields. Browsers and password managers ignore it there by design. Use a specific token instead (`autocomplete="email"`, `"street-address"`, `"cc-number"`, etc.).
- **DON'T** use `autocomplete="off"` unless handling highly sensitive tracking tokens (violates standard password manager overrides). Use standard inputs `type="email"`, `type="tel"`.

### Code Example

```html
<form>
  <fieldset>
    <legend>Address Information</legend>
    <label for="city">City:</label>
    <input type="text" id="city" list="cities" autocomplete="address-level2">
    <datalist id="cities">
      <option value="New York">
      <option value="London">
    </datalist>
  </fieldset>
</form>
```

## 8. Native Media Elements

### Guidelines

- **DO** set `width` and `height` to prevent layout shifts (CLS) on `<video>` elements.
- **DO** provide a `poster` image fallback for videos.
- **DO** include subtitles and captions with `<track>`.
- **DO** ensure background videos are `muted`, provide users with full control over playback, and use `role="none"` or `aria-hidden="true"`. The `controls` attribute must also be omitted to make sure the video is not focusable.  

- **DON'T** rely on JS for basic video controls if native `controls` attribute is sufficient.
- **DON'T** apply `role="none"` or `aria-hidden="true"` to focusable elements (such as embedded interactive `<iframe>` components). Hiding elements from the assistive technology tree while leaving them accessible to sequential keyboard navigation violates core accessibility heuristics. The background video exception holds solely because omitting the `controls` attribute renders the `<video>` element fully non-focusable.
- **DON'T** automatically play audio when a page is opened, unless there is an accessible stop or pause control, or a way to change the volume of the audio, independent from the operating system's volume level, as to adhere to WCAG 1.4.2 Audio Control, Level A.

### Code Example

```html
<video 
  controls 
  width="800" 
  height="450" 
  poster="poster.webp"
>
  <source src="intro.webm" type="video/webm">
  <source src="intro.mp4" type="video/mp4">
  <track src="caps.vtt" kind="captions" srclang="en" label="English">
</video>
```

## 9. Dynamic Styles and Interactivity

### Guidelines

- **DO** use the `style` attribute to pass state to CSS via **Custom Properties**. This keeps visual logic in your stylesheet while JavaScript provides the raw data.
- **DO** ensure that information is available for people using screen readers, using text alternatives, appropriate accessible names, roles, and programmatic state information

- **DON'T** use inline styles for static design (colors, padding, margins) that belong in a stylesheet.
- **DON'T** use inline event handlers (e.g., `onclick`). Trigger actions using `addEventListener()`.
- **DON'T** convey state, interaction, or information using color alone.

### Code Example

```html
<body>
  <!-- Progress with style-driven color data -->
  <label for="upload-progress">Upload status:</label>
  <progress id="upload-progress" class="loading-bar" value="0" max="100" style="--brand-hue: 200;"></progress>

  <script>
    const updateProgress = (percent, hue) => {
      const bar = document.querySelector('.loading-bar');
      bar.value = percent;
      
      // Update dynamic style variable 
      if (hue) bar.style.setProperty('--brand-hue', hue);
    };

    // Example: Move to 85% and shift color to green (120)
    setTimeout(() => updateProgress(85, 120), 1000);
  </script>
</body>
```
```css
.loading-bar {
  accent-color: hsl(var(--brand-hue, 200) 80% 50%);
  transition: accent-color 0.3s ease;
}
```

