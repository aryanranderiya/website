#!/usr/bin/env node
/**
 * fetch-og-previews.mjs
 *
 * The homepage hero bakes OpenGraph preview cards for a few external links
 * (The Experience Company, GAIA, the Spotify playlist). Those previews used to
 * be scraped live during `astro build` — fine when the homepage was prerendered,
 * but the homepage now renders on demand (agent content negotiation), so a live
 * scrape would run per request. This script pulls each URL ONCE, extracts its OG
 * metadata, and writes it to a committed JSON file that <Hero> imports statically.
 *
 * Output (commit it — Cloudflare Pages reads it, never runs this script):
 *   src/data/og-previews.json   { "<url>": { image, name, favicon, title, description } | null }
 *
 * Re-run when one of the target sites rebrands or their OG tags change:
 *
 *   node scripts/fetch-og-previews.mjs
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = join(ROOT, 'src', 'data', 'og-previews.json');

// Keep in sync with the URLs <Hero> renders preview cards for.
const TARGETS = [
	'https://experience.heygaia.io',
	'https://heygaia.io',
	'https://open.spotify.com/playlist/1kDa0wKgm0baT3550xsURH',
];

const META_RE = /<meta\b[^>]*?>/gi;
const ATTR_RE = /(\w[\w:-]*)\s*=\s*"([^"]*)"|(\w[\w:-]*)\s*=\s*'([^']*)'/g;
const TITLE_RE = /<title[^>]*>([\s\S]*?)<\/title>/i;
const LINK_RE = /<link\b[^>]*?>/gi;

function parseTagAttrs(tag) {
	const out = {};
	let match;
	ATTR_RE.lastIndex = 0;
	while ((match = ATTR_RE.exec(tag)) !== null) {
		const key = (match[1] ?? match[3]).toLowerCase();
		const value = match[2] ?? match[4];
		out[key] = value;
	}
	return out;
}

function decode(text) {
	if (!text) return undefined;
	return text
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&#x27;/g, "'")
		.trim();
}

function absolutize(url, base) {
	if (!url) return undefined;
	try {
		return new URL(url, base).toString();
	} catch {
		return undefined;
	}
}

async function scrape(url) {
	const res = await fetch(url, {
		headers: {
			'user-agent':
				'Mozilla/5.0 (compatible; aryanranderiya.com/preview-link; +https://aryanranderiya.com)',
			accept: 'text/html,application/xhtml+xml',
		},
		redirect: 'follow',
		signal: AbortSignal.timeout(5000),
	});
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	const text = await res.text();
	const headEnd = text.search(/<\/head>/i);
	const head = headEnd > 0 ? text.slice(0, headEnd) : text;
	const finalUrl = res.url || url;

	const meta = {};
	let m;
	META_RE.lastIndex = 0;
	while ((m = META_RE.exec(head)) !== null) {
		const attrs = parseTagAttrs(m[0]);
		const key = (attrs.property || attrs.name)?.toLowerCase();
		if (key && attrs.content) meta[key] = attrs.content;
	}

	let favicon;
	LINK_RE.lastIndex = 0;
	while ((m = LINK_RE.exec(head)) !== null) {
		const attrs = parseTagAttrs(m[0]);
		const rel = attrs.rel?.toLowerCase() ?? '';
		if (rel.includes('icon') && attrs.href) {
			favicon = absolutize(decode(attrs.href), finalUrl);
			if (rel.includes('apple-touch') || rel.includes('shortcut')) break;
		}
	}
	if (!favicon) favicon = absolutize('/favicon.ico', finalUrl);

	const titleMatch = head.match(TITLE_RE);
	const docTitle = titleMatch ? titleMatch[1] : undefined;

	return {
		image: absolutize(decode(meta['og:image'] ?? meta['twitter:image']), finalUrl),
		name: decode(meta['og:site_name'] ?? new URL(finalUrl).hostname),
		favicon,
		title: decode(meta['og:title'] ?? meta['twitter:title'] ?? docTitle),
		description: decode(meta['og:description'] ?? meta['twitter:description'] ?? meta.description),
	};
}

async function main() {
	const previews = {};
	for (const url of TARGETS) {
		try {
			previews[url] = await scrape(url);
			console.log(`ok      ${url}`);
		} catch (err) {
			// Mirror fetchOgMetadata's contract: null lets <Hero> fall back to its
			// own inline preview props instead of failing the build.
			previews[url] = null;
			console.warn(`failed  ${url}: ${err?.message ?? err}`);
		}
	}
	await mkdir(dirname(OUT), { recursive: true });
	await writeFile(`${OUT}\n`.replace('\n', ''), `${JSON.stringify(previews, null, '\t')}\n`);
	console.log(`wrote ${OUT}`);
}

main();
