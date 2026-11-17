# Project catalogue

`projects.json` is the checked-in source for the five case studies. It replaces the former dependency on a sibling `portfolio-lab/projects.js`. Clone into any directory name; the adapters validate repository landmarks rather than its basename.

To edit an existing case, change its record here. Asset paths are relative to `site/`, must stay inside it, and must exist. A case needs a unique lowercase `id`, title, description, URL, cover and ordered materials. `home`, `despre` and `process` are reserved. Add new assets under `site/assets/projects/<id>/`; update translated copy in `scripts/make-i18n-data.py` as needed. The Work ring grows without moving existing pins.

Run from the repository root with Node.js and Python 3 available. Media dimension/previews require Pillow and opencv-python (`python -m pip install Pillow opencv-python`). Serving the existing site requires only Python; no npm install/build is needed.

```sh
node scripts/adapt-data.cjs --about-only
node scripts/adapt-work-composition.cjs --check
node scripts/adapt-landscape-fit.cjs --check
python scripts/serve.py
```

`--about-only` is the historical name for the non-destructive catalogue refresh: it updates data/dimensions and preserves existing captures. For new/changed mobile capture assets, run `node scripts/adapt-data.cjs` without that flag. It regenerates capture wrappers/JPEG previews. Review the resulting diff and all new material dimensions.

The data adapter patches only bounded catalogue/dimension modules, then reapplies translations, Work composition and landscape fitting. It does not restore a clean native bundle or rewrite navigation/media behavior. If replacing a native renderer bundle, follow the full adapter order in `scripts/ENTRY.md` instead.

Verify case opening, every material, return camera, locale and View site on desktop and mobile before publication. `site/portfolio-data.json` and the patched native module are generated outputs and must be committed with the source record. Only `site/` is deployed.
