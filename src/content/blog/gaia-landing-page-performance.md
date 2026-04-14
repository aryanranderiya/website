---
title: "GAIA Landing Page: From Lighthouse 34 to 100"
description: A full walkthrough of every fix  --  wallpaper preloads, forced reflows, deferred Sentry, critical CSS inlining  --  and the exact numbers at each step.
date: 2026-04-13
tags: [performance, next.js, web vitals, react]
category: engineering
featured: true
cover: https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=630&fit=crop
---

I've been working on [GAIA](https://heygaia.io)  --  a proactive AI assistant  --  for a while now, and for most of that time the landing page performance was an afterthought. The product was evolving fast, features kept getting added, and "fix the Lighthouse score" kept slipping down the priority list. It finally became impossible to ignore.

The starting number was **34**. On a desktop, no throttling, production build. That's not "could be better." That's broken. The page locked the main thread for nearly four seconds after loading and didn't become interactive for over ten. I decided to fix it properly  --  no visual changes, no feature removals, just finding and eliminating everything that was standing between the user and a responsive page.

The final number across five consecutive production-build runs: **100, 100, 100, 100, 98.** Average 99.6.

This post is a full account of how that happened, in the order it happened, with the actual code.

---

## The ground rules I set before touching anything

I wanted to be honest with myself about what kind of optimisation I was doing. It's easy to "improve performance" by ripping out animations or gutting a feature. That's not performance work  --  that's just deletion. So I gave myself three rules:

1. **No visual changes.** The hero animation stays. The wallpapers animate the same way. Every pixel looks identical before and after.
2. **No functional changes.** Auth works the same. Analytics still fire. The live workflow API call on the landing page stays in.
3. **Only defer, split, preload, or wire configs differently.**

If I couldn't fix something without breaking one of those rules, I'd leave it in the "still on the list" section and ship anyway.

---

## Where we started

Before touching a line of code, I did a full profiling pass. Dev server, no throttling, Chrome DevTools performance panel and Lighthouse side by side.

The headline numbers from a production build before any fixes:

| Metric | Baseline |
|---|---|
| Performance score | 34 |
| First Contentful Paint | 3.1 s |
| Largest Contentful Paint | 3.1 s |
| Total Blocking Time | **3,730 ms** |
| Time to Interactive | **10.3 s** |
| Bootup Time | 5.2 s |
| Main-thread Work | 11.8 s |
| Unused JavaScript | 394 KB |
| Server Response Time | 680 ms |

The TBT number is the one I kept coming back to. 3,730 milliseconds. That means for almost four seconds after the HTML arrived, the browser's main thread was completely occupied running JavaScript. Any click, any scroll, any interaction during that window just queued up and waited. That's why the page *felt* so broken  --  not because it looked wrong, but because nothing responded.

The profiling surfaced five specific culprits:

- **902 KB of raw wallpaper preloads** in the root layout, loading all four full-resolution images on every page
- **A 372ms synchronous style recalculation** from a single function in `UseCaseSection` that walked the entire DOM ancestor chain on mount
- **Sentry + replay running on the critical path**  --  165 KB gzipped of error-tracking code initialising during hydration
- **`@xyflow/react` CSS** on the critical path from a statically-imported component that should have been deferred
- **The icons chunk** ballooning to 137 icons in a shared synchronous bundle

I worked through them in roughly this order.

---

## Fix 1  --  Remove 902 KB of raw wallpaper preloads

**File:** `apps/web/src/app/layout.tsx`

This one was embarrassing to find. The root layout was preloading all four hero wallpapers on every page  --  raw, full-resolution, bypassing Next.js image optimisation entirely. And on the landing page, `HeroImage.tsx` was also rendering the active wallpaper via `<Image>`, so `swiss_morning.webp` (311 KB) was downloading *twice*: once as a raw preload (311 KB) and once through the image optimisation pipeline (52 KB).

The fix was to remove all four raw preloads and add `priority` to the `<Image>` component so Next.js auto-injects the preload for the correctly-sized, correctly-formatted URL instead.

**Before:**
```tsx
<link
  rel="preload"
  as="image"
  href="/images/wallpapers/swiss_morning.webp"
  fetchPriority="high"
  type="image/webp"
/>
<link rel="preload" as="image" href="/images/wallpapers/swiss.webp" type="image/webp" />
<link rel="preload" as="image" href="/images/wallpapers/swiss_evening.webp" type="image/webp" />
<link rel="preload" as="image" href="/images/wallpapers/swiss_night.webp" type="image/webp" />
```

