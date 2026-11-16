# Native hover stability review

Run `node qa/calm-hover-review/review.cjs` from the portfolio root. The script uses the existing local Playwright installation and the preview at `http://127.0.0.1:8943`.

The review passed all 24 captures at 1440×900 and 390×844, each with normal and reduced motion. It records the five case compositions in Work, focused BTB at material zero, and the Help/contact stickers at rest and hovered. Each scene includes stationary and moving mouse input. Mouse hover on the phone viewport is synthetic; this is not a physical-touch test.

Instrumentation modifies intercepted browser responses only. It does not write native bundles or change the site. It records project plane geometry immediately before drawing, both the logical and displayed camera, and actual sticker mesh/text inputs immediately before `V.draw`. It forces native draws during each capture so stable values are not merely stale idle snapshots. These forced frames are not a performance benchmark.

All recorded position, dimensions, angle, opacity, dimming, camera, sticker pose, sticker shape and text-transform ranges were exactly zero within each capture. Help opened and closed successfully in all four runs, its native roll changed 0→1→0, and the camera stayed unchanged. No page errors occurred.

`report.json` contains aggregate ranges and pass/fail results. The 24 `*.json.gz` files retain full samples. Eight PNGs show the tested overview and focused BTB states. `review.cjs` waits for the new Home entry to boot and navigates through its public API before testing the underlying scene.
