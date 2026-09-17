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
A Model Context Protocol server that gives LLM agents read-only, curated access to WHOOP recovery, sleep, strain, and workout data — OAuth included.

## Tools

- `whoop_overview`: one-call snapshot (recovery + last sleep + today's strain + profile)
- `whoop_recovery`, `whoop_sleep`, `whoop_strain`, `whoop_workouts`: history with trimmed, unit-converted values
- Detail tools for profile, single cycles, sleeps, and workouts
- Strict Zod schemas, hidden pagination, `days` or ISO-8601 ranges (max 25)

## Design notes

Deliberately not a 1:1 REST wrapper: token-efficient responses, no token store (stateless OAuth proxy for WHOOP's limited OAuth 2.0), transform-layer unit tests, strict `tsc --noEmit`, dev inspector UI. Deployable to Manufact Cloud.

## Stack

TypeScript, MCP, Zod, Vitest.
