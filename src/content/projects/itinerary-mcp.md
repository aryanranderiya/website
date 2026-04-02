---
title: Itinerary MCP Server
description: FastAPI travel itinerary backend with MCP integration - lets AI assistants discover, filter, and create travel plans via natural language.
date: 2025-03-01
tags: [Python, FastAPI, MCP]
tech: [Python, FastAPI, SQLAlchemy, SQLite, MCP]
featured: false
type: other
folder: Projects
images: []
status: completed
order: 18
github: https://github.com/aryanranderiya/itinerary-mcp-server
---

A FastAPI backend for managing travel itineraries with Model Context Protocol integration. The idea is that AI assistants like Claude or GitHub Copilot can connect to it and discover, filter, and create travel plans through natural language.

It has SQLAlchemy models for itineraries, accommodations, transfers, and activities. Comes with seed data for Phuket and Krabi with recommended itineraries from 2 to 8 nights. The MCP endpoint runs over SSE and is compatible with any MCP client. Built this as an exploration into what MCP-powered travel planning could look like.