**After:**
```tsx
{/* All four raw preloads removed. */}
```

And in `HeroImage.tsx`:
```tsx
<Image
  src={wallpaper.webp}
  width={1920}
  height={1080}
  sizes="100vw"
  priority  {/* was: loading="eager" */}
  alt=""
/>
```

Impact: roughly 902 KB off every page load. The wallpaper still preloads  --  just through the optimised path, at the right size, in the right format for the user's device.

---

## Fix 2  --  Kill the 372ms forced reflow

**File:** `apps/web/src/features/use-cases/components/UseCaseSection.tsx`

This one took me a while to trace. The performance panel showed a 372ms "Recalculate Style" entry on mount. I followed the call stack into `getScrollContainer()`, which walked up the DOM ancestor chain calling `window.getComputedStyle()` on every parent element to find the nearest scrollable container.

On the landing page, nothing matched  --  the window is the scroller. So the function walked all the way to the document root, calling `getComputedStyle` at every step, forcing a full style recalculation on 1,615 elements, and returning `null`. Then it ran again on the next render. Then again.

**Before:**
```ts
const getScrollContainer = useCallback(() => {
  let current = dummySectionRef.current?.parentElement;
  while (current) {
    const styles = window.getComputedStyle(current); // full style recalc each hop
    if (styles.overflowY === "auto" || styles.overflowY === "scroll") return current;
    current = current.parentElement;
  }
  return null;
}, [dummySectionRef]);
```

The fix was two parts: add a `scroller` prop so the call site can pass `null` explicitly and skip the traversal entirely, and cache the result so in-app uses only ever pay for it once.

**After:**
```ts
const scrollContainerCache = useRef<HTMLElement | null | undefined>(undefined);

const getScrollContainer = useCallback((): HTMLElement | null => {
  if (scroller !== undefined) return scroller;        // explicit prop wins
  if (scrollContainerCache.current !== undefined)     // cached hit
    return scrollContainerCache.current;

  let current = dummySectionRef.current?.parentElement;
  while (current) {
    const styles = window.getComputedStyle(current);
    if (styles.overflowY === "auto" || styles.overflowY === "scroll") {
      scrollContainerCache.current = current;
      return current;
    }
    current = current.parentElement;
  }
  scrollContainerCache.current = null;
  return null;
}, [dummySectionRef, scroller]);
```

Landing page call site:
```tsx
<UseCaseSection
  dummySectionRef={contentRef}
  hideUserWorkflows
  useBlurEffect
  rows={2}
  columns={3}
  hideAllCategory
  scroller={null}  {/* skip DOM traversal entirely */}
/>
```

Impact: the 372ms forced reflow entry disappeared from the performance panel entirely. Re-ran the Lighthouse forced-reflow insight  --  gone.

---

## Fix 3  --  Defer `@xyflow/react` CSS off the critical path

**File:** `apps/web/src/features/landing/components/demo/ChatDemoSection.tsx`

`ChatDemoSection` was already behind `dynamic()`  --  it's the interactive demo section below the fold and shouldn't be in the initial bundle. But inside it, `DemoGoalsView` was *statically* imported, and `DemoGoalsView` imports `@xyflow/react/dist/style.css`. Even with the outer dynamic boundary, that CSS was leaking into a shared CSS chunk and becoming render-blocking.

**Before:**
```tsx
import DemoGoalsView from "./goals-demo/DemoGoalsView";
```

**After:**
```tsx
import dynamic from "next/dynamic";

// Lazy-load so @xyflow/react CSS is deferred with its JS chunk.
const DemoGoalsView = dynamic(() => import("./goals-demo/DemoGoalsView"), {
  ssr: false,
});
```

Impact: 199ms of render-blocking CSS off the critical path.

---

## Fix 4  --  Remove dead preconnects

**File:** `apps/web/src/app/layout.tsx`

The root layout had preconnect hints to `https://us.i.posthog.com` and `https://api.heygaia.io`. Neither origin was actually being hit from the page  --  PostHog routes through a `/ingest` proxy rewrite, and the API calls go to localhost in dev. Chrome was opening TCP + TLS handshake connections to both, never using them, and the DevTools network audit was flagging them as unused.

**Before:**
```tsx
<link rel="preconnect" href="https://us.i.posthog.com" crossOrigin="anonymous" />
<link rel="preconnect" href="https://api.heygaia.io" crossOrigin="anonymous" />
```

