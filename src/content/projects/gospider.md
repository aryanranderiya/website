---
title: GoSpider
description: High-performance concurrent web crawler in Go that converts thousands of web pages to Markdown in minutes.
date: 2025-02-01
tags: [Go, Web Scraping]
tech: [Go]
featured: false
type: cli
folder: Projects
coverImage: /ProjectMedia/GoSpider/screenshot-1.png
images:
  - /ProjectMedia/GoSpider/screenshot-1.png
  - /ProjectMedia/GoSpider/screenshot-2.png
status: completed
order: 18
github: https://github.com/aryanranderiya/GoSpider
---

I built GoSpider because I needed to crawl and convert large documentation sites to Markdown quickly, and nothing I found was fast enough to be practical. The result was a high-performance, concurrent web crawler written in Go that implemented a producer-consumer architecture around Go's core concurrency primitives - goroutines, buffered channels, and thread-safe maps.

The architecture centered on a 10,000-URL buffered queue that fed a configurable pool of worker goroutines, each independently fetching pages, extracting links, and converting HTML to Markdown. I paired this with a singleton HTTP client that maintained up to 500 connections per host, which kept throughput high even when hitting the same domain repeatedly. A separate pool of 16 dedicated file-writer goroutines with 1MB buffers handled all disk I/O in parallel, reducing filesystem overhead significantly.

I added proxy rotation with automatic validation and fallback to direct connections, domain-based rate limiting, and URL deduplication via in-memory hash maps for O(1) lookup. The crawler also extracted URLs from both the raw HTML and the converted Markdown output, which caught links that would otherwise be missed. Real-time monitoring reported URLs per second, queue depth, domain coverage, and success rates as the crawl ran.

In practice, I was able to crawl and convert 100,000 URLs - parsing pages to Markdown and downloading assets - in under half an hour. The tool installs with a single `go install` command and exposes flags for worker count, domain and URL limits, proxy usage, image downloading, and verbosity, making it straightforward to tune for anything from a small site audit to a large-scale archiving job.
