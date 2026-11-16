# Actual product verification after the text fix

Read-only verification of the local product. No browser layout overrides and no product-file edits were used. The test waits for `portfolioLoader.getState().phase === 'complete'` before input, and waits for locale animations to finish before measuring text.

**231/231 checks passed**, covering seven viewport/DPR configurations and all three locales (English, Romanian, Russian):

| Viewport | DPR | Bio font | Tagline font | Profile scrolling |
| --- | --- | --- | --- | --- |
| 1440×900 | 1, 2 | 17.52px | 11px | Not needed |
| 390×844 | 1, 3 | 15.31px | 11px | Not needed |
| 844×390 landscape | 1 | 14px | 11px | 353–374px |
| 375×600 | 1 | 14px | 11px | 58–75px |
| 393×620 | 1 | 14px | 11px | 50–67px |

The DOM screen's combined scale is 1 within floating-point rounding in every measured state. Fonts are now laid out at their displayed sizes. Screens remain within both the photographed phone and the viewport; no horizontal text clipping was found. On short screens the internal profile scroll reaches the Instagram link and the final content.

Verified interactions: photo opening, next/previous, photo Back retaining About, About → Work → Back restoring the saved Home composition, resizing/rotating while About is open, resizing during the phone approach, and Back while resizing. No runtime errors or AI mentions were found in visible About copy in any locale.

An additional reduced-motion smoke at 375×600 passed in all locales, including photo next, About → Work → Back and a settled Home return. Captures were refreshed separately after `decode()` completed for all seven visible profile images; `capture-verification.json` records this for all configurations and the reduced-motion smoke. Full profile/screenshots in this directory are those final decoded captures, not the earlier diagnostic A/B images.

Visual inspection included desktop DPR1, portrait DPR1/DPR3, 375×600 English, 393×620 Russian and short landscape Russian. The text is legible, the formerly thick scaled separator is now thin, and narrow screens use vertical scrolling instead of squeezing the copy below the new minimum sizes.

Root subsequently added `profile.scrollTop = 0` when reopening About to address a separate WebKit re-entry issue. Its WebKit verification is owned by the other reviewer; the 231-check matrix above was not repeated for that single reset line.

Files:

- `validation.json`, `summary.json`: full interaction and geometry results.
- `capture-verification.json`: decoded-image captures and reduced-motion smoke.
- `../verify-product.cjs`, `../capture-verified.cjs`: reproduction scripts.

Limitations: this matrix used local headless Chrome with emulated viewport/DPR/touch. It is not a claim of physical iPhone hardware testing. Public deployment verification is owned by root.