**After:** both tags removed.

---

## Fix 5  --  Guard PostHog against a missing token

**File:** `apps/web/instrumentation-client.ts`

Every single page load was throwing `posthog.init("undefined")`. The non-null assertion (`!`) was suppressing TypeScript's type error, but at runtime in environments without the env var set  --  like CI or local dev without a `.env.local`  --  it just passed the string `"undefined"` as the API key. PostHog tried to init, failed, and logged a console error. Lighthouse's Best Practices audit caught it.

**Before:**
```ts
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, { ... });
```

**After:**
```ts
if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, { ... });
}
```

---

## Fix 6  --  Footer hydration mismatch

**File:** `apps/web/src/components/navigation/Footer.tsx`

This one was subtle. The Lighthouse console errors audit was flagging a React hydration error on the Footer's JSON-LD `<script>`  --  not on the component that was actually the cause.

There were two sources of server/client divergence in the same component:

1. `Math.random()` selected a tagline during render. The server picked one, the client picked a different one. I had `suppressHydrationWarning` on the text node, which silenced that specific element  --  but React was still detecting tree structure mismatches from cascading effects, and Lighthouse was seeing it in the JSON-LD sibling.

2. The footer filtered its nav links based on `isAuthenticated`. Zustand's persisted store hydrates from localStorage synchronously on the client, so the link list on first client render could differ from what the server rendered.

**Before:**
```ts
const user = useUser();
const isAuthenticated = user?.email;
const randomTagline = taglines[Math.floor(Math.random() * taglines.length)];
```

**After:**
```ts
const user = useUser();
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
const isAuthenticated = mounted ? user?.email : undefined;

const [randomTagline, setRandomTagline] = useState(taglines[0]);
useEffect(() => {
  setRandomTagline(taglines[Math.floor(Math.random() * taglines.length)]);
}, []);
```

SSR and the initial client render are now identical. The tagline randomises and the auth-gated links update after hydration as normal state changes.

---

## Fix 7  --  DemoModelPicker react-aria ID mismatch

**File:** `apps/web/src/features/landing/components/demo/DemoChatHeader.tsx`

HeroUI's `Select` component uses `react-aria` under the hood, which generates unique IDs during render. Those IDs differ between the server render and the first client render by design  --  it's how react-aria handles accessible labelling across SSR. Nothing to fix upstream, just don't SSR it.

**Before:**
```tsx
import DemoModelPicker from "./DemoModelPicker";
```

**After:**
```tsx
import dynamic from "next/dynamic";
const DemoModelPicker = dynamic(() => import("./DemoModelPicker"), { ssr: false });
```

---

## Fix 8  --  Heading order in demo cards

**File:** `apps/web/src/features/landing/components/demo/dashboard-demo/DemoDashboardView.tsx`

The dashboard demo section had `<h3>` and `<h4>` elements scattered through card content without a parent `<h1>` or `<h2>` in scope. They were being used as styled text labels, not as structural document headings. Lighthouse's accessibility audit flagged `heading-order` as invalid.

The fix is just semantic  --  change the element, keep the classes.

**Before:**
```tsx
<h3 className="font-medium text-zinc-300">{title}</h3>
<h4 className="text-sm font-medium text-white line-clamp-1">{todo.title}</h4>
```

**After:**
```tsx
<p className="font-medium text-zinc-300">{title}</p>
<p className="text-sm font-medium text-white line-clamp-1">{todo.title}</p>
```

---

## Checkpoint  --  where we were after fixes 1–8

At this point all the correctness issues were gone. The Lighthouse audit had stopped flagging `errors-in-console`, `heading-order`, and the hydration error. Accessibility moved from 95 to 96. Best Practices from 92 to 96.

But the performance score was still 34. Everything I'd fixed up to this point was about accuracy and correctness. The real performance work  --  JavaScript on the critical path  --  was still ahead.

Here's what the production build looked like at this point:

| Chunk | Size (gzipped) | What's inside |
|---|---|---|
| `dc6a02bddab9f781.js` | 165 KB | Sentry + replay integration |
| `7c1f06a1fd63fda3.js` | 162 KB | 137 icons from `gaia-icons` |
| `ecdbee14db15cf33.js` | 63 KB | misc vendor |
| `3b0266bcaac9dd39.js` | 56 KB | Sentry secondary chunk |

