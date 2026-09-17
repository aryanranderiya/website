---
title: astro-doctor
description: Deterministic static analysis for Astro — 42 rules across islands, hydration, SSR, security, and performance. No LLM, no network; every finding ships file, line, and fix recipe.
shortDescription: Deterministic Astro linter for humans and agents
date: 2026-09-15
tech: [JavaScript, Node.js, WASM, Astro]
featured: false
type: cli
folder: Projects
coverImage: /images/projects/astro-doctor/cover.svg
images:
  - /images/projects/astro-doctor/cover.svg
order: 38
github: https://github.com/aryanranderiya/astro-doctor
---
Your agent writes bad Astro. astro-doctor catches it — deterministically, with no LLM and no network.

## Features

- 42 rules across islands/hydration, data-fetching, SSR, performance, security, and maintainability
- Every finding ships file, line, and a fix recipe — built for agent fix-loops
- CLI (`--json`, `--verbose`), programmatic API, and a CI gate (exit 1 on errors)
- Agent skill bundle for Claude Code, Cursor, Codex, and OpenCode
- Config file, per-line suppressions with reasons, health score + top offenders

## How it's built

Template structure comes from a compiler-backed Document IR (`@astrojs/compiler`, scanner fallback); frontmatter JavaScript goes through a single-pass lexer. Correctness is enforced structurally: length-preservation invariants, a 200-mutant fuzz run over every rule, and agreement + metamorphic property suites.

## Notes

The cover reproduces its real first run on this site (16 errors, 41 warnings) — which became the 100/100 cleanup documented across the following releases.
