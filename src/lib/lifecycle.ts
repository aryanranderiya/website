/**
 * Lifecycle helpers for the `<ClientRouter />` (view transitions) world.
 *
 * The whole site is a long-lived SPA: navigating an internal link swaps the
 * `<body>` DOM instead of doing a full browser load. Bundled `<script>` modules
 * therefore run exactly ONCE per hard load — never again on a swap — so any
 * interactivity wired at module top level is dead after the first navigation
 * (the classic "works until I reload" bug).
 *
 * The fix is to register init with the router instead of running it eagerly.
 * Route every interactivity script through `onPage()` and the whole class of
 * bug — stale listeners, never-firing observers, leaked intervals — goes away.
 *
 * See: https://docs.astro.build/en/guides/view-transitions/#script-behavior-with-view-transitions
 */

type Cleanup = void | (() => void);

/**
 * Run `init` on the initial load AND after every ClientRouter swap.
 *
 * Return a cleanup function from `init` to tear down whatever it allocated
 * (event listeners, `setInterval`, `IntersectionObserver`, …). The cleanup runs
 * before the next `init` and again on `astro:before-swap`, which is what keeps
 * navigations idempotent and leak-free.
 *
 * ```ts
 * import { onPage } from '@/lib/lifecycle';
 *
 * onPage(() => {
 *   const btn = document.getElementById('copy');
 *   const onClick = () => navigator.clipboard.writeText(location.href);
 *   btn?.addEventListener('click', onClick);
 *   return () => btn?.removeEventListener('click', onClick);
 * });
 * ```
 *
 * `init` must be self-contained: do ALL DOM access inside it, never at module
 * top level — top-level code is exactly what doesn't survive a swap.
 */
export function onPage(init: () => Cleanup): void {
	let cleanup: Cleanup;

	const teardown = () => {
		if (typeof cleanup === 'function') {
			try {
				cleanup();
			} finally {
				cleanup = undefined;
			}
		}
	};

	const run = () => {
		teardown();
		cleanup = init();
	};

	// `astro:page-load` fires on the very first load too, so this single
	// registration covers both initial render and every subsequent swap.
	document.addEventListener('astro:page-load', run);
	// Tear down before the outgoing page is swapped away, so nothing from the
	// old page leaks into or fires against the new one.
	document.addEventListener('astro:before-swap', teardown);
}
