#!/usr/bin/env node
/**
 * fetch-book-covers.mjs
 *
 * The bookshelf used to hotlink Open Library cover URLs at runtime. Those are slow:
 * each one is a 302 redirect chain that can take ~3s to resolve, so ~70 covers loading
 * live made the page crawl. This script pulls every cover ONCE at build time, optimizes
 * it to a small local WebP, and records a thumbhash (a tiny blur placeholder that decodes
 * to a data URL with zero network requests) plus the real dimensions.
 *
 * Output (commit both — Cloudflare Pages reads them, never runs this script):
 *   public/images/books/<slug>.webp       optimized cover, ~360px wide
 *   src/data/book-covers.json             { "<slug>": { hash, w, h } }
 *
 * Re-run whenever you add or change a book's `cover` in src/content/books/.
 *
 *   node scripts/fetch-book-covers.mjs
 */

import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { rgbaToThumbHash } from 'thumbhash';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const BOOKS_DIR = join(ROOT, 'src', 'content', 'books');
const PUBLIC = join(ROOT, 'public');
const OUT_DIR = join(PUBLIC, 'images', 'books');
const OUT_MANIFEST = join(ROOT, 'src', 'data', 'book-covers.json');

// 360px keeps the cover crisp at every on-page size — the detail sheet shows it at
// 168px (≈336px on a 2× screen) and the shelf at ~102px.
const COVER_WIDTH = 360;
const WEBP_QUALITY = 80;
const THUMB_PX = 100; // thumbhash stays accurate and fast at this size

/** Pull `cover:` out of a book's YAML frontmatter (values are unquoted in our content). */
function parseCover(md) {
	const match = md.match(/^cover:\s*(.+?)\s*$/m);
	if (!match) return undefined;
	return match[1].replace(/^['"]|['"]$/g, '');
}

async function loadSource(cover) {
	if (/^https?:\/\//.test(cover)) {
		// fetch() follows the Open Library redirects for us
		const res = await fetch(cover);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return Buffer.from(await res.arrayBuffer());
	}
	// local cover (e.g. /images/books/atomic-habits.webp) — read from public/
	return readFile(join(PUBLIC, cover.replace(/^\//, '')));
}

async function thumbhash(buffer) {
	const { data, info } = await sharp(buffer)
		.resize(THUMB_PX, THUMB_PX, { fit: 'inside' })
		.ensureAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });
	const hash = rgbaToThumbHash(info.width, info.height, new Uint8Array(data));
	return Buffer.from(hash).toString('base64');
}

async function main() {
	await mkdir(OUT_DIR, { recursive: true });

	const files = (await readdir(BOOKS_DIR)).filter((f) => f.endsWith('.md'));
	console.log(`Processing ${files.length} books…`);

	const manifest = {};
	const failures = [];

	for (const file of files) {
		const slug = basename(file, '.md');
		const cover = parseCover(await readFile(join(BOOKS_DIR, file), 'utf8'));
		if (!cover) continue;

		try {
			const source = await loadSource(cover);

			// Optimize to a small WebP at a fixed display width (never upscale).
			const out = join(OUT_DIR, `${slug}.webp`);
			const { width, height } = await sharp(source)
				.resize(COVER_WIDTH, null, { withoutEnlargement: true })
				.webp({ quality: WEBP_QUALITY, effort: 6 })
				.toFile(out);

			manifest[slug] = { hash: await thumbhash(source), w: width, h: height };
			process.stdout.write('.');
		} catch (err) {
			failures.push({ slug, error: err.message });
			process.stdout.write('x');
		}
	}

	console.log('');

	// Stable key order keeps the committed JSON diff clean.
	const sorted = Object.fromEntries(Object.keys(manifest).sort().map((k) => [k, manifest[k]]));
	await writeFile(OUT_MANIFEST, `${JSON.stringify(sorted, null, 2)}\n`);
	console.log(`✓ Wrote ${Object.keys(manifest).length} covers → public/images/books/`);
	console.log(`✓ Wrote manifest → src/data/book-covers.json`);

	if (failures.length) {
		console.warn(`⚠ ${failures.length} failed:`);
		for (const f of failures) console.warn(`  ${f.slug}: ${f.error}`);
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
