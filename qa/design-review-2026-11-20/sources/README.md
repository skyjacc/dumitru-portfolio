# Design references selected for the portfolio review

Research date: 20 November 2026 (Europe/Moscow). This is source triage, not a claim that installing a skill improves the site. Remote code was not executed, dependencies were not installed, and runtime files were not modified. The attachment's unrelated third-party video URLs were not opened.

The current project is an exported spatial renderer with authored plain JavaScript/CSS and bounded adapters, not an npm-buildable React source tree. Its approved direction is a black paper desk, illustrated navigation, spatial case materials and a phone profile. Review recommendations must preserve that direction.

## Useful criteria for this pass

| Priority | Before / audit question | After / pass criterion | Primary reference |
| --- | --- | --- | --- |
| 1 | Do Work, photo and language controls remain understandable/reachable without hover or a mouse? | Real semantic controls, visible focus, no focus hidden beneath fixed chrome, touch targets that do not overlap. Test phone profile and project materials at narrow widths and enlarged text. | [Vercel rules](https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md), [Jakub's details](https://github.com/jakubkrehel/make-interfaces-feel-better/blob/main/skills/make-interfaces-feel-better/SKILL.md) |
| 2 | Does repeated Home → About → Work or Back wait for an irrelevant old movement? | The latest input gets feedback immediately; motion preserves its current position and reaches the latest intended state. Test reversal during approach, scatter and material changes, not just settled screenshots. | [Emil motion review](https://github.com/emilkowalski/skills/blob/main/skills/review-animations/SKILL.md), [Jakub animations](https://github.com/jakubkrehel/make-interfaces-feel-better/blob/main/skills/make-interfaces-feel-better/animations.md) |
| 3 | Does decoration compete with reading or make every repeated interaction wait? | Keep the distinctive scene transition, but make routine press/focus feedback immediate and brief. Reduce decorative movement for reduced-motion and coarse pointers. Slowing a recording helps locate jumps; normal-speed viewing still decides perceived quality. | [Emil standards](https://github.com/emilkowalski/skills/blob/main/skills/review-animations/STANDARDS.md) |
| 4 | Do titles, native canvas labels and phone text form a consistent hierarchy at actual display size? | Clear project identity, useful concise description, one clear destination action, stable text while media changes. Inspect optical alignment and wrapping without adding a new font or changing the approved paper icons. | [Jakub's details](https://github.com/jakubkrehel/make-interfaces-feel-better/blob/main/skills/make-interfaces-feel-better/SKILL.md), [Anthropic frontend design](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) |
| 5 | Is a visitor shown the work and a real way to contact Dumitru, rather than only a decorative demo? | Distinguish concepts honestly; retain working external project links and email/Instagram. Keep labels concrete and preserve the user's approved aesthetic. | [Anthropic frontend design](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md), [Hallmark overview](https://github.com/Nutlope/hallmark/blob/main/README.md) |

Short exact anchors from the sources: Vercel says “Animations interruptible—respond to user input mid-animation.” Jakub says “Never introduce a second styling system just to apply a polish fix.” Emil's duration table explicitly says “Marketing / explanatory | Can be longer.” Anthropic states “the brief's own words always win.” These are criteria, not new findings by themselves.

The long spatial flights are an intentional part of this portfolio. A generic sub-300ms UI recommendation is not sufficient evidence to delete them or force every scene into a short dropdown timing. Likewise, hand-drawn icons intentionally vary from a standard icon library; visual inconsistency must be demonstrated in context. Runtime animation code can be JavaScript when it must follow the camera or respond to interruption; changing technology alone does not prove an improvement.

## First ten entries from the attachment

All listed endpoints below were opened successfully during this pass. Classification reflects the inspected primary content, not a quality ranking.

| Entry | What the primary source actually supplies | Fit here |
| --- | --- | --- |
| [UIZZE](https://uizze.com/) | Searchable interface references and agent connection paths. The home page does not establish a locally installed “Anti UI Slop” skill. | Optional reference discovery, not a required dependency. |
| [Impeccable](https://impeccable.style/) | A design vocabulary and workflows for creation, review and refinement. | Context-aware critique can help. A blanket visual rewrite is outside this task. |
| [Taste Skill](https://github.com/Leonxlnx/taste-skill/blob/main/skills/taste-skill/SKILL.md) | An opinionated website-building workflow with house rules and browser gates. | Do not adopt wholesale: current rules disallow image captions/carousels/drawn icons in relevant paths and substitute `.example` contacts. Those conflict with this approved live portfolio. |
| [Emil Design Engineering](https://github.com/emilkowalski/skills) | Specific design-engineering and animation review guidance; standards include timing, purpose, interruption and gesture handling. | Strong fit for transitions and repeated controls. |
| [Vercel Web Design Guidelines](https://github.com/vercel-labs/agent-skills/blob/main/skills/web-design-guidelines/SKILL.md) | A review wrapper that fetches current [Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md). | Strong fit for functional/accessibility review. The attachment's repository is valid; the separate `web-interface-guidelines` repository is the rules source. |
| [Anthropic Frontend Design](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) | Direction, type, content hierarchy and deliberate design decisions; explicitly respects the client's chosen brief. | Useful for visual critique and copy restraint. |
| [Hallmark](https://github.com/Nutlope/hallmark/blob/main/README.md) | A themed design workflow with separate report-only audit and redesign modes. | Useful distinction between defects, defaults and optional polish. No new theme needed. |
| [Make Interfaces Feel Better](https://github.com/jakubkrehel/make-interfaces-feel-better/blob/main/skills/make-interfaces-feel-better/SKILL.md) | Detailed typography, surfaces, interactions, icon and performance review. | Strong fit for optical alignment, hit areas, wrapping and interruption. |
| [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/README.md) | Searchable design intelligence and design-system generation across stacks. | More useful for a new design system than this focused audit. |
| [Stageshow](https://github.com/benjitaylor/skills/blob/main/README.md) | React-built faux product UI illustrations, feature cards, cursor demos and recording tools. | Could help later case-study visuals; not a drop-in replacement for the current canvas/native runtime. |

## Libraries and scope

The remaining attachment is largely a directory of inspiration sites, component libraries, authoring tools and design assets. Those endpoints were not individually evaluated in this source pass. React-oriented component kits would require an integration decision in this exported application, not a paste-and-go visual improvement. No framework migration, new effects package, MCP installation, generation service or purchase is justified by this audit alone.

Conclusions about the actual portfolio belong to the other review reports and require reproduced behavior or inspected screenshots. These source notes do not claim that every guideline was tested, that a skill's preferences are accessibility law, or that the browser-emulated review replaces a physical iPhone check.
