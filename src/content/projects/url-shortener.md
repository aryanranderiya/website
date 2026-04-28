---
title: URL Shortener
description: Full-stack MERN app to generate custom or randomized short URLs with expiration date functionality.
shortDescription: Custom URL shortener with expiry dates
date: 2024-03-01
tags: [Utility]
tech: [React, Node.js, Express, MongoDB, TailwindCSS]
featured: false
type: web
folder: Projects
coverImage: /ProjectMedia/URL_Shortener/URLShortener.webp
images:
  - /ProjectMedia/URL_Shortener/URLShortener.webp
  - /ProjectMedia/URL_Shortener/2024-03-14_21-13.webp
  - /ProjectMedia/URL_Shortener/screenshot-1.webp
status: completed
order: 11
url: https://links.aryanranderiya.com
github: https://github.com/aryanranderiya/URLShortener
---

I built this as a full-stack exercise in connecting every layer of a web app - from user input through an API to a database and back out as a working redirect. The core idea is simple: paste a long URL and get back something short and shareable. What made it more interesting to build was adding real control on top of that - you can type a custom alias if you have something memorable in mind, or let the app generate a random one with a slider to control how many characters the code uses.

One feature I was particularly deliberate about was expiration dates. A lot of link shorteners live forever, which isn't always what you want - sometimes a link is for a campaign, an event, or a temporary resource. Adding an expiry field meant handling date comparison on every redirect request, checking whether a link had expired before serving it, and deciding how to communicate that gracefully to whoever followed it.

The stack is React with NextUI on the frontend and Node.js with Express on the backend, with MongoDB Atlas holding all the URL mappings. Both frontend and backend are deployed on Vercel, and the backend automatically serves the frontend from the build folder so the whole thing is one deployment. The UI is lean and focused - a single input, the alias controls, and the result.

I use this project regularly at links.aryanranderiya.com. Building a complete round-trip - form submission to database write to HTTP redirect - in a weekend-scale project turned out to be a solid way to see how all the MERN pieces fit together in practice.
