---
title: "Claude Usage Tracker (fork)"
description: "Native macOS menu bar app for tracking Claude and Codex usage limits in real time, extended to auto-detect local accounts from cswap, OpenCode Go and Codex."
shortDescription: "macOS menu bar Claude usage tracker"
date: 2026-11-23
tech: [Swift, SwiftUI, macOS, Codex]
featured: false
type: desktop
folder: Projects
coverImage: /images/projects/claude-usage-tracker/cover.webp
images:
  - /images/projects/claude-usage-tracker/popover.webp
  - /images/projects/claude-usage-tracker/settings.webp
  - /images/projects/claude-usage-tracker/statusline.webp
order: 30
github: https://github.com/aryanranderiya/claude-usage-tracker-aryan
---

Claude Usage Tracker is a native macOS menu bar app that shows how much of your Claude limits you have used and when they reset: the five-hour session, the weekly cap, per-model limits and API spend, for as many accounts as you have. It can track OpenAI Codex the same way.

This fork removes the manual setup. It auto-detects accounts from [cswap](https://github.com/realiti4/claude-swap), OpenCode Go and Codex instead of asking you to add each one by hand. Detection is read-only, so the app never copies, swaps, refreshes or writes those tools' credentials. It also runs as its own app, with a separate bundle id, Keychain services, Application Support folder, UserDefaults domain and Notch HUD port, so it can sit beside upstream without sharing profiles, history or the hook listener.

It is built in Swift and SwiftUI for macOS 13+, with a menu bar popover, widgets and a notch HUD. Upstream is [hamed-elfayome/Claude-Usage-Tracker](https://github.com/hamed-elfayome/Claude-Usage-Tracker).
