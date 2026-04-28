---
title: TicketBus
description: Public transportation mobile app with QR-based ticket booking, bus passes, e-wallets, user profiles, and a comprehensive map module.
shortDescription: QR-based bus ticket booking mobile app
date: 2023-06-01
tags: [Transportation]
tech: [Java, Android, Firebase]
featured: true
type: mobile
folder: Featured
coverImage: /ProjectMedia/TicketBus/TicketBus_project_banner.webp
images:
  - /ProjectMedia/TicketBus/TicketBus_project_banner.webp
  - /ProjectMedia/TicketBus/SplashScreen.png
  - /ProjectMedia/TicketBus/Onboarding.png
  - /ProjectMedia/TicketBus/Login_Signup.png
  - /ProjectMedia/TicketBus/Dashboard.png
  - /ProjectMedia/TicketBus/Map.png
  - /ProjectMedia/TicketBus/TicketBooking.png
  - /ProjectMedia/TicketBus/Bus_Pass.png
  - /ProjectMedia/TicketBus/User_Profile.png
  - /ProjectMedia/TicketBus/AdminPanel.png
  - /ProjectMedia/TicketBus/AdminPanel_Bus.png
  - /ProjectMedia/TicketBus/AdminPanel_BusPass.png
  - /ProjectMedia/TicketBus/AdminPanel_Location.png
  - /ProjectMedia/TicketBus/AdminPanel_Users.png
video: /ProjectMedia/TicketBus/Ticketbus.mp4
status: completed
order: 5
github: https://github.com/aryanranderiya/TicketBus
---

I led a team to build TicketBus, an Android app aimed at making public transportation genuinely digital from end to end. The core experience lets commuters book tickets on the go, apply for bus passes that come with QR codes for quick validation at the gate, and manage everything through an integrated e-wallet so there's no need to carry cash or hunt for exact change. Real-time information about bus arrivals and route changes is surfaced throughout, so you're never guessing when the next bus is coming.

The map module was one of the more technically interesting pieces to build. It's powered by the Mapbox API and gives users detailed route maps with bus stops and turn-by-turn directions for planning a trip, not just tracking one in progress. Getting that integrated cleanly with the rest of the app - so tapping a route in the booking flow took you directly to the map view - required thinking carefully about how the different screens handed off to each other.

The whole thing runs on Firebase for backend services, which handled authentication, real-time database sync, and storage without needing a separate server to maintain. The codebase is Java throughout, built in Android Studio, with a screen flow that moves naturally from onboarding through login, ticket booking, pass management, and the map. We also shipped a full admin panel as a companion interface, letting authorized users manage bus listings, pass configurations, and location data independently.

A big thanks to Neel Dedkawala, Himanshi Borad, Dhruv Gohil, Prince Ganeshwala, and Preet Gabani who helped build this out. The project took first place at the college Project Fair, which felt like solid confirmation that the experience we designed actually resonated with people seeing it fresh.
