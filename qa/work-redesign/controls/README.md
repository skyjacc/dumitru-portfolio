# Paper project controls

2026-11-16. Local preview at http://127.0.0.1:8943/. Owned product files: `site/portfolio-ui.js` and `site/portfolio.css` only.

## Changes

- Replaced the old 01–04 text strip with small contact-print thumbnails, handwritten indices and a pencil-circle selection marker. Stable button hitboxes are at least 44 × 44 CSS px. Hover moves only the inner paper, never its hit area.
- Added drawn previous/next arrows on desktop. Mobile uses directly selectable thumbnails; the thumbnail strip alone can scroll if more materials are added. Existing native material events, ordering and manual selection are retained.
- View site is a cream paper tag with handwritten type and a drawn arrow. Its localized accessible name includes the project name and new-tab warning. Video thumbnails use existing posters, without a second autoplaying video.
- Moved the compact project type next to the link. Badges read Concept / Fictional concept, Concept / Concept fictiv, or Концепт / Вымышленный проект; fiction is detected by the localized type, not a fixed project key. Full type remains in the title. This complements the native worker's removal of the large type header.
- The lower Back is hidden and removed from the focus sequence; the upper shared Back is the visible action. Keyboard opening focuses that upper Back and Escape returns focus to the Work opener.
- Kept material/Visit layout independent of the camera. Existing safe-area reporting includes the new footer, with 24 px of requested caption clearance. EN/RO/RU labels and status announcements follow the native selected material. No timer advances materials.

## Verification

- `report.json`: **66/66** checks, all five projects/four materials at 1440 × 900 and 390 × 844; ORA at 393 × 620 and 320 × 640; RO/RU link layout at 320.
- `layout-report.json`: **26/26** bounded recheck after the native caption fix and shortened badges, four viewports including RO/RU at 320 px.
- `wrap-report.json`: **1/1** additional Romanian 320 px check; View site text wraps between complete words, preserving `site-ul` on one line.
- `keyboard-report.json`: **3/3** reduced-motion checks: keyboard open → upper Back focus; thumbnail Enter → selected material; Escape → Work/opener focus.
- Source poster images decode, exactly one print is selected, target sizes and controls remain within the viewport, upper Back works, and no page/HTTP errors occurred in the final runs.
- `pre-native-fix.json` records an earlier concurrent native-label exception in `1l2px902fb04m.js`; the spatial worker fixed it before the passing runs. Earlier tiny-card captures were overwritten after the fix.

The previously reported **native caption overlap on 320 px RU is resolved** by the spatial worker's safe-area layout fix. The final 320 px EN/RO/RU and 393 × 620 screenshots were visually reviewed: native descriptions clear the photo prints and shortened type badge, with no collision. The thumbnail and link bounds checks are still scoped to the DOM controls rather than a general native renderer certification.

## Applied guidance

Modern Web Guidance was retrieved and read from `mwg-guide-34032-1794846673142.md` (carousel and accessibility). The existing canvas carousel remains the project navigation engine; DOM-native scrolling is used for its thumbnail selector only.

- **`carousel`**: used named HTML buttons and a non-color selected marker; “The active slide's control must not communicate that it is active through color alone”. Scrolling is scoped to the thumbnail strip, and settled native material changes update the existing polite status region.
- **`accessibility`**: kept native button/anchor semantics and restored keyboard focus to the remaining visible action; “Don't attach keyboard handlers to native interactive elements”. Enter/Space activation is native; existing gallery arrow/Escape navigation remains separate.

Browser emulation only; no physical device or screen-reader certification is claimed.
