---
title: YouTube Shorts Automator
description: An AI pipeline for automated creation and uploading of YouTube Shorts - generating script, voice-over, subtitles, background media, and metadata from a prompt.
date: 2024-03-01
tags: [Automation, AI / ML]
tech: [Python, Flask, MongoDB, HTML, CSS]
featured: false
type: web
folder: Projects
coverImage: /ProjectMedia/YouTube_Shorts Automator/project_banner (2).png
images:
  - /ProjectMedia/YouTube_Shorts Automator/project_banner (2).png
  - /ProjectMedia/YouTube_Shorts Automator/2024-04-04_02-07.png
status: completed
order: 12
---

An end-to-end pipeline that takes a text prompt and turns it into a ready-to-upload YouTube Short. It generates the script, creates a voice-over, adds subtitles, finds or generates background media, and assembles the final video with metadata - all automated.

The backend is Python with Flask, and MongoDB stores the job state and generated assets. I tested it on an actual YouTube channel and got 4k+ views in under 3 days, which was a pretty good signal that the output quality was reasonable. The whole thing was an experiment in how much of the content creation pipeline you can realistically automate.
