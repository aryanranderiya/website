---
title: Intelli-Transport
description: AI-driven transportation system with traffic prediction, accident detection, and driver safety monitoring - built for TechNova Hackathon.
date: 2024-12-01
tags: [AI / ML, Transportation]
tech: [Next.js, TypeScript, FastAPI, Python]
featured: false
type: web
folder: Hackathon
coverImage: /ProjectMedia/TechNova/screenshot-1.png
images:
  - /ProjectMedia/TechNova/screenshot-1.png
  - /ProjectMedia/TechNova/screenshot-2.png
  - /ProjectMedia/TechNova/screenshot-3.png
  - /ProjectMedia/TechNova/screenshot-4.png
  - /ProjectMedia/TechNova/screenshot-5.png
status: completed
order: 25
url: https://tech-nova-hackathon.vercel.app
github: https://github.com/aryanranderiya/TechNovaHackathon
---

I built this with Dhruv Maradiya for the Pre TechNova Hackathon, where we set out to tackle several of the most persistent pain points in urban transportation within a single unified system. The idea was to move beyond single-feature projects and deliver something that felt like a real product - one that addressed traffic congestion, driver safety, accident response, and transit scheduling all at once.

The traffic prediction module uses a recurrent model trained to forecast congestion patterns based on historical flow data, giving the system a forward-looking view rather than just reacting to current conditions. For driver safety, we trained a vision model to detect both fatigue and distraction from a camera feed in real time, flagging risky behavior before it leads to an incident. A separate computer vision pipeline processes footage from surveillance cameras to identify accidents as they happen, which could feed directly into emergency response workflows.

The fourth module handled dynamic bus schedule optimization, adjusting routes and departure times based on predicted demand rather than fixed timetables. Tying all of this together required careful thought around the backend architecture - we used FastAPI to expose each ML service as a clean API, with the ML services deployed on AWS and Render, and the Next.js frontend hosted on Vercel.

Getting four distinct ML-powered modules production-ready under hackathon time pressure was genuinely challenging. Each one had its own data requirements, model architecture, and deployment considerations, and making them feel cohesive through a single interface required as much product thinking as engineering. Pulling it all off end to end was one of the more satisfying moments I've had building something under a deadline.
