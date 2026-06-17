# Portfolio — Design & Code Guidelines

## Icons

- Always use icons from `@theexperiencecompany/gaia-icons` (solid-rounded) via the `@icons` alias.
- Import with: `import { HugeiconsIcon, SomeIcon } from '@icons'`
- Render with: `<HugeiconsIcon icon={SomeIcon} size={16} color="var(--text-ghost)" />`
- **Never use emojis or Unicode symbols** (e.g. `⌨`, `✦`, `ⓘ`, `⚙`) as icons anywhere in the UI.
- **Never use text/symbol substitutes** for icons — always use a proper gaia-icons component.
- Astro pages can import and render gaia-icons components directly in the template (server-side rendered) — no `client:load` needed for static icons.

## Client-Side Scripts (ClientRouter / view transitions)

The site runs `<ClientRouter />`, so internal navigation **swaps the DOM instead
of doing a full page load**. A bundled `<script>` module runs exactly ONCE per
hard load and **never re-runs on navigation** — so any interactivity wired at
module top level (or on `DOMContentLoaded` / `window.onload`) silently dies after
the first in-app navigation and only "comes back" on a hard reload.

**Hard rule:** any `.astro` `<script>` that wires interactivity (event listeners,
`setInterval`, `IntersectionObserver`/`MutationObserver`/`ResizeObserver`,
animations, DOM queries that attach behavior) **MUST** route through `onPage()`
from `@/lib/lifecycle`. Do all DOM access inside the callback; return a cleanup
function so listeners/timers/observers tear down before the next swap.

```ts
import { onPage } from '@/lib/lifecycle';

onPage(() => {
  const btn = document.getElementById('copy');
  const onClick = () => navigator.clipboard.writeText(location.href);
  btn?.addEventListener('click', onClick);
  return () => btn?.removeEventListener('click', onClick); // runs before next swap
});
```

- **Never** use `DOMContentLoaded`, `window.onload`, or top-level DOM wiring in
  `.astro` scripts — they don't fire on a swap.
- **Don't** hand-roll the `astro:page-load` boilerplate per file — use `onPage`.
- `is:inline` head scripts that must run pre-paint (theme, analytics) are the
  exception: they use `astro:after-swap` directly (they can't import `onPage`).
- A script on a `transition:persist` element legitimately runs once (its DOM
  survives swaps) — mark it with a `lifecycle-ok` comment to satisfy the guard.
- React islands (`client:*`) re-hydrate on swap automatically; use `useEffect`,
  not `onPage`. (Note `transition:persist`+`transition:persist-props` islands do
  NOT re-run effects on nav — sync via an `astro:page-load` listener inside the
  effect.)

Enforced by `pnpm lint:lifecycle` (`scripts/check-lifecycle.mjs`), which runs in
the pre-commit and pre-push hooks.

## Design System

- **Flat design — no borders or outlines anywhere.** Do not use `border`, `border-[var(--border)]`, `ring`, `outline`, or `divide` on UI cards, containers, notices, or panels.
- Use `bg-[var(--muted-bg)]` for surface differentiation instead of borders.
- No box shadows for decoration — only use shadows when functionally needed (e.g. floating elements, dropdowns).
- No emojis anywhere in the UI.

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
