---
title: KeyBar
description: "macOS menu bar app for Keychron and Bluetooth keyboards — real battery percentage and health, charge reminders, typing speed, keystrokes and corrections."
shortDescription: "Battery + typing stats for Bluetooth keyboards"
date: 2026-11-21
tech: [Swift, SwiftUI, macOS, Bluetooth]
featured: false
type: desktop
folder: Projects
coverImage: /images/projects/keybar/popover.webp
order: 31
github: https://github.com/aryanranderiya/keybar
---

KeyBar is a small macOS menu bar app for Bluetooth keyboards. Most wireless keyboards report their battery level over Bluetooth, and macOS never shows it. KeyBar does, along with how fast you type and a few other things worth knowing.

Battery shows the real percentage the keyboard reports, plus estimated days left and a week of history. After a few charges it estimates how long a full charge actually lasts, compares that with a few months ago, and warns you a couple of days before the battery is likely to run out.

Typing speed shows your current words per minute and a chart of the day that can switch to the last 7 or 30 days, plus keystrokes, typing time and how often you reached for Backspace. For Keychron boards it also counts down the 10-minute auto-sleep after you stop typing, so you know why the first key after a coffee break does nothing. Firmware, Bluetooth address, report rate and connection state are all there too.

Input Monitoring is required because the keyboard sends its battery level the same way it sends keypresses. KeyBar only keeps counts and timings, never which keys you pressed, and nothing leaves your Mac. Tested on a Keychron K6; macOS 14 or later.
