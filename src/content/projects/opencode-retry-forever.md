---
title: opencode-retry-forever
description: "opencode plugin that retries transient provider failures forever beneath the session runner, and auto-resumes turns that die with an unknown finish reason."
shortDescription: "Never lose a long agent session"
date: 2026-08-22
tech: [TypeScript, Bun, OpenCode]
featured: false
type: tool
folder: Projects
order: 35
github: https://github.com/aryanranderiya/opencode-retry-forever
---

If you leave a fleet of agents running for hours, a single upstream hiccup kills a whole session. opencode's built-in retry gives up after a handful of attempts and then `SessionRunner.drain` throws. This plugin wraps `globalThis.fetch`, the call opencode's request executor ultimately makes, so retries happen below the session runner and the session never learns that anything went wrong.

It retries 408, 409, 425, 429, 500, 502, 503, 504, 520–525 and 527–530, plus thrown network errors from both Node/undici and Bun. Matching only POSIX codes silently misses connect failures on Bun. Defaults are a fixed 250ms wait and unlimited attempts: no backoff, no growth.

Aborts are never retried, `Retry-After` is honored up to 60 seconds, request bodies are buffered once and replayed on every attempt, and every retry is logged so an unlimited loop never looks like a hang.

It also handles turns that die with `finish: "unknown"`. On a genuine mid-stream drop it re-sends your prompt until the turn completes; in testing, 20 consecutive drops recovered on turn 21. A zero-token unknown finish, such as an interrupt, denied permission or compaction, is treated as deliberate and left alone.

The plugin loads on opencode 1.x and 2.x. On 2.x it uses `setup` and `session.execution.failed` because provider traffic no longer passes through plugin fetch.
