---
title: Wi-Fi Attendance
description: Android app that streamlines classroom attendance tracking using the university's Wi-Fi BSSID and unique device hardware IDs, with Excel export support.
shortDescription: Wi-Fi-based classroom attendance for Android
date: 2023-11-01
tags: [Education, Automation]
tech: [Java, Android, Firebase]
featured: false
type: mobile
folder: Hackathon
coverImage: /ProjectMedia/Wi-Fi_Attendance/wifi_project_banner.webp
images:
  - /ProjectMedia/Wi-Fi_Attendance/wifi_project_banner.webp
  - /ProjectMedia/Wi-Fi_Attendance/287043334-95748acf-6050-45c4-abd3-b3590645cfdb.webp
  - /ProjectMedia/Wi-Fi_Attendance/287043315-93d9a24c-5bfe-4311-b624-463531ae9d93.webp
  - /ProjectMedia/Wi-Fi_Attendance/287043321-0016e2a9-eedd-438b-84d2-033ae890e865.webp
  - /ProjectMedia/Wi-Fi_Attendance/287043256-4f5a301d-1d8a-4ea4-9c37-171ccb541baf.webp
  - /ProjectMedia/Wi-Fi_Attendance/287043284-8b3cd6d3-7c5c-42e4-b404-e3b1beefd9d3.webp
  - /ProjectMedia/Wi-Fi_Attendance/287043323-25c59090-053b-4d49-b83a-0b5241624a17.webp
  - /ProjectMedia/Wi-Fi_Attendance/287043329-5ebec9eb-1e0e-4c7f-8732-d92fc4d843f9.webp
status: completed
order: 23
github: https://github.com/aryanranderiya/WifiClassroomAttendance
---

I built this for New India Vibrant Hackathon 2023 (Problem Statement PS003007), leading a team to tackle a problem every university knows well - manual attendance in a large class is slow, tedious, and easy to cheat. The solution uses something already present in every classroom: the campus Wi-Fi access point. When a student tries to mark attendance, the app validates three things simultaneously - whether they're connected to the correct Wi-Fi BSSID, whether their device hardware ID matches a registered student, and whether their email domain matches the university's (sot.pdpu.ac.in). All three have to align before attendance is accepted.

The app has two distinct flows. Students connect to the classroom Wi-Fi and submit their attendance during an active session with a single tap. Faculty members get a separate panel where they open and close sessions, and once a session closes, students can no longer submit. The attendance data is then exportable as an Excel file, which fits naturally into the administrative workflows most institutions already use for records.

Firebase handles everything on the backend - real-time database sync, authentication, and storage - which meant session state reflected instantly across all connected student devices without any polling. The app is written in Java for Android, with a deliberate focus on simplicity: four screens covering login, attendance submission, reporting, and session management, with nothing unnecessary between them.
