# Open-centre gallery and interactive pencil character

The current Work layout replaces the earlier diamond rows with a balanced five-case inner ring. New cases fill larger rings without repositioning earlier cases. Portrait folded previews use shared drawing/hit geometry so the wider field does not make them too small.

The character is an original SVG with think, walk, lift, note and peek poses. In Work it supports pointer capture, arrow-key movement and click/tap-to-place. In a project it is decorative, walks into a clear viewing spot and reacts briefly to material changes. Home, Process and About clear active input. The saved Work position is independent of the gallery camera.

## Evidence

- Production: https://dumitru-spatial-portfolio.vercel.app/ — deployment `dpl_6ZFMnffRAege7Vt83fYYMynQsmQJ` is READY with aliases assigned. `integration-public/report.json`: **13/13** public smoke checks passed in desktop Chromium and phone WebKit, without browser/network errors. `public-file-check.json`: **4/4** changed files match the final manifest's SHA1 and byte size. Public overview and project observer screenshots were visually inspected.
- `layout/README.md`: 82/82 final placement and real click/tap/material/Back checks across desktop, narrow/normal phone and 2K, including stable growth and exact camera return. Final phone preview widths are approximately89px at390 and71px at320.
- `character/`: 12/12 focused gesture/state checks and 11/11 final interruption/narrow checks, without browser errors. Covers actual drag Escape, lost capture, resize and leaving Work during drag, plus visible non-overlapping observers for all five projects at320×640 WebKit. A cancelled drag's trailing click is suppressed.
- `integration-local/`: 32/32 assembled checks passed across desktop Chromium, trusted narrow-phone touch input and WebKit phone: drag/camera isolation, real visible project observer, material reaction, exact saved-position/camera return, Process/About, reduced motion and resize. The first report sampled a material change before the new discrete UI event arrived; the final harness waits for both native and companion state. The initial narrow screenshot exposed missing observer space; the final side-gap fallback keeps the figure visible without covering artwork.
- `rear-audit/README.md`: fresh local/public sessions and the supplied Bonanza deep link did not reproduce persistent rear TV noise. The quiet lazy placeholders remain; no unrelated renderer edit was made for that screenshot.

Browser emulation covers Chromium and WebKit, not a physical phone or assistive-technology certification. No user activity is recorded; character reactions are transient visual state only.

## Modern Web Guidance

- **drag:** “Record the pointer offset on `pointerdown` and use it on every move”. The character keeps its grab offset and pointer capture; cancellation releases capture and restores the saved position. A native button retains keyboard and single-pointer alternatives.
- **motion:** “Prefer to animate `opacity` and `transform`”. Position, walk and lift feedback use composited transforms; finite reactions stop at rest. Reduced motion preserves the visible final state without waiting for absent animation events.

The existing UI state loop emits `portfolio:projectstate` only on changes. The companion does not add another permanent polling loop. The selected-material bounds come from the native renderer's geometry bridge rather than an independent estimate.
