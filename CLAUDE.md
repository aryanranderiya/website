# Portfolio — Design & Code Guidelines

## Icons

- Always use icons from `@theexperiencecompany/gaia-icons` (solid-rounded) via the `@icons` alias.
- Import with: `import { HugeiconsIcon, SomeIcon } from '@icons'`
- Render with: `<HugeiconsIcon icon={SomeIcon} size={16} color="var(--text-ghost)" />`
- **Never use emojis or Unicode symbols** (e.g. `⌨`, `✦`, `ⓘ`, `⚙`) as icons anywhere in the UI.
- **Never use text/symbol substitutes** for icons — always use a proper gaia-icons component.
- Astro pages can import and render gaia-icons components directly in the template (server-side rendered) — no `client:load` needed for static icons.

## Design System

- **Flat design — no borders or outlines anywhere.** Do not use `border`, `border-[var(--border)]`, `ring`, `outline`, or `divide` on UI cards, containers, notices, or panels.
- Use `bg-[var(--muted-bg)]` for surface differentiation instead of borders.
- No box shadows for decoration — only use shadows when functionally needed (e.g. floating elements, dropdowns).
- No emojis anywhere in the UI.
