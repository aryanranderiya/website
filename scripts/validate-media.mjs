#!/usr/bin/env node
/**
 * validate-media.mjs
 *
 * Validates every image and video in public/ for format integrity:
 *   - Image files actually decode as images (catches the "HTML 404 saved as .webp" bug)
 *   - Video files have a valid stream and dimensions
 *   - Source-referenced media files actually exist on disk
 *
 * Usage: node scripts/validate-media.mjs
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const ROOT   = fileURLToPath(new URL('..', import.meta.url));
const PUBLIC = join(ROOT, 'public');
const SRC    = join(ROOT, 'src');

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif']);
const VIDEO_EXTS = new Set(['.mp4', '.webm', '.mov']);
const SVG_EXT    = '.svg';
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

const broken = [];   // { path, reason }
const missing = [];  // { ref, source }

// ─── Validate every image/video on disk ──────────────────────────────────────

const allMedia = await walk(PUBLIC, (f) => {
  const ext = extname(f).toLowerCase();
  return IMAGE_EXTS.has(ext) || VIDEO_EXTS.has(ext) || ext === SVG_EXT;
});

console.log(`Validating ${allMedia.length} media files…\n`);

for (const file of allMedia) {
  const ext = extname(file).toLowerCase();
  const rel = relative(PUBLIC, file);

  try {
    if (IMAGE_EXTS.has(ext)) {
      const meta = await sharp(file).metadata();
      if (!meta.width || !meta.height) {
        broken.push({ path: rel, reason: 'no dimensions' });
        continue;
      }
      // sniff: compare declared extension vs actual format
      const expected = ext === '.jpg' ? 'jpeg' : ext.slice(1);
      if (meta.format && meta.format !== expected) {
        broken.push({ path: rel, reason: `extension says ${expected}, actual format ${meta.format}` });
      }
    } else if (ext === SVG_EXT) {
      // SVG is text; just confirm it has an <svg tag
      const head = (await readFile(file, 'utf8')).slice(0, 1024).toLowerCase();
      if (!head.includes('<svg')) {
        broken.push({ path: rel, reason: 'no <svg> tag in first 1KB' });
      }
    } else if (VIDEO_EXTS.has(ext)) {
      // ffprobe and ensure there's at least one video stream with dimensions
      const json = execFileSync('ffprobe', [
        '-v', 'error',
        '-print_format', 'json',
        '-show_streams',
        file,
      ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
      const streams = JSON.parse(json).streams || [];
      const v = streams.find((s) => s.codec_type === 'video');
      if (!v) broken.push({ path: rel, reason: 'no video stream' });
      else if (!v.width || !v.height) broken.push({ path: rel, reason: 'video stream has no dimensions' });
    }
  } catch (err) {
    // sharp throws "Input file contains unsupported image format" on HTML/garbage
    const msg = (err.message || String(err)).split('\n')[0];
    broken.push({ path: rel, reason: msg });
  }
}

// ─── Check that every src-referenced media path actually exists ──────────────

const sourceFiles = await walk(SRC, (f) => SOURCE_EXTS.has(extname(f).toLowerCase()));
// Trailing \b prevents matching .webm in `.webmanifest` etc.
const refRegex = /["'`(]\/((?:ProjectMedia|design|blog|images|icons|media|ClientWork|favicon|Resume)[^"'`)\s]+?\.(?:png|jpe?g|webp|avif|gif|svg|mp4|webm|mov|pdf))(?=["'`)\s])/gi;
// Skip files where the doc explicitly demonstrates broken/example refs in code blocks
const SKIP_REFS_FOR = new Set(['src/content/blog/CLAUDE.md']);

function stripFences(content, ext) {
  // Markdown / MDX: blank out fenced code blocks (example paths shown as code
  // shouldn't be treated as live references).
  if (ext === '.md' || ext === '.mdx') {
    return content.replace(/```[\s\S]*?```/g, '');
  }
  // JS / TS / Astro: strip // line comments and /* block */ comments so
  // example paths in doc comments aren't reported as missing.
  if (['.ts', '.tsx', '.js', '.jsx', '.astro'].includes(ext)) {
    return content
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/[^\n]*/g, '$1'); // avoid eating http:// in URLs
  }
  return content;
}

for (const sf of sourceFiles) {
  const relSrc = relative(ROOT, sf);
  if (SKIP_REFS_FOR.has(relSrc)) continue;
  const content = stripFences(await readFile(sf, 'utf8'), extname(sf).toLowerCase());
  let m;
  while ((m = refRegex.exec(content)) !== null) {
    const ref = m[1];
    // Skip template literals (paths with ${...} placeholders aren't real)
    if (ref.includes('${')) continue;
    const onDisk = join(PUBLIC, decodeURIComponent(ref));
    try { await stat(onDisk); }
    catch { missing.push({ ref: '/' + ref, source: relSrc }); }
  }
}

// ─── Report ──────────────────────────────────────────────────────────────────

if (broken.length) {
  console.log(`✗ ${broken.length} broken file(s):\n`);
  for (const b of broken) console.log(`  ${b.path}\n    ↳ ${b.reason}`);
  console.log();
}

if (missing.length) {
  // De-dupe (same ref may appear in many source files)
  const uniq = new Map();
  for (const m of missing) {
    if (!uniq.has(m.ref)) uniq.set(m.ref, []);
    uniq.get(m.ref).push(m.source);
  }
  console.log(`✗ ${uniq.size} missing reference(s) (referenced in source but file doesn't exist):\n`);
  for (const [ref, sources] of uniq) {
    console.log(`  ${ref}`);
    for (const s of sources.slice(0, 3)) console.log(`    ↳ ${s}`);
    if (sources.length > 3) console.log(`    ↳ … +${sources.length - 3} more`);
  }
  console.log();
}

if (!broken.length && !missing.length) {
  console.log('✓ All media valid, all references resolve.');
}

process.exit(broken.length || missing.length ? 1 : 0);
