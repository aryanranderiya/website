/**
 * Fetches favicons for skills that don't have devicon entries.
 * Uses Google's favicon API as primary, with a direct site fallback.
 * Run: node scripts/fetch-favicons.mjs
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public', 'icons', 'favicons');

const TARGETS = [
  { name: 'langchain',    domain: 'langchain.com' },
  { name: 'langgraph',    domain: 'langchain.com' },
  { name: 'mcp',          domain: 'modelcontextprotocol.io' },
  { name: 'composio',     domain: 'composio.dev' },
  { name: 'e2b',          domain: 'e2b.dev' },
  { name: 'livekit',      domain: 'livekit.io' },
  { name: 'firecrawl',    domain: 'firecrawl.dev' },
  { name: 'mem0',         domain: 'mem0.ai' },
  { name: 'chromadb',     domain: 'trychroma.com' },
  { name: 'hono',         domain: 'hono.dev' },
  { name: 'pydantic',     domain: 'pydantic.dev' },
];

async function fetchFavicon(domain, size = 64) {
  const url = `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; favicon-fetcher/1.0)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = await res.arrayBuffer();
  // Google returns a 1x1 grey PNG for unknown domains — check size
  if (buf.byteLength < 200) throw new Error(`Too small (${buf.byteLength} bytes) — likely fallback icon`);
  return Buffer.from(buf);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const results = await Promise.allSettled(
    TARGETS.map(async ({ name, domain }) => {
      const outPath = join(OUT_DIR, `${name}.png`);
      const buf = await fetchFavicon(domain);
      await writeFile(outPath, buf);
      console.log(`✓  ${name}.png  ← ${domain}`);
    })
  );

  const failed = results.filter(r => r.status === 'rejected');
  if (failed.length) {
    console.warn(`\n⚠  ${failed.length} failed:`);
    TARGETS.forEach(({ name, domain }, i) => {
      if (results[i].status === 'rejected') {
        console.warn(`   ${name} (${domain}): ${results[i].reason?.message}`);
      }
    });
  }
  console.log('\nDone.');
}

main().catch(err => { console.error(err); process.exit(1); });
