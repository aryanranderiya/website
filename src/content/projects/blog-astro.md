---
title: Personal Blog Astro
description: Feature-rich personal blog built with Astro, React, and TailwindCSS - WYSIWYG editor, Giscus comments, RSS, sitemap, automated releases, and a near-perfect Lighthouse score.
shortDescription: Astro-powered blog with WYSIWYG editor and SEO
date: 2025-09-16
tags: [Open Source]
tech: [Astro, React, TypeScript, TailwindCSS]
featured: false
type: web
folder: Projects
coverImage: /ProjectMedia/Personal_Blog_Astro/screenshot.webp
images:
  - /ProjectMedia/Personal_Blog_Astro/screenshot.webp
  - /ProjectMedia/Personal_Blog_Astro/pagespeed.webp
status: completed
order: 34
url: https://blog.aryanranderiya.com
github: https://github.com/aryanranderiya/blog
---

My personal blog at [blog.aryanranderiya.com](https://blog.aryanranderiya.com), the second iteration after the older Next.js version, built to be both a good reading experience and a genuinely pleasant authoring environment. The first version was all MDX files committed to a repo; this one adds a live WYSIWYG editor powered by Yoopta Editor so I can draft and edit posts directly in the browser during development without ever touching raw Markdown.

The technical foundation is Astro with React islands, TypeScript throughout, and TailwindCSS. Posts are stored as MDX with a strictly typed frontmatter schema validated by Zod; the build fails fast if a post is missing required fields. Automatic slug generation derives URLs from titles, and reading time is calculated at build time so it never needs to be manually entered. The RSS feed and XML sitemap are auto-generated on every build.

For SEO I implemented canonical URLs, full OpenGraph tags, and JSON-LD structured data on each post. Comments run through Giscus, which maps each post's slug to a GitHub Discussion thread; readers log in with GitHub to comment, which keeps spam near zero without needing a separate auth system. A sticky header with a smooth scroll progress indicator gives readers a sense of where they are in longer pieces.

Built-in tooling makes authoring fast: a draft system lets me keep in-progress posts committed without them going live, social sharing buttons cover Twitter, Facebook, LinkedIn, Reddit, WhatsApp, and email out of the box, and there's an export option for any post to plain Markdown, HTML, or text. Dark and light themes, mobile-first responsive design, and conventional-commits-based automated releases via release-please round out the developer ergonomics.

Deployment is fully automated: GitHub Actions triggers a production build and pushes the output to GitHub Pages on every merge to main. The site scored near-perfect on Lighthouse; the static-first architecture of Astro means almost no JavaScript ships to the browser unless a component explicitly opts into hydration.
