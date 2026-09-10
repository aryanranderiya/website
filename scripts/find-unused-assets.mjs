#!/usr/bin/env node
/**
 * find-unused-assets.mjs
 *
 * Scans all source files (.astro, .tsx, .ts, .mdx, .md, .json, .css) for references
 * to files in public/, then reports assets that are never referenced.
 * Handles CSS url(...) refs, runtime-built URLs (template literals / string
 * concatenation mark their directory prefix as used), and src/data/*.json
 * manifest keys (path-like keys and bare slugs).
 *
 * Usage:  node scripts/find-unused-assets.mjs
 *         node scripts/find-unused-assets.mjs --delete   (delete unreferenced files)
 *         node scripts/find-unused-assets.mjs --json     (output JSON)
 */

import { readdir, readFile, unlink, stat } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PUBLIC_DIR = join(ROOT, 'public');
const SRC_DIR = join(ROOT, 'src');

const ASSET_EXTS = new Set([
  '.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.svg',
  '.mp4', '.webm', '.mov', '.ogg',
  '.pdf', '.ico', '.woff', '.woff2',
]);

const SOURCE_EXTS = new Set([
  '.astro', '.tsx', '.ts', '.jsx', '.js', '.mdx', '.md', '.json', '.css',
]);

const ALWAYS_KEEP = new Set([
  'robots.txt', 'favicon.ico', 'favicon.svg', 'CNAME', 'sitemap.xml',
  '_headers', '_redirects', '_routes.json',
]);

// Directories under public/ that are dynamically loaded at runtime OR referenced
// outside JS/TS source (manifests, browser conventions) — exclude from detection.
const EXCLUDE_DIRS = new Set([
  'images/pets',    // web-pet GIFs: path built as /images/pets/${folder}/${color}_${anim}_8fps.gif
  'icons/favicons', // tool favicons fetched dynamically by fetch-favicons script
  'favicon',        // PWA icons referenced in public/favicon/site.webmanifest (not scanned)
]);

const args = process.argv.slice(2);
const doDelete = args.includes('--delete');
const jsonOutput = args.includes('--json');

async function walk(dir, exts) {
  const results = [];
  const entries = await readdir(dir, { withFileTypes: true });
  await Promise.all(
    entries.map(async (e) => {
      const full = join(dir, e.name);
      if (e.isDirectory()) {
        results.push(...(await walk(full, exts)));
      } else if (!exts || exts.has(extname(e.name).toLowerCase())) {
        results.push(full);
      }
    })
  );
  return results;
}

async function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

