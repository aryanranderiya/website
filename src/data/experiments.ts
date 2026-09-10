// Experiments - small interactive component demos.
// The /experiments page shows these as a click-through grid; each opens a
// detail page (/experiments/[slug]) where the live component, title,
// description and writeup are shown.

import type { GaiaUiEmbed } from './gaia-ui';
import { gaiaUiEmbedFor } from './gaia-ui';

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
	/** GAIA UI docs embed — grid shows the first variant, detail shows all */
	gaiaUi?: GaiaUiEmbed;
}

export const experiments: Experiment[] = [
	{
		slug: 'chat-demo',
		title: 'Chat Demo',
		description: 'GAIA UI chat preview — pixel-accurate bubbles for every platform.',
		bio: 'Live embeds from the GAIA UI docs. One entry per component, variants below, full docs linked at the bottom.',
		date: '2026-09-11',
		gaiaUi: gaiaUiEmbedFor('chat-demo'),
	},
	{
		slug: 'footer-glow',
		title: 'Footer Glow',
		description: 'GAIA UI glowing footer backdrop with the halftone wordmark.',
		bio: 'Live embeds from the GAIA UI docs — same component family as the GAIA Footer experiment above, shown in its documented variants.',
		date: '2026-09-11',
		gaiaUi: gaiaUiEmbedFor('footer-glow'),
	},
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
		description: "heygaia.io's footer glow + interactive halftone GAIA dot-wordmark.",
		bio: 'Ported from the GAIA www source. The wordmark is a live halftone dot grid rasterized from Aeonik and the GAIA mark — hover to swell the dots, click for the ripple.',
		date: '2026-09-10',
	},
];
