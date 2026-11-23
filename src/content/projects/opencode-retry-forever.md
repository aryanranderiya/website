---
title: opencode-retry-forever
description: "opencode plugin that retries transient provider failures forever beneath the session runner, and auto-resumes turns that die with an unknown finish reason."
shortDescription: "Never lose a long agent session"
date: 2026-08-22
tech: [TypeScript, Bun, OpenCode]
featured: false
type: tool
folder: Projects
coverImage: /images/projects/opencode-retry-forever/cover.webp
order: 35
github: https://github.com/aryanranderiya/opencode-retry-forever
---

If you leave a fleet of agents running for hours, a single upstream hiccup kills a whole session. opencode's built-in retry gives up after a handful of attempts and then `SessionRunner.drain` throws. This plugin wraps `globalThis.fetch` — the call opencode's request executor ultimately makes — so retries happen below the session runner and the session never learns that anything went wrong.

It retries 408, 409, 425, 429, 500, 502, 503, 504, 520–525 and 527–530, plus thrown network errors in both Node/undici POSIX codes and Bun's own codes (matching only POSIX silently misses every connect failure on Bun). The defaults are a fixed 250ms wait and unlimited attempts: no backoff, no growth. Aborts are never retried, `Retry-After` is honored up to 60 seconds, request bodies are buffered once and replayed verbatim, and every retry is logged so an unlimited loop can never look like a hang.

It also handles turns that die with `finish: "unknown"`. On a genuine mid-stream drop it re-sends your own prompt until the turn completes — 20 consecutive drops recovered on turn 21 in testing — while a zero-token unknown finish, such as an interrupt, denied permission or compaction, is treated as deliberate and left alone. The plugin loads on opencode 1.x and 2.x; on 2.x it uses `setup` and `session.execution.failed` because 2.x keeps provider traffic away from plugin fetch.
