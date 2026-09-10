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
	{
		slug: 'gaia-footer',
		title: 'GAIA Footer',
		description:
			'A faithful replica of the heygaia.io site footer: deep-blue glow wallpaper, film-grain overlay, link columns, a giant wordmark, and the status plus social bottom bar.',
		bio: "Rebuilt from the live heygaia.io footer markup. The wallpaper and Experience logo hotlink GAIA's CDN; the commercial type falls back to Inter with tight tracking; hovers use GAIA blue (#00bbff). The canvas-rendered giant wordmark is the one deliberate substitution: a blend-overlay type treatment instead of the original canvas effect. Images sit behind shimmer skeletons with a crossfade on load.",
		date: '2026-09-10',
	},
];
