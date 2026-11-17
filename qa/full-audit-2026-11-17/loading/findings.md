# Loading, failure handling and runtime performance audit

2026-11-17. Audited checkout `cc6e2db` / published runtime `0947124`. No product files changed. Local origin: `http://127.0.0.1:8943/`; production: `https://dumitru-spatial-portfolio.vercel.app/`.

## Confirmed defect

### LOAD-01 — P2: a failed entry-controller request leaves an unrecoverable black loading screen

**Reproduce:** block `/entry-flow.js` in DevTools Network Request Blocking, disable cache and reload. Equivalent deterministic probe: `$env:AUDIT_URL='http://127.0.0.1:8943/'; node qa/full-audit-2026-11-17/loading/probe.cjs fail-entry`.

**Actual:** at 23.79 seconds the viewport is entirely black. `portfolioEntry` and `portfolioLoader` do not exist; no loading handoff occurred. The slow-loading/enter button never becomes available and there is no visible email fallback. The native runtime/resources otherwise loaded. This is a failure-path defect, not a claim that this request normally fails in production.

**Cause / anchors:** `site/index.html:29` creates the blocking loader and keyboard guard. `site/index.html:43` loads the controller as an external script with no script-error recovery. Both the only seven-second escape (`site/entry-flow.js:332`) and removal of the loader/guard (`site/entry-flow.js:318`–`327`) are implemented inside that same controller. `<noscript>` does not help when JavaScript is enabled but a critical script fails.

**Impact:** one unsuccessful critical resource request prevents all navigation and contact until the visitor reloads. Expected bounded failure handling exists for images and the native renderer, but not for the controller responsible for that handling.

**Recommendation:** add a small independent bootstrap failure/watchdog path in the HTML shell that can remove the blocking curtain, release the keyboard guard, and show retry/contact/direct-work links when the controller never starts. Preserve the intentional normal loading animation.

**Evidence:** `fail-entry.json` (one intentionally failed request, no handoff, screenshot time); `fail-entry-initial.png`; reproducible `probe.cjs`. Native-script failure is a useful control: `fail-native.json` and `fail-native-initial.png` show the current fallback working for a different failed module.

## Performance improvements / degraded-state polish (not additional confirmed functional defects)

### PERF-01 — Cold mobile artwork costs substantially more than the application code

Public Chrome, viewport 390×844, DPR 3, clean browser context, normal network:

| Observation | Measured value |
| --- | ---: |
| Resource entries | 76 |
| Resource transfer, excluding HTML navigation entry | 3,721,064 bytes |
| Main laptop variant alone | 1,199,450 bytes transferred / 1,199,150 encoded |
| Five desktop project covers loaded behind Home | 1,073,696 bytes transferred |
| All scripts together | 379,670 bytes transferred |
| Fonts | 206,840 bytes transferred |
| DOMContentLoaded | 1.222s |
| Home state / loader removed | 3.186s / 3.789s |
| Last observed LCP candidate | 4.652s, laptop image |

The laptop is correctly requested once and has high priority; responsive variants exist. Its selected 1024px lossless export is nevertheless 32% of the initial payload. Five project covers not yet shown account for another 29%. `scripts/prepare-desk-responsive.py:17` explicitly exports the retained v2 variants losslessly. Selection is in `site/entry-flow.js:39`–`47`; matching preload in `site/index.html:19`. This is an optimization opportunity, not an assertion that the current source resolution should simply be lowered (the user specifically requested sharp paper edges).

**Recommendation:** visually compare a perceptually compressed export preserving the alpha edge/grain; review whether background native cover fetches can wait until Home is ready or Work intent. Keep the high-DPR option and the matching preload/srcset. Do not sacrifice clarity to meet an arbitrary byte target.

**Slow-network observation:** with CDP 150ms latency and 200,000 bytes/s download (1.6Mbps), no CPU throttle, Home appeared at 14.811s and loader finished 15.419s. At 17.285s the laptop request remained incomplete and its lower half was visibly still decoding (`slow-mobile-initial.png`). Loader state was `loadingFailed:true`, `resourcesSettled:true`, `finishReason:'ready'`. The intentional 10s resource timeout is in `site/entry-flow.js:333`; `finish()` only shows explanatory fallback when the native runtime is unavailable (`:323`).

The timeout correctly avoids trapping the visitor. Treat the unannounced partially decoded critical illustration as degraded-state polish: after timeout, show a coherent static placeholder/low-resolution preview until decode finishes, rather than calling the whole scene ready while its primary object is partially painted. The deterministic held-laptop test confirms handoff with the request unresolved and recovery when it arrives; its first screenshot is taken immediately after handoff during the intentional staggered reveal and must not be used to claim that all lower objects stay missing.

Evidence: `public-mobile.json`, `slow-mobile.json`, `slow-mobile-initial.png`, `held-laptop.json`, `slow-delayed.cjs`.

### PERF-02 — Opening ANDRA loads both motion materials immediately

On first ANDRA opening, before explicitly choosing its video material, both detached native video elements move from`preload:none`/paused to`preload:auto`/playing. They are the neighboring cards in the spatial composition, so this is consistent with the existing visual design; it is not an endless hidden-playback bug.

The media payload measured locally is 8,685,214 bytes for`/assets/hero-bouquet-hd.mp4` plus 1,341,172 bytes for`/assets/projects/andra/bloom.mp4`: **10,026,386bytes**. Both downloaded when ANDRA first opened. These bytes must not be counted as initial Home download.

