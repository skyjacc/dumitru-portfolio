# New entry flow — functional QA

Result: requested flows pass on the tested local build. No unresolved product failures found.

Tested `http://127.0.0.1:8943` with fresh Chrome contexts at 1440×900, 390×844, 320×740, and 854×900 with `prefers-reduced-motion: reduce`. Actual mouse/touch controls were used. Camera tolerance is 1e-6; existing `helpers.settle` was used. No product files were edited and no per-frame instrumentation was added.

## Coverage and results

- **Loading → Home:** loader is present initially, auto-completes after at least 1.5 seconds, and opens the introduction. Native canvas is both inert and invisible under Home. EN is the fresh-context default.
- **Home → Work:** CTA enters a separate Work overview, without leaving the case menu open. The Work pill opens the list with exactly five keys: Andra, BTB, FKD, ORA, Bonanza. Escape closes only the menu first; Escape from the Work overview restores Home.
- **Five cases:** all open via the Work list and return via Back to Work, restoring the exact saved camera on desktop and mobile.
- **About / Process origin:** opening from Home and pressing Escape restores Home; opening from Work and using Back restores Work and its camera.
- **Languages:** EN / RO / RU Home copy differs correctly and preserves Home; changing language inside Andra preserves the current material, both cameras and detail state.
- **Home cancellation:** rapid CTA Work → Home cancels pending Work entry; the introduction stays active after the old transition delay expires.
- **Real mid-return reopen:** 180 ms after Back from Andra, the visible native BTB pin was found with a lightweight exposed hit-test and clicked/tapped. BTB opens, and its Back restores the original Work camera on both sizes.
- **Browser history:** actual browser Back from Andra returns to Work and the saved camera.
- **Direct URLs:** `/work/despre` and `/work/andra` bypass the Home introduction after the loader, open detail, then Back goes to Work; Home then restores the introduction.
- **Compact / reduced motion:** 320 px and 854 px reduced-motion paths complete Home → Work → Process → Work → Home. Home CTA remains inside the viewport.
- **Hover:** desktop Work pill position, outer transform and icon transform are unchanged after sustained hover. No positional jitter was observed.
- **Normal-run errors:** no unexpected JavaScript, console or HTTP resource errors in the completed edge and compact runs. Initial full runs also recorded no such errors.

## Controlled resource failures

All 14 checks pass:

1. **Stalled Home image:** Continue stays hidden before seven seconds, appears around seven seconds, enters usable Home, and Work becomes available after the delayed image resolves.
2. **Failed Home image:** a failed decorative preview does not trap the loader; Home and Work remain usable without a JavaScript crash.
3. **Failed native bundle:** the expected browser load error is captured. Continue enters Home; clicking Work while native startup is unavailable keeps Home visible. A fallback appears with all five direct project links.

Evidence images: `slow-image-continue.png`, `failed-native-continue.png`, `native-failure-fallback.png`, plus Home / Work captures for the ordinary viewports.

## Reports and test adjustment

- `flow-report.json`: 75 recorded assertions; 73 passed. Two initial harness steps tried to click the Process pill at 180 ms into return, when the product deliberately hides it. They were not user-reachable actions and are not product defects.
- `edge-report.json`: 18/18 pass, including the replacement **actual native canvas click/tap during return**, Browser Back and both direct URLs at both sizes.
- `fault-report.json`: 14/14 pass for delayed image, image error and native bundle failure.
- Total: **105 valid passing assertions**, no unresolved functional defect. Raw harness failures are retained for audit rather than removed.
- `review.cjs` now waits for the Process pill to become available when replaying that UI-only sequence. `edges.cjs` contains the true mid-return native interaction; `faults.cjs` contains the fault injection.
- `final-versions.json`: entry-flow.js, entry-flow.css, portfolio-ui.js, portfolio.css and native main bundle hashes all remained unchanged across this QA pass.

The one exposed helper in `edges.cjs` forwards the existing native hit-test to choose a real on-screen pin; it does not navigate directly or record animation frames. Visual composition review is owned by root.

## Final loader hardening retest

After the loader patch, fresh contexts rechecked the following: 7 s Continue; automatic failure-open for a never-loading image at about 10 s; no “Ready to explore” status after failed image/native tasks; missing native engine immediately exposes five direct links; `/work/andra` with a failed native bundle automatically lands on usable Home with those links; ordinary desktop/mobile Home → Work → Process → Back → Home; disabled JavaScript hides the loader.

All required behavior above passed. `final-fault-report.json` retains its raw 29 assertions: 27 strict passes and two reviewed observations:

- A deliberately blocked Andra image produced one `Failed to fetch` pageerror while Home and Work remained usable. Two fresh standard targeted probes did not reproduce a pageerror and recorded only the deliberately blocked `desktop.webp` / `?retry=1` requests. `image-error-probe.json` contains the latest successful probe. The native renderer's image fetch already has `.catch(i)`; no owning stack was captured, so no speculative code change is proposed. One additional CDP-instrumented diagnostic was stopped after a timing timeout and is not treated as a functional result. This is classified as a controlled blocked-resource sample, not an observed normal-flow defect.
- The no-JavaScript test asserted five project links, which exceeded the requested no-script loader-hide behavior. The loader is correctly `display:none`; the current static fallback supplies an email link. Root independently confirmed this intended fallback.

Final retest scripts: `faults-final.cjs`, `image-error-probe.cjs`. The final runtime normal smoke had zero page errors. `entry-flow.css` received an unrelated 700×650 print-layout adjustment during this phase; root owns that visual verification. No further product changes were made by QA.
