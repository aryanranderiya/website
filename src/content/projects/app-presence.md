---
title: AppPresence
description: "A tiny macOS menu bar app that shows the app you're using on Discord with its real icon — no bot, token or login, plus per-app status lines and a WakaTime card."
shortDescription: "Discord presence from your menu bar"
date: 2026-11-23
tech: [Swift, SwiftUI, SQLite, Discord]
featured: false
type: desktop
folder: Projects
coverImage: /images/projects/app-presence/screenshot.webp
images:
  - /images/projects/app-presence/settings.webp
order: 32
github: https://github.com/aryanranderiya/app-presence
---

AppPresence puts the app you are actually using on your Discord profile, with its real icon. It is a menu bar-only macOS app: no bot, no token, no login, and nothing registered in the Discord Developer Portal.

Nothing appears until you enable it per app. Each app gets its own status line — `shipping with` for Rex, `conducting agents` for Conductor — and an editable third line for real context; Conductor fills it live with the active project and branch. Icons come from every app in `/Applications` exported at 512px, so Rex, Conductor, Arc, Ghostty and 260+ others show their actual artwork. A second card reports WakaTime today and your weekly leaderboard rank, then your daily average and 7-day total on hover. Hard blocks (Discord, 1Password) mean an app can never appear even if you enable everything else, and switching to a hidden app does not wipe the last allowed status. The timer counts from when the app actually opened, not when you last focused it.

Policies, phrases and settings live in one small SQLite database under Application Support. Menu bar only, macOS 13+.
