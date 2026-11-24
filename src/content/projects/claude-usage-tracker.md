---
title: "Claude Usage Tracker (fork)"
description: "A fork of Claude Usage Tracker that auto-detects accounts from cswap, OpenCode Go and Codex, runs as its own app, and tracks Claude and Codex limits from the macOS menu bar."
shortDescription: "Auto-detecting Claude usage tracker fork"
date: 2026-11-23
tech: [Swift, SwiftUI, macOS, Codex]
featured: false
type: desktop
folder: Projects
coverImage: /images/projects/claude-usage-tracker/popover.webp
order: 30
github: https://github.com/aryanranderiya/claude-usage-tracker-aryan
---

This is my fork of [Claude Usage Tracker](https://github.com/hamed-elfayome/Claude-Usage-Tracker), a native macOS menu bar app for Claude and Codex limits. The app itself is upstream's: the five-hour session, weekly cap, per-model limits and API spend, in a menu bar popover, widgets and a notch HUD.

## What's different in this fork

- **No manual account setup.** It auto-detects accounts from [cswap](https://github.com/realiti4/claude-swap), OpenCode Go and Codex instead of asking you to add each one by hand.
- **Read-only detection.** The app never copies, swaps, refreshes or writes those tools' credentials.
- **Runs beside upstream.** It has its own app name, bundle id, Keychain services, Application Support folder, UserDefaults domain and Notch HUD port, so profiles, history, credentials and the hook listener stay separate.

It is built in Swift and SwiftUI for macOS 13+.