That first chunk. 165 KB of Sentry, including the session replay integration, shipping synchronously on the critical path and running during hydration. That single chunk was responsible for a large portion of the 3,730ms TBT.

---

## Fix 9  --  Defer Sentry Replay to idle

**File:** `apps/web/instrumentation-client.ts`

Sentry's `replayIntegration` adds roughly 100 KB gzipped. It captures a session recording in the background  --  useful for debugging, but it doesn't need to start the moment the page loads. It was in the `integrations` array at init time, which meant it shipped eagerly and ran as part of hydration.

**Before:**
```ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  integrations: [Sentry.replayIntegration()],  // eager, ~100KB gz
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

**After:**
```ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  integrations: [],  // replay attached after idle
});

const loadReplay = () => {
  Sentry.lazyLoadIntegration("replayIntegration")
    .then((replayIntegration) => {
      const client = Sentry.getClient();
      if (client) client.addIntegration(replayIntegration());
    })
    .catch(() => {
      // Swallow  --  replay is best-effort.
    });
};

if ("requestIdleCallback" in globalThis) {
  globalThis.requestIdleCallback(loadReplay, { timeout: 4000 });
} else {
  setTimeout(loadReplay, 3000);
}
```

Error capture stays on the critical path  --  if something crashes during boot, we still catch it. Session recording just starts a few seconds later, after the browser has settled. The user never notices.

Note the `globalThis.requestIdleCallback` instead of `window.requestIdleCallback`  --  the instrumentation file runs in edge-adjacent contexts where `window` may not exist, so `globalThis` is the safe reference.

---

## Fix 10  --  Split Navbar's conditional components out of the initial bundle

**Files:** `apps/web/src/components/navigation/Navbar.tsx`, `apps/web/src/layouts/LandingProvidersLayout.tsx`

Four components were eagerly imported in the Navbar but only ever rendered conditionally:

- `NavbarMenu`  --  shown when the dropdown opens
- `MobileMenu`  --  only rendered below 990px viewport width
- `animated-number-react`  --  just the GitHub star counter, 120 KB on disk
- `LoginModal`  --  only mounted when the auth modal opens

All four were in the initial JavaScript bundle, parsed and executed on every page load.

**Before:**
```tsx
import AnimatedNumber from "animated-number-react";
import MobileMenu from "@/components/navigation/MobileMenu";
import { NavbarMenu } from "./NavbarMenu";
import LoginModal from "@/features/auth/components/LoginModal";
```

**After:**
```tsx
const MobileMenu = dynamic(() => import("@/components/navigation/MobileMenu"), {
  ssr: false,
});
const NavbarMenu = dynamic(
  () => import("./NavbarMenu").then((m) => ({ default: m.NavbarMenu })),
  { ssr: false },
);
const AnimatedNumber = dynamic(() => import("animated-number-react"), { ssr: false });
const LoginModal = dynamic(() => import("@/features/auth/components/LoginModal"), {
  ssr: false,
});
```

The star counter renders as a plain static number for a frame until `animated-number-react` loads, then the animation takes over on the next update. Nobody notices.

---

## Fix 11  --  Move Vercel Analytics and Speed Insights out of the root layout

**Files:** `apps/web/src/app/layout.tsx`, `apps/web/src/layouts/AnalyticsLayout.tsx`

`@vercel/analytics` and `@vercel/speed-insights` were imported at the top of the root layout and mounted synchronously. The root layout is an async Server Component  --  you can't use `next/dynamic({ ssr: false })` directly inside it. But `AnalyticsLayout` is already a client component with a 2-second mount gate for Google Analytics, which made it the natural home for these too.

**Before (layout.tsx):**
```tsx
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
// ...
<SpeedInsights />
<VercelAnalytics />
<AnalyticsLayout />
```

**After (AnalyticsLayout.tsx):**
```tsx
const VercelAnalytics = dynamic(
  () => import("@vercel/analytics/next").then((m) => ({ default: m.Analytics })),
  { ssr: false },
);
const SpeedInsights = dynamic(
  () => import("@vercel/speed-insights/next").then((m) => ({ default: m.SpeedInsights })),
  { ssr: false },
);

useEffect(() => {
  const t = setTimeout(() => setShouldLoad(true), 2000);
  return () => clearTimeout(t);
}, []);

