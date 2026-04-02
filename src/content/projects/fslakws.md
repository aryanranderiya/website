---
title: Few-Shot Keyword Spotting
description: Multilingual keyword detection in audio using minimal training data - built for Smart India Hackathon 2024.
date: 2024-09-01
tags: [TypeScript, Python]
tech: [TypeScript, Python, Next.js]
featured: false
type: web
folder: Hackathon
images: []
status: completed
order: 24
github: https://github.com/aryanranderiya/Few-Shot-Language-Agnostic-Keyword-Spotting
---

I built this as part of Smart India Hackathon 2024, working on Problem Statement 1680. The core challenge was a genuinely hard one: detect specific keywords in audio across multiple languages, but without requiring large labeled datasets in each of those languages. Most keyword spotting systems are trained on thousands of hours of audio per language, which makes them useless for the hundreds of languages that simply don't have that data available. A few-shot, language-agnostic approach was the only realistic path forward.

The pipeline we designed starts by standardizing all incoming audio to 16kHz, then applies noise reduction and data augmentation to make the model more robust to real-world recording conditions. Rather than relying on language-specific phoneme dictionaries, we used pitch pattern analysis for word boundary detection, which works across languages without needing language-specific rules. The core of the model is a lightweight neural network built for acoustic feature extraction - small enough to run efficiently but capable enough to generalize across the tonal and phonetic variation you get when supporting multiple languages simultaneously.

What made this technically interesting was the few-shot framing: the system only needs a handful of audio examples of a keyword to recognize it, rather than a full training corpus. This opens up applications that would otherwise be impractical - real-time emergency keyword detection in regional languages, voice interfaces for underrepresented communities, and accessibility tools for languages that mainstream speech tech tends to ignore. I worked on this alongside Dhruv Maradiya, Nemil, Tavish Gupta, and Mansi Rank, and the collaboration pushed the project into territory none of us would have reached individually.
