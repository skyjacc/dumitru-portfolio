# About font units and scrollbar: focused WebKit review

Engine: Playwright WebKit 27.2 / build 2388 on Windows, mobile/touch emulation, DPR 3. This is not a physical iPhone or Safari in-app browser test. Root 32px is an explicit simulation of a larger preferred text size, not an OS Dynamic Type test.

## Final result

`webkit-units-report.json`: **40/40 checks passed** after the story-layout correction. Scenarios: 393×620, EN/RO/RU at root 32px, plus EN at root 16px.

- Profile body font scales from 14px to 28px; heading from 20px to 40px.
- Phone screen radius remains 19.145443px at both font sizes.
- Profile and photo story clientWidth/scrollWidth are 186/186: no horizontal clipping.
- Enlarged photo retains 167×167px; all captions and controls remain reachable by vertical scrolling. Story max scroll EN/RO/RU: 222/356/188px. At default text size the photo is 214.7px high and story needs no scroll.
- Photo Back preserves the previous profile position. Fresh photo opens at story scrollTop 0. Closing/reopening About resets the profile to its top.
- No page errors.

Earlier in this same review, default 16px EN/RO/RU at 393×620 and one EN 390×844 sanity passed profile geometry/reachability. At 390×844, bio is 15.31px, radius 29.07px, and no profile scrolling is necessary. Only the focused four scenarios above were repeated after the photo-layout correction.

## Scrollbar limits

Computed `scrollbar-width` is `thin`. This WebKit build does not expose/support `scrollbar-color`; the source's 6px WebKit fallback applies. Mobile WebKit's automation does not support `mouse.wheel`. Scroll reachability was checked with `scrollIntoViewIfNeeded` and `scrollBy`, while photo and Back use real `tap()` actions. Overlay thumbs are absent from these headless screenshots, so their visible physical width is not claimed as visually verified.

## Failure found and fixed by root

At root 32px the fixed-height photo story collapsed the Romanian photo to 0px and caused horizontal overflow in the control text (especially Russian). Root added a scrollable story, a non-collapsing image minimum, wrapping text and a zero-scroll fresh photo entrance. Final tests pass.

The baseline report preserves the finding. Its `photo Back preserves profile position` failures were **test-harness false positives**: the before value was sampled after hiding the profile, where WebKit reports 0. The final harness samples the visible profile immediately before tapping the photo; all four checks pass.

## Guidance

Modern Web Guidance `respect-os-text-scale`, freshly searched/retrieved for this task; full text in `webkit-units-guide.txt`:

> Test that text can be resized to at least 200% of its default size without loss of content or functionality.

Final screenshots without transient click feedback: `webkit-units-final-{16-en,32-ro}-{profile,photo-top,photo-bottom}.png`. Baseline screenshots with `-baseline` preserve the original enlarged-text photo failure. No product files were changed by this reviewer; no deployment/shutdown performed.
