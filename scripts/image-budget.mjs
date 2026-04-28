#!/usr/bin/env node
/**
 * image-budget.mjs
 *
 * Asset size budget — flags media files that are too large.
 *
 *   green   image ≤ 300 KB,  video ≤  5 MB
 *   yellow  image ≤   1 MB,  video ≤ 15 MB         (warn)
 *   red     image >   1 MB,  video > 15 MB         (fail)
 *
 * The 25 MB ceiling is set by Cloudflare Pages — anything over that breaks
 * deployment. Yellow = "consider optimizing", red = "ship-blocker before
 * adding more".
 *
 * Usage:
 *   node scripts/image-budget.mjs            # exits 0 if all green/yellow
 *   node scripts/image-budget.mjs --strict   # exits non-zero on yellow too
 */

import { readdir, stat } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT   = fileURLToPath(new URL('..', import.meta.url));
const PUBLIC = join(ROOT, 'public');

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif']);
const VIDEO_EXTS = new Set(['.mp4', '.webm', '.mov']);

const KB = 1024, MB = 1024 * 1024;

const BUDGETS = {
  // 2 MB image fail budget accommodates extra-tall scrolling screenshots
  // (e.g. full-page captures); anything larger is a sign that the image
  // should be split, scaled down, or moved to the CDN.
  image: { warn: 300 * KB, fail: 2 * MB },
  // 20 MB video fail keeps us comfortably under the Cloudflare Pages
  // 25 MB single-file deploy ceiling.
  video: { warn: 5 * MB,   fail: 20 * MB },
};

const args   = process.argv.slice(2);
const strict = args.includes('--strict');
const ci     = process.env.CI === 'true';

// In CI use markers GitHub Actions understands; locally use ANSI colors.
const fmt = ci
  ? { red: (s) => `::error::${s}`, yellow: (s) => `::warning::${s}`, dim: (s) => s }
  : { red: (s) => `\x1b[31m${s}\x1b[0m`, yellow: (s) => `\x1b[33m${s}\x1b[0m`, dim: (s) => `\x1b[2m${s}\x1b[0m` };

async function walk(dir, predicate) {
  const out = [];
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); }
  catch { return out; }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(full, predicate));
    else if (predicate(full)) out.push(full);
  }
  return out;
}

const fmtSize = (b) => b >= MB ? `${(b/MB).toFixed(1)} MB` : `${(b/KB).toFixed(0)} KB`;

const allMedia = await walk(PUBLIC, (f) => {
  const ext = extname(f).toLowerCase();
  return IMAGE_EXTS.has(ext) || VIDEO_EXTS.has(ext);
});

const reds = [], yellows = [];

for (const f of allMedia) {
  const ext = extname(f).toLowerCase();
  const kind = VIDEO_EXTS.has(ext) ? 'video' : 'image';
  const size = (await stat(f)).size;
  const budget = BUDGETS[kind];
  const rel = relative(PUBLIC, f);
  if (size > budget.fail)      reds.push({ rel, size, kind });
  else if (size > budget.warn) yellows.push({ rel, size, kind });
}

reds.sort((a, b) => b.size - a.size);
yellows.sort((a, b) => b.size - a.size);

const total = allMedia.length;
const ok = total - reds.length - yellows.length;
console.log(`${total} media files: ${ok} green, ${yellows.length} yellow, ${reds.length} red\n`);

if (reds.length) {
  console.log(fmt.red(`✗ ${reds.length} OVER BUDGET:`));
  for (const r of reds) {
    const limit = fmtSize(BUDGETS[r.kind].fail);
    console.log(fmt.red(`  ${fmtSize(r.size).padStart(8)}  ${r.rel}  (${r.kind} budget: ${limit})`));
  }
  console.log();
}

if (yellows.length) {
  console.log(fmt.yellow(`⚠ ${yellows.length} approaching budget:`));
  for (const y of yellows) {
    const limit = fmtSize(BUDGETS[y.kind].warn);
    console.log(fmt.yellow(`  ${fmtSize(y.size).padStart(8)}  ${y.rel}  (${y.kind} warn: ${limit})`));
  }
  console.log();
}

if (!reds.length && !yellows.length) {
  console.log('✓ All media within budget.');
}

const failed = reds.length > 0 || (strict && yellows.length > 0);
process.exit(failed ? 1 : 0);
