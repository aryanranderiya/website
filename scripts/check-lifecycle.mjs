#!/usr/bin/env node
/**
 * check-lifecycle — guards against the #1 ClientRouter footgun.
 *
 * With `<ClientRouter />` enabled, navigating an internal link swaps the DOM
 * instead of doing a full browser load. A bundled `<script>` module therefore
 * runs ONCE per hard load, never again on a swap — so interactivity wired at
 * module top level (or on `DOMContentLoaded` / `window.onload`) silently dies
 * after the first navigation. The "works until I reload" bug.
 *
 * This scans every `.astro` `<script>` block and fails the build when it finds:
 *
 *   1. `DOMContentLoaded` / `window.onload` / `addEventListener('load', …)` —
 *      these NEVER fire on a view-transition swap. Always wrong. (inline + bundled)
 *
 *   2. A bundled (non-`is:inline`) script that wires interactivity at top level
 *      (addEventListener / setInterval / IntersectionObserver / MutationObserver /
 *      ResizeObserver) WITHOUT routing through `onPage()` or any `astro:*`
 *      lifecycle event. Such code runs once and is dead after navigation.
 *
 * The fix is always the same: wrap init in `onPage()` from `@/lib/lifecycle`.
 *
 * Escape hatch: add a `lifecycle-ok` comment inside a script block to skip it
 * (e.g. a script on a `transition:persist` element, whose DOM legitimately
 * survives swaps so run-once is correct). Explain WHY in the same comment.
 *
 * Usage: node scripts/check-lifecycle.mjs   (exit 1 on any violation)
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const SRC = join(ROOT, 'src');

/** Recursively collect every .astro file under src/. */
function astroFiles(dir) {
	const out = [];
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) out.push(...astroFiles(full));
		else if (entry.endsWith('.astro')) out.push(full);
	}
	return out;
}

/** Extract each <script>…</script> block with its opening-tag attributes. */
function scriptBlocks(source) {
	const blocks = [];
	const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/g;
	let m;
	while ((m = re.exec(source)) !== null) {
		const attrs = m[1];
		const body = m[2];
		const line = source.slice(0, m.index).split('\n').length;
		blocks.push({ attrs, body, line });
	}
	return blocks;
}

// `DOMContentLoaded` and the window `load` event never re-fire on a ClientRouter
// swap — wrong in both inline and bundled scripts. (Note: `img.addEventListener
// ('load')` etc. are resource-load events and are perfectly fine — only the
// window/document page-load events are the trap.)
const FORBIDDEN_LOAD = [
	/\bDOMContentLoaded\b/,
	/\bwindow\.onload\b/,
	/window\s*\.\s*addEventListener\(\s*['"`]load['"`]/,
];

// APIs that wire long-lived interactivity. In a bundled script these must run
// inside a lifecycle hook, not at top level.
const INTERACTIVITY = [
	/\baddEventListener\s*\(/,
	/\bsetInterval\s*\(/,
	/\bnew\s+IntersectionObserver\b/,
	/\bnew\s+MutationObserver\b/,
	/\bnew\s+ResizeObserver\b/,
];

// A bundled script is "lifecycle-aware" if it routes through onPage() or binds
// any astro:* router event (page-load, after-swap, before-swap, before-preparation…).
const LIFECYCLE_AWARE = [/\bonPage\s*\(/, /['"`]astro:[a-z-]+['"`]/];

const violations = [];

for (const file of astroFiles(SRC)) {
	const rel = relative(ROOT, file);
	const source = readFileSync(file, 'utf8');

	for (const { attrs, body, line } of scriptBlocks(source)) {
		// Skip non-JS scripts (JSON-LD) and external src-only scripts (no body).
		if (/type\s*=\s*['"]application\/(ld\+)?json['"]/.test(attrs)) continue;
		if (/\bsrc\s*=/.test(attrs) && body.trim() === '') continue;
		// Explicit opt-out for legitimate run-once scripts (e.g. persisted DOM).
		if (/lifecycle-ok/.test(body)) continue;

		const isInline = /\bis:inline\b/.test(attrs) || /\bdefine:vars\b/.test(attrs);

		// Rule 1 — applies to every script.
		for (const pat of FORBIDDEN_LOAD) {
			if (pat.test(body)) {
				violations.push({
					file: rel,
					line,
					msg: `uses ${pat.source} — never fires on a ClientRouter swap. Wrap init in onPage() from '@/lib/lifecycle' (or astro:after-swap).`,
				});
			}
		}

		// Rule 2 — bundled scripts only.
		if (isInline) continue;
		const wiresInteractivity = INTERACTIVITY.some((p) => p.test(body));
		const lifecycleAware = LIFECYCLE_AWARE.some((p) => p.test(body));
		if (wiresInteractivity && !lifecycleAware) {
			violations.push({
				file: rel,
				line,
				msg: `wires interactivity at top level without onPage()/astro:* lifecycle — runs once and breaks after navigation. Wrap it in onPage() from '@/lib/lifecycle'.`,
			});
		}
	}
}

if (violations.length === 0) {
	console.log('✓ check-lifecycle: all .astro scripts are ClientRouter-safe');
	process.exit(0);
}

console.error(`\n✗ check-lifecycle found ${violations.length} issue(s):\n`);
for (const v of violations) {
	console.error(`  ${v.file}:${v.line}`);
	console.error(`    ${v.msg}\n`);
}
console.error(
	"Fix: route the script through onPage() from '@/lib/lifecycle'. See website/CLAUDE.md.\n",
);
process.exit(1);
