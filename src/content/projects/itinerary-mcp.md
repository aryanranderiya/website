---
title: Itinerary MCP Server
description: FastAPI travel itinerary backend with MCP integration - lets AI assistants discover, filter, and create travel plans via natural language.
shortDescription: AI travel planner via MCP & FastAPI
date: 2025-04-29
tech: [Python, FastAPI, SQLite, MCP]
featured: false
type: web
folder: Projects
coverImage: /ProjectMedia/Itinerary_MCP/screenshot-1.png
images:
  - /ProjectMedia/Itinerary_MCP/screenshot-1.png
  - /ProjectMedia/Itinerary_MCP/screenshot-2.png
  - /ProjectMedia/Itinerary_MCP/readme-3.webp
  - /ProjectMedia/Itinerary_MCP/readme-4.webp
  - /ProjectMedia/Itinerary_MCP/readme-5.webp
  - /ProjectMedia/Itinerary_MCP/readme-6.webp
  - /ProjectMedia/Itinerary_MCP/readme-7.webp
  - /ProjectMedia/Itinerary_MCP/readme-8.webp
  - /ProjectMedia/Itinerary_MCP/readme-9.webp
order: 18
github: https://github.com/aryanranderiya/itinerary-mcp-server
---

This was a take-home test challenge for an internship. What made it clever was the choice of topic: the Model Context Protocol had just been released and wasn't in any LLM's training data yet, so the company deliberately picked it precisely because no model knew what MCP was. You couldn't just paste the prompt into ChatGPT and get a working answer - you had to actually read the spec, understand how it worked, and write the code yourself. It was their way of filtering for people who can genuinely build rather than just prompt their way through, and honestly it was a refreshing way to be evaluated.

So I went and read the MCP spec from scratch and built this. The Model Context Protocol is a standardized way for language models to discover and invoke tools exposed by a server, and the challenge was to map it onto something as nested as travel itineraries - where a single trip contains accommodations, day-by-day activities, and transfer logistics all at once.

The backend is a FastAPI application with SQLAlchemy models covering the full hierarchy of a travel plan: itineraries as the top-level container, then accommodations and transfers tied to specific date ranges, and individual activities slotted into each day. MCP is integrated using the fastapi_mcp library, and the endpoint runs over Server-Sent Events at /mcp. Any compliant MCP client - Claude Desktop, GitHub Copilot, or a custom integration - can connect via a simple SSE URL with no additional glue code required.

To make the demo immediately useful, I seeded the database with realistic data for Phuket and Krabi, covering trip lengths from two to eight nights across multiple itinerary styles. This gave me concrete data to test against when verifying that an AI assistant could correctly filter by destination, duration, or activity type and return sensible results. Watching Claude reason through a vague prompt like "a week in southern Thailand with beach days" and surface the right structured itinerary was the moment the project clicked as something genuinely useful rather than just a technical exercise.
