import type { LinkPreview } from '@/components/ui/PreviewLink';

const META_RE = /<meta\b[^>]*?>/gi;
const ATTR_RE = /(\w[\w:-]*)\s*=\s*"([^"]*)"|(\w[\w:-]*)\s*=\s*'([^']*)'/g;
const TITLE_RE = /<title[^>]*>([\s\S]*?)<\/title>/i;
const LINK_RE = /<link\b[^>]*?>/gi;

interface MetaTag {
	[k: string]: string;
}

function parseTagAttrs(tag: string): MetaTag {
	const out: MetaTag = {};
	let match: RegExpExecArray | null;
	ATTR_RE.lastIndex = 0;
	while ((match = ATTR_RE.exec(tag)) !== null) {
		const key = (match[1] ?? match[3]).toLowerCase();
		const value = match[2] ?? match[4];
		out[key] = value;
	}
	return out;
}

function decode(text: string | undefined): string | undefined {
	if (!text) return undefined;
	return text
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&#x27;/g, "'")
		.trim();
}

function absolutize(url: string | undefined, base: string): string | undefined {
	if (!url) return undefined;
	try {
		return new URL(url, base).toString();
	} catch {
		return undefined;
	}
}

const cache = new Map<string, Promise<LinkPreview | null>>();

async function fetchOnce(url: string): Promise<LinkPreview | null> {
	try {
		const res = await fetch(url, {
			headers: {
				'user-agent':
					'Mozilla/5.0 (compatible; aryanranderiya.com/preview-link; +https://aryanranderiya.com)',
				accept: 'text/html,application/xhtml+xml',
			},
			redirect: 'follow',
		});
		if (!res.ok) return null;
		// Only the head is needed; bail out at </head> if we can.
		const text = await res.text();
		const headEnd = text.search(/<\/head>/i);
		const head = headEnd > 0 ? text.slice(0, headEnd) : text;
		const finalUrl = res.url || url;

		const meta: Record<string, string> = {};
		let m: RegExpExecArray | null;
		META_RE.lastIndex = 0;
		while ((m = META_RE.exec(head)) !== null) {
			const attrs = parseTagAttrs(m[0]);
			const key = (attrs.property || attrs.name)?.toLowerCase();
			if (key && attrs.content) meta[key] = attrs.content;
		}

		let favicon: string | undefined;
		LINK_RE.lastIndex = 0;
		while ((m = LINK_RE.exec(head)) !== null) {
			const attrs = parseTagAttrs(m[0]);
			const rel = attrs.rel?.toLowerCase() ?? '';
			if (rel.includes('icon') && attrs.href) {
				favicon = absolutize(attrs.href, finalUrl);
				if (rel.includes('apple-touch') || rel.includes('shortcut')) break;
			}
		}
		if (!favicon) {
			favicon = absolutize('/favicon.ico', finalUrl);
		}

		const titleMatch = head.match(TITLE_RE);
		const docTitle = titleMatch ? titleMatch[1] : undefined;

		return {
			image: absolutize(meta['og:image'] ?? meta['twitter:image'], finalUrl),
			name: decode(meta['og:site_name'] ?? new URL(finalUrl).hostname),
			favicon,
			title: decode(meta['og:title'] ?? meta['twitter:title'] ?? docTitle),
			description: decode(
				meta['og:description'] ?? meta['twitter:description'] ?? meta.description
			),
		};
	} catch {
		return null;
	}
}

/**
 * Fetch OpenGraph metadata for a URL. Used at Astro build time only —
 * the result is baked into the page HTML and shipped to the client as static
 * props on `<PreviewLink>`. The cache deduplicates calls within one build.
 *
 * Falls back to `null` for non-fetchable schemes (mailto:) or network errors;
 * callers should provide their own `preview` prop in that case.
 */
export function fetchOgMetadata(url: string): Promise<LinkPreview | null> {
	if (!/^https?:/i.test(url)) return Promise.resolve(null);
	const existing = cache.get(url);
	if (existing) return existing;
	const promise = fetchOnce(url);
	cache.set(url, promise);
	return promise;
}
