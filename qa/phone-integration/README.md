# Shared About / Contact phone review

The review runs against the existing local preview at `http://127.0.0.1:8943/` in its own headless browsers. It does not use the shared MCP browser or mutate the app source.

```powershell
node qa/phone-integration/review.cjs
```

To repeat one environment:

```powershell
$env:REVIEW_ENGINE = 'touch390' # desktop, touch390, webkit320, landscape
node qa/phone-integration/review.cjs
```

Contexts run sequentially: Chromium 1440×900; Chromium touch 390×844; WebKit touch 320×640; Chromium touch landscape 844×390. The script uses locator clicks/taps, keyboard input and Chromium CDP touch gestures. The WebKit swipe check uses mouse/pointer input; this is not a physical iPhone test.

Coverage includes direct Contact opening, stationary physical phone during About/Contact screen changes, current navigation and titles, all six photos, previous/next order and boundaries, photo swipe, inner and outer Back, Escape, profile scroll preservation, blank-space dismissal, drag immunity, rapid-repeat cancellation, Work return, email/Instagram destinations, actual Chromium clipboard copy and denied-permission fallback, English/Romanian/Russian and reduced motion. Mail/Instagram links are inspected without sending messages or opening external apps.

Phone position is sampled during each inner screen transition. Clipboard denial is injected only in the test page and restored afterward. Profile scrolling uses a controlled initial scroll offset, then normal user input to open and close the inner screen.

Generated JSON reports and PNG screenshots remain local (ignored by Git). `report-<environment>.json` keeps each environment's latest run even when a focused run replaces `report.json`. Screenshots are `<environment>-profile.png` and `<environment>-contact.png`.

## Findings during review

- Chromium portrait revealed profile scroll loss after returning from a photo, once the new personal note made the profile overflow (31→0). The implementation worker corrected the order of footer/profile restoration and explicitly preserves the profile scroll offset; the repeat passes.
- In short landscape, scrolling to the bottom requests offset 104, but activating the partially clipped sixth thumbnail normally scrolls it into view at 41. The review therefore measures its baseline after `scrollIntoViewIfNeeded`: 41 before opening and 41 after Back. This is expected scrolling to reveal the control, not lost profile position.
- An unrealistically fast 40 ms CDP swipe caused Chromium to suppress the following tap's synthetic click. The test now uses eight 35 ms touch movements and a 600 ms post-gesture interval. The actual photo swipe and subsequent Back are checked separately; no app workaround was added for the test-input artifact.

## Final local results — 2026-11-17

| Browser / viewport | Passed | Failed |
| --- | ---: | ---: |
| Chromium desktop 1440×900 | 33 | 0 |
| Chromium touch 390×844 | 33 | 0 |
| WebKit touch 320×640 | 32 | 0 |
| Chromium touch landscape 844×390 | 33 | 0 |
| **Total** | **131** | **0** |

No uncaught browser errors. About↔Contact physical phone position/size drift measured 0 CSS pixels. All contact actions remain reachable by internal scrolling in the short landscape phone. Contact/Photo Back and whole-phone dismissal do not reopen the phone.

These are local browser-emulation checks, not a physical iPhone or published-site check. Chromium clipboard writing was tested against the real browser clipboard; WebKit covers the explicit denied/unavailable fallback instead. External email/Instagram destinations were not activated. The profile/contact screenshots provide visual evidence at all four viewports; physical iOS browser chrome and keyboard behavior remain outside this review.
