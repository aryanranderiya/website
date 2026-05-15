---
title: Google Contacts Email Scraper
description: A Python script I wrote to scrape my entire university's student and faculty emails out of the Google Workspace directory via the People API.
shortDescription: Scraped my whole uni's student + faculty emails
date: 2024-03-29
tech: [Python, Google API]
featured: false
type: cli
folder: Projects
coverImage: /ProjectMedia/Google_Contacts Email Scraper/project_banner_google_contacts.png
images:
  - /ProjectMedia/Google_Contacts Email Scraper/project_banner_google_contacts.png
  - /ProjectMedia/Google_Contacts Email Scraper/2024-03-30_22-39.webp
  - /ProjectMedia/Google_Contacts Email Scraper/2024-03-30_22-41.png
order: 19
github: https://github.com/aryanranderiya/GoogleContactsEmailScraper
---

So basically I used this to scrape my entire university's student and faculty emails lol. My uni ran on Google Workspace, which meant every single student and faculty member was sitting right there in the shared directory - I just needed a clean flat list of all of them and Google really does not want to give you that. The standard export is a vCard file you have to parse, and clicking through contacts one by one for an entire university is obviously not happening.

The script uses OAuth 2.0 with the contacts.readonly and directory.readonly scopes, going through Google's consent flow on first run and caching the token locally so I didn't have to re-auth every time. It then hits the Google People API, paginates through every contact in batches, and dumps all the email addresses it finds into text files - one for personal contacts, one for the directory sorted alphabetically, and one sorted by domain. Point it at a Workspace org and it'll happily walk the whole thing.

The most important thing to get right was pagination. The People API returns a continuation token with each page, and you have to keep making requests until that token is absent - assuming a fixed number of results is how you silently miss contacts at the end of a large directory. Getting that loop correct, and handling contacts that have multiple email addresses, was most of the real work.

What came out is a narrow utility that turns hours of tedious clicking into a few seconds of runtime. It's the kind of tool that has one job and does it reliably.
