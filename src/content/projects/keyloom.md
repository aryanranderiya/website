---
title: Keyloom
description: Open-source library of 40+ animated video scenes plus a browser studio to assemble them — every scene a copy-pasteable React component, built on Remotion.
shortDescription: Animated video primitives + studio
date: 2026-05-08
tech: [TypeScript, React, Next.js, Remotion, Tailwind CSS]
featured: false
type: web
folder: Projects
coverImage: /images/projects/keyloom/studio.webp
images:
  - /images/projects/keyloom/studio.webp
  - /images/projects/keyloom/components.webp
  - /images/projects/keyloom/clapperboard.webp
order: 40
url: https://keyloom.app
github: https://github.com/theexperiencecompany/keyloom
---

Keyloom is an open-source library of 40+ high-quality animated video scenes where each scene is a single copy-pasteable React component — text animations, animated charts (bar, line, area, pie, radar, radial), chat mockups (iMessage, WhatsApp, Slack, Discord, Telegram, Instagram), tweets, phone and laptop frames, pricing and testimonial cards, terminals, QR codes, even a GitHub star button.

On top sits a browser-based Studio for stitching scenes on a timeline: per-clip styling and transitions (fade, swipe, zoom), stackable effects (fade-out, slide-out, Ken Burns), project save/load as JSON, MP4 export, a Whisper-powered captions editor, and a split-screen maker. The library and Studio share one scene registry, so docs previews drop straight onto the timeline with no SDK or install step.

It supports two workflows: human-driven (pick scenes, tweak props in the Inspector, export) and agent-driven — AI coding agents compose the typed scene components directly (a `TitlePopup → Terminal → BarChart → Toast → LogoCloud` chain renders a SaaS launch reel), with a local stdio MCP server for tool use. Built with the Experience Company (GAIA) ecosystem: Next.js 16, React 19, Tailwind 4, shadcn/ui, Remotion 4, FFmpeg.wasm, and a Bun + Turborepo monorepo (`apps/web`, `apps/remotion`, `packages/ui`).
