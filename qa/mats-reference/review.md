# Mats reference — read-only observations

Source: https://mats.zip/ ; inspected in an independent Chrome / Playwright session on 2026-11-16.

1. The first screen has one dominant, recognisable object and substantial black negative space. Two very dark bands of repeated category text sit behind it. Quiet four-column navigation and small availability/location lines anchor the perimeter.
2. Objects are semantic: autograph for the person, a hand cursor for web design, an Eames chair for products, and a classical bust for writing. This makes the object a signpost rather than unrelated decoration.
3. Hovering the category navigation changes the solid object into a rotating point cloud. Selecting another category morphs the cloud's shape. Moving off the navigation reveals the solid material again through a mask/pixelated transition. The navigation itself stays in place.
4. Real 3D is confirmed, not inferred from screenshots: GLB scenes, compressed Int16 coordinate buffers and an HDR cubemap load over the network. The inspected bundle uses a Pixi-based WebGL renderer with an orthographic camera, a directional light and a point light. Solid models rotate around their vertical axis; point clouds interpolate between corresponding coordinates. This is not a pre-rendered video.
5. Chrome works here because the object has curved, rounded surfaces and consistent environment reflections. The black background stays quiet; highlights explain the volume. There are no floating glass cards or arbitrary coloured glows. Do not transfer the chrome material automatically to paper or project UI.
6. Text, navigation and the long About/project content are normal DOM. The 3D treatment is concentrated in the hero; scrolling reaches conventional readable layouts. The renderer stops its ticker after the hero leaves the viewport. It is not an infinite navigable 3D workbench.

## Transfer to Dumitru's chosen workbench

Use a dominant laptop, a small set of UI sketches/notes, and recognisable previews of the five own projects. Give the objects different roles, depths and sizes, with one coherent lighting direction. Keep labels/contact/language controls fixed and plain. Preserve the existing camera/open/return mechanics; the reference informs the scene's visual hierarchy, not a replacement navigation system. The selected EN → RO → RU order is a separate product requirement.

Do not repeat the rejected chrome sigil or substitute decorative objects for the user's real materials. A flat rendered illustration or 2.5D cutout composition can imitate a camera view, but should not be represented as Mats-style freely rotating 3D.

## Evidence

- settled-1440.png: solid autograph home.
- web-design.png / products.png / writings.png: point-cloud category states.
- web-design-solid.png / products-solid.png / writings-solid.png: solid category models after leaving nav.
- about-scroll.png: conventional readable DOM content.
- initial.json: network assets, DOM and canvas inventory.
- source-bundle.js: inspected public source for technical confirmation, QA only; not copied into the product.

No product code or assets were changed.
