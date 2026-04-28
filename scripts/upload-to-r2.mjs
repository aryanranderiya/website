#!/usr/bin/env node
/**
 * upload-to-r2.mjs
 *
 * Uploads design, project, and blog media from public/ to Cloudflare R2,
 * then patches all source-file references to use the CDN URL.
 *
 * Usage:
 *   pnpm exec wrangler login          # one-time auth
 *   node scripts/upload-to-r2.mjs            # dry run (shows what will happen)
 *   node scripts/upload-to-r2.mjs --upload   # upload files
 *   node scripts/upload-to-r2.mjs --patch    # patch source references
 *   node scripts/upload-to-r2.mjs --upload --patch          # both
 *   node scripts/upload-to-r2.mjs --upload --patch --delete # + delete from public/
 */

import { readdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const ROOT     = fileURLToPath(new URL('..', import.meta.url));
const PUBLIC   = join(ROOT, 'public');
const SRC      = join(ROOT, 'src');

const BUCKET     = 'website';
const CDN_ORIGIN = 'https://cdn.aryanranderiya.com';

// Directories under public/ to migrate
const MIGRATE_DIRS = ['design', 'ProjectMedia', 'blog'];

// Extensions to upload
const MEDIA_EXTS = new Set([
  '.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.svg',
  '.mp4', '.webm', '.mov', '.pdf',
]);

const CONTENT_TYPES = {
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.mp4':  'video/mp4',
  '.webm': 'video/webm',
  '.mov':  'video/quicktime',
  '.pdf':  'application/pdf',
};

const SOURCE_EXTS = new Set(['.astro', '.tsx', '.ts', '.jsx', '.js', '.mdx', '.md', '.json']);

const args   = process.argv.slice(2);
const upload = args.includes('--upload');
const patch  = args.includes('--patch');
const del    = args.includes('--delete');

if (!upload && !patch) {
  console.log('Dry run — pass --upload and/or --patch to act.\n');
}

async function walk(dir, exts) {
  const out = [];
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); }
  catch { return out; }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(full, exts));
    else if (!exts || exts.has(extname(e.name).toLowerCase())) out.push(full);
  }
  return out;
}

// ─── Collect files ───────────────────────────────────────────────────────────

const files = (
  await Promise.all(MIGRATE_DIRS.map(d => walk(join(PUBLIC, d), MEDIA_EXTS)))
).flat();

console.log(`Found ${files.length} files in ${MIGRATE_DIRS.join(', ')}\n`);

// ─── Upload ──────────────────────────────────────────────────────────────────

if (upload) {
  let done = 0;
  for (const f of files) {
    const key  = relative(PUBLIC, f);          // e.g. design/headers/foo.jpg
    const ext  = extname(f).toLowerCase();
    const ct   = CONTENT_TYPES[ext] ?? 'application/octet-stream';

    process.stdout.write(`[${++done}/${files.length}] ${key} … `);
    try {
      execSync(
        `pnpm exec wrangler r2 object put ${BUCKET}/${key} --file="${f}" --content-type="${ct}"`,
        { cwd: ROOT, stdio: 'pipe' }
      );
      console.log('✓');
    } catch (err) {
      console.log('✗');
      console.error('  ', err.stderr?.toString().trim() ?? err.message);
    }
  }
  console.log(`\nUploaded ${done} files to ${BUCKET}\n`);
}

// ─── Patch source references ─────────────────────────────────────────────────

if (patch) {
  const srcFiles = await walk(SRC, SOURCE_EXTS);
  let patchedFiles = 0;
  let patchedRefs  = 0;

  for (const sf of srcFiles) {
    let content = await readFile(sf, 'utf8');
    let changed = false;

    for (const dir of MIGRATE_DIRS) {
      // Match both "/dir/..." and "dir/..." (without leading slash, e.g. in mdx frontmatter)
      const patterns = [
        { from: new RegExp(`(["'\`(])\/${dir}\/`, 'g'), to: `$1${CDN_ORIGIN}/${dir}/` },
        { from: new RegExp(`(src|href)="(\/${dir}\/)`, 'g'), to: `$1="${CDN_ORIGIN}/${dir}/` },
      ];

      for (const { from, to } of patterns) {
        const next = content.replace(from, (m) => {
          patchedRefs++;
          return m.replace(new RegExp(`\/${dir}\/`), `${CDN_ORIGIN}/${dir}/`);
        });
        if (next !== content) { content = next; changed = true; }
      }
    }

    if (changed) {
      await writeFile(sf, content, 'utf8');
      patchedFiles++;
      console.log(`Patched: ${relative(ROOT, sf)}`);
    }
  }

  console.log(`\nPatched ${patchedRefs} references across ${patchedFiles} source files.\n`);
}

// ─── Delete from public/ ─────────────────────────────────────────────────────

if (del) {
  if (!upload) {
    console.warn('⚠ --delete without --upload skipped (upload first).');
  } else {
    let deleted = 0;
    for (const f of files) {
      await unlink(f).catch(() => {});
      deleted++;
    }
    console.log(`Deleted ${deleted} files from public/\n`);
  }
}

if (!upload && !patch) {
  const totalBytes = files.reduce((s, _) => s, 0);
  for (const f of files.slice(0, 20)) {
    console.log(' ', relative(PUBLIC, f));
  }
  if (files.length > 20) console.log(`  … and ${files.length - 20} more`);
  console.log('\nRun with --upload to push to R2, --patch to update source refs, --delete to remove from public/.');
}
