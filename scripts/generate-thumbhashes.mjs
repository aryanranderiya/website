/**
 * Generates thumbhashes for all design images.
 * Run locally with: node scripts/generate-thumbhashes.mjs
 * Commit the output (src/data/design-thumbhashes.json) — Cloudflare Pages
 * reads the committed file and never needs to run this script.
 *
 * Re-run whenever you add new images to public/design/.
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { rgbaToThumbHash } from 'thumbhash';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const DESIGN_DIR = join(ROOT, 'public', 'design');
const OUT_FILE = join(ROOT, 'src', 'data', 'design-thumbhashes.json');

// thumbhash works best at small sizes — 100px max keeps quality high
// while keeping encoding fast and the hash accurate
const MAX_PX = 100;

async function getImageFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getImageFiles(full));
    } else if (/\.(webp|png|jpg|jpeg|avif)$/i.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

async function hashImage(filePath) {
  const { data, info } = await sharp(filePath)
    .resize(MAX_PX, MAX_PX, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const hash = rgbaToThumbHash(info.width, info.height, new Uint8Array(data));
  return Buffer.from(hash).toString('base64');
}

async function main() {
  const files = await getImageFiles(DESIGN_DIR);
  console.log(`Found ${files.length} images — generating thumbhashes...`);

  const map = {};
  const results = await Promise.allSettled(
    files.map(async (filePath) => {
      const key = relative(join(ROOT, 'public'), filePath).replace(/\\/g, '/');
      const hash = await hashImage(filePath);
      map[key] = hash;
      process.stdout.write('.');
    })
  );

  console.log('');

  const failed = results.filter(r => r.status === 'rejected');
  if (failed.length > 0) {
    console.warn(`⚠ ${failed.length} images failed:`);
    failed.forEach(r => console.warn(' ', r.reason?.message));
  }

  await writeFile(OUT_FILE, JSON.stringify(map, null, 2) + '\n');
  console.log(`✓ Wrote ${Object.keys(map).length} hashes → src/data/design-thumbhashes.json`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
