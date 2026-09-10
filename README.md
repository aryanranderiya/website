# aryanranderiya.com

Personal portfolio for Aryan Randeriya — developer, designer, and builder based in Ahmedabad, India. Covers projects, freelance work, graphic design, a blog, a bookshelf, photos, and more.

Live at [aryanranderiya.com](https://aryanranderiya.com).

## Stack

- [Astro](https://astro.build) — site framework, content collections, SSR/SSG
- React — interactive islands via `client:load` / `client:visible`
- Tailwind CSS v4 — utility styling
- Framer Motion + GSAP — animations
- MDX — blog and project content
- Biome — linting and formatting
- TypeScript throughout

## Running locally

```bash
bun install
bun run dev
```

> Known issue: `bun dev` (Cloudflare workerd runtime) currently fails at
> startup with `require is not defined` from React's CJS shims
> (`react-dom/server`, `react`). This is an upstream gap between Vite 8's
> module runner, workerd, and React's packaging — production `build` +
> `preview` are unaffected (rollup interops the CJS). Until upstream resolves
> it, verify changes with the production loop below.

Production loop (also what serves https://aryanranderiya.com):

```bash
bun run build
bun run preview # serves dist/ on :4321 with the real Worker runtime
```

Other useful scripts: `bun run type-check`, `bun run lint:fix`, `bun run check:fix`.

## Design principles

The UI follows a strict flat design system. No borders, no outlines, no decorative shadows — background fills (`bg-[var(--muted-bg)]`) handle surface differentiation instead. All icons come from `@theexperiencecompany/gaia-icons` (solid-rounded set), never from emojis or Unicode symbols.

## Environment variables

Spotify and GitHub integrations require secrets at build time:

```
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REFRESH_TOKEN=
GITHUB_TOKEN=
```
