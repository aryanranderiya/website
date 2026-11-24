---
title: Pipeline Lens
description: "Chromium extension that redraws GitHub Actions runs as a readable graph and per-job timeline, and puts the merge queue where GitHub's merge box already is."
shortDescription: "Readable GitHub Actions runs"
date: 2026-11-02
tech: [JavaScript, Chrome Extension, GitHub Actions]
featured: false
type: tool
folder: Projects
coverImage: /images/projects/pipeline-lens/master.webp
images:
  - /images/projects/pipeline-lens/timeline.webp
  - /images/projects/pipeline-lens/pr.webp
  - /images/projects/pipeline-lens/merge-queue.webp
order: 34
github: https://github.com/aryanranderiya/pipeline-lens
---

GitHub's Actions graph tells you a run is red, then makes you open four other pages to find out why. Pipeline Lens is a Chromium extension that replaces that graph with one drawn from the workflow's real `needs:` edges, then adds a timeline.

Matrix jobs and reusable workflows collapse into one card each, so a 46-job run reads as 18 cards, and unstarted jobs are dashed. The timeline puts every job on one clock. Grey before a bar is runner wait; the thin tick is that job's usual duration from the last eight runs of the same workflow on the same branch. A bar that runs past its tick gets a red tail and a multiple like `1.3×`. Both views share a header with the run's total time and the job holding it up.

On a pull request it surfaces the job that actually failed and the step inside it, and puts the merge queue where GitHub's merge box already is.

It runs as an unpacked extension on Chrome, Arc, Edge, Brave: anything Chromium 111 or newer. A classic GitHub token with no scopes is optional and stored locally for the merge-queue view.
