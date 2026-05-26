# Books — content & cover pipeline

Each `.md` file here is one book on the [Bookshelf](/books) page. The frontmatter is
validated by the `books` schema in `src/content/config.ts`.

## Adding a book

Create `<slug>.md` (the filename becomes the URL slug):

```md
---
title: Atomic Habits
author: James Clear
status: read          # read | reading | to-read
cover: https://covers.openlibrary.org/b/id/8131760-L.jpg
rating: 5             # optional, 0–5
genre: [self-help, productivity]
year: 2018            # optional
pages: 320            # optional
dateRead: 2023-06-15  # optional
featured: true        # optional
review: One-line take. # optional
---

Optional longer body / notes.
```

### Finding a cover

Search [openlibrary.org](https://openlibrary.org), open the book, and grab the cover ID
from its image URL — `https://covers.openlibrary.org/b/id/<ID>-L.jpg`. A local path like
`/images/books/<slug>.webp` also works if you'd rather supply your own image.

## Covers are optimized at build time — do NOT rely on the URL at runtime

The `cover` URL above is only a **source**. Open Library cover URLs are slow (each is a
~3s 302 redirect chain), so the site never hotlinks them. Instead:

```bash
npm run covers   # scripts/fetch-book-covers.mjs
```

This downloads every cover once, resizes it to a ~360px WebP, and writes:

- `public/images/books/<slug>.webp` — the optimized cover the page actually loads
- `src/data/book-covers.json` — a `{ "<slug>": { hash, w, h } }` manifest where `hash`
  is a [thumbhash](https://evanw.github.io/thumbhash/) (a tiny blur placeholder decoded
  to a data URL with **zero** network requests) and `w`/`h` are the real dimensions (so
  the shelf sizes each book with no layout shift).

The bookshelf reads the manifest and renders `/images/books/<slug>.webp` with the
thumbhash placeholder — Open Library is never touched at runtime.

**Re-run `npm run covers` whenever you add or change a book's `cover`, and commit the new
WebP + the updated `book-covers.json`.** Cloudflare Pages just reads the committed files;
it never runs the script.
