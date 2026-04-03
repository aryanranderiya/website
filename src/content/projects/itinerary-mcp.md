---
title: Itinerary MCP Server
description: FastAPI travel itinerary backend with MCP integration - lets AI assistants discover, filter, and create travel plans via natural language.
date: 2025-03-01
tags: [MCP, AI / ML, FastAPI]
tech: [Python, FastAPI, SQLite, MCP]
featured: false
type: other
folder: Projects
coverImage: /ProjectMedia/Itinerary_MCP/screenshot-1.png
images:
  - /ProjectMedia/Itinerary_MCP/screenshot-1.png
  - /ProjectMedia/Itinerary_MCP/screenshot-2.png
status: completed
order: 18
github: https://github.com/aryanranderiya/itinerary-mcp-server
---

I built this as an exploration into what it would look like to give AI assistants genuine control over a structured travel planning backend. The Model Context Protocol is a standardized way for language models to discover and invoke tools exposed by a server, and I wanted to see how naturally it could map onto something as nested as travel itineraries - where a single trip contains accommodations, day-by-day activities, and transfer logistics all at once.

The backend is a FastAPI application with SQLAlchemy models covering the full hierarchy of a travel plan: itineraries as the top-level container, then accommodations and transfers tied to specific date ranges, and individual activities slotted into each day. MCP is integrated using the fastapi_mcp library, and the endpoint runs over Server-Sent Events at /mcp. Any compliant MCP client - Claude Desktop, GitHub Copilot, or a custom integration - can connect via a simple SSE URL with no additional glue code required.

To make the demo immediately useful, I seeded the database with realistic data for Phuket and Krabi, covering trip lengths from two to eight nights across multiple itinerary styles. This gave me concrete data to test against when verifying that an AI assistant could correctly filter by destination, duration, or activity type and return sensible results. Watching Claude reason through a vague prompt like "a week in southern Thailand with beach days" and surface the right structured itinerary was the moment the project clicked as something genuinely useful rather than just a technical exercise.
