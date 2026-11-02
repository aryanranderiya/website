/**
 * Renders a square thumbnail of every vendored briefing edition (the top of
 * the real render, demo content, default skin) for the edition picker:
 *   bun run briefing:thumbs
 * Run after briefing:vendor and commit the result. Uses frame.html, so the
 * thumbnails are the templates themselves, not a redraw.
 */

import { mkdir, readFile, rm } from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { DEMO_DRAFT, DEMO_LOOK } from '../src/components/experiments/briefing/demo.ts';
import { buildEdition, resolveSkin } from '../src/components/experiments/briefing/edition.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'public');
const OUT = join(PUBLIC, 'vendor', 'briefing-editions', 'thumbs');
const CANVAS_PX = 540;
/** 2x the picker's 40px tile. */
const THUMB_PX = 80;
const TYPES = {
	'.html': 'text/html',
	'.js': 'text/javascript',
	'.woff2': 'font/woff2',
	'.webp': 'image/webp',
	'.jpg': 'image/jpeg',
};

async function main() {
	const server = Bun.serve({
		port: 0,
		async fetch(req) {
			const path = join(PUBLIC, decodeURIComponent(new URL(req.url).pathname));
			const body = await readFile(path).catch(() => null);
			if (!body) return new Response('not found', { status: 404 });
			return new Response(body, { headers: { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' } });
		},
	});
	const browser = await chromium.launch();
	try {
		const page = await browser.newPage({ viewport: { width: CANVAS_PX, height: CANVAS_PX }, deviceScaleFactor: 2 });
		await page.goto(`http://localhost:${server.port}/vendor/briefing-editions/frame.html`);
		const templates = await page.evaluate(() => window.briefing.templates);
		await rm(OUT, { recursive: true, force: true });
		await mkdir(OUT, { recursive: true });
		for (const template of templates) {
			const look = { ...DEMO_LOOK, family: template.id };
			const edition = buildEdition(DEMO_DRAFT, look);
			const skin = resolveSkin(template, look);
			await page.evaluate(([family, s, ed]) => window.briefing.render(family, s, ed), [template.id, skin, edition]);
			await page.evaluate(() => document.fonts.ready);
			await page.waitForLoadState('networkidle');
			const png = await page.screenshot({ clip: { x: 0, y: 0, width: CANVAS_PX, height: CANVAS_PX }, omitBackground: true });
			await sharp(png).resize(THUMB_PX, THUMB_PX).webp({ quality: 82 }).toFile(join(OUT, `${template.id}.webp`));
		}
		console.log(`rendered ${templates.length} thumbnails`);
	} finally {
		await browser.close();
		server.stop();
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
