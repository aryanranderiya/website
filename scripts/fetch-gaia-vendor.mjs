/**
 * Syncs vendored GAIA UI component source from the shadcn registry
 * (https://ui.heygaia.io/r/<slug>.json) into
 * src/components/experiments/gaia-ui/, applying the documented Astro
 * adaptations. Run manually after the registry changes:
 *   bun scripts/fetch-gaia-vendor.mjs
 * and commit the result. The script is idempotent — clean output means
 * `git diff` shows nothing on the vendored files.
 *
 * Adaptations (mechanical, kept minimal so diffs stay reviewable):
 * - chat-demo.tsx: DEFAULT_AVATAR "/gaia-glow.png" (docs-site asset) →
 *   local "/images/site/avatar.webp".
 * - footer-glow.tsx: drop `next/image` (Next-only) → plain absolute <img>;
 *   `@/registry/...` imports → relative siblings; top fade
 *   `from-background` → `from-black` (the component is designed dark with a
 *   bg-black root, but our --background token is light, which paints a grey
 *   veil over the wallpaper).
 * Everything else (incl. `@/lib/utils`, present locally) is verbatim.
 */

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'src', 'components', 'experiments', 'gaia-ui');
const REGISTRY_BASE = 'https://ui.heygaia.io/r';

// slug -> files to extract (registry path suffix -> local filename)
const TARGETS = {
	'chat-demo': [{ from: 'registry/new-york/ui/chat-demo.tsx', to: 'chat-demo.tsx' }],
	'iphone-mockup': [{ from: 'registry/new-york/ui/iphone-mockup.tsx', to: 'iphone-mockup.tsx' }],
	'footer-glow': [
		{ from: 'registry/new-york/ui/footer-glow.tsx', to: 'footer-glow.tsx' },
		{ from: 'registry/new-york/ui/footer-wordmark.tsx', to: 'footer-wordmark.tsx' },
		{ from: 'registry/new-york/ui/grain-overlay.tsx', to: 'grain-overlay.tsx' },
	],
};

function assertReplaced(content, oldStr, file) {
	if (!content.includes(oldStr)) {
		throw new Error(`${file}: expected pattern not found — upstream changed, review adaptations`);
	}
}

function adapt(filename, content) {
	if (filename === 'chat-demo.tsx') {
		const oldStr = 'const DEFAULT_AVATAR = "/gaia-glow.png";';
		assertReplaced(content, oldStr, filename);
		content = content.replace(oldStr, 'const DEFAULT_AVATAR = "/images/site/avatar.webp";');
	}
	if (filename === 'footer-glow.tsx') {
		let oldStr = 'import Image from "next/image";\n';
		assertReplaced(content, oldStr, filename);
		content = content.replace(oldStr, '');
		oldStr = '@/registry/new-york/ui/footer-wordmark';
		assertReplaced(content, oldStr, filename);
		content = content.replace(oldStr, './footer-wordmark');
		oldStr = '@/registry/new-york/ui/grain-overlay';
		assertReplaced(content, oldStr, filename);
		content = content.replace(oldStr, './grain-overlay');
		oldStr = `<Image
					src={backgroundSrc}
					alt=""
					fill
					sizes="100vw"
					className="pointer-events-none z-0 origin-bottom scale-150 select-none object-cover object-bottom"
				/>`;
		assertReplaced(content, oldStr, filename);
		content = content.replace(
			oldStr,
			`// biome-ignore lint/performance/noImgElement: static wallpaper layer, no layout shift (absolute fill)
				<img
					src={backgroundSrc}
					alt=""
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 z-0 h-full w-full origin-bottom scale-150 select-none object-cover object-bottom"
				/>`
		);
		oldStr = 'bg-gradient-to-b from-background via-background/50 to-transparent';
		assertReplaced(content, oldStr, filename);
		content = content.replace(
			oldStr,
			'bg-gradient-to-b from-black via-black/50 to-transparent'
		);
	}
	return content;
}

async function main() {
	for (const [slug, files] of Object.entries(TARGETS)) {
		const res = await fetch(`${REGISTRY_BASE}/${slug}.json`);
		if (!res.ok) throw new Error(`${res.status} ${slug}.json`);
		const item = await res.json();
		const byPath = new Map((item.files ?? []).map((f) => [f.path, f.content]));
		for (const { from, to } of files) {
			const content = byPath.get(from);
			if (!content) throw new Error(`${slug}.json: missing ${from}`);
			await writeFile(join(OUT_DIR, to), adapt(to, content));
			console.log(`ok ${to}`);
		}
	}
	console.log(`synced ${OUT_DIR}`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
