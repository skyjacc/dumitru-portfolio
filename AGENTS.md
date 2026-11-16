# Portfolio development guidance

## Modern Web Guidance

For HTML, CSS, client-side JavaScript, animation, accessibility and browser-performance work, read and apply the installed skill:

`C:/Users/oblako/.codex/skills/modern-web-guidance/SKILL.md`

Search for the relevant capability before implementation, retrieve matching guides, and verify the change against the applicable guidance and browser fallbacks. Use the skill for the current task; installing it does not authorize an unrelated redesign or codebase-wide modernization.

On Windows the CLI is available through `npx.cmd -y modern-web-guidance@latest`. Follow the installed skill's current search/retrieve workflow. If the skill is missing on another machine, install `skills/modern-web-guidance` from the official repository instead of assuming it is present.

Source: https://github.com/GoogleChrome/modern-web-guidance
Installed on 2026-11-16 from commit `4dd968349e54ca45a05dd5c818fb035c9054b022`.

## Project context

Read `README.md` and `scripts/ENTRY.md` for the current architecture and adapter workflow. Make bounded changes to the existing implementation and preserve the user's approved behavior unless the task asks to change it.

Only `site/` is published. Keep development guidance and authoring tools outside that directory.
