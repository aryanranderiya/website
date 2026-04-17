// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  site: 'https://aryanranderiya.com',
  // Hybrid: every page is prerendered unless it opts out with
  // `export const prerender = false`. Only /api/spotify.json runs as a
  // Cloudflare Pages Function on every request.
  output: 'static',
  adapter: cloudflare({
    imageService: 'compile',
    // Surface CF runtime bindings (env, secrets, KV) inside `astro dev`
    // via miniflare, so the Spotify route can read process secrets locally.
    platformProxy: { enabled: true },
  }),
  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) =>
        !page.includes('/api/') &&
        !page.includes('/f4llout/') &&
        !page.includes('/404'),
      serialize(item) {
        const url = item.url;
        let priority = 0.5;
        let changefreq = /** @type {const} */ ('monthly');

        if (url === 'https://aryanranderiya.com/') {
          priority = 1.0;
          changefreq = 'weekly';
        } else if (/\/(blog|projects|resume|now|tools|books|movies|freelance|graphic-design|camera-roll|agent-convos)\/?$/.test(url)) {
          priority = 0.9;
          changefreq = 'weekly';
        } else if (/\/(projects|now|freelance|agent-convos)\//.test(url)) {
          priority = 0.8;
          changefreq = 'monthly';
        } else if (/\/blog\//.test(url)) {
          // Legacy /blog/:slug URLs — still generated, lower priority
          priority = 0.6;
          changefreq = 'monthly';
        } else if (/^https:\/\/aryanranderiya\.com\/[^/]+\/?$/.test(url) && !/\/(blog|projects|resume|now|tools|books|movies|freelance|graphic-design|camera-roll|agent-convos)\/?$/.test(url)) {
          // Root-level blog post URLs (e.g. /job)
          priority = 0.8;
          changefreq = 'monthly';
        }

        return { ...item, priority, changefreq };
      },
    }),
  ],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  image: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.githubusercontent.com' },
      { protocol: 'https', hostname: '**.spotify.com' },
      { protocol: 'https', hostname: 'i.scdn.co' },
      { protocol: 'https', hostname: '**.imdb.com' },
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: 'covers.openlibrary.org' },
      { protocol: 'https', hostname: 'books.google.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'pbs.twimg.com' },
    ],
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@icons': fileURLToPath(new URL('./src/components/icons/index.ts', import.meta.url)),
      },
    },
    optimizeDeps: {
      exclude: ['@mlc-ai/web-llm'],
    },
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});
