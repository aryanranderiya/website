---
title: Markdown kitchen sink
description: Every markdown element this site knows how to render, in one long post, so regressions in prose styling are impossible to miss.
date: 2026-04-17
tags: [test, markdown, reference]
category: note
draft: false
---

This post exists as a **living spec** for the blog's prose styles. Every element
below is something a markdown file can produce; if anything here looks broken, the
site's typography has regressed.

## Inline formatting

You can write in **bold**, in *italics*, in ***both at once***, and even in
~~strikethrough~~ when a correction needs to be visible. Inline `code` is
rendered with a pill background, while `longer inline code spans with
hyphenated-identifiers` stay on one line where possible.

Highlighted text using <mark>mark element</mark> reads like a highlighter.
Keyboard shortcuts live in <kbd>kbd</kbd> elements: press
<kbd>⌘</kbd> + <kbd>K</kbd> to open the command palette.

Proper GFM footnotes work too — here's one[^first] and here's another[^longer]
inline in a paragraph. The markers link to the footnote block at the bottom of
the post, and each footnote has a back-arrow to return to where you were.

Raw HTML also gets through: superscript<sup>note</sup> and subscript<sub>2</sub>.
The acronym <abbr title="Content Delivery Network">CDN</abbr> expands on hover.

Links come in two flavours: an [internal one to the home page](/) and an
[external one to GAIA](https://heygaia.io). Both should feel like the surrounding
text, not lit-up buttons.

## Headings

### This is an H3

Paragraph spacing under an H3 should feel natural — enough room to breathe
without floating off on its own.

#### This is an H4

H4 is tighter and smaller.

##### This is an H5

H5 and H6 switch to an uppercase label style, reserved for rare cases.

###### This is an H6

## Lists

Unordered, nested:

- First top-level bullet
- Second, with children
  - Nested circle bullet
  - Another one
    - Third-level square
- Back to the top level

Ordered, nested:

1. Plan the thing
2. Build the thing
   1. Write the types first
   2. Wire the UI
   3. Ship behind a flag
3. Tell people about the thing

Task list (GFM):

- [x] Strip WIP chips from projects
- [x] Make preview card clickable
- [ ] Document the colour system
- [ ] Replace Mapbox with something lighter

## Blockquotes

> The best interfaces are the ones you don't notice. You notice the bad ones.
> The good ones get out of the way.

Nested quote:

> Software engineering is the part of computer science that is about dealing with other people.
>
> > Also with your past self, which is usually worse.

## Code

Inline first: a call like `fetchOgMetadata(url)` returns a `Promise<LinkPreview | null>`.

A short TypeScript block:

```ts
// src/lib/greet.ts
export function greet(name: string): string {
  if (!name) throw new Error('name required');
  return `Hello, ${name}`;
}

greet('world');
```

A longer JSX / React example:

```tsx
import { useState } from 'react';

export function Counter({ start = 0 }: { start?: number }) {
  const [count, setCount] = useState(start);
  return (
    <button
      type="button"
      onClick={() => setCount((c) => c + 1)}
      className="px-3 py-1 rounded-md bg-neutral-100"
    >
      clicked {count} times
    </button>
  );
}
```

A Bash block for shell snippets:

```bash
pnpm install
pnpm dev -- --host 0.0.0.0
```

A CSS block:

```css
.prose a {
  color: var(--text-primary);
  text-decoration-color: var(--border-strong);
  text-underline-offset: 3px;
}
```

## Tables

| Component       | Purpose                               | Status      |
| --------------- | ------------------------------------- | ----------- |
| `PreviewLink`   | Hoverable link with an OG preview     | Done        |
| `GithubGraph`   | Contribution heatmap for the homepage | Done        |
| `MapWidget`     | Mapbox tile with a memoji marker      | Done        |
| `SpotifyWidget` | Now-playing pulled from Spotify API   | Live on CF  |

Numeric table with right-aligned-ish values:

| Route                  | Prerendered | Notes                            |
| ---------------------- | ----------- | -------------------------------- |
| `/`                    | yes         | Hero OG baked at build time      |
| `/projects/*`          | yes         | One file per slug                |
| `/api/ai-prompt.json`  | yes         | Snapshot of the AI system prompt |
| `/api/spotify.json`    | **no**      | Runs as a Pages Function         |

## Definition list

A terse glossary:

Pre-render
: Generated once at build time and served as a static file.

Pages Function
: A Cloudflare Worker scoped to a single route; runs on every request.

Stale-while-revalidate
: Serve the cached response immediately, refresh it in the background.

## Figures

![A waving hand emoji](/images/waving-hand.webp)

Images on their own line above still work, but wrapping them in a `<figure>`
gives you a caption:

<figure>
  <img src="/images/waving-hand.webp" alt="A waving hand emoji" />
  <figcaption>The hand in question, waving back.</figcaption>
</figure>

## Collapsible sections

<details>
  <summary>Why is the Spotify route the only SSR endpoint?</summary>

  Everything else on this site either doesn't change between deploys or gets
  regenerated whenever the content folder changes. Spotify's "currently
  playing" is the one genuinely live piece of data, so it's the only route
  that opts out of prerendering with `export const prerender = false`.
</details>

<details>
  <summary>Long summary that should wrap gracefully even when it's genuinely long</summary>

  The summary stays on one line while closed, and the arrow rotates when the
  disclosure opens. Content can contain **any** prose elements — including
  lists, code, and even nested details.

  - Nested bullet
  - Another one

  ```ts
  // Nested code block
  console.log('still themed correctly');
  ```
</details>

## Horizontal rule

Below is an `<hr>`, which should be a faint single line, not a thick brutal bar.

---

## Long-form prose

Lorem ipsum is a placeholder, but a paragraph of real text gives a better feel
for line-height and measure. This site targets a comfortable reading column at
around 68 characters per line, with 1.65 line-height and a muted secondary
colour for body copy. Headings punch through in the primary colour so the eye
can scan the structure of a post without having to read it linearly.

That density matters more than any single typographic choice. The prose
should feel like it was set, not auto-generated — which means small things like
matched margins between paragraphs and lists, consistent spacing above
headings, and a deliberate choice about where to use `<strong>` versus a new
sentence.

Click any image above to open it in the lightbox — arrow keys navigate,
<kbd>Esc</kbd> closes.

[^first]: Footnotes render as a numbered block at the bottom of the post, with a back-arrow that returns you to the caller.
[^longer]: They can contain `inline code`, **emphasis**, links to [other sites](https://example.com), and multiple sentences. The footnote column is deliberately muted so body text stays the loudest voice on the page.
