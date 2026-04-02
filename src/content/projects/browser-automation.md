---
title: Browser Automation
description: Natural language browser automation platform - describe what you want done on the web, and it does it.
date: 2025-01-01
tags: [Python, FastAPI, Next.js]
tech: [Python, FastAPI, Next.js, TypeScript]
featured: false
type: web
folder: Projects
images: []
status: completed
order: 15
github: https://github.com/aryanranderiya/browser-automation
---

I built this for CrustData as an exploration into what browser automation looks like when you strip away all the scripting overhead and let plain English do the work instead. The idea was simple: describe what you want done on the web, and the platform figures out how to do it - handling sequencing and execution without you writing a single line of automation code.

The FastAPI backend handled everything from persistent browser session management to captcha detection and content extraction. When a captcha appeared mid-session, the automation would pause and hand control back to the user rather than failing silently. The command processing layer supported intelligent chaining, so multi-step workflows could be described naturally and the system would resolve the correct execution order on its own, with non-blocking asynchronous execution and status reporting throughout.

Content extraction was a particular focus - the platform supported pulling out text, tables, links, and JSON-LD structured data from pages, making it useful for research and scraping tasks beyond just basic navigation. On the frontend, I built a Next.js interface with real-time progress updates, task monitoring, and form handling built in for workflows that required filling out web forms as part of a larger automation sequence.
