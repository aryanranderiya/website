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

Switch the file extension from `.md` to `.mdx`. Each component lives in
`src/components/blog/mdx/` and is registered in the shared `mdxComponents`
map (`src/components/blog/mdx/index.ts`), which every collection slug page
(`blog`, `projects`, `agent-convos`) passes to `<Content components={…} />`.

That means **you can use the tags below in any `.mdx` without importing
them** — they're not blog-specific. A local `import` inside an `.mdx` still
works and takes precedence over the registry, so the examples below (which
import explicitly) remain valid.

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

Both `<DemoVideo>` and `<Video>` render the
[SimplePlayer](https://simpleplayer.grizz.fyi/) web component
(`@grizzshutsdown/simpleplayer`): a clean framed clip with a play/pause +
scrubber overlay, lazy-loading, and (with `controls`) volume, Picture-in-Picture,
and fullscreen. The element is registered globally on the client by an
`import '@grizzshutsdown/simpleplayer'` inside each component, so it survives
Astro view transitions.

> SimplePlayer fills its frame with `object-fit: cover`. If your clip isn't
> 16:9, pass `aspectRatio` matching the source (e.g. `aspectRatio="1280 / 774"`)
> or it will be cropped.

### `<DemoVideo>` — autoplay walkthrough clip

```mdx
import DemoVideo from '@/components/blog/mdx/DemoVideo.astro';

<DemoVideo
  src="/blog/my-post/clip.mp4"
  aspectRatio="1280 / 774"
  caption="A walkthrough of the build."
/>
```

Muted **autoplay + loop** when scrolled into view — use for ambient
hero/walkthrough clips. Props: `src`, `caption`, `aspectRatio` (default
`16 / 9`), `autoplay` (default `true`), `controls` (default `false` — set it to
add the volume/PiP/fullscreen tray).

### `<Video>` — click-to-play embed

```mdx
import Video from '@/components/blog/mdx/Video.astro';

<Video
  src="/blog/my-post/clip.mp4"
  caption="Recording of the bug in action."
/>
```

Same player as `<DemoVideo>`, but defaults to **click-to-play** (`autoplay`
default `false`) so the clip only loads when tapped. Same prop set.

### `<Kbd>` — keyboard key

```mdx
import Kbd from '@/components/blog/mdx/Kbd.astro';

Press <Kbd>⌘</Kbd> + <Kbd>K</Kbd> to open the command palette.
```

The raw markdown `<kbd>...</kbd>` works too; the component is only
worth the import if you want the styled key-pill in a lot of places.

### `<Figure>` — single image (+ optional TOC tag)

```mdx
<Figure
  src="/blog/my-post/shot.webp"
  alt="Alt text."
  caption="A short caption. Can contain <a href='...'>links</a>."
/>
```

A captioned image, equivalent to writing a `<figure>` by hand but with the
bonus that it can be **tagged into the table of contents**. Add `toc` plus
an optional `tocLabel` (falls back to caption, then alt) and `tocMode`:

```mdx
<Figure
  src="/blog/my-post/desk.webp"
  caption="My current setup."
  toc
  tocLabel="My current setup"
  tocMode="inline"   {/* "inline" (default) = small thumbnail, "line" = image icon + label */}
/>
```

See **Table of contents tagging** below.

### `<ImageGrid>` — multi-image grid

```mdx
<ImageGrid
  cols={2}
  caption="Optional caption under the whole grid."
  images={[
    { src: "/blog/my-post/a.webp", alt: "First image." },
    { src: "/blog/my-post/b.webp", alt: "Second image." },
    { src: "/blog/my-post/c.webp", alt: "Third image." },
    { src: "/blog/my-post/d.webp", alt: "Fourth image." },
  ]}
/>
```

Lays out several images in a responsive square grid (one column on
mobile, `cols` columns from 560px up — defaults to 2). Images are
`object-fit: cover` with rounded corners, flat (no borders),
`--muted-bg` surface. Every image still gets the automatic lightbox.
Registered globally, so no import needed. Use it instead of stacking
multiple `<figure>` blocks when the shots belong together.

Individual grid images can also be tagged into the TOC:

```mdx
images={[
  { src: "/blog/my-post/a.webp", alt: "First.", toc: true, tocLabel: "First", tocMode: "inline" },
]}
```

### Table of contents tagging

The right-rail TOC ("On this page") is normally built from `##`/`###`
headings. You can also tag **images** into it from `<Figure>` (single) or
`<ImageGrid>` (per-image) with `toc` + `tocLabel` + `tocMode`:

- `tocMode="inline"` (default) — a small uniform landscape thumbnail next
  to the label.
- `tocMode="line"` — an image icon next to the label (no thumbnail).

The TOC list is assembled **client-side** from the rendered DOM, so heading
and image entries appear in document order. The rail shows up automatically
when a post has more than one heading **or** any tagged image (even a post
with zero headings, like an image-led photo essay). It needs at least two
total entries to render. Implementation: `src/components/ui/TableOfContents.astro`
(its styles are `is:global` under `#toc` because entries are built in JS).

### `<Tweet>` — X / Twitter embed

```mdx
<Tweet id="2056325510431686836" />
```

Pass the numeric status id (the trailing part of the X URL). The tweet is
fetched at **build time** via `react-tweet`'s `getTweet`, rendered to static
HTML with `<EmbeddedTweet>` — zero client JS, no runtime fetch. Styling is
remapped onto the site's flat tokens in `global.css` (`.tweet-embed
.react-tweet-theme`): no border, `--muted-bg` surface, opacity-hierarchy
text, auto dark mode. If the tweet can't be fetched it falls back to a plain
"View tweet on X" link. Registered globally, so no import needed.

---

## Ideas that aren't built yet

If a post needs one of these, it's a small add — grep this file, add the
component under `src/components/blog/mdx/`, document it here, ship.

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
