---
title: FoodPay
description: Mobile-first food ordering platform with real-time cart management, product search, and OTP-verified order completion. React frontend backed by a Deno REST API and MongoDB.
shortDescription: Mobile food ordering app with OTP order verification
date: 2024-10-23
tags: [Consumer]
tech: [React, TypeScript, Vite, Deno, MongoDB, TailwindCSS]
featured: false
type: web
folder: Client
images: []
status: completed
order: 36
github: https://github.com/aryanranderiya/Foodpay-frontend
---

FoodPay is a mobile-first food ordering application I built for a client. The frontend is a React + Vite + TypeScript SPA using NextUI for components and TailwindCSS for layout, designed for one-handed mobile use, with a fixed search bar at the top, a scrollable product grid in the middle, and a floating cart button pinned to the bottom that animates in once items are added.

The product listing page fetches items from the API on mount and renders them with image, price, description, and rating. Adding an item to the cart shows an inline increment/decrement control directly on the product card rather than navigating away, which keeps the browsing flow uninterrupted. Cart state is managed in React with quantity tracking and toast notifications for add confirmations.

The checkout flow generates an OTP when an order is placed. The delivery side of the system uses that OTP to mark the order complete, a simple but practical way to confirm handoff without requiring any user account infrastructure.

For the backend I chose Deno rather than Node.js. The runtime's native TypeScript support and URL-based imports meant no build step and a leaner project setup. The API is built with Oak (Deno's Express equivalent) and uses Mongoose for MongoDB, with the same document model patterns as Node but a different runtime. Routes cover product listing and order lifecycle: create, read, update, delete, and the OTP-based finish endpoint. CORS is configured for the deployed frontend origin so the two services communicate cleanly in production.
