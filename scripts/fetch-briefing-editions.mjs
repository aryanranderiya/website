/**
 * Vendors GAIA's daily-briefing edition templates from a local GAIA checkout
 * (apps/api/app/services/briefing/editions/) for the /experiments/briefing
 * configurator. Run manually after the editions change:
 *   bun run briefing:vendor <path-to-gaia-checkout>
 * and commit the result. Idempotent: clean output means `git diff` is empty.
 *
 * Writes:
 * - public/vendor/briefing-editions/js/tpl-*.js: the templates, verbatim.
 * - public/vendor/briefing-editions/{fonts,art}/: assets.json decoded to files.
 * - public/vendor/briefing-editions/frame.html: the render harness, the
 *   browser twin of GAIA's explorer_render.py (fonts, EXPLORER shim, scripts).
 * - src/components/experiments/briefing/manifest.json: the paintings.
 * - src/data/stamp-cities.json: Air Mail's 85 city stamps (also the stamps experiment).
 */

import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'vendor', 'briefing-editions');
const MANIFEST = join(ROOT, 'src', 'components', 'experiments', 'briefing', 'manifest.json');
const STAMP_CITIES = join(ROOT, 'src', 'data', 'stamp-cities.json');
const PUBLIC_BASE = '/vendor/briefing-editions';

// Mirrors explorer_render.py's _FONT_FACE_SPEC.
const FONTS = [
	['Aeonik Extended', 'AEONIK_SEMIBOLD', 600, 'normal'],
	['Aeonik Extended', 'AEONIK_BOLD', 700, 'normal'],
	['Playfair Display', 'PLAYFAIR_NORMAL_500', 500, 'normal'],
	['Playfair Display', 'PLAYFAIR_NORMAL_700', 700, 'normal'],
	['Playfair Display', 'PLAYFAIR_ITALIC_500', 500, 'italic'],
];
// stamps.py's _LABEL_PHRASES: a country whose phrase is the label's own words gets no line.
const LABEL_PHRASES = new Set(['par avion', 'by air mail']);
const ARTWORK_RE =
	/Artwork\(\s*"(\w+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*(_OIL_ON_CANVAS|"[^"]+"),?\s*\)/g;

// ISO 3166 alpha-2 code per countries.json name, for flag images (Intl region
// names differ across runtimes, so the mapping is explicit). A new country fails loud.
const COUNTRY_CODES = {
	'Angola': 'ao',
	'Argentina': 'ar',
	'Bangladesh': 'bd',
	'Brazil': 'br',
	'Canada': 'ca',
	'Chile': 'cl',
	'China': 'cn',
	'Colombia': 'co',
	'DR Congo': 'cd',
	'Egypt': 'eg',
	'Ethiopia': 'et',
	'France': 'fr',
	'Hong Kong': 'hk',
	'India': 'in',
	'Indonesia': 'id',
	'Iran': 'ir',
	'Iraq': 'iq',
	'Japan': 'jp',
	'Malaysia': 'my',
	'Mexico': 'mx',
	'Myanmar': 'mm',
	'Nigeria': 'ng',
	'Pakistan': 'pk',
	'Peru': 'pe',
	'Philippines': 'ph',
	'Russia': 'ru',
	'Saudi Arabia': 'sa',
	'Singapore': 'sg',
	'South Africa': 'za',
	'South Korea': 'kr',
	'Spain': 'es',
	'Sudan': 'sd',
	'Taiwan': 'tw',
	'Tanzania': 'tz',
	'Thailand': 'th',
	'Turkey': 'tr',
	'United Kingdom': 'gb',
	'United States': 'us',
	'Vietnam': 'vn',
};

const slugify = (s) =>
	s
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

function parseArtworks(source) {
	const medium = source.match(/_OIL_ON_CANVAS = "([^"]+)"/)?.[1];
	const artworks = [...source.matchAll(ARTWORK_RE)].map(([, key, title, artist, year, m]) => ({
		key,
		title,
		artist,
		year,
		medium: m === '_OIL_ON_CANVAS' ? medium : m.slice(1, -1),
	}));
	if (!medium || artworks.length === 0) throw new Error('artworks.py: no Artwork(...) entries parsed');
	return artworks;
}

