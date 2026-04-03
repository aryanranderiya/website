---
title: Blog (Next.js)
description: Full-featured blogging platform with static generation, Markdown support, comments, and SEO - my old blog before switching to Astro.
date: 2024-02-01
tags: [Blog, Next.js]
tech: [Next.js, TypeScript, TailwindCSS, SQLite]
featured: false
type: web
folder: Projects
coverImage: /ProjectMedia/Pesronal_Blog/blog_project_banner.png
images:
  - /ProjectMedia/Pesronal_Blog/blog_project_banner.png
  - /ProjectMedia/Pesronal_Blog/screenshot-1.png
  - /ProjectMedia/Pesronal_Blog/screenshot-2.png
  - /ProjectMedia/Pesronal_Blog/screenshot-3.png
  - /ProjectMedia/Pesronal_Blog/screenshot-4.png
status: completed
order: 19
url: https://blog.aryanranderiya.com
github: https://github.com/aryanranderiya/Blog-Next.js
---

This was my personal blogging platform before I rebuilt it in Astro, and it served as my primary writing space for a good stretch of time. I wanted full ownership over the reading experience rather than fitting into someone else's platform, and Next.js was the right tool to do that without sacrificing speed.

The platform uses both Static Site Generation and Incremental Static Regeneration, so pages loaded fast and new content could go live without a full rebuild. Posts are authored in Markdown, which kept the writing workflow clean, and the site generates a table of contents automatically for longer articles so readers can jump around without scrolling. I wired up full-text search so nothing gets buried, and page analytics to give me an honest read of what people were actually spending time on.

Reader interactivity was something I cared about. Comments are backed by a SQLite database rather than a third-party embed, which kept everything under one roof and didn't require readers to sign up for an external service. Social sharing is built in, and I tuned the SEO metadata carefully - open graph tags, structured data, canonical URLs - so posts had a reasonable shot at being discovered.

Both dark and light mode are fully implemented, the layout is responsive across all screen sizes, and the whole thing is deployed on Vercel where ISR works exactly as expected. I eventually moved to Astro when I wanted something more stripped-down for content delivery, but this project is where I learned how static generation actually behaves in a real production scenario.
