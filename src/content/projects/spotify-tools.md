---
title: Spotify Tools
description: Python desktop app with Spotify API integration - playlist management, mini player, and profile viewing.
shortDescription: Desktop playlist manager & mini player
date: 2023-09-03
tech: [Python, Spotify API]
featured: false
type: desktop
folder: Projects
coverImage: /ProjectMedia/Spotify_Tools/spotify_tools_project_banner.png
images:
  - /ProjectMedia/Spotify_Tools/spotify_tools_project_banner.png
video: /ProjectMedia/Spotify_Tools/SpotifyTools_demo.mp4
videoAspectRatio: "16 / 9"
order: 19
github: https://github.com/aryanranderiya/SpotifyTools
---

I built this as my first project learning Python during the CS50 Python course. The inspiration was that i had massive playlists with 1k, 2k+ songs and Spotify never truly shuffled my playlists. It always shuffled using an algorithm for my most listened to songs. But it only suggested the songs i listened to the most, which in turn was a chicken and egg problem, I just never got to listen to the majority of my plalylist. As a result i wanted something that could shuffle my entire playlists using pure math instead of a smart algorithm.

While doing this I even ended up fucking my playlist up because while sorting the pagination limit was 100 and it trimmed my 2k song playlist down to 100 songs and i ended up having to manually fill the playlist in because spotify doesn't really have archive support for deleted songs only deleted playlists so I had to go to each artist i follow and add all their songs manually. I did recover upto around 1700 / ~2000 songs !!! It was disastrous lmao but you learn a lot along the way 😂

---

Spotify Tools was a Python desktop application I built to explore the Spotify Web API, bringing playlist management, a mini player, and playback controls together in a single native interface through OAuth-based authentication. I implemented the full OAuth flow from scratch, handling token exchange and refresh cycles so the app could maintain an authenticated session without requiring the user to log in repeatedly. The project gave me hands-on experience working with REST APIs from a desktop context rather than a web browser, which required thinking differently about redirect URIs, local servers for token callbacks, and persisting credentials securely.

The core feature set covered the things I actually wanted from a lightweight Spotify client - browsing and managing playlists, viewing profile information, and shuffling tracks without reaching for the web player. I also built out a mini player panel with full playback controls, including play, pause, skip forward, and skip back, all wired up to the Spotify API's player endpoints. Getting the playback state to sync correctly with what was actually playing on the active device turned out to be one of the trickier parts of the implementation.

I ended up using this tool daily for a stretch of time, which was a good indicator that the core experience held up in practice. Building something I genuinely reached for every day made the project feel worthwhile beyond just being a learning exercise, and it pushed me to smooth out rough edges in the UI that I might have otherwise left alone.
