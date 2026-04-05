// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  site: 'https://aryanranderiya.com',
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
        } else if (/\/(blog|projects|resume|now|tools|books|movies|freelance|graphic-design|camera-roll)\/?$/.test(url)) {
          priority = 0.9;
          changefreq = 'weekly';
        } else if (/\/(blog|projects|now|freelance)\//.test(url)) {
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
