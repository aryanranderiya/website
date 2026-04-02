---
title: Generate PDF from Practical
description: Web app for students to create professional PDFs from practical assignments with a code editor, AI generation, and Python execution.
date: 2024-06-01
tags: [Next.js, TypeScript, TailwindCSS]
tech: [Next.js, TypeScript, TailwindCSS, Monaco Editor, PDFKit]
featured: false
type: web
folder: Projects
images: []
status: completed
order: 16
github: https://github.com/aryanranderiya/Generate-PDF-from-Practical
---

Every semester, students at my university have to submit practical assignments as neatly formatted PDFs. It's tedious. So I built a web app that handles the whole thing - you write or paste your code in a Monaco editor, optionally use AI to generate it, execute Python server-side with Matplotlib plot embedding, and export a clean PDF.

It has syntax highlighting, dark mode, custom formatting options, and the server-side Python execution captures stdout and renders any plots directly into the output. Built with Next.js, shadcn/ui, and PDFKit on the backend.
