# About and Contact inside the paper phone

The Instagram-inspired screen belongs to the existing paper-phone object, not to a new page overlay. It uses Dumitru's local avatar and six existing photographs, confirmed work description and location. His personal note describes the photographs he likes: night streets, a lone light, sea sunsets and friends in the frame. It has no invented follower/like counts, verification badge, personal favorites or AI-production copy.

## Navigation

- About opens the profile. Contact opens the contact screen through the same phone approach.
- Switching About ↔ Contact while the phone is enlarged changes only its HTML content. The desk and phone keep their position.
- Profile photographs open in the phone. Arrows and horizontal swipes change the selected photograph manually. Inner Back restores the profile's scroll position.
- The bottom paper-plane opens Contact. Email and Instagram are actual destinations; email-copy reports success only after copying. There is no message-submission backend.
- Inner Back/Escape from a photo or Contact returns to the profile. The profile's Back, the global Back and a completed blank-space tap outside the phone close to Home.
- Header sections retain their toggle behavior. The active About/Contact control is reflected in the page title and `aria-current`.
- Work/Process remain separate scenes. The articulated character remains confined to Work and open projects.

## Reference study

[Kernjosh](https://webdesign.kernjosh.com/) was inspected in the live browser and in the supplied local mirror. Its About view is an iOS Notes-style page inside the same physical phone as Contact. The local bundle is `assets/main-CwptEoZ4.js`, function `ou`; appearance is in `assets/styles-BSGglFK2.css`.

The reference phone approaches in 850 ms; screen content starts appearing after 467.5 ms. Closing first dims the screen for 180 ms and then returns the prop over 700 ms. Switching About/Contact does not move the phone: a 160 ms fade-out precedes a 240 ms reveal of the other screen. The browser confirmed identical 405×750 phone bounds before/after this switch at 1440×900.

The supplied mirror contains inline About media, not an internal photo lightbox. The requested selectable photo gallery and Instagram-style profile are original additions to this portfolio. Reference biography, portraits, pets and form implementation were not copied into the project.

## Integration boundary

`entry-flow.js` owns the physical phone approach/retreat and the `about` scene. `studio-about.js` owns `profile`, `photo` and `contact`, publishing `portfolio:phoneview` with `{view}`. `portfolio-ui.js` uses the current phone view for the shared header. EN/RO/RU labels remain local dictionary data.

Retain the counter-scaled HTML screen from the earlier sharpness fix: text must be laid out at its final displayed dimensions, not magnified from a tiny screen texture. Short landscape screens retain their upright inner layout inside the rotated phone. UI transitions must be cancelable and respect reduced motion.

Save the profile scroll offset before hiding its footer for a photo. The taller photo area can otherwise cause Chromium to clamp the outgoing profile's scroll offset. Restore the footer geometry and saved offset before focusing the returning profile. A fresh phone opening still starts at the top; the Profile/Photos footer buttons deliberately choose their own scroll target.

The Modern Web Guidance `directional-navigation-transitions` and `navbar` guides were consulted. Inner motion is scoped to the phone rather than replacing the document's spatial scene. Active navigation follows the guide's instruction: “Use `aria-current="page"` to identify the current page.”

## Verification

The repeatable browser review is in [`qa/phone-integration`](../qa/phone-integration/README.md). It covers Chromium desktop, Chromium touch portrait/landscape and narrow WebKit; actual input opens all six photos, changes screens, navigates Back and checks the saved scroll position. It samples the physical phone during inner transitions, exercises interrupted navigation, verifies contact actions, clipboard denial, EN/RO/RU and reduced motion. Browser screenshots were also inspected at desktop, portrait and short-landscape sizes. This is browser emulation, not a physical-iPhone certification.

Only local preview was updated for this task. Git publication and any later Vercel deployment are distinct steps; do not use older deployment evidence to claim these phone changes are live.
