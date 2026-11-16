# Dumitru — working composition

Implemented on 16 November 2026 from the user's selected direction: laptop, interface sketches, notes and own projects in the existing black space.

## Composition

- Short centred introduction in EN / RO / RU; English by default.
- Open sketchbook above-left, two printed proofs of ANDRA and BTB above-right, process note below-left, dominant laptop below-right.
- Existing five interactive projects remain separate nearby world objects. The two printed proofs inside Home are decorative excerpts, not extra projects.
- Portrait layout adjusts object positions and type size. All artwork stays in the native Home coordinate system.
- Native intro stagger and independent subtle pointer offsets give the objects depth. Reduced-motion disables pointer offsets. The old six-second logo/copy pulse is deliberately omitted from the new Home so object sizes do not change while idle or freeze partway through a pulse. Camera, project/material controls, About and saved-position return are untouched.

## Original generated artwork

Higgsfield model `gpt_image_2_6`, two images, transparent PNG, 2048×2048, high quality. Preflight price: 2.75 credits per image, 5.5 total. No reference-site artwork was downloaded into the portfolio.

- Laptop job: `ff29076a-9810-4eed-a0b4-f14ba65534ae`.
- Sketchbook job: `23734c52-89ed-46f2-996c-46c01e683791`.
- Original PNG masters: `site/hero/workbench/laptop.png` and `sketchbook.png`, excluded from deployment.
- Runtime WebP copies: same 2048×2048 dimensions and alpha, quality90 encoding; 774594 and 973398 bytes respectively. Combined transfer approximately 1.67 MiB instead of 12.3 MiB of source PNGs.
- Notebook: graphite wireframes, blue pencil marks, linen binding and paper grain. Laptop: graphite case, abstract code and interface preview; no invented identity or personal interests.

Typography and the process note are authored SVGs, outlined from local fonts. The two proof sheets embed screenshots of Dumitru's actual ANDRA/BTB concepts. Short Home copy and the note have all three language variants; embedded project visuals retain their original designs.

## Reapply

Run `node scripts/adapt-workbench-home.cjs` after the existing base/Home/i18n adapters. It owns only the bounded Home renderer, Home image preload and `site/hero/workbench/*.svg`. Running `adapt-personal-home.cjs` later restores the older simple Home; apply workbench last to keep this direction.

Do not replace the native world, hit testing, history, camera or material controls while revising this visual. The current task is a new Home composition, not a new interaction engine.

Evidence: `qa/workbench-tuned-*.png` and `qa/workbench-review/`.
