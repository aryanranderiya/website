---
title: ccusage (fork)
description: Terminal token-usage tracker for AI coding CLIs, extended with prime-agent, fx, opencode2 and pi parsers, magnitude formatting, and multi-machine GitHub sync.
shortDescription: Extended CLI usage + cost tracker
date: 2026-08-21
tech: [TypeScript, Rust, SQLite, Node.js]
featured: false
type: cli
folder: Projects
coverImage: /images/projects/ccusage/screenshot.webp
images:
  - /images/projects/ccusage/screenshot.webp
order: 41
github: https://github.com/aryanranderiya/ccusage
---
`ccusage` reads the local logs left by AI coding CLIs and prints token-usage and cost tables — offline, no API keys. This fork extends it for a multi-agent, multi-machine setup.

## What the fork adds

- **More agents**: `prime-agent`, `fx` (Vercel), `opencode`/`opencode2` (SQLite + JSON, deduped), `pi` — all inside the unified reports
- **`ccusage sync`**: backup and multi-machine coalescing via a private GitHub repo
- **Readability**: magnitude formatting (`68.44M`, never truncated mid-digit), cleaner labels, `ccusage2` alias
- **Counting guarantees**: single-count ledgers, message-identity dedupes, cross-checked against raw logs

## Before / after (same machine)

```text
$ ccusage sync
Unknown command 'sync'
Run 'ccusage --help' for usage.
```

```text
$ ccusage sync --repo <you>/ccusage-sync   # fork only: parse → push → pull → merged report
$ ccusage fx daily                         # fork only: Vercel ledger agent
$ ccusage prime daily                      # fork only: prime-agent sessions
```

Upstream output renders identically where the data overlaps (verified locally); the fork's full internals are documented in its `FORK.md`.

## Stack

TypeScript + Rust core (JSONL/SQLite parsing), pnpm monorepo, Nix distribution.