function frameHtml(templateFiles, stamps) {
	// stamps.py's stamp_for: the postal template's city axis, one option per hosted city.
	const cityAxis = stamps.map((c) => ({
		id: c.slug,
		label: c.name,
		key: c.assetKey,
		city: c.name.toUpperCase(),
		air: c.air,
	}));
	const faces = FONTS.map(
		([family, key, weight, style]) =>
			`@font-face{font-family:'${family}';font-style:${style};font-weight:${weight};font-display:block;src:url(${PUBLIC_BASE}/fonts/${slugify(key)}.woff2) format('woff2');}`
	).join('\n');
	const scripts = templateFiles.map((f) => `<script src="${PUBLIC_BASE}/js/${f}"></script>`).join('\n');
	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex">
<!-- Matches the site's scheme: a mismatch makes the browser paint the frame opaque white. -->
<meta name="color-scheme" content="light dark">
<style>
${faces}
* { margin: 0; padding: 0; box-sizing: border-box; }
html { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; background: transparent; }
body { width: 540px; overflow: hidden; }
/* Website adaptation: editions laid on a desk (data-paper marks their sheet; Air Mail
   and Receipt are the two without one) float on the page instead of a dark desk. */
#root > article:has([data-paper]), #root > .t-postal, #root > .t-receipt { background: transparent !important; }
/* ...and without the shadows they cast on it. Menu's card keeps its inset foil
   rules, so its outer shadow is clipped instead of overridden. */
.t-postal .env, .t-postal .letter, .t-memo .sheet, .t-librarycard .stack { box-shadow: none !important; }
.t-boardingpass .pass, .t-invoice .doc { filter: none !important; }
.t-receipt .wrap::before, .t-receipt .wrap::after { display: none !important; }
.t-menu .card { clip-path: inset(0); }
</style>
<style id="tpl-css"></style>
</head>
<body>
<div id="root"></div>
<script>
"use strict";
const TEMPLATES = [];
const EXPLORER = {
  register(t) {
    if (!t.id || !t.name || !t.axes || !t.render || !t.css) throw new Error("bad template: " + (t.id || "?"));
    TEMPLATES.push(t);
  },
  // explorer_render.py's fold marker: the first body block after the header.
  fold(blocks) {
    return blocks.map((block, i) => (i === 0 ? block.replace(/^(\\s*<[a-zA-Z][\\w-]*)/, "$1 data-fold") : block));
  },
  cities: ${JSON.stringify(cityAxis)},
};
</script>
${scripts}
<script>
"use strict";
const root = document.getElementById("root");
let onHeight = () => {};
new ResizeObserver(() => onHeight(root.scrollHeight)).observe(root);
window.briefing = {
  templates: TEMPLATES.map(({ id, name, axes }) => ({ id, name, axes })),
  render(family, skin, ed) {
    const tpl = TEMPLATES.find((t) => t.id === family);
    if (!tpl) throw new Error("edition family not registered: " + family);
    document.getElementById("tpl-css").textContent = tpl.css;
    root.innerHTML = tpl.render(ed, skin);
    return root.scrollHeight;
  },
  set onHeight(fn) { onHeight = fn; },
};
</script>
</body>
</html>
`;
}

async function main() {
	const gaia = process.argv[2];
	if (!gaia) throw new Error('usage: bun scripts/fetch-briefing-editions.mjs <path-to-gaia-checkout>');
	const editions = join(gaia, 'apps', 'api', 'app', 'services', 'briefing', 'editions');
	const explorer = join(editions, 'explorer');

	await rm(OUT, { recursive: true, force: true });
	await Promise.all(['js', 'fonts', 'art'].map((d) => mkdir(join(OUT, d), { recursive: true })));

	const templateFiles = (await readdir(join(explorer, 'js'))).filter((f) => /^tpl-.*\.js$/.test(f)).sort();
	for (const f of templateFiles) {
		await writeFile(join(OUT, 'js', f), await readFile(join(explorer, 'js', f)));
	}

	const assets = JSON.parse(await readFile(join(explorer, 'assets', 'assets.json'), 'utf8'));
	const decode = (key) => {
		if (!assets[key]) throw new Error(`assets.json: missing ${key}`);
		return Buffer.from(assets[key], 'base64');
	};
	for (const [, key] of FONTS) await writeFile(join(OUT, 'fonts', `${slugify(key)}.woff2`), decode(key));
	await writeFile(join(OUT, 'band.webp'), decode('BAND'));
	await writeFile(join(OUT, 'tec-mark.webp'), await readFile(join(explorer, 'assets', 'brand', 'tec_mark_black.webp')));

	const artworks = parseArtworks(await readFile(join(editions, 'artworks.py'), 'utf8'));
	for (const a of artworks) await writeFile(join(OUT, 'art', `${slugify(a.title)}.jpg`), decode(a.key));

	const cities = JSON.parse(await readFile(join(explorer, 'assets', 'stamps', 'cities.json'), 'utf8'));
	const countries = JSON.parse(await readFile(join(explorer, 'assets', 'stamps', 'countries.json'), 'utf8'));
	const stamps = cities
		.filter((c) => c.url)
		.map((c) => {
			const air = countries[c.country]?.air;
			if (air === undefined) throw new Error(`countries.json: missing ${c.country}`);
			const countryCode = COUNTRY_CODES[c.country];
			if (!countryCode) throw new Error(`no ISO region code for ${c.country}`);
			return {
				slug: c.slug,
				name: c.name,
				country: c.country,
				countryCode,
				// stamps.py's stamp_asset_key: the asset the postal template reads the art from.
				assetKey: `CITY_${c.slug.toUpperCase()}`,
				url: c.url,
				air: LABEL_PHRASES.has(air.toLowerCase()) ? '' : air,
			};
		})
		.sort((a, b) => a.name.localeCompare(b.name));

	await writeFile(join(OUT, 'frame.html'), frameHtml(templateFiles, stamps));
	const manifest = {
		base: PUBLIC_BASE,
		artworks: artworks.map(({ key, ...a }) => ({ ...a, src: `${PUBLIC_BASE}/art/${slugify(a.title)}.jpg` })),
	};
	await writeFile(MANIFEST, `${JSON.stringify(manifest, null, '\t')}\n`);
	await writeFile(STAMP_CITIES, `${JSON.stringify(stamps, null, '\t')}\n`);
	console.log(`synced ${templateFiles.length} templates, ${artworks.length} paintings, ${stamps.length} stamps`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
