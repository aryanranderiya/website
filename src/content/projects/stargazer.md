---
title: Stargazer
description: Terminal UI tool in Go that collects GitHub stargazers, resolves email addresses, and exports to CSV.
date: 2025-03-01
tags: [Developer Tools, Analytics]
tech: [Go]
featured: false
type: cli
folder: Projects
images: []
status: completed
order: 18
github: https://github.com/aryanranderiya/stargazer
---

I built Stargazer because I needed to reach out to people who had starred a GitHub repository and found that no existing tool handled email resolution in a meaningful way. The core idea was simple: given any public GitHub repo, collect every account that had starred it and enrich each profile with a real email address wherever possible.

To make email resolution as thorough as possible, I implemented a three-step fallback strategy. The tool first checked the user's public GitHub profile for a listed email, then scraped commit history to surface any git-configured addresses, and finally fell back to GitHub's noreply address when neither source yielded a result. This layered approach recovered contact information for a much larger share of stargazers than a single lookup ever could.

I wrote the interface using BubbleTea, which gave the tool a proper terminal UI with distinct screens for configuration, live progress, and a completion summary. Incremental CSV writing meant that interrupting a long run mid-way never caused lost data - whatever had already been processed was safely on disk. With five concurrent workers the tool could work through roughly 1,000 stargazers in under fifteen minutes.

The final artifact was a single 7 MB binary with no runtime dependencies, which made it straightforward to drop onto any machine and run immediately. The project gave me a solid introduction to Go's concurrency model and to building polished CLI experiences with the Charm ecosystem.
