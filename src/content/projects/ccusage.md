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
  - /images/projects/ccusage/logo.svg
order: 41
github: https://github.com/aryanranderiya/ccusage
---

`ccusage` reads the local log files left by AI coding CLIs and prints token-usage and dollar-cost tables by day, week, month, or session — offline, no API keys. Upstream (`ccusage/ccusage`) already covers 16+ sources with daily/weekly/monthly/session reports, billing-block views, model breakdowns, cache-token accounting, and JSON output.

This fork extends it for a multi-agent, multi-machine setup, with every addition documented in `FORK.md`:

- **Extra agents**: `prime-agent` (`~/.prime` JSONL sessions), `fx` (Vercel usage ledger), `opencode`/`opencode2` (SQLite `opencode.db` plus legacy JSON, deduped), and `pi` — all rolling into the unified reports with an Agent column.
- **`ccusage sync`**: backs stats up to a private GitHub repo and coalesces every machine's usage (`data/<machine>.json`, conflict-free by construction, `--machine`, `--no-push`).
- **Readability**: magnitude formatting (millions render as `68.44M`, never truncated mid-digit), redundant `[store]` prefixes dropped, plus a `ccusage2` install alias.
- **Counting guarantees**: single-count from authoritative ledgers, message-identity dedupes, all cross-checked against independent tallies of the raw logs.

Before (upstream, captured) vs after (fork — new commands, documented in `FORK.md`):

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

Verified locally against real usage data (Claude, Grok, OpenCode sources all parse; `daily` renders identically where the data overlaps). The one honest caveat: the fork's Rust core means contributions go through `cargo`, not just the TypeScript surface.
