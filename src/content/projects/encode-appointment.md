---
title: Appointment Management System
description: Full-stack appointment booking app with a React + Vite frontend and Express + MongoDB backend, built as the assignment that landed me the web dev head role at my university's CS club.
shortDescription: Full-stack appointment booking app, CS club entry assignment
date: 2024-07-17
tags: [Productivity]
tech: [React, TypeScript, Vite, Express.js, MongoDB, Node.js]
featured: false
type: web
folder: Projects
images: []
status: completed
order: 35
url: https://encode-aryan.vercel.app
github: https://github.com/aryanranderiya/encode-assignment
---

Encode, the computer science club at my university, had a web development assignment as part of their selection process. I built an appointment management system as my submission, and it's the project that got me in as web development head.

The frontend is a Vite + React + TypeScript application. I kept the component structure clean and focused on making the actual booking flow (browsing slots, scheduling an appointment, seeing confirmations) feel polished and immediate rather than just functional. The UI uses TailwindCSS for layout and styling throughout.

The backend is an Express.js REST API connected to MongoDB. It handles appointment creation, retrieval, updates, and deletion, with environment-based configuration for the database connection. The frontend and backend communicate over a single configurable API base URL, making it straightforward to deploy both to separate services without hardcoding anything.

The full system is deployed and live, with the frontend on Vercel and the backend pointed to a hosted MongoDB instance. I put together clear setup documentation in the README for both halves of the stack, since the selection process involved the club evaluating not just the code but how approachable it was for other developers to run locally.
