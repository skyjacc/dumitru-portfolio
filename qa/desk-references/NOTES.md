# Reference inspection — 16 November 2026

Read-only browser inspection for the proposed workbench direction. No reference art was copied into the portfolio. This research is **not** a completed review of every page or interaction.

## Aengel

- After the loading gate, the observed scene presents large curved project-image planes in black space. The planes occupy most of the viewport; small fixed corner identity/contact controls stay outside the moving content.
- Mouse movement changes the view subtly. Wheel input advances the project imagery horizontally through the scene, with perspective and depth rather than a normal vertical stack.
- The network confirms actual GLB objects, Draco decoding, KTX2 normal/color textures and environment maps. Examples: `models/scene3/flower.glb`, `models/scene4/hand.glb`, `textures/flowerAoMap.v2.bc7.ktx2`, `envMap/photoStudio.ktx2`. A full-viewport canvas renders the scene; ordinary image assets also supply project material.
- Limitation: the `/about` entry resolved to the project scene after Enter in this browser session. The exact About composition was not verified, so the screenshots must not be described as About screenshots.

Evidence: `aengel-entered.png`, `aengel-hover.png`, `aengel-entered-scroll.png`, network metadata in `aengel-ready.json`.

## About Luca

- A single-viewport canvas sits behind very restrained interface content: the name, a contact action, numbered navigation and social links. The measured document height was the viewport height.
- The loader progresses to an Enter gate. This run did not reliably pass the gate, so there is no verified visual claim here about the finished 3D scene or its hover behavior.
- The network loads a 4.49 MB `static/model/scene.glb`, a Draco decoder, particle/cloud textures, and font atlas images/JSON. This is a real model-and-shader scene rather than a sequence of DOM images.
- The source bundle includes Three.js rendering and GSAP. Three separate voice/audio tracks and a hover sound were requested; their exact trigger behavior was not verified.

Evidence: `luca-ready.png`, `luca-ready.json`, `luca-inspection.json`. `luca-top.png` is a loading state and is not a finished design screenshot.

## Implications for Dumitru's next direction

Keep the existing black spatial portfolio and stable project navigation. A laptop, UI sketches, notes and real project fragments can form one coherent personal workspace; typography should remain a separate localized layer. Use the references for scale, spatial hierarchy and fixed controls. Do not imply a generated flat workspace image has the same freely navigable geometry as these true 3D scenes. The current release keeps the simple Home while this direction is documented for later.
