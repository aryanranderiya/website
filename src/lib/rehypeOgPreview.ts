import { fetchOgMetadata } from './fetchOgMetadata';

interface HastNode {
	type: string;
	tagName?: string;
	properties?: Record<string, unknown>;
	children?: HastNode[];
	value?: string;
}

const SITE_HOSTS = new Set(['aryanranderiya.com', 'www.aryanranderiya.com', 'localhost']);

function getProp(props: Record<string, unknown> | undefined, ...keys: string[]): unknown {
	if (!props) return undefined;
	for (const k of keys) {
		if (props[k] != null) return props[k];
	}
	return undefined;
}

function isExternal(href: string): boolean {
	if (!/^https?:\/\//i.test(href)) return false;
	try {
		const url = new URL(href);
		return !SITE_HOSTS.has(url.hostname);
	} catch {
		return false;
	}
}

function shouldSkipAnchor(node: HastNode): boolean {
	const props = node.properties ?? {};
	if (getProp(props, 'dataFootnoteRef', 'data-footnote-ref') != null) return true;
	if (getProp(props, 'dataFootnoteBackref', 'data-footnote-backref') != null) return true;
	if (getProp(props, 'dataNoPreview', 'data-no-preview') != null) return true;
	const className = props.className ?? props.class;
	if (
		Array.isArray(className) &&
		className.some((c) => typeof c === 'string' && c.includes('footnote'))
	) {
		return true;
	}
	return false;
}

/**
 * Rehype plugin: scrapes OG metadata at build time for every external `<a>` in
 * blog posts, prepends a favicon `<img>` inside the anchor, and stamps the
 * preview JSON onto a `data-preview` attribute. The client-side `<BlogLinks>`
 * island reads that attribute to render the hover popover.
 */
export function rehypeOgPreview() {
	return async function transformer(tree: HastNode, file: { path?: string }) {
		const path = file?.path ?? '';
		if (!path.includes('/content/blog/')) return;

		const anchors: HastNode[] = [];
		(function walk(node: HastNode) {
			if (node.type === 'element' && node.tagName === 'a') {
				if (!shouldSkipAnchor(node)) anchors.push(node);
			}
			if (node.children) for (const c of node.children) walk(c);
		})(tree);

		await Promise.all(
			anchors.map(async (node) => {
				const props = node.properties ?? {};
				const href = typeof props.href === 'string' ? props.href : '';
				if (!isExternal(href)) return;

				const preview = await fetchOgMetadata(href);
				if (!preview) return;

				node.properties = { ...props, 'data-preview': JSON.stringify(preview) };

				if (preview.favicon) {
					const favicon: HastNode = {
						type: 'element',
						tagName: 'img',
						properties: {
							src: preview.favicon,
							alt: '',
							className: ['blog-link-favicon'],
							loading: 'lazy',
							'aria-hidden': 'true',
						},
						children: [],
					};
					node.children = [favicon, ...(node.children ?? [])];
				}
			})
		);
	};
}

export default rehypeOgPreview;
