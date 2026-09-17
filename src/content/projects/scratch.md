---
title: Scratch
description: Minimal markdown scratchpad for macOS — Notion-style editing, GitHub PR linking with @-mentions, and automatic git sync to your own repo.
shortDescription: Markdown scratchpad with PR linking
date: 2026-08-07
tech: [TypeScript, React, Rust, Tauri, Tailwind CSS]
featured: false
type: desktop
folder: Projects
coverImage: /images/projects/scratch/notes.webp
images:
  - /images/projects/scratch/notes.webp
  - /images/projects/scratch/kanban.webp
order: 39
github: https://github.com/aryanranderiya/scratch
---
<img src="/images/projects/scratch/icon.png" alt="Scratch app icon" width="72" height="72" style="border-radius:18px;width:72px;height:72px" />

A minimal markdown scratchpad that lives in the corner of your screen — between heavy tools like Obsidian and macOS Stickies, which has neither markdown nor sync.

## Features

- Notion-style block editor (`/` commands, headings, callouts, task lists) via TipTap
- `@`-mention search over open PRs across your repos and orgs, sorted by CI readiness
- One-click PR QA checklists and a kanban triage board with drag and drop
- Plain `.md` vault with YAML frontmatter — grep-able, portable, no lock-in
- Auto git sync: commit, fast-forward, and push to your own repo every few minutes

## Stack

React 19, TypeScript, Tailwind v4, Zustand up front; Tauri v2 + Rust (`git2`, `reqwest`) behind. Tested with Playwright (mocked IPC) and `cargo test`; installers built by CI per git tag.
