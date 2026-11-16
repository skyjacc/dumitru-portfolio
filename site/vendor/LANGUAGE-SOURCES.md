# Language transition dependencies

## Motion mini 14.14.0

- Package: https://www.npmjs.com/package/motion/v/14.14.0
- API documentation: https://motion.dev/docs/animate
- Rollover concept: https://motion.dev/docs/text-animation#rolling-text-hover
- Bundle source: https://esm.sh/motion@14.14.0/es2022/mini.bundle.mjs
- Local file: `motion-mini-14.14.0.mjs` (self-contained ES module, no remote runtime imports)
- License: MIT, `MOTION-LICENSE.md`, extracted unchanged from the published package.
- Published tarball SHA1: `956e0f88ec0a1e62eb6e21b5564dfa837c168196`.

## Invokers polyfill 1.0.4

- Package: https://www.npmjs.com/package/invokers-polyfill/v/1.0.4
- Bundle source: https://esm.sh/invokers-polyfill@1.0.4/es2022/invokers-polyfill.bundle.mjs
- Local file: `invokers-polyfill-1.0.4.mjs` (self-contained ES module)
- License: MIT, `INVOKERS-LICENSE.txt`, extracted from the published package.
- Imported only if `commandForElement` is absent from `HTMLButtonElement.prototype`.

Both dependencies are served from this site; the visitor makes no request to esm.sh or npm. No Motion+ code or paid examples are included.
