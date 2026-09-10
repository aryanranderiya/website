---
title: TicketBus
description: Public transportation mobile app with QR-based ticket booking, bus passes, e-wallets, user profiles, and a comprehensive map module.
shortDescription: QR-based bus ticket booking mobile app
date: 2023-08-03
tech: [Java, Android, Firebase]
featured: true
type: mobile
folder: Featured
coverImage: /images/projects/ticketbus/TicketBus_project_banner.webp
images:
  - /images/projects/ticketbus/TicketBus_project_banner.webp
  - /images/projects/ticketbus/SplashScreen.webp
  - /images/projects/ticketbus/Onboarding.webp
  - /images/projects/ticketbus/Login_Signup.webp
  - /images/projects/ticketbus/Dashboard.webp
  - /images/projects/ticketbus/Map.webp
  - /images/projects/ticketbus/TicketBooking.webp
  - /images/projects/ticketbus/Bus_Pass.webp
  - /images/projects/ticketbus/User_Profile.webp
  - /images/projects/ticketbus/AdminPanel.webp
  - /images/projects/ticketbus/AdminPanel_Bus.webp
  - /images/projects/ticketbus/AdminPanel_BusPass.webp
  - /images/projects/ticketbus/AdminPanel_Location.webp
  - /images/projects/ticketbus/AdminPanel_Users.webp
video: /images/projects/ticketbus/Ticketbus.mp4
videoAspectRatio: "608 / 1312"
order: 5
github: https://github.com/aryanranderiya/TicketBus
---

This was my first major software (and first mobile android dev) project that I completed as my final project during my diploma final year. I honestly learnt so much and working with Java as my first programmning language really invoked my love for programming, software development, design and problem solving in general. This really holds a special place in my heart.

---

I led a team to build TicketBus, an Android app aimed at making public transportation genuinely digital from end to end. The core experience lets commuters book tickets on the go, apply for bus passes that come with QR codes for quick validation at the gate, and manage everything through an integrated e-wallet so there's no need to carry cash or hunt for exact change. Real-time information about bus arrivals and route changes is surfaced throughout, so you're never guessing when the next bus is coming.

The map module was one of the more technically interesting pieces to build. It's powered by the Mapbox API and gives users detailed route maps with bus stops and turn-by-turn directions for planning a trip, not just tracking one in progress. Getting that integrated cleanly with the rest of the app - so tapping a route in the booking flow took you directly to the map view - required thinking carefully about how the different screens handed off to each other.

The whole thing runs on Firebase for backend services, which handled authentication, real-time database sync, and storage without needing a separate server to maintain. The codebase is Java throughout, built in Android Studio, with a screen flow that moves naturally from onboarding through login, ticket booking, pass management, and the map. We also shipped a full admin panel as a companion interface, letting authorized users manage bus listings, pass configurations, and location data independently.

A big thanks to Neel Dedkawala, Himanshi Borad, Dhruv Gohil, Prince Ganeshwala, and Preet Gabani who helped build this out. The project took first place at the college Project Fair, which felt like solid confirmation that the experience we designed actually resonated with people seeing it fresh.
