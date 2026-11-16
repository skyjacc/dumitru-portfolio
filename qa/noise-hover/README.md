# Restored native unloaded-card noise

Local target: `http://127.0.0.1:8943/`. Final result: **14/14 checks passed**, without browser errors. `report.json` contains the measurements.

The QA route instruments only the browser response of the restored renderer to record its existing noise seed, reduced-motion and frozen flags. Product files are not modified; the same native drawing operation and timing remain intact.

- Desktop Chromium: cold Work visibly contains original rear-card noise; after inactivity the native field freezes. Entering a different project's hover changes noise seeds again without changing camera or project positions.
- Loaded BTB: after opening and selecting material 4, no gated noise draws remain in that visible project. Back restores the original camera.
- Reduced motion: all observed fields use fixed seed 0.
- Mobile WebKit, 390 × 844 DPR 3: cold noise, opening BTB, selecting material 4 and exact camera return pass.

Visual evidence: `desktop-hover-noise.png`, `desktop-loaded-btb.png`, `phone-cold-work.png`, `phone-loaded-btb.png`, `reduced-cold-work.png`.

`report-initial.json` preserves two initial harness failures: dispatching resize to inspect idle state woke the renderer, and clearing the sample buffer before reduced-motion hover left no sample because no redraw was needed. Corrected checks observe the final idle draw and retain the fixed reduced-motion samples; no product changes were needed. Only those desktop/reduced scenarios were rerun, retaining the passing phone result.

This is desktop/browser device emulation, not a physical iPhone test. The character, layout, camera, image-loading and reduced-motion mechanisms are unchanged by this restoration.
