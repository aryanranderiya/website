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

Your agent writes bad Astro. astro-doctor catches it.

astro-doctor deterministically scans an Astro codebase for issues across islands and hydration, data-fetching and prerendering, performance, security, correctness, and maintainability. It exists for the exact failure mode AI coding agents produce: confident, plausible Astro that silently misuses `client:*` directives, leaks server-only code to the browser, or breaks under ClientRouter navigation. No LLM judging, no network calls — 42 AST/regex rules, each emitting file, line, and a fix recipe.

It runs three ways: a CLI (`astro-doctor [dir]`, with `--json` for machines, `--fast` and `--cache` for iteration), a programmatic API (`scanDir`), and a CI gate (`astro-doctor ci install` writes the GitHub Actions workflow; exit code 1 on any error). A `doctor.config.mjs` tunes severities and ignore globs, and findings suppress explicitly with reasoned comments — no allowlists. It also ships an agent skill (`skills/astro-doctor/SKILL.md`) so Claude Code, Cursor, Codex, or OpenCode can run it, read the JSON, and apply fixes in a loop.

Under the hood, template structure comes from a compiler-backed Document IR (`@astrojs/compiler`, with a quote-aware scanner fallback), frontmatter JavaScript goes through a single-pass lexer, and correctness is enforced structurally: length-preservation invariants, a 200-mutant fuzz run over every rule, CLI exit-code and JSON-shape tests, and compiler/scanner agreement plus metamorphic property suites. On my own portfolio it went from 16 errors and 41 warnings to a clean 100/100 — and along the way caught two production 404s (a default social image and a manifest icon that didn't exist).

The cover above reproduces its actual first run on this site: 16 errors, 41 warnings, score 26/100.
