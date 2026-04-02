---
title: Automatic License Plate Recognition
description: AI-powered license plate detection and recognition system with a web dashboard for real-time monitoring and record search.
date: 2024-09-01
tags: [TypeScript, React, Node.js]
tech: [React, Node.js, Express, MongoDB, TailwindCSS, TypeScript]
featured: false
type: web
folder: Projects
images: []
status: completed
order: 14
github: https://github.com/aryanranderiya/Automatic-License-Plate-Recognition
---

Built this during PDEU's Student Research Program with Dev Patel and Dev Harwani. The idea was simple - point a camera at a vehicle, detect the plate, run OCR on it, and store the result. We ended up building a full web dashboard on top of it so you could search through recognized plates, monitor feeds in real time, and pull up historical records from MongoDB.

The backend runs on Node.js and Express, the frontend is React with Vite and Tailwind, and the whole thing talks to a Mongo database for persistence. Nothing fancy architecturally, but it works reliably and was a solid exercise in tying together a computer vision pipeline with a usable web interface.
