---
title: GAIA UI
description: An open-source, shadcn-style component registry and design system for building AI-assistant interfaces - chat bubbles, model selectors, tool-call sections, and rich cards.
shortDescription: Open-source AI-assistant design system & component registry
date: 2025-11-04
tech: [Next.js, React, TypeScript, TailwindCSS, Framer Motion]
featured: false
type: web
folder: Projects
coverImage: /ProjectMedia/GAIA_UI/gaia-ui-7.webp
images:
  - /ProjectMedia/GAIA_UI/gaia-ui-7.webp
  - /ProjectMedia/GAIA_UI/gaia-ui-2.webp
  - /ProjectMedia/GAIA_UI/gaia-ui-3.webp
  - /ProjectMedia/GAIA_UI/gaia-ui-4.webp
  - /ProjectMedia/GAIA_UI/gaia-ui-5.webp
  - /ProjectMedia/GAIA_UI/gaia-ui-6.webp
order: 4
url: https://ui.heygaia.io
github: https://github.com/theexperiencecompany/gaia-ui
---

GAIA UI is the open-source design system we built at The Experience Company to standardize how AI-assistant interfaces get built - both inside GAIA and for anyone else building conversational products. Rather than shipping a runtime npm dependency that locks consumers into our versioning, it follows the shadcn model: a registry of components you install with a CLI (`npx @heygaia/ui add <component>`) that copies the actual source into your project, so you own and can freely modify every line.

The hard part of an AI-assistant UI isn't the buttons - it's the conversational surface. So the library leans into that: message bubbles, a chat composer, model selectors, tool-call and reasoning sections, file dropzones, and rich result cards (weather, goals, notifications) sit alongside the usual primitives. Around 30 components are documented, each with a live Preview/Code tab on the docs site so you can see the rendered component and copy its source in the same view.

It's a Next.js 16 app on the App Router with Tailwind v4, Radix primitives, and Framer Motion for the interaction polish, with the docs authored in MDX and component demos rendered live. It's published publicly on npm under the MIT license, builds through the shadcn registry tooling, and deploys to Cloudflare Workers via OpenNext. The package is `@heygaia/ui`, live at ui.heygaia.io.
