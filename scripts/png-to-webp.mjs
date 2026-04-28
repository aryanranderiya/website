#!/usr/bin/env node
/**
 * png-to-webp.mjs
 *
 * Convert PNGs in public/ to WebP at high quality (q=90, max effort) while
 * preserving original dimensions exactly. After conversion, patch all source
 * references from .png → .webp, then optionally delete the originals.
 *
 * Settings chosen to be conservative:
 *   - quality 90    (visually indistinguishable from PNG for screenshots)
 *   - effort 6      (max compression effort — slow but smallest WebP)
 *   - alpha kept    (preserves transparency)
 *   - dimensions exactly preserved
 *
 * Skips:
 *   - PNGs smaller than 50 KB (not worth the round trip)
 *   - PNGs that already have a .webp twin at the same path
 *
 * Usage:
 *   node scripts/png-to-webp.mjs                 # dry run
 *   node scripts/png-to-webp.mjs --convert       # convert only
 *   node scripts/png-to-webp.mjs --convert --patch  # convert + update source refs
 *   node scripts/png-to-webp.mjs --convert --patch --delete  # + remove .pngs
 */

import { readdir, readFile, writeFile, unlink, stat } from 'node:fs/promises';
import { join, relative, extname, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT      = fileURLToPath(new URL('..', import.meta.url));
const PUBLIC    = join(ROOT, 'public');
const SRC       = join(ROOT, 'src');
const MIN_BYTES = 50 * 1024;    // skip pngs under 50 KB
const QUALITY   = 90;
const EFFORT    = 6;

const args     = process.argv.slice(2);
const convert  = args.includes('--convert');
const patch    = args.includes('--patch');
const del      = args.includes('--delete');

const SOURCE_EXTS = new Set(['.astro', '.tsx', '.ts', '.jsx', '.js', '.mdx', '.md', '.json']);

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

const fmt = (b) => b >= 1024 * 1024 ? `${(b/1024/1024).toFixed(1)} MB` : `${(b/1024).toFixed(0)} KB`;

async function fileExists(p) { try { await stat(p); return true; } catch { return false; } }

// ─── Collect candidate PNGs ──────────────────────────────────────────────────

const allPngs = await walk(PUBLIC, (f) => f.toLowerCase().endsWith('.png'));
const candidates = [];

for (const png of allPngs) {
  const sz = (await stat(png)).size;
  if (sz < MIN_BYTES) continue;
  const webpTwin = png.replace(/\.png$/i, '.webp');
  if (await fileExists(webpTwin)) continue;
  candidates.push({ png, size: sz, webp: webpTwin });
}

candidates.sort((a, b) => b.size - a.size);

if (candidates.length === 0) {
  console.log('No conversion candidates.');
  process.exit(0);
}

const totalIn = candidates.reduce((s, c) => s + c.size, 0);
console.log(`${candidates.length} PNGs to convert (${fmt(totalIn)} total)\n`);

if (!convert) {
  for (const c of candidates.slice(0, 30)) {
    console.log(`  ${fmt(c.size).padStart(8)}  ${relative(PUBLIC, c.png)}`);
  }
  if (candidates.length > 30) console.log(`  … and ${candidates.length - 30} more`);
  console.log('\nDry run. Pass --convert to actually convert.');
  process.exit(0);
}

// ─── Convert ─────────────────────────────────────────────────────────────────

const conversions = [];   // successful: { rel, before, after }
const failures    = [];   // failed:     { rel, error }
let totalOut = 0;

for (let i = 0; i < candidates.length; i++) {
  const { png, webp, size } = candidates[i];
  const rel = relative(PUBLIC, png);
  process.stdout.write(`[${i + 1}/${candidates.length}] ${rel} … `);
  try {
    // sharp preserves source dimensions and color profile by default; we
    // only override compression knobs.
    await sharp(png)
      .webp({ quality: QUALITY, effort: EFFORT })
      .toFile(webp);

    const newSize = (await stat(webp)).size;

    // Sanity check: if WebP came out larger, that's a regression — discard.
    if (newSize >= size) {
      await unlink(webp);
      console.log(`✗ webp larger (${fmt(newSize)} ≥ ${fmt(size)}), keeping png`);
      failures.push({ rel, error: 'webp not smaller' });
      continue;
    }

    totalOut += newSize;
    conversions.push({ rel, png, webp, before: size, after: newSize });
    const pct = ((1 - newSize / size) * 100).toFixed(0);
    console.log(`✓ ${fmt(size)} → ${fmt(newSize)}  (-${pct}%)`);
  } catch (err) {
    console.log(`✗ ${err.message}`);
    failures.push({ rel, error: err.message });
  }
}

const totalConverted = conversions.reduce((s, c) => s + c.before, 0);
console.log(`\nConverted ${conversions.length}/${candidates.length}: ${fmt(totalConverted)} → ${fmt(totalOut)} (saved ${fmt(totalConverted - totalOut)})`);
if (failures.length) {
  console.log(`Failed: ${failures.length}`);
  for (const f of failures.slice(0, 5)) console.log(`  - ${f.rel}: ${f.error}`);
}

// ─── Patch source references ─────────────────────────────────────────────────

if (patch && conversions.length) {
  console.log('\nPatching source references…');
  const srcFiles = await walk(SRC, (f) => SOURCE_EXTS.has(extname(f).toLowerCase()));

  // Build a set of converted paths (e.g. "/ProjectMedia/foo.png")
  const pathMap = new Map();
  for (const c of conversions) {
    const publicPath = '/' + relative(PUBLIC, c.png).split('\\').join('/');
    pathMap.set(publicPath, publicPath.replace(/\.png$/i, '.webp'));
  }

  let touched = 0;
  let refs    = 0;
  for (const sf of srcFiles) {
    let content = await readFile(sf, 'utf8');
    let changed = false;
    for (const [from, to] of pathMap) {
      if (content.includes(from)) {
        const before = content;
        content = content.split(from).join(to);
        const occurrences = (before.match(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        refs += occurrences;
        changed = true;
      }
    }
    if (changed) {
      await writeFile(sf, content, 'utf8');
      touched++;
      console.log(`  ${relative(ROOT, sf)}`);
    }
  }
  console.log(`Patched ${refs} references in ${touched} files.`);
}

// ─── Delete originals ────────────────────────────────────────────────────────

if (del && conversions.length) {
  console.log('\nDeleting original PNGs…');
  for (const c of conversions) {
    await unlink(c.png).catch(() => {});
  }
  console.log(`Deleted ${conversions.length} PNGs.`);
}

if (!patch) {
  console.log('\nRe-run with --patch to update source refs, --delete to remove the .png originals.');
}
