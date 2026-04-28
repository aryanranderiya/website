#!/usr/bin/env node
/**
 * find-unused-assets.mjs
 *
 * Scans all source files (.astro, .tsx, .ts, .mdx, .md, .json) for references
 * to files in public/, then reports assets that are never referenced.
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
  '.astro', '.tsx', '.ts', '.jsx', '.js', '.mdx', '.md', '.json',
]);

const ALWAYS_KEEP = new Set([
  'robots.txt', 'favicon.ico', 'favicon.svg', 'CNAME', 'sitemap.xml',
  '_headers', '_redirects', '_routes.json',
]);

// Directories under public/ that are dynamically loaded at runtime OR referenced
// outside JS/TS source (manifests, browser conventions) — exclude from detection.
const EXCLUDE_DIRS = new Set([
  'media',          // web-pet GIFs: path built as /media/${folder}/${color}_${anim}_8fps.gif
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

  // 3. Build a single giant string of all source content
  const sourceContent = (
    await Promise.all(srcFiles.map((f) => readFile(f, 'utf8').catch(() => '')))
  ).join('\n');

  // 4. For each asset, check if any path fragment appears in source
  const unused = [];
  const used = [];

  for (const assetPath of publicAssets) {
    const relPath = relative(PUBLIC_DIR, assetPath); // e.g. "ProjectMedia/Foo/bar.png"
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

    // Match on the full relative path OR just the filename (less precise but catches more)
    const isReferenced =
      sourceContent.includes(relPath) ||
      sourceContent.includes(`/${relPath}`) ||
      sourceContent.includes(filename);

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
