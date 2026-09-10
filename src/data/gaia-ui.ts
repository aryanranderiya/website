// GAIA UI component embeds (https://ui.heygaia.io).
// To add a component: append its docs slug to COMPONENT_SLUGS in
// scripts/fetch-gaia-components.mjs, run it, and add an experiments entry
// pointing at the generated data. No iframes, no vendored code — the
// experiments pages render the parsed data natively.

import componentsData from './gaia-components.json';

export interface GaiaUiVariant {
	name: string;
	anchor: string;
	description: string | null;
}

export interface GaiaUiProp {
	prop: string;
	type: string;
	default: string;
	description: string;
}

export interface GaiaUiEmbed {
	slug: string;
	title: string;
	description: string;
	docsUrl: string;
	variants: GaiaUiVariant[];
	example: string | null;
	props: GaiaUiProp[];
}

const components = (componentsData as { components: GaiaUiEmbed[] }).components;

export function gaiaUiEmbedFor(slug: string): GaiaUiEmbed | undefined {
	return components.find((c) => c.slug === slug);
}
