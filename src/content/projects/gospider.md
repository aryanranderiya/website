---
title: GoSpider
description: High-performance concurrent web crawler in Go that converts thousands of web pages to Markdown in minutes.
date: 2025-02-01
tags: [Go, CLI]
tech: [Go, Concurrency, HTTP]
featured: false
type: other
folder: Projects
images: []
status: completed
order: 18
github: https://github.com/aryanranderiya/GoSpider
---

A web crawler built in Go with a producer-consumer architecture. It extracts URLs, downloads content, and converts web pages to Markdown at scale. The whole thing is designed around Go's concurrency primitives - goroutines, channels, and thread-safe maps.

You can configure worker pools from 1 to 1000+, it does connection pooling at 500 per host, has a 10,000-URL buffer queue, and 16 dedicated file writers. It also handles URL deduplication, proxy rotation with validation, and domain-based rate limiting. Install it with a single `go install` command. I built this because I needed to crawl and convert a lot of documentation pages quickly, and nothing existing was fast enough.
