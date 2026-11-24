---
title: ccusage2 (fork)
description: "A fork of ccusage for multi-agent, multi-machine setups: prime-agent, fx, opencode and pi parsers, GitHub sync, magnitude formatting and the ccusage2 alias."
shortDescription: "Multi-agent, multi-machine ccusage fork"
date: 2026-08-21
tech: [TypeScript, Rust, SQLite, Node.js]
featured: false
type: tool
folder: Projects
coverImage: /images/projects/ccusage/fork-daily.webp
order: 41
github: https://github.com/aryanranderiya/ccusage2
---

This is a fork of [ccusage](https://github.com/ccusage/ccusage). Upstream already prints token-usage and dollar-cost tables for 16+ AI coding CLIs, offline and without API keys. The fork adds the sources and workflow I needed to run a fleet of agents across machines; the command and npm package are still `ccusage`.

## What this fork adds

- **Extra agents**: `prime-agent` (`~/.prime` JSONL sessions), `fx` (Vercel usage ledger), `opencode`/`opencode2` (SQLite `opencode.db` plus legacy JSON, deduped), and `pi` — all rolling into the unified reports with an Agent column.
- **`ccusage sync`**: backs stats up to a private GitHub repo and coalesces every machine's usage (`data/<machine>.json`, conflict-free by construction, `--machine`, `--no-push`).
- **Readability**: magnitude formatting (millions render as `68.44M`, never truncated mid-digit), redundant `[store]` prefixes dropped, plus a `ccusage2` install alias.
- **Counting guarantees**: single-count from authoritative ledgers, message-identity dedupes, all cross-checked against independent tallies of the raw logs.

Verified locally against real usage data (Claude, Grok and OpenCode sources all parse; `daily` renders identically where the data overlaps). The fork keeps upstream's Rust core, so changes go through `cargo` as well as the TypeScript surface.