async function main() {
  // 1. Collect all public assets
  const publicAssets = await walk(PUBLIC_DIR, ASSET_EXTS);

  // 2. Collect all source files (src + root-level config files)
  const srcFiles = await walk(SRC_DIR, SOURCE_EXTS);

  // 3. Build a single giant string of all source content.
  // Per-file contents are retained so data manifests can be parsed below.
  const fileContents = await Promise.all(
    srcFiles.map(async (f) => ({ file: f, content: await readFile(f, 'utf8').catch(() => '') }))
  );
  const sourceContent = fileContents.map((f) => f.content).join('\n');

  // 3a. Dynamic path prefixes from template literals / string concatenation.
  // Literal substring matching misses URLs built at runtime, e.g.
  //   `/images/books/${entry.id}.webp`        (src/pages/books/index.astro)
  //   `/images/games/fallout/${i + 1}.webp`   (src/pages/f4llout/index.astro,
  //                                           Array.from({ length: 9 }, …))
  //   `/images/design/apparel/${file}` …      (DesignGallery.tsx)
  //   `/icons/colophon/${item.icon}`          (src/pages/colophon.astro)
  // Any asset under a referenced prefix counts as used. ONLY strings with
  // interpolation (${…}) or + concatenation qualify — a plain literal such as
  // one "/images/blog/foo.webp" must never mark its whole directory used,
  // or genuinely unused siblings in that directory would be masked.
  const DYNAMIC_PREFIX_RE =
    /(?:^|[`\s('"=])\/((?:images|icons|fonts|videos?|assets?|media|files)\/[A-Za-z0-9_\-]+(?:\/[A-Za-z0-9_\-]+)*\/)/g;
  const dynamicPrefixes = new Set();
  // Backtick strings that interpolate: static prefix before ${…}.
  for (const m of sourceContent.matchAll(/`[^`]*\$\{[^`]*`/g)) {
    for (const pm of m[0].matchAll(DYNAMIC_PREFIX_RE)) dynamicPrefixes.add(pm[1]);
  }
  // Quoted strings adjacent to + (either side): '…' + x or x + '…'.
  for (const m of sourceContent.matchAll(/"[^"\n]*"\s*\+|\+\s*"[^"\n]*"|'[^'\n]*'\s*\+|\+\s*'[^'\n]*'/g)) {
    for (const pm of m[0].matchAll(DYNAMIC_PREFIX_RE)) dynamicPrefixes.add(pm[1]);
  }

  // 3b. References via src/data/*.json manifests. Keys (and string values)
  // that look like asset paths count, e.g. design-thumbhashes.json keys
  // ("design/headers/foo.webp" ↔ public/images/design/headers/foo.webp).
  // Bare top-level keys (book-covers.json slugs like "my-book-slug")
  // match by asset basename ("images/books/my-book-slug.webp").
  const jsonPathRefs = new Set();
  const jsonSlugKeys = new Set();
  const collectJsonRefs = (node, depth) => {
    if (typeof node === 'string') {
      const s = node.trim().replace(/^\/+/, '');
      if (s.includes('/') && ASSET_EXTS.has(extname(s).toLowerCase())) jsonPathRefs.add(s);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach((v) => collectJsonRefs(v, depth + 1));
      return;
    }
    if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) {
        const key = k.trim();
        if (key.includes('/') && ASSET_EXTS.has(extname(key).toLowerCase())) {
          jsonPathRefs.add(key.replace(/^\/+/, ''));
        } else if (depth === 0 && key && !/[\s:/]/.test(key)) {
          jsonSlugKeys.add(key);
        }
        collectJsonRefs(v, depth + 1);
      }
    }
  };
  for (const { file, content } of fileContents) {
    if (!file.includes('/src/data/') || !file.endsWith('.json')) continue;
    try {
      collectJsonRefs(JSON.parse(content), 0);
    } catch {
      // Not parseable JSON — already covered by raw text matching above.
    }
  }

  // 4. For each asset, check if any path fragment appears in source
  const unused = [];
  const used = [];

  for (const assetPath of publicAssets) {
    const relPath = relative(PUBLIC_DIR, assetPath); // e.g. "images/projects/foo/bar.png"
    const filename = relPath.split('/').pop();

    // Skip dynamically-loaded directories
    const isExcluded = [...EXCLUDE_DIRS].some(
      (d) => relPath === d || relPath.startsWith(d + '/')
    );
    if (isExcluded) {
      used.push(relPath);
      continue;
    }

    if (ALWAYS_KEEP.has(filename)) {
      used.push(relPath);
      continue;
    }

    // Match on the full relative path OR just the filename (less precise but catches more).
    // Dynamic prefixes (template literals / concatenation) and JSON manifest
    // keys conservatively mark whole subtrees / slug-matched files as used.
    const basenameNoExt = filename.replace(/\.[^.]+$/, '');
    const isDynamic = [...dynamicPrefixes].some((p) => relPath.startsWith(p));
    let isManifestRef = false;
    if (jsonSlugKeys.has(basenameNoExt)) {
      isManifestRef = true;
    } else {
      for (const ref of jsonPathRefs) {
        if (relPath === ref || relPath.endsWith(`/${ref}`)) {
          isManifestRef = true;
          break;
        }
      }
    }
    const isReferenced =
      sourceContent.includes(relPath) ||
      sourceContent.includes(`/${relPath}`) ||
      sourceContent.includes(filename) ||
      isDynamic ||
      isManifestRef;

    if (isReferenced) {
      used.push(relPath);
    } else {
      const { size } = await stat(assetPath);
      unused.push({ path: relPath, fullPath: assetPath, size });
    }
  }

  // Sort unused by size desc
  unused.sort((a, b) => b.size - a.size);

  const totalUnusedBytes = unused.reduce((s, f) => s + f.size, 0);

  if (jsonOutput) {
    console.log(JSON.stringify({ unused, totalUnusedBytes }, null, 2));
    return;
  }

  if (unused.length === 0) {
    console.log('✓ No unused assets found.');
    return;
  }

  const pad = (s, n) => String(s).padStart(n);

  if (dynamicPrefixes.size > 0) {
    console.log(`Dynamic prefixes treated as used: ${[...dynamicPrefixes].sort().join(', ')}`);
  }
  console.log(`\nUnused assets (${unused.length} files, ${await formatSize(totalUnusedBytes)} total):\n`);
  console.log(`  ${'Size'.padStart(8)}  Path`);
  console.log(`  ${'────────'.padStart(8)}  ────────────────────────────────────────`);

  for (const f of unused) {
    console.log(`  ${pad(await formatSize(f.size), 8)}  ${f.path}`);
  }

  console.log(`\n  Total recoverable: ${await formatSize(totalUnusedBytes)}`);

  if (doDelete) {
    console.log('\nDeleting…');
    let deleted = 0;
    for (const f of unused) {
      await unlink(f.fullPath);
      deleted++;
    }
    console.log(`Deleted ${deleted} files.`);
  } else {
    console.log('\nRe-run with --delete to remove them.');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