if (!shouldLoad) return null;
return (
  <>
    {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
    <VercelAnalytics />
    <SpeedInsights />
  </>
);
```

All three analytics products now load after the page is interactive. Around 40–60 KB gz deferred.

---

## Fix 12  --  Lazy-load the Footer

**File:** `apps/web/src/components/layouts/LandingLayoutShell.tsx`

The Footer is always below the fold. Its static import pulls `JsonLd`, `next/image`, around 20 icons through `appConfig`, and Zustand auth state  --  all on every page load, all competing with the hero section for main-thread time during hydration.

I used `dynamic({ ssr: true })`  --  the HTML still renders server-side (so the JSON-LD and nav links are in the page for SEO), but the client-side JavaScript bundle is split off and doesn't race the hero.

**Before:**
```tsx
import Footer from "@/components/navigation/Footer";
```

**After:**
```tsx
const Footer = dynamic(() => import("@/components/navigation/Footer"), {
  ssr: true,
  loading: () => null,
});
```

Verified with `curl | grep SiteNavigationElement` that the JSON-LD still ships in the SSR HTML.

---

## Fix 13  --  Inline critical CSS with `optimizeCss`

**File:** `apps/web/next.config.mjs`

This one turned out to be the biggest single win of the entire pass.

Every CSS file is render-blocking by default. The browser won't paint any pixels until all render-blocking stylesheets have been fully downloaded and parsed. Before this fix, the landing page was shipping two stylesheets  --  each taking around 400ms to arrive  --  that had to be completely downloaded before any text appeared on screen.

Next.js ships `experimental.optimizeCss: true`, which delegates to [beasties](https://github.com/danielroe/beasties) (Vercel's successor to Critters) to:

- Extract the CSS that's actually needed to render above-the-fold content
- Inline it directly into the `<head>` of the HTML response
- Defer the rest as `<link rel="preload" onload="this.rel='stylesheet'">`

No CSS round-trip. The HTML arrives with everything it needs to paint the hero already in it.

**Before:**
```js
// next.config.mjs
experimental: {
  optimizePackageImports: ["framer-motion", "lucide-react"],
},
```

**After:**
```js
experimental: {
  optimizeCss: true,
  optimizePackageImports: [
    "@heroui/button", "@heroui/chip", "@heroui/modal",
    "@heroui/system", "@heroui/tooltip", "@heroui/select",
    "@heroui/scroll-shadow", "@heroui/react",
    "@heroui/skeleton", "@heroui/spinner",
    "@radix-ui/react-visually-hidden",
    "motion", "schema-dts",
  ],
},
```

I also expanded `optimizePackageImports` heavily here. Without an entry for HeroUI packages, Next.js includes the entire component library barrel export even when you only use `Button`. With explicit entries, the build correctly tree-shakes down to just the components actually used.

The numbers after this single fix:

| Metric | Before | After | Delta |
|---|---|---|---|
| Performance | 61 | **88** | +27 |
| FCP | 3.6 s | **1.5 s** | −2.1 s |
| LCP | 3.6 s | **1.5 s** | −2.1 s |
| Speed Index | 4.9 s | **1.7 s** | −3.2 s |
| TTI | 3.6 s | **1.5 s** | −2.1 s |

2.1 seconds off LCP. From one config flag.

---

## Fix 14  --  Defer the entire Sentry + PostHog init to idle

**File:** `apps/web/instrumentation-client.ts`

After everything else was done, I ran one more measurement pass and noticed Sentry's initialisation itself  --  not just replay  --  was still showing up as a significant main-thread task. The `Sentry.init()` call was running synchronously during the instrumentation phase, before the page even started hydrating.

The final approach was to collapse Sentry and PostHog into a single `requestIdleCallback` and defer both completely until the browser was genuinely idle. Error capture stays on the page (via a lazy proxy that buffers errors before Sentry initialises), but neither SDK runs on the critical path.

```ts
const loadObservability = () => {
  // PostHog
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: "/ingest",
      ui_host: "https://us.posthog.com",
      capture_pageview: false,
      capture_pageleave: true,
    });
  }

  // Sentry (core only  --  replay loads separately)
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    integrations: [],
  });

  // Replay after another idle tick
  globalThis.requestIdleCallback?.(() => {
    Sentry.lazyLoadIntegration("replayIntegration")
      .then((replayIntegration) => {
        Sentry.getClient()?.addIntegration(replayIntegration());
      })
      .catch(() => {});
  }, { timeout: 4000 });
};

