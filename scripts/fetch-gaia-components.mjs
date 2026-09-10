/**
 * Fetches GAIA UI component docs + registry metadata and normalizes them into
 * src/data/gaia-components.json, which the experiments pages render natively
 * (no iframes, no vendored code).
 *
 * To add a component: append its docs slug to COMPONENT_SLUGS below and run:
 *   bun scripts/fetch-gaia-components.mjs
 * Commit the JSON. Builds read the committed file and never hit the network,
 * so a docs outage can't break the portfolio build (failures warn + keep old).
 *
 * Sources per slug:
 * - https://raw.githubusercontent.com/heygaia/ui/main/content/docs/components/<slug>.mdx
 *   frontmatter (title/description) + `### Variant` sections under any `##`
 *   heading (name/anchor/description) + first ```tsx example + props table
 * - https://ui.heygaia.io/r/<slug>.json (shadcn registry item: title/description fallback)
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_FILE = join(__dirname, '..', 'src', 'data', 'gaia-components.json');

const COMPONENT_SLUGS = ['chat-demo', 'footer-glow'];
const DOCS_BASE = 'https://ui.heygaia.io/docs/components';
const MDX_BASE =
	'https://raw.githubusercontent.com/heygaia/ui/main/content/docs/components';
const REGISTRY_BASE = 'https://ui.heygaia.io/r';

const slugify = (s) =>
	s
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');

function parseFrontmatter(mdx) {
	const m = mdx.match(/^---\n([\s\S]*?)\n---/);
	const fm = {};
	if (m) {
		for (const line of m[1].split('\n')) {
			const i = line.indexOf(':');
			if (i > 0)
				fm[line.slice(0, i).trim()] = line
					.slice(i + 1)
					.trim()
					.replace(/^"(.*)"$/, '$1');
		}
	}
	return { fm, body: m ? mdx.slice(m[0].length) : mdx };
}

/** Split body into h2 sections: [{ heading, content }] (h1/h3+ stay inline). */
function splitH2(body) {
	const parts = body.split(/^## /m);
	return parts.slice(1).map((p) => {
		const nl = p.indexOf('\n');
		return { heading: p.slice(0, nl).trim(), content: p.slice(nl + 1) };
	});
}

const SKIP_VARIANT_SECTIONS = new Set(['installation', 'example', 'props', 'notes']);
const SKIP_HEADINGS = new Set(['installation', 'example', 'props', 'notes', 'usage']);

/** First ```tsx fence in a section (the runnable example). */
function firstTsx(content) {
	const m = content.match(/```tsx\n([\s\S]*?)```/);
	return m ? m[1].trim() : null;
}

/** Parse a markdown props table into [{ prop, type, default, description }]. */
function parsePropsTable(content) {
	const lines = content.split('\n').filter((l) => /^\|/.test(l.trim()));
	if (lines.length < 3) return [];
	const rows = lines.slice(2);
	return rows
		.map((r) => {
			// Split on unescaped pipes — type cells contain `\|` unions.
			const c = r
				.split(/(?<!\\)\|/)
				.map((s) => s.trim().replace(/^`|`$/g, '').replace(/\\\|/g, '|'));
			if (c.length < 6) return null;
			return { prop: c[1], type: c[2], default: c[3], description: c[4] };
		})
		.filter(Boolean);
}

function stripMdx(content) {
	return content
		.replace(/```[\s\S]*?```/g, '')
		.replace(/<[^>]+>/g, '')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/[*_`]/g, '')
		.split('\n')
		.map((l) => l.trim())
		.filter(Boolean)
		.join(' ');
}

async function fetchText(url) {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`${res.status} ${url}`);
	return res.text();
}

async function buildComponent(slug) {
	const [mdx, reg] = await Promise.all([
		fetchText(`${MDX_BASE}/${slug}.mdx`),
		fetch(`${REGISTRY_BASE}/${slug}.json`).then((r) => (r.ok ? r.json() : null)),
	]);
	const { fm, body } = parseFrontmatter(mdx);
	const sections = splitH2(body);

	const variants = [];
	let example = null;
	let props = [];
	for (const s of sections) {
		const key = s.heading.toLowerCase();
		if (key === 'example' && !example) example = firstTsx(s.content);
		if (key === 'props' && props.length === 0) props = parsePropsTable(s.content);
		if (SKIP_VARIANT_SECTIONS.has(key)) continue;
		// h3 subsections are the variants (e.g. iMessage/WhatsApp under Usage)
		const h3s = s.content.split(/^### /m).slice(1);
		for (const h of h3s) {
			const nl = h.indexOf('\n');
			const name = h.slice(0, nl).trim();
			if (!name || SKIP_HEADINGS.has(name.toLowerCase())) continue;
			const desc = stripMdx(h.slice(nl + 1)).slice(0, 220);
			variants.push({ name, anchor: slugify(name), description: desc || null });
		}
	}

	return {
		slug,
		title: fm.title || reg?.title || slug,
		description: fm.description || reg?.description || '',
		docsUrl: `${DOCS_BASE}/${slug}`,
		variants,
		example,
		props,
	};
}

async function main() {
	let prev = {};
	try {
		prev = JSON.parse(await readFile(OUT_FILE, 'utf8'));
	} catch {
		// first run
	}
	const out = { ...(prev && typeof prev === 'object' ? prev : {}), components: [] };
	for (const slug of COMPONENT_SLUGS) {
		try {
			out.components.push(await buildComponent(slug));
			console.log(`ok ${slug}`);
		} catch (err) {
			console.warn(`WARN ${slug}: ${err.message} — keeping previous entry`);
			const old = (prev.components || []).find((c) => c.slug === slug);
			if (old) out.components.push(old);
		}
	}
	await writeFile(OUT_FILE, JSON.stringify(out, null, 2) + '\n');
	console.log(`wrote ${OUT_FILE}`);
}

main();
