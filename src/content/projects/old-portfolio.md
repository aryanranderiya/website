---
title: Portfolio v1
description: My first personal portfolio - built from scratch in vanilla HTML, CSS, and JavaScript with Firebase as backend, GSAP-powered animations, and a custom design projects gallery.
shortDescription: First personal portfolio - HTML/CSS/JS + Firebase
date: 2023-12-01
tags: [Personal]
tech: [HTML, CSS, JavaScript, Firebase, GSAP]
featured: false
type: web
folder: Projects
coverImage: /ProjectMedia/Portfolio/Website-Homepage.png
images:
  - /ProjectMedia/Portfolio/Website-Homepage.png
  - /ProjectMedia/Portfolio/304815490-aee4f364-4434-416b-a265-cdc3c21f458a.png
  - /ProjectMedia/Portfolio/304815557-d8f8521a-a70a-4cd8-a4ef-9320cb154029.png
  - /ProjectMedia/Portfolio/304815629-15d1b6c3-d8d6-4a7e-905a-07a941f76cf6.png
  - /ProjectMedia/Portfolio/304815662-ac666075-fb4a-4ac5-bdcf-fd774db3fc7e.png
  - /ProjectMedia/Portfolio/304815810-20f915cc-cc2f-4c93-acfb-6c52c0cabd61.png
  - /ProjectMedia/Portfolio/304816206-f3d4bc70-edcb-4c01-adec-f209b0773c99.png
  - /ProjectMedia/Portfolio/304816390-05bd1f27-f3ef-4518-ad59-dfc263c96a9b.png
  - /ProjectMedia/Portfolio/304816745-734a2488-44b0-4433-9b45-eec0602c24bf.png
  - /ProjectMedia/Portfolio/304808063-b9372b80-6cb0-4ad2-957d-8925a2906d5c.png
  - /ProjectMedia/Portfolio/304808197-8f6a4391-272a-4d6d-987c-64b70b871256.png
  - /ProjectMedia/Portfolio/304808497-7d1da441-3969-4a1d-b800-bef031322051.png
  - /ProjectMedia/Portfolio/304813012-af9281fe-3eb2-46f6-ae1b-095b6ab09498.png
  - /ProjectMedia/Portfolio/304813094-6908cb56-95f2-4bd1-9d08-e9e5b458f491.png
  - /ProjectMedia/Portfolio/304813312-080aeaca-53f5-4c95-8ea5-e856e81abe98.png
  - /ProjectMedia/Portfolio/304813509-1a2502aa-103d-4375-8d6a-e1122c7c84cc.png
  - /ProjectMedia/Portfolio/304813593-fc9dd15a-e767-44fd-aeab-59a4c24215e4.png
  - /ProjectMedia/Portfolio/designprojects_0.png
  - /ProjectMedia/Portfolio/designprojects_1.png
  - /ProjectMedia/Portfolio/designprojects_2.png
  - /ProjectMedia/Portfolio/designprojects_3.png
  - /ProjectMedia/Portfolio/designprojects_4.png
  - /ProjectMedia/Portfolio/designprojects_5.png
  - /ProjectMedia/Portfolio/designprojects_6.png
  - /ProjectMedia/Portfolio/designprojects_7.png
  - /ProjectMedia/Portfolio/designprojects_8.png
  - /ProjectMedia/Portfolio/designprojects_9.png
video: /ProjectMedia/Personal_Portfolio/portfolio-demo.mp4
status: archived
order: 35
---

The first version of my personal portfolio, built from scratch in vanilla HTML, CSS, and JavaScript over about three months in late 2023. No frameworks, no build tools - just hand-written markup and stylesheets, with everything wired together by raw DOM APIs and a few targeted libraries. Animations and scroll-driven transitions ran through GSAP, which gave me the control to fine-tune timing and easing curves until the experience felt smooth on every section.

I used Firebase as the backend for everything dynamic - the Realtime Database stored my software project metadata so I could update entries without redeploying, Cloud Storage hosted all the project images, and Firebase Hosting served the site itself. Tech stack icons came from the GitHub language colors registry; I'd fetch the language list per repo from the GitHub API and map each language to its color, then render a custom card UI that mimicked GitHub's own theme but with the data presentation I wanted.

The design projects section was the part I was most excited about. My Behance presence didn't capture the work the way I wanted, so I built a custom gallery to showcase years of design work - apparel, branding, posters, mockups - in a layout that gave each piece more breathing room. Responsiveness was handled entirely with CSS clamps and media queries, no JavaScript-based breakpoint logic.

This site is the predecessor to the current portfolio you're reading. I rebuilt everything in Astro for the second version - faster, leaner, and easier to author content for - but the original is what taught me how much hand-tuning it takes to make a site genuinely feel polished on every device.