if ("requestIdleCallback" in globalThis) {
  globalThis.requestIdleCallback(loadObservability, { timeout: 4000 });
} else {
  setTimeout(loadObservability, 3000);
}
```

This was the last piece. After this, the TBT on desktop dropped to **0 ms**.

---

## Add two GritQL lint rules to lock in the gains

One thing I've learned from performance work: without guardrails, the gains evaporate. Someone adds a new component, imports `motion/react` at the top level without thinking, and suddenly the motion feature bundle is back on the critical path. So I wrote two GritQL rules that run as part of the normal lint pass and fail the build if they're violated.

**`no-motion-full-import.grit`**  --  catches `import { ... } from "motion/react"` when a lazy `m` import should be used instead:
```grit
language js

`import $imports from "motion/react"` where {
  $imports <: not contains `LazyMotion`,
  $imports <: not contains `domAnimation`,
  $imports <: not contains `domMax`,
} => . // fail: use motion/react-m with LazyMotion instead
```

**`no-motion-react-heavy-imports.grit`**  --  same pattern for aliased imports and extended co-import lists.

These run on every `nx lint web` invocation. The critical-path bundle size is now enforced automatically.

---

## The final numbers

Five consecutive runs, same machine, same production build, same localhost standalone server (no CDN, no HTTP/2, no Brotli):

| Run | Performance | LCP | TBT | TTI |
|---|---|---|---|---|
| 1 | 98 | 0.6 s | 30 ms | 0.8 s |
| 2 | 100 | 0.6 s | 0 ms | 0.6 s |
| 3 | 100 | 0.5 s | 0 ms | 0.5 s |
| 4 | 100 | 0.4 s | 0 ms | 0.6 s |
| 5 | 100 | 0.4 s | 10 ms | 0.6 s |

**Average: 99.6.** Accessibility went to 100. Best Practices to 96. SEO stayed at 100.

Before vs after summary:

| Metric | Before | After |
|---|---|---|
| Performance | 34 | **99.6** |
| FCP | 3.1 s | **0.4–0.6 s** |
| LCP | 3.6 s | **0.4–0.6 s** |
| TBT | 3,730 ms | **0–30 ms** |
| TTI | 10.3 s | **0.5–0.8 s** |
| Bootup Time | 5.2 s | **~0.1 s** |
| Main-thread Work | 11.8 s | **~0.5 s** |

These numbers are on a plain `node server.js` with no edge network. In production with a CDN, HTTP/2, and Brotli compression, the FCP and LCP numbers will be strictly better.

---

## What still isn't fixed (and why)

**The LCP render delay (~200ms).** The hero subheading uses a `fadeIn` CSS animation with a `0.2s` delay and `fill-mode: both`. The element is `opacity: 0` for the first 200ms after paint, so the browser can't measure LCP until it becomes visible. That costs around 200–400ms of LCP time that's entirely cosmetic. The user sees a beautiful fade-in. The benchmark sees latency. I chose not to fix it.

**The icon chunk (162 KB).** 137 icons from `gaia-icons` land in a shared synchronous chunk because many async sections on the landing page share the same icons, which defeats the split. `optimizePackageImports` is already on. Fixing this further would require auditing icon usage per section and either reducing the count or accepting duplicates across chunks  --  an UX decision, not a pure perf one.

**Sentry's own forced reflow (282ms).** Sentry's SDK triggers a layout read during its idle-phase initialisation. It's no longer on the critical path, so it doesn't block LCP or TBT  --  but it's still measurable during the idle period. Would need a Sentry SDK configuration pass to address.

---

## What I learned

The biggest insight from this whole pass: **the critical path is not the same as the initial bundle.** The initial bundle can be large and the critical path can still be fast if the right things are deferred. The two metrics that actually matter for perceived performance are FCP (when does something appear?) and TBT (when can the user interact?). Everything else follows from getting those right.

The second insight: **CSS is often the actual bottleneck**, not JavaScript. Fixing `optimizeCss` delivered a 2.1-second LCP improvement  --  more than any individual JavaScript optimisation. It's easy to focus entirely on bundle sizes and miss that render-blocking stylesheets are a much harder ceiling.

And the third: **lint rules are part of the fix**. Without the GritQL rules enforcing the motion import pattern, these gains would have a half-life of a few weeks. The code review will catch some things, but a machine that fails CI is more reliable than a human reviewer who's in a hurry.

The full PR is at [theexperiencecompany/gaia#635](https://github.com/theexperiencecompany/gaia/pull/635).
