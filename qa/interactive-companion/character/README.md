# Interactive pencil companion

Implemented in `site/studio-companion.js` and `site/studio-companion.css`. The native renderer, gallery camera and project navigation are not edited by this component.

## Behaviour

- A compact native button is the Work drag handle. Grab offset and pointer capture preserve its position under the pointer. The drawing lifts/sways, then lands; if a drop intersects a project it walks to a nearby clear space rather than snapping instantly.
- A click/tap selects a destination; a second click/tap on empty space places it. Arrow keys move it, Shift increases the step, and Escape cancels. EN/RO/RU accessible names and a polite live region describe the action. The short handwritten hint appears only on hover/focus or during destination selection.
- Work placement is stored in world coordinates. Camera panning/zooming and opening/returning from a project do not rewrite the saved drop position. Resize clamps it to a reachable position.
- Opening a project hides the figure during the camera flight, then gives it a finite walk from a side edge to the actual selected-card bounds. It takes notes and rests in a peeking pose. A material change briefly repositions/reacts; it does not advance project materials.
- On narrow screens the observer uses the free side margin at a smaller size, down to 48px high at320px. Stroke width stays about1 CSS pixel. The selected artwork, captions, thumbnails and navigation remain clear.
- Home/About/Process, blur, pointer cancellation, lost capture and resize terminate active movement. A cancelled drag suppresses the trailing synthesized click, preventing accidental destination selection.
- Project-state events reuse the existing UI signature updates. Animation frames run only during travel, gestures or short camera-follow windows; the settled character sleeps. Walk actions finish within820ms and writing within1450ms. Reduced motion skips travel/pose animation and preserves the final visible state.

No visitor actions are recorded or sent anywhere. These are local visual reactions to the current open project/material.

## Verification

- `check.cjs`: **12/12** focused checks passed after the first return/collision corrections. Mouse drag, fixed camera, click-to-place, Escape selection cancellation, keyboard movement, actual-drag Escape, project approach, idle pose, material reaction and exact world-position return. `report.json` contains the results and desktop screenshots.
- `interruptions.cjs`: **11/11** passed on the final code. Forced `lostpointercapture`, Escape during drag, resize during drag, Work→Process during drag, subsequent Work interactivity and all five project observers at320×640 WebKit. No browser errors. `interruptions-report.json` contains the final results.
- `320-*-observer.png`: all five project states show the figure fully inside the viewport, outside the selected image, with no running animations at rest. Desktop `held.png` and `taking-notes.png` illustrate the transient poses; the older latter screenshot includes a focus outline that the final Detail-inert fix removes.
- Root-owned assembled integration covers touch dragging, cross-mode transitions, material changes, responsive return and publication separately. These are browser emulations, not physical-device or screen-reader certification.

## Modern Web Guidance applied

- **drag:** “Record the pointer offset on `pointerdown` and use it on every move” and “Default to `setPointerCapture()` and clear the dragging state on `lostpointercapture`.” I use a native button, matching pointer/keyboard clamping, click-to-place, localized instructions and movement announcements. `touch-action:none` and prefixed user selection apply only to the handle. Cancellation also suppresses the trailing click observed in Chromium.
- **motion:** “Prefer to animate `opacity` and `transform`” and “Keep the final state.” I animate the SVG rig/position with finite action states, keep the gallery camera untouched, and finish immediately for reduced motion without waiting for animationend.

Retrieved full guides: `C:/Users/oblako/AppData/Local/Temp/mwg-guide-45908-1794848915411.md` (drag, motion).
