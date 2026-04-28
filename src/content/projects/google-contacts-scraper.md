---
title: Google Contacts Email Scraper
description: Python tool using the Google People API to extract email addresses from large contact directories and export them.
shortDescription: Bulk email extractor via Google People API
date: 2023-12-01
tags: [Automation, Web Scraping]
tech: [Python, Google API]
featured: false
type: cli
folder: Projects
coverImage: /ProjectMedia/Google_Contacts Email Scraper/project_banner_google_contacts.png
images:
  - /ProjectMedia/Google_Contacts Email Scraper/project_banner_google_contacts.png
  - /ProjectMedia/Google_Contacts Email Scraper/2024-03-30_22-39.webp
  - /ProjectMedia/Google_Contacts Email Scraper/2024-03-30_22-41.png
status: completed
order: 19
github: https://github.com/aryanranderiya/GoogleContactsEmailScraper
---

I built this when I needed to extract a large number of email addresses from a Google Workspace directory for an outreach project. Google Contacts has no native bulk export that gives you a clean flat list of addresses - the standard export is a vCard file that requires additional parsing, and doing it contact-by-contact through the UI was completely out of the question at scale.

The script uses OAuth 2.0 with the contacts.readonly and directory.readonly scopes, going through Google's standard consent flow on first run and storing the resulting token locally so subsequent runs don't require re-authentication. It then calls the Google People API, paginates through every contact in batches, and writes all discovered email addresses to text files. It handles both personal contacts and any shared organizational directory accessible under the account, producing three output files: one for personal contact emails, one for directory emails sorted alphabetically, and one sorted by domain.

The most important thing to get right was pagination. The People API returns a continuation token with each page, and you have to keep making requests until that token is absent - assuming a fixed number of results is how you silently miss contacts at the end of a large directory. Getting that loop correct, and handling contacts that have multiple email addresses, was most of the real work.

What came out is a narrow utility that turns hours of tedious clicking into a few seconds of runtime. It's the kind of tool that has one job and does it reliably.
