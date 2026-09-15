import { fetchOgMetadata } from './fetchOgMetadata';

interface HastNode {
	type: string;
	tagName?: string;
	properties?: Record<string, unknown>;
	children?: HastNode[];
	value?: string;
	/** mdxJsxFlowElement / mdxJsxTextElement carry these instead of properties */
	name?: string;
	attributes?: Array<{ type?: string; name?: string; value?: unknown }>;
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
 * blog posts and project bodies, prepends a favicon `<img>` inside the anchor,
 * and stamps the preview JSON onto a `data-preview` attribute. The client-side
 * `<BlogLinks>` island reads that attribute to render the hover popover.
 *
 * Anchors inside raw-HTML blocks (figures, embeds) never become hast
 * elements, so they are patched by string surgery on the raw nodes instead.
 */
const RAW_ANCHOR_RE = /<a(\s[^<>]*?href="(https?:\/\/[^"]+)"[^<>]*?)>/gi;

function escapePreviewJson(json: string): string {
	return json.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

export function rehypeOgPreview() {
	return async function transformer(tree: HastNode, file: { path?: string }) {
		const path = file?.path ?? '';
		if (
			!path.includes('/content/blog/') &&
			!path.includes('/content/projects/') &&
			!path.includes('/content/agent-convos/')
		) {
			return;
		}

		const anchors: HastNode[] = [];
		const rawNodes: HastNode[] = [];
		const mdxAnchors: HastNode[] = [];
		(function walk(node: HastNode) {
			if (node.type === 'element' && node.tagName === 'a') {
				if (!shouldSkipAnchor(node)) anchors.push(node);
			} else if (node.type === 'raw' && typeof node.value === 'string') {
				rawNodes.push(node);
			} else if (
				(node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') &&
				node.name === 'a'
			) {
				mdxAnchors.push(node);
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

		// Raw HTML blocks: collect unique external hrefs, fetch once, patch.
		const rawHrefs = new Set<string>();
		for (const node of rawNodes) {
			const value = node.value as string;
			RAW_ANCHOR_RE.lastIndex = 0;
			let m: RegExpExecArray | null;
			// biome-ignore lint/suspicious/noAssignInExpressions: standard regex exec loop
			while ((m = RAW_ANCHOR_RE.exec(value)) !== null) {
				const [tag, , href] = m;
				if (!isExternal(href)) continue;
				if (/data-no-preview|data-preview/.test(tag)) continue;
				rawHrefs.add(href);
			}
		}
		const rawPreviews = new Map<string, string>();
		await Promise.all(
			[...rawHrefs].map(async (href) => {
				const preview = await fetchOgMetadata(href);
				if (!preview) return;
				const img = preview.favicon
					? `<img src="${escapePreviewJson(preview.favicon)}" alt="" class="blog-link-favicon" loading="lazy" aria-hidden="true"/>`
					: '';
				rawPreviews.set(
					href,
					` data-preview="${escapePreviewJson(JSON.stringify(preview))}">${img}`
				);
			})
		);
		if (rawPreviews.size > 0) {
			for (const node of rawNodes) {
				const value = node.value as string;
				RAW_ANCHOR_RE.lastIndex = 0;
				node.value = value.replace(
					/<a(\s[^<>]*?href="(https?:\/\/[^"]+)"[^<>]*?)>/gi,
					(match, attrs, href) => {
						const patch = rawPreviews.get(href);
						if (!patch || /data-no-preview|data-preview/.test(attrs)) return match;
						return `<a${attrs}${patch}`;
					}
				);
			}
		}

		// MDX/JSX anchors (<figure> captions etc.): patch attributes in place.
		await Promise.all(
			mdxAnchors.map(async (node) => {
				const attrs = node.attributes ?? [];
				const hrefAttr = attrs.find((a) => a.name === 'href');
				const href = typeof hrefAttr?.value === 'string' ? hrefAttr.value : '';
				if (!isExternal(href)) return;
				if (attrs.some((a) => a.name === 'data-preview' || a.name === 'data-no-preview')) return;

				const preview = await fetchOgMetadata(href);
				if (!preview) return;

				attrs.push({
					type: 'mdxJsxAttribute',
					name: 'data-preview',
					value: JSON.stringify(preview),
				});
				node.attributes = attrs;

				if (preview.favicon) {
					const favicon: HastNode = {
						type: 'mdxJsxTextElement',
						name: 'img',
						attributes: [
							{ type: 'mdxJsxAttribute', name: 'src', value: preview.favicon },
							{ type: 'mdxJsxAttribute', name: 'alt', value: '' },
							{ type: 'mdxJsxAttribute', name: 'className', value: 'blog-link-favicon' },
							{ type: 'mdxJsxAttribute', name: 'loading', value: 'lazy' },
							{ type: 'mdxJsxAttribute', name: 'aria-hidden', value: 'true' },
						],
						children: [],
					};
					node.children = [favicon, ...(node.children ?? [])];
				}
			})
		);
	};
}
