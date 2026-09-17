---
title: whoop-mcp
description: MCP server giving LLM agents read-only, curated access to WHOOP recovery, sleep, strain, and workout data — OAuth included, token-efficient by design.
shortDescription: WHOOP data MCP server for agents
date: 2026-06-28
tech: [TypeScript, MCP, Zod, Vitest]
featured: false
type: cli
folder: Projects
images:
  - /images/projects/whoop-mcp/favicon.webp
order: 42
github: https://github.com/aryanranderiya/whoop-mcp
---

`whoop-mcp` is a Model Context Protocol server that exposes WHOOP wearable data — recovery, sleep, strain, workouts, profile and body metrics — to LLM agents. It is deliberately not a 1:1 REST wrapper: one major context tool (`whoop_overview`) returns a whole snapshot, responses are trimmed and unit-converted (minutes and hours instead of raw seconds, kcal where it matters), inputs and outputs carry strict Zod schemas, and internal pagination stays hidden to save round-trips and context.

History tools take `days` or explicit ISO-8601 `start`/`end` plus `limit` (max 25): recovery percentage with HRV, resting HR, SpO2 and skin temperature; sleep performance, efficiency and consistency with stage minutes and respiratory rate; daily strain on the 0–21 scale with heart-rate zones; workouts with sport, strain, distance, and calories. Detail tools cover profile, single cycles, sleeps, and workouts.

Authentication bridges WHOOP's OAuth 2.0 (which lacks dynamic client registration and PKCE-S256) through an OAuth proxy with compliant metadata, staying stateless with no token store. The transform layer carries unit tests (`vitest`), strict `tsc --noEmit`, and an `/inspector` dev UI — and it's deployable to Manufact Cloud, where it also runs live.
