// Experiments - small interactive component demos.
// The /experiments page shows these as a click-through grid; each opens a
// detail page (/experiments/[slug]) where the live component, title,
// description and writeup are shown.

export interface Experiment {
	/** unique id, also used to map to its live component + as the route */
	slug: string;
	title: string;
	/** one-line lead shown on the detail page */
	description: string;
	/** longer writeup shown on the detail page */
	bio: string;
	/** ISO date */
	date: string;
}

export const experiments: Experiment[] = [
	{
		slug: 'holo-card',
		title: 'Holographic Card',
		description:
			'A holographic membership card with a cursor-tracked foil sheen, a 3D parallax tilt, and a flip to the back - clipped to a postage-stamp die-cut silhouette.',
		bio: "This is the exact holo card from GAIA's onboarding flow, dropped in here as an experiment. The foil is a mix-blend-mode 'color-dodge' gradient that tracks your cursor; the 3D tilt is react-parallax-tilt; the silhouette is an SVG postage-stamp clip-path scaled to the card. Move your mouse across it to watch the foil shift, and click it to flip to the back.",
		date: '2026-05-22',
	},
];
