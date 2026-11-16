# Character follows the rendered board

The Work character now uses one world-size factor calibrated on first entry, then scales directly with the native rendered camera. It is allowed to leave the viewport just like the project cards. Its saved world position is not relocated by viewport resize or Home/Work re-entry. Collision avoidance and viewport reachability remain part of an explicit user placement/drop, not camera navigation.

Root's native `portfolio:boardframe` event fires after each actual board draw. The companion updates in that same frame using the drawn-camera geometry; there is no extra camera-follow RAF or idle polling loop. A character's explicit walk in Work interpolates between world positions, so camera movement during the walk does not detach it. Detail uses its intentional viewing composition and avoids the new side-arrow controls.

## Verification

Final: **17/17 passed**, no browser errors. Per-frame character-centre error and zoom error were both zero against the independent native-camera formula for the recorded desktop and touch samples.

`review.cjs` uses real desktop mouse dragging/wheel input and trusted Chromium CDP touch pan/pinch/character drag at 390×844. It samples every observed board frame independently from `event.detail.camera` and `fitScale`, checks unchanged world coordinates, proportional zoom, exact Back camera/position, resize, explicit character drag, and visible Detail placement clear of artwork/arrows. `report.json` contains the final result. Actual native images were visually inspected; these are browser emulations, not physical-device certification.

The initial harness used an incorrect `portfolioEntry.home()` name (corrected to `showHome()`). The first complete run exposed a root bridge's shadowed `fitScale` reference; `report-before-bridge-fix.json` preserves that failure. Root fixed the native helper outside the drawing function, after which the targeted cases passed. Detail screenshots now wait for the discrete observer-arrival event as well as the native camera to settle.

## Guidance

- **drag:** “Record the pointer offset on `pointerdown` and use it on every move”. I retain capture/grab offset, keyboard and click-to-place while distinguishing explicit placement constraints from a board object's passive camera projection. Viewport clamping is intentionally not applied to passive projection; otherwise panning changes its saved world position.
- **motion:** “Prefer to animate `opacity` and `transform`” and “Keep the final state”. I synchronize the transform to the existing renderer event, preserving the visible end state and reduced-motion behavior without another perpetual RAF.

Retrieved complete drag/motion guides: `C:/Users/oblako/AppData/Local/Temp/mwg-guide-41628-1794850626861.md`. The 2d-panning guide required opt-in for a volatile API; no such API or opt-in was used, and no change to the existing board gesture implementation was necessary.
