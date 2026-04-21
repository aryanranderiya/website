---
title: Automatic License Plate Recognition
description: AI-powered license plate detection and recognition system with a web dashboard for real-time monitoring and record search.
shortDescription: AI license plate detection & web dashboard
date: 2024-09-01
tags: [AI / ML, Computer Vision]
tech: [React, Node.js, Express, MongoDB, TailwindCSS, TypeScript]
featured: false
type: web
folder: Projects
images: []
status: completed
order: 14
github: https://github.com/aryanranderiya/Automatic-License-Plate-Recognition
---

I built this during PDEU's Student Research Program alongside Dev Patel and Dev Harwani. The goal was an AI-powered system that could detect license plates from images or video feeds and convert them to readable text using OCR, then surface everything through a web dashboard for monitoring and search. The detection and recognition pipeline was the core challenge - making it work reliably across varied lighting conditions, plate angles, and image qualities took most of the research effort.

Once the recognition pipeline was solid, we built a full web interface on top so the system was actually usable outside of a script. The dashboard lets you upload images or connect a video feed for real-time detection, search through previously recognized plates, and view timestamped historical records pulled from MongoDB. The search and filter functionality was something we thought carefully about, since the practical use case is looking up a specific plate across a large historical dataset.

The backend is Node.js with Express handling the API and processing pipeline, the frontend is React with Vite and Tailwind for a fast and interactive UI, and MongoDB stores all recognized plate data for record-keeping and analysis. The architecture is intentionally clean rather than over-engineered - the goal was a working system in front of reviewers, not infrastructure. It was a solid exercise in bridging a computer vision pipeline with a web interface that non-technical users could actually navigate.
