---
title: Few-Shot Keyword Spotting
description: Multilingual keyword detection in audio using minimal training data - built for Smart India Hackathon 2024.
date: 2024-09-01
tags: [TypeScript, Python, Machine Learning]
tech: [TypeScript, Python, CNN, Next.js]
featured: false
type: web
folder: Hackathon
images: []
status: completed
order: 24
github: https://github.com/aryanranderiya/Few-Shot-Language-Agnostic-Keyword-Spotting
---

Built for Smart India Hackathon 2024, Problem Statement 1680. The challenge was to detect keywords in audio across multiple languages with very little training data - a few-shot, language-agnostic approach.

We built a pipeline that standardizes audio to 16kHz, runs noise reduction and data augmentation, then uses pitch pattern analysis for word boundary detection. The core model is a lightweight CNN for acoustic feature extraction. The practical applications range from real-time emergency keyword detection to speech interfaces for underrepresented languages. Worked on this with Dhruv Maradiya, Nemil, Tavish Gupta, and Mansi Rank.
