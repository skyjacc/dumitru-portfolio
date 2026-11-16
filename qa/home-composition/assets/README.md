# Paper prop assets — 16 November 2026

Two original project-bound cutouts created with the built-in Imagegen tool, not CLI/API or Higgsfield. Exact prompts and generated source paths are in `prompts.json`. No credit-based external generation was invoked.

## Deliverables

- `site/hero/desk/v3/notebook.webp`: closed kraft notebook, restrained blue brush mark, red/charcoal artist brush.
- `site/hero/desk/v3/scissors.webp`: silver scissors and two overlapping brown 35mm negative strips.
- Five lossless responsive variants per item in `site/hero/desk/v3/responsive/`: 256, 384, 512, 768 and 1024px.
- Original generated RGBA PNGs are copied to `qa/home-composition/assets/masters/`; default Imagegen originals remain untouched.
- `manifest.json` records dimensions, alpha bounds, paths and byte sizes. The same manifest is beside the runtime exports.

Both generated outputs are **1254×1254**, despite a prompt preference for approximately 2048px. No artificial upscale was performed. Native sources remain the highest-resolution choice.

## References and intent

The user's notebook and scissors/film screenshots were used as subject and style references. The existing approved `site/hero/desk/v2/laptop.webp` was a material reference for matte photographic paper, narrow fiber fringe and restrained wear. No reference screenshot is shipped as a product asset. Existing v2 assets and website code were not modified.

The prompt distinguishes printed photographic cutouts from paper sculptures, vector illustration or glossy renderings. Both assets have real transparency, including the scissors handles and film perforations. `export.py` performs only lossless encoding and density resizing; it does not invent silhouettes, erode/dilate alpha or modify creative content.

## Inspection

Both results were visually inspected and rendered in Chromium over `#080808` next to the approved laptop at realistic display size. Evidence: `black-preview.png`. The material and fringe are consistent, without a visible rectangular background or thick sticker border. No generation correction was required.

The tool's raw transparent preview displays red/yellow speckles that exist only at alpha below16. No such pixels have alpha16 or higher; they are not visible in the actual black-page preview. Original alpha was preserved rather than thresholded. Layout bounds use alpha16 only as metadata, matching the current character/crop convention:

| Asset | Canvas | Visible bounding box (left, top, right, bottom) | Layout crop (left, top, width, height) |
| --- | --- | --- | --- |
| notebook | 1254×1254 | 107,15,1118,1241 | 107,15,1011,1226 |
| scissors | 1254×1254 | 85,18,1170,1253 | 85,18,1085,1235 |

The CSS consumer should choose a source for actual displayed size and DPR and keep these assets free of permanent raster filters; the parent implementation owns positioning, sizing, interactions and responsiveness.
