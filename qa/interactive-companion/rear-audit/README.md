# Rear material audit — 2026-11-16

Read-only check, fresh private Chrome contexts, 1440 × 900. No product files changed.

## Observed

- Local `http://127.0.0.1:8943` and public `https://dumitru-spatial-portfolio.vercel.app` show quiet dark rear cards on a fresh Work entry.
- After Bonanza → fourth material → Back, the still-unvisited ANDRA and FKD rear cards remain quiet. After opening each of those projects, the rear cards show their loaded images as expected.
- Exact cold deep link `/work/bonanza?v=sketch-loader` opens Bonanza correctly. Back returns to Work with quiet ANDRA/FKD rear cards.
- No page errors or HTTP errors in the normal sequence. No page errors in the deep-link sequence.
- Both sites delivered native chunk `1l2px902fb04m.js` with SHA-256 `3544adf3768d81bdf42b16d12ecde61abd756a43b620334de392845c34bc3322` during this check.

## Remaining source branch

The quiet-gated fix is present in the delivered bundle (`portfolio-quiet-gated-paper-v1`). However, generic ungated media loading still uses the original snow placeholder:

- `site/_next/static/chunks/1l2px902fb04m.js`, first line, function `k(e,t,n,r=1,i)` near character 620 calls `e.snow(...)`.
- Drawing function `I` near character 2400 uses `D<1 && ... && (E||I ? quietBacking : k(e,O,r,S,L))`.
- `E` is the media's current gated state, `I` is a previously-gated media flag, and `D` is its reveal progress.

This branch could display snow while an ungated image is not ready; it was **not visible in the audited settled states**, including the exact deep link. The reported screenshot is therefore not representative of the fresh settled scene we captured, but the audit cannot prove whether it was an old tab or a transient loading frame.

## Evidence

- `local-work-before.png`, `local-work-after-bonanza.png`, `local-work-after-fkd.png`
- `public-work-after-bonanza.png`, `public-work-after-fkd.png`
- `local-direct-ready.png`, `local-direct-back.png`, `public-direct-back.png`
- `report.json`, `deeplink-report.json`
- Reproduce with `node qa/interactive-companion/rear-audit/review.cjs` and `node qa/interactive-companion/rear-audit/deeplink.cjs`.
