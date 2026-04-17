---
title: Blog authoring reference
description: Everything you can write in a post on aryanranderiya.com.
date: 2026-04-17
draft: true
---

# Blog authoring reference

This file documents every block you can put in a blog post. It's marked
`draft: true` so it never ships to production. When you want to see the
styling live, flip `draft: false` and visit `/blog-authoring-reference`.

Posts live in `src/content/blog/` as either `.md` (pure markdown, no
React/Astro) or `.mdx` (markdown + imported components). The collection
schema is in `src/content/config.ts`.

---

## Frontmatter

```yaml
---
title: string              # required
description: string        # required — also used for OG / meta description
date: YYYY-MM-DD           # required
updated: YYYY-MM-DD        # optional — shows an "Updated" chip
tags: [tag-one, tag-two]   # optional — shown as pills under the title
category: blog | note | essay
cover: /blog/my-post/hero.webp   # optional — big image + OG image
draft: false               # `true` hides the post from the build
featured: false
---
```

---

## Plain markdown (works in `.md` and `.mdx`)

### Headings

`#` through `######`. Clicking a table-of-contents entry jumps to the heading
with breathing room (`scroll-margin-top`) so it isn't glued to the viewport edge.

### Inline formatting

| Syntax                         | Result                                       |
| ------------------------------ | -------------------------------------------- |
| `**bold**`                     | **bold**                                     |
| `*italic*`                     | *italic*                                     |
| `~~strikethrough~~`            | ~~strikethrough~~                            |
| `` `code` ``                   | `code`                                       |
| `[text](/url)`                 | inline link, underline-dotted on hover       |
| `<mark>highlight</mark>`       | <mark>highlight</mark>                       |
| `<kbd>⌘</kbd>`                 | keyboard key pill                            |
| `<abbr title="...">ABBR</abbr>`| dotted-underline tooltip                     |
| `<sup>1</sup>` / `<sub>2</sub>`| superscript / subscript                      |

### Lists

Unordered lists nest `disc → circle → square`. Ordered lists use decimal.
GFM task lists work:

```md
- [x] done
- [ ] not done
```

### Blockquotes

```md
> A quote. Gets a thick left bar and a muted-bg fill.
>
> > Nested quotes step up with a translucent tint.
```

### Tables

Standard GFM tables with a muted column-header row and subtle per-row
borders:

```md
| Column A | Column B | Column C |
| -------- | -------- | -------- |
| a1       | b1       | c1       |
```

### Code blocks

Fenced with a language tag for Shiki syntax highlighting:

````md
```tsx
export function Hello() {
  return <div>hi</div>;
}
```
````

### Definition lists

```md
Term
: Definition goes here.
```

### Horizontal rule

A `---` on its own line renders as a faint separator.

### Footnotes (GFM)

```md
A claim worth qualifying.[^src]

[^src]: Source, detail, or context goes down here.
```

Footnote markers link to a "Footnotes" section at the bottom of the
post, and each footnote has a back-arrow that returns the reader to
the caller.

### Images

Bare image syntax renders full-width and clickable (lightbox with
arrow-key navigation, `Esc` to close):

```md
![Alt text](/blog/my-post/shot.webp)
```

For a caption, wrap in a real `<figure>` (this is valid markdown and
works in `.md`):

```html
<figure>
  <img src="/blog/my-post/shot.webp" alt="Alt text." />
  <figcaption>A short caption. Can contain <a href="...">links</a>.</figcaption>
</figure>
```

### Collapsible disclosure

Native `<details>`/`<summary>` is styled as a muted card with a
rotating arrow:

```html
<details>
  <summary>What's in the box?</summary>

  Markdown inside works, including nested code blocks and lists.
</details>
```

---

## MDX-only components

Switch the file extension from `.md` to `.mdx` and import what you
need. Each component lives in `src/components/blog/mdx/`.

### `<Callout>` — note / info / tip / warn / success

```mdx
import Callout from '@/components/blog/mdx/Callout.astro';

<Callout type="warn" title="Optional custom title">
  A short paragraph of context. **Inline markdown works inside.**
</Callout>
```

Types map to: `note` (muted), `info` (blue), `tip` (green), `warn`
(amber), `success` (green).

### `<YouTube>` — embedded video

```mdx
import YouTube from '@/components/blog/mdx/YouTube.astro';

<YouTube id="dQw4w9WgXcQ" caption="Optional caption." />
```

Accepts either a bare ID or a full URL, and an optional `start={42}`
in seconds. Uses the `youtube-nocookie` domain.

### `<Video>` — native HTML5 video

```mdx
import Video from '@/components/blog/mdx/Video.astro';

<Video
  src="/blog/my-post/clip.mp4"
  poster="/blog/my-post/clip-cover.webp"
  caption="Recording of the bug in action."
/>
```

`autoplay` is supported (muted+loop are forced by the browser for
autoplay to be allowed).

### `<Kbd>` — keyboard key

```mdx
import Kbd from '@/components/blog/mdx/Kbd.astro';

Press <Kbd>⌘</Kbd> + <Kbd>K</Kbd> to open the command palette.
```

The raw markdown `<kbd>...</kbd>` works too; the component is only
worth the import if you want the styled key-pill in a lot of places.

---

## Ideas that aren't built yet

If a post needs one of these, it's a small add — grep this file, add the
component under `src/components/blog/mdx/`, document it here, ship.

- `<Tweet id="..." />` — Twitter / X embed via `react-tweet`.
- `<Gist id="..." />` — GitHub gist embed.
- `<Compare before="..." after="..." />` — before/after slider for
  design posts.
- `<Quote author="..." role="...">...</Quote>` — pull-quote with an
  attribution line.
- `<ProjectCard slug="..." />` — inline card linking to a project.
- `<ProjectGallery slugs={[...]} />` — a row of project thumbnails.

---

## Lightbox scope

Every `<img>` inside the post body (including inside `<figure>`) gets
the click-to-expand lightbox automatically — no component or class
needed. See `src/components/ui/Lightbox.astro`.
