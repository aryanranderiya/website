---
title: Bluelion Engineering
description: Freelance marketing site for a Philadelphia structural engineering firm - an animation-driven landing experience with a project portfolio, services breakdown, and a CMS-backed admin dashboard.
shortDescription: Freelance site for a structural engineering firm
date: 2025-09-04
tech: [Next.js, React, TypeScript, TailwindCSS, Framer Motion, MongoDB]
featured: false
type: web
folder: Client
coverImage: /ProjectMedia/Blue_Lions/bluelions-1.webp
images:
  - /ProjectMedia/Blue_Lions/bluelions-1.webp
  - /ProjectMedia/Blue_Lions/bluelions-2.webp
  - /ProjectMedia/Blue_Lions/bluelions-3.webp
  - /ProjectMedia/Blue_Lions/bluelions-4.webp
  - /ProjectMedia/Blue_Lions/bluelions-5.webp
  - /ProjectMedia/Blue_Lions/bluelions-6.webp
  - /ProjectMedia/Blue_Lions/bluelions-7.webp
  - /ProjectMedia/Blue_Lions/bluelions-8.webp
order: 28
---

A freelance project for Bluelion Engineering (BLE Consultants), a structural engineering firm based in Philadelphia serving clients across New York, New Jersey, Pennsylvania, and Connecticut. They specialize in wood design, cold-formed steel structural systems, and licensed special inspections for architects, developers, and contractors - and they needed a site that conveyed engineering credibility while still feeling modern.

The front of the site is an animation-driven marketing experience: a steel-truss hero, a clear services breakdown across their three core offerings, and a project portfolio showcasing real residential and commercial work with an interactive previous-work list, an about and mission section, and a leadership profile for the principal engineer. Motion is handled with Framer Motion, GSAP with ScrollTrigger, and Lenis smooth scrolling, tuned so the scroll feels deliberate rather than gimmicky - the kind of polish that signals the firm takes precision seriously.

Behind it is a full content management layer. Rather than hardcoding the portfolio, I built a Next.js admin dashboard backed by MongoDB with image uploads through UploadThing, so the team can add new projects, case studies, and imagery without touching code. The whole thing is a Next.js 15 App Router application with React 19, Tailwind v4, Radix primitives, and Leaflet maps for location context - structured so the marketing site stays fast and static while the editable content stays genuinely editable.