Anchor: native media synchronization in `site/_next/static/chunks/1l2px902fb04m.js:97` changes preload to auto when a video is marked in-frame/soon and starts all live in-frame videos. ANDRA media catalogue is at`:144`.

**Recommendation:** consider keeping rear motion cards on their posters on mobile until selected, or provide smaller mobile motion encodes. This is a bandwidth/battery tradeoff for product review. Do not remove the user's approved rotation.

Evidence: `media.json` (records detached video instances, which are absent from `document.querySelectorAll('video')`); `lifecycle.json`; reproducible `media.cjs`.

## Checks that passed

- **Public files:** 275 runtime/assets returned 200 in a bounded HEAD scan. `vercel.json` is 404 because Vercel does not serve its own configuration; this is expected and excluded from defects. `http.json` records all 276 manifest entries. Normal cold/reload probes had no failed requests or page errors.
- **Caching:** same-context public reload transferred 22,800 resource bytes, rather than 3.72 MB; existing revalidation/ETags work. Every resource revalidates with`max-age=0,must-revalidate`. Do not blindly mark the adapted `_next` filenames immutable: this repository edits their contents without changing those filenames across releases.
- **No JavaScript:** loader hidden; readable email contact fallback rendered (`nojs-initial.png`).
- **Native renderer script failure:** timeout yields readable Home and five direct case links (`fail-native-initial.png`), approximately 13s to loader removal in this test.
- **Failed laptop request:** loader finishes instead of hanging; `fail-laptop.json` records the intended error path.
- **No WebGL:** forcing all WebGL context creation to return null uses Canvas2D; all five projects opened and returned without JS errors. `fallback-detail.json`, `chrome-no-webgl-work.png`.
- **WebKit mobile:** all five project open/return cycles completed without JS errors; `fallback-detail.json`, `webkit-mobile-work.png`. This is browser emulation, not physical iPhone certification.
- **Ordinary Home and Process idle:** zero instrumented RAF callbacks in the measured 5s settled windows. SVG scheduler had no pending frame/timer in Home/About/Process. The original Home character stopped when leaving Home.
- **About after ANDRA:** both detached videos paused and kept the exact same currentTime during a subsequent 15s idle window. That same 15s window recorded zero RAF callbacks.
- **Reduced motion:** zero idle RAF callbacks in each measured Home/Work/Detail/About/Process 5s window; SVG life marked paused with`reduced-motion`. A fresh reduced-motion load did not download the two MP4s; switching preference after videos were loaded paused both. No public pause button was added or requested by this audit.
- **Idle bookkeeping:** DOM node/listener/document counts were stable inside the sampled 5s idle windows; heap sometimes decreased after normal garbage collection. This is no evidence of a rapid idle leak, not a full memory-leak certification.

## Method and limits

- Own isolated Playwright browser processes; no shared browser/MCP state and no runtime edits. `probe.cjs` instruments RAF callbacks and PerformanceObserver; `media.cjs` captures detached video creation.
- Timings are single-run local observations on this shared machine. Multiple agents/browser processes were active during portions of the audit. Do not treat RAF frequency, long tasks or frame timings as hardware-independent FPS, INP, field CWV or percentile measurements. The cold mobile run had a 461ms bootstrap long task, but this audit does not assign a production severity based on that single machine sample.
- Slow mobile condition is explicitly synthetic network throttling; no CPU throttle. It is not a real Romanian cellular-network measurement.
- Bringing another headless tab forward did not change `document.hidden`; browser freeze/resume was exercised but did not deliver visibilitychange either. Therefore these probes do **not** certify real background-tab/app lifecycle behavior. Active section visibility and reduced motion were directly verified. No real iOS background/screen-lock test performed.
- A complete repeated-cycle heap/leak study was not conducted. No field telemetry, Lighthouse score, or exhaustive graphics-driver compatibility claim.
- Other agents reported long DOMContentLoaded waits in bundled Chromium. This suite's installed Chrome produced 1.222s/4.804s DOMContentLoaded in normal/throttled public tests; the cause of the other engine's delay was not established. Do not conflate the reports with a verified site defect.
- All audit browser processes closed. Reports/scripts only; no Git/deployment changes.

## Modern Web Guidance

Applied installed skill's search/retrieve process. Searches: `optimize loading performance`, `load responsive images`, `pause inactive animations`. Retrieved and read complete guides: `performance`, `optimize-image-priority`, `efficient-background-processing`, `lazy-load-video-and-audio`, `motion`. Read local `AGENTS.md`, `README.md`, `scripts/ENTRY.md`. CLI reported a newer skill version; no skill/runtime modification was made as part of this audit.

- **performance / optimize-image-priority:** used the rule “DON'T lazy-load the LCP image” to retain high priority for the laptop, and separated initially hidden case resources from necessary Home artwork. Reported actual transfer bytes rather than repository size.
- **efficient-background-processing:** used “Pause heavy background tasks when a component is not being rendered” to test stopped clocks/videos per scene. Did not prescribe content-visibility for an already small fixed-scene application.
- **lazy-load-video-and-audio:** used “preload=\"metadata\" still initiates range requests” as the reason to inspect actual media transfers and detached video states, rather than relying on preload labels or DOM-only queries. A Safari fallback would be necessary if a future change relies on native lazy-media behavior.
- **motion:** used “Keep the final state” and reduced-motion guidance to verify that stopping animations leaves usable static views. The user's explicit removal of the pause control was respected; no unsolicited UI recommendation to re-add it.

This is an audit; no guide-backed implementation changes are claimed.

