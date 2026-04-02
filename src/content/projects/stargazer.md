---
title: Stargazer
description: Terminal UI tool in Go that collects GitHub stargazers, resolves email addresses, and exports to CSV.
date: 2025-03-01
tags: [Go, CLI]
tech: [Go, BubbleTea, GitHub API]
featured: false
type: other
folder: Projects
images: []
status: completed
order: 18
github: https://github.com/aryanranderiya/stargazer
---

A TUI tool written in Go that takes any GitHub repo and collects all its stargazers, enriches their profiles with email addresses using a three-step fallback (public profile, git commit email, noreply), and exports everything to CSV.

It's a single 7MB binary with zero dependencies. Uses BubbleTea for an interactive terminal interface with config, progress, and completion screens. It does incremental CSV writing so if you interrupt it midway, you don't lose what it already found. Processes about 1,000 stargazers in 5-15 minutes with 5 workers. Built this because I needed stargazer data for outreach and nothing existing handled email resolution well.
