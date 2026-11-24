---
title: booksync
description: "One command that syncs the EPUBs and PDFs you uploaded to Google Play Books into Apple Books on your Mac, with no duplicates and proper covers."
shortDescription: "Google Play Books → Apple Books sync"
date: 2026-11-04
tech: [Python, macOS, Apple Books, Google Play Books]
featured: false
type: cli
folder: Projects
order: 33
github: https://github.com/aryanranderiya/booksync
---

booksync moves the EPUBs and PDFs you uploaded to Google Play Books into Apple Books, on your Mac, with one command. There is no export API and no built-in path between the two apps; without this, your options are clicking Export on 70 books one at a time or giving up.

`booksync sync` borrows your Google login from Arc or Chrome’s existing cookies, opens Play Books in a hidden window, and skips everything it has already handled. For each new book it exports the file, checks that it is real, gives it a cover worth looking at, saves a copy to `~/Books/PlayBooks` and adds it to Apple Books.

Run it again next month and it only fetches what is new. Books are tracked by file and ISBN, so there are no duplicates, and anything it cannot export is remembered and skipped later. `booksync shelf`, `status`, `import`, `covers` and `doctor` cover the rest.

It is Python 3.12 with `uv`, reads your own browser cookies and decrypts them locally. Nothing is sent anywhere except to Google, as you: no server, no account, no telemetry.
