---
title: IEEE CS Club Website
description: Official website for the IEEE Computer Society chapter at PDEU, with events showcase, committee profiles, photo gallery, membership info, and FAQ, built with Astro and TypeScript.
shortDescription: IEEE CS Club PDEU official website in Astro
date: 2025-04-16
tags: [Community, Education]
tech: [Astro, TypeScript, TailwindCSS]
featured: false
type: web
folder: Projects
images: []
status: completed
order: 37
github: https://github.com/aryanranderiya/ieeecs-website
---

I built the official website for the IEEE Computer Society chapter at Pandit Deendayal Energy University. The site is a single-page Astro application with distinct sections for everything the club needed to communicate publicly: a hero, an about section, a past events showcase, a photo gallery, committee member profiles, membership information, a contact form, and an FAQ.

I chose Astro for the same reasons I'd recommend it for any content-heavy static site: pages ship as HTML by default with near-zero JavaScript, which keeps load times fast without any manual optimization work. TypeScript runs throughout the project, which was also a deliberate choice for a codebase that multiple club members would contribute to over time; the types act as in-code documentation and catch mistakes before they ship.

The gallery section pulls from a set of compressed WebP images from club events, covering workshops on DSA, generative AI, IoT, Git, and web development. Committee profiles are rendered from a structured data source so updating members for a new term is a matter of editing data rather than touching component code. The events section follows the same pattern: adding a new event means adding an entry to a data file, not modifying markup.

The project was set up with contribution in mind from the start, with clear branch naming conventions, commit message standards, and local setup documentation to lower the barrier for club members who weren't regular contributors.
