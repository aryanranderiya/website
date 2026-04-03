---
title: Expense Management System
description: Full-stack expense management system with role-based access, dashboards, and category tracking - built for Odoo Winter 2025 Hackathon.
date: 2025-01-15
tags: [Hackathon, Full Stack, PostgreSQL]
tech: [Next.js, TailwindCSS, NestJS, PostgreSQL, Prisma, Docker, TypeScript]
featured: false
type: web
folder: Hackathon
coverImage: /ProjectMedia/Odoo_Expense/screenshot-1.png
images:
  - /ProjectMedia/Odoo_Expense/screenshot-1.png
  - /ProjectMedia/Odoo_Expense/screenshot-2.png
status: completed
order: 27
url: https://odoow25video.aryanranderiya.com
github: https://github.com/aryanranderiya/OdooW25
---

I built this for the Odoo Winter 2025 Hackathon with my team WinPaglu, reviewed by Aman Patel. The problem statement was expense management - companies need a clean, reliable way to track employee spending, and most tools either over-engineer it or make the basics more complicated than they need to be. We wanted something focused and actually usable within the hackathon window.

The result is a full-stack expense management platform with a dashboard that gives users a clear overview of their spending at a glance. Expenses are organized by category, which makes filtering and reporting far more useful than a flat list ever would be. Role-based access control means admins can see and manage the full company picture while regular users only see what's relevant to them.

The frontend is Next.js with TailwindCSS, the backend is NestJS, and PostgreSQL sits underneath with Prisma as the ORM. Prisma made migrations and seeding considerably smoother during development - particularly valuable in a hackathon where the schema was still evolving. The whole stack runs in Docker, so standing up the environment is a single compose command. We seeded the database with a default company, admin user, and expense categories so it's immediately usable without manual setup.

Keeping a strict separation between frontend and backend - rather than reaching for a full-stack framework that blurs the line - added some API contract overhead but gave us the flexibility to iterate on each layer independently, which turned out to matter a lot under time pressure.
