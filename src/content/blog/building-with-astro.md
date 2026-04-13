---
title: Why I Switched Everything to Astro
description: After years of Next.js, here's why Astro 5 changed how I think about building websites.
date: 2024-11-15
tags: [astro, web, performance]
category: engineering
featured: true
cover: https://heygaia.io/og-image.webp
---

Astro's island architecture is genuinely one of the best ideas in frontend development. You get the DX of React but ship HTML. Here's what I've learned building with it.

## The Zero-JS Default

The most radical thing about Astro is that JavaScript is opt-in. Components only ship JS when you explicitly say so with `client:load`, `client:visible`, etc.

For a content-heavy site, this means:
- Instant page loads
- No hydration cost
- Better SEO out of the box

## View Transitions

Astro 5's built-in View Transitions API support is incredible. One import and your site feels like an SPA without the downsides.

## Content Collections

Type-safe markdown with Zod schemas. No more wondering if your frontmatter is correct.
