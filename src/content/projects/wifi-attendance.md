---
title: Wi-Fi Attendance
description: Android app that streamlines classroom attendance tracking using the university's Wi-Fi BSSID and unique device hardware IDs, with Excel export support.
date: 2023-11-01
tags: [Hackathon, Android]
tech: [Java, Android, Firebase]
featured: false
type: mobile
folder: Hackathon
coverImage: /ProjectMedia/Wi-Fi_Attendance/wifi_project_banner.png
images:
  - /ProjectMedia/Wi-Fi_Attendance/wifi_project_banner.png
  - /ProjectMedia/Wi-Fi_Attendance/287043334-95748acf-6050-45c4-abd3-b3590645cfdb.png
  - /ProjectMedia/Wi-Fi_Attendance/287043315-93d9a24c-5bfe-4311-b624-463531ae9d93.png
  - /ProjectMedia/Wi-Fi_Attendance/287043321-0016e2a9-eedd-438b-84d2-033ae890e865.png
status: completed
order: 23
github: https://github.com/aryanranderiya/WifiClassroomAttendance
---

I built this for New India Vibrant Hackathon 2023 (Problem Statement PS003007), leading a team to tackle a problem every university knows well - manual attendance in a large class is slow, tedious, and easy to cheat. The solution uses something already present in every classroom: the campus Wi-Fi access point. When a student tries to mark attendance, the app validates three things simultaneously - whether they're connected to the correct Wi-Fi BSSID, whether their device hardware ID matches a registered student, and whether their email domain matches the university's (sot.pdpu.ac.in). All three have to align before attendance is accepted.

The app has two distinct flows. Students connect to the classroom Wi-Fi and submit their attendance during an active session with a single tap. Faculty members get a separate panel where they open and close sessions, and once a session closes, students can no longer submit. The attendance data is then exportable as an Excel file, which fits naturally into the administrative workflows most institutions already use for records.

Firebase handles everything on the backend - real-time database sync, authentication, and storage - which meant session state reflected instantly across all connected student devices without any polling. The app is written in Java for Android, with a deliberate focus on simplicity: four screens covering login, attendance submission, reporting, and session management, with nothing unnecessary between them.
