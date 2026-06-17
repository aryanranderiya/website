/**
 * Guarded entry point for the `<simple-player>` web component
 * (`@grizzshutsdown/simpleplayer`). Import THIS instead of the package directly.
 *
 * Why: the library's `attributeChangedCallback` guards most branches with
 * `this.isConnected`, but the `aspect-ratio` branch does not. During an Astro
 * `<ClientRouter />` swap the callback can fire before `connectedCallback` has
 * resolved the element's internal `<video>`, so it dereferences
 * `undefined.dataset` and throws an uncaught `TypeError` on every navigation
 * involving a video. `connectedCallback` re-applies all attributes anyway, so
 * the pre-connect callback is redundant — we just add the missing guard.
 *
 * Drop this wrapper (and import the package directly again) once upstream ships
 * the `this.isConnected` guard on the `aspect-ratio` branch.
 */
import '@grizzshutsdown/simpleplayer';

type ACC = (
	this: HTMLElement,
	name: string,
	oldValue: string | null,
	newValue: string | null
) => void;

const SP = customElements.get('simple-player') as
	| (CustomElementConstructor & { __acGuarded?: boolean })
	| undefined;

if (SP && !SP.__acGuarded) {
	SP.__acGuarded = true;
	const proto = SP.prototype as unknown as { attributeChangedCallback?: ACC };
	const original = proto.attributeChangedCallback;
	if (typeof original === 'function') {
		proto.attributeChangedCallback = function (this: HTMLElement, ...args) {
			try {
				return original.apply(this, args);
			} catch {
				// Benign pre-connect race during view-transition swaps —
				// connectedCallback re-applies attributes once internals exist.
			}
		};
	}
}
