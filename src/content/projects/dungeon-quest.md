---
title: Dungeon Quest
description: Retro-style platformer with pixel art graphics, collectible items, and classic dungeon exploration - built for a frontend hackathon.
shortDescription: Retro dungeon platformer hackathon game
date: 2025-04-01
tags: [Canvas, Game]
tech: [Next.js, TypeScript, TailwindCSS]
featured: false
type: game
folder: Hackathon
coverImage: /ProjectMedia/DungeonQuest/banner.webp
images:
  - /ProjectMedia/DungeonQuest/banner.webp
  - /ProjectMedia/DungeonQuest/dungeon_quest.webp
  - /ProjectMedia/DungeonQuest/screenshot-1.webp
  - /ProjectMedia/DungeonQuest/screenshot-2.webp
  - /ProjectMedia/DungeonQuest/screenshot-3.webp
  - /ProjectMedia/DungeonQuest/screenshot-4.webp
status: completed
order: 20
url: https://pixel-quest.vercel.app/
github: https://github.com/aryanranderiya/dungeon-quest
---

I honestly built this along with a couple more projects like Slate, as a hail mary for trying to win a hackathon lol.

I thought pushing quantity over quality would rule in my favour by building projects for a couple different problem statements. I did end up winning a PS5 with my project Slate. I guess we'll never know if it really was quantity over quality 😂

---

I built Dungeon Quest for a Frontend UI Hackathon hosted by Outlier.ai, pushing the limits of what a web framework could do outside the context of a typical web application. The concept was a retro-style dungeon adventure with pixel art graphics where the player navigates torch-lit corridors collecting 21 unique items and 5 armor pieces - helmet, chestplate, boots, shield, and sword - tracked in a dedicated inventory sidebar.

The entire game ran in the browser using HTML5 Canvas for rendering, with no dedicated game engine involved. Movement used WASD or arrow keys, and I layered a CRT screen overlay on top of the canvas to push the retro aesthetic further - that effect alone did a lot of work in selling the nostalgic feel. The UI elements outside the canvas, like the inventory and sidebar, were built with Radix UI components wired into React state. What would normally be the domain of something like Unity or Phaser was instead constructed from a canvas layer backed by Next.js and TypeScript - a deliberate constraint that forced creative solutions at every turn.
