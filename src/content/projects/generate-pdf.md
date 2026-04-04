---
title: Generate PDF from Practical
description: Web app for students to create professional PDFs from practical assignments with a code editor, AI generation, and Python execution.
date: 2024-06-01
tags: [Automation, AI / ML]
tech: [Next.js, TypeScript, TailwindCSS]
featured: false
type: web
folder: Projects
images: []
status: completed
order: 16
github: https://github.com/aryanranderiya/Generate-PDF-from-Practical
---

Every semester, students at my university had to submit practical assignments as neatly formatted PDFs - a repetitive formatting chore that got in the way of actually learning. I built this to eliminate that friction: a single web app where you fill in your student info, write or generate your code, run it, and export a professionally formatted PDF without touching a word processor.

The code editor is Monaco - the same editor that powers VS Code - with full syntax highlighting. Students can write code directly, or use the integrated AI generation feature to scaffold a solution when the prompt is straightforward and they just need a starting point. Once the code is ready, it gets executed server-side in a Python environment, and both the stdout output and any Matplotlib plots are captured and embedded directly into the document. The plots don't open in a separate window - they're intercepted and dropped inline, so the final PDF actually reflects what the code produces.

The student information form covers name, enrollment number, subject details, and practical metadata. You can choose font styles, and the whole interface has dark mode support. PDF generation runs through PDFKit on a Next.js API route, which kept the editor, execution endpoint, and export logic in one cohesive project rather than split across services. The UI components are built with Radix UI and custom shadcn/ui styling.
