---
title: Personal Blog
description: Feature-rich personal blog built with Astro and React, featuring a WYSIWYG editor, Giscus-powered comments, RSS, sitemap, and automated GitHub Pages deployment.
shortDescription: Astro-powered blog with WYSIWYG editor and SEO
date: 2025-09-16
tags: [Open Source]
tech: [Astro, React, TypeScript, TailwindCSS]
featured: false
type: web
folder: Projects
images: []
status: completed
order: 34
url: https://blog.aryanranderiya.com
github: https://github.com/aryanranderiya/blog
---

My personal blog at [blog.aryanranderiya.com](https://blog.aryanranderiya.com), the second iteration after the older Next.js version, built to be both a good reading experience and a genuinely pleasant authoring environment. The first version was all MDX files committed to a repo; this one adds a live WYSIWYG editor powered by Yoopta Editor so I can draft and edit posts directly in the browser during development without ever touching raw Markdown.

The technical foundation is Astro with React islands, TypeScript throughout, and TailwindCSS. Posts are stored as MDX with a strictly typed frontmatter schema validated by Zod; the build fails fast if a post is missing required fields. Automatic slug generation derives URLs from titles, and reading time is calculated at build time so it never needs to be manually entered. The RSS feed and XML sitemap are auto-generated on every build.

For SEO I implemented canonical URLs, full OpenGraph tags, and JSON-LD structured data on each post. Comments run through Giscus, which maps each post's slug to a GitHub Discussion thread; readers log in with GitHub to comment, which keeps spam near zero without needing a separate auth system. A sticky header with a smooth scroll progress indicator gives readers a sense of where they are in longer pieces.

Deployment is fully automated: GitHub Actions triggers a production build and pushes the output to GitHub Pages on every merge to main. A draft system lets me keep in-progress posts committed without them going live. I also added conventional-commits-based automated releases via release-please, which keeps the changelog clean and the version history meaningful.

The site scored well on Lighthouse; the static-first architecture of Astro means almost no JavaScript ships to the browser unless a component explicitly opts into hydration.
