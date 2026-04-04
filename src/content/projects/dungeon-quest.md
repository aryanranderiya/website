---
title: Dungeon Quest
description: Retro-style platformer with pixel art graphics, collectible items, and classic dungeon exploration - built for a frontend hackathon.
date: 2025-04-01
tags: [Canvas, Game]
tech: [Next.js, TypeScript, TailwindCSS]
featured: false
type: game
folder: Hackathon
coverImage: /ProjectMedia/DungeonQuest/banner.png
images:
  - /ProjectMedia/DungeonQuest/banner.png
  - /ProjectMedia/DungeonQuest/dungeon_quest.png
  - /ProjectMedia/DungeonQuest/screenshot-1.png
  - /ProjectMedia/DungeonQuest/screenshot-2.png
  - /ProjectMedia/DungeonQuest/screenshot-3.png
status: completed
order: 20
url: https://pixel-quest.vercel.app/
github: https://github.com/aryanranderiya/dungeon-quest
---

I built Dungeon Quest for a Frontend UI Hackathon hosted by Outlier.ai, pushing the limits of what a web framework could do outside the context of a typical web application. The concept was a retro-style dungeon adventure with pixel art graphics where the player navigates torch-lit corridors collecting 21 unique items and 5 armor pieces - helmet, chestplate, boots, shield, and sword - tracked in a dedicated inventory sidebar.

The entire game ran in the browser using HTML5 Canvas for rendering, with no dedicated game engine involved. Movement used WASD or arrow keys, and I layered a CRT screen overlay on top of the canvas to push the retro aesthetic further - that effect alone did a lot of work in selling the nostalgic feel. The UI elements outside the canvas, like the inventory and sidebar, were built with Radix UI components wired into React state. What would normally be the domain of something like Unity or Phaser was instead constructed from a canvas layer backed by Next.js and TypeScript - a deliberate constraint that forced creative solutions at every turn.

The hackathon format meant working under tight time pressure, so I had to prioritize quickly. The dungeon exploration, item collection system, and the CRT visual effect all came together within the deadline, and the project ended up being one of the more unconventional entries in the competition. Seeing a game feel genuinely playable using only tools meant for building websites made the whole exercise deeply satisfying.
