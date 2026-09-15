import type { LinkPreview } from '@/components/ui/PreviewLink';

const META_RE = /<meta\b[^>]*?>/gi;
const ATTR_RE = /(\w[\w:-]*)\s*=\s*"([^"]*)"|(\w[\w:-]*)\s*=\s*'([^']*)'/g;
const TITLE_RE = /<title[^>]*>([\s\S]*?)<\/title>/i;
const LINK_RE = /<link\b[^>]*?>/gi;
const HEAD_END_RE = /<\/head>/i;

// Stop downloading once we have the head (or this many bytes) — meta,
// favicon and title all live up there. Downloading full bodies is what made
// scrapes time out under build concurrency.
const MAX_HEAD_BYTES = 300_000;

interface MetaTag {
	[k: string]: string;
}

function parseTagAttrs(tag: string): MetaTag {
	const out: MetaTag = {};
	let match: RegExpExecArray | null;
	ATTR_RE.lastIndex = 0;
	// biome-ignore lint/suspicious/noAssignInExpressions: standard regex exec loop
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

// Tiny concurrency limiter: the build fires hundreds of scrapes at once and
// the pile-up is what starves slow hosts past the timeout. No new deps.
function createLimiter(n: number) {
	let active = 0;
	const queue: Array<() => void> = [];
	const pump = () => {
		while (active < n && queue.length > 0) {
			const task = queue.shift();
			if (!task) break;
			active++;
			task();
		}
	};
	return <T>(fn: () => Promise<T>): Promise<T> =>
		new Promise<T>((resolve, reject) => {
			queue.push(() => {
				fn().then(
					(v) => {
						active--;
						pump();
						resolve(v);
					},
					(e) => {
						active--;
						pump();
						reject(e);
					}
				);
			});
			pump();
		});
}

// 8 concurrent scrapes is plenty for a build-time job and keeps slow hosts
// (and local network stacks) from collapsing under a 200-way pile-up.
const limit = createLimiter(8);

async function fetchHead(url: string): Promise<{ head: string; finalUrl: string } | null> {
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), 5000);
	try {
		const res = await fetch(url, {
			headers: {
				'user-agent':
					'Mozilla/5.0 (compatible; aryanranderiya.com/preview-link; +https://aryanranderiya.com)',
				accept: 'text/html,application/xhtml+xml',
			},
			redirect: 'follow',
			signal: ctrl.signal,
		});
		if (!res.ok || !res.body) return null;
		const reader = res.body.getReader();
		const decoder = new TextDecoder();
		let html = '';
		for (;;) {
			const { done, value } = await reader.read();
			if (value) html += decoder.decode(value, { stream: true });
			if (done || HEAD_END_RE.test(html) || html.length >= MAX_HEAD_BYTES) {
				try {
					await reader.cancel();
				} catch {
					// already closed — nothing to cancel
				}
				break;
			}
		}
		html += decoder.decode();
		return { head: html, finalUrl: res.url || url };
	} catch {
		return null;
	} finally {
		clearTimeout(timer);
	}
}

function parseHead(head: string, finalUrl: string): LinkPreview {
	const meta: Record<string, string> = {};
	let m: RegExpExecArray | null;
	META_RE.lastIndex = 0;
	// biome-ignore lint/suspicious/noAssignInExpressions: standard regex exec loop
	while ((m = META_RE.exec(head)) !== null) {
		const attrs = parseTagAttrs(m[0]);
		const key = (attrs.property || attrs.name)?.toLowerCase();
		if (key && attrs.content) meta[key] = attrs.content;
	}

	let favicon: string | undefined;
	LINK_RE.lastIndex = 0;
	// biome-ignore lint/suspicious/noAssignInExpressions: standard regex exec loop
	while ((m = LINK_RE.exec(head)) !== null) {
		const attrs = parseTagAttrs(m[0]);
		const rel = attrs.rel?.toLowerCase() ?? '';
		if (rel.includes('icon') && attrs.href) {
			favicon = absolutize(decode(attrs.href), finalUrl);
			if (rel.includes('apple-touch') || rel.includes('shortcut')) break;
		}
	}
	if (!favicon) {
		favicon = absolutize('/favicon.ico', finalUrl);
	}

	const titleMatch = head.match(TITLE_RE);
	const docTitle = titleMatch ? titleMatch[1] : undefined;

	return {
		image: absolutize(decode(meta['og:image'] ?? meta['twitter:image']), finalUrl),
		name: decode(meta['og:site_name'] ?? new URL(finalUrl).hostname),
		favicon,
		title: decode(meta['og:title'] ?? meta['twitter:title'] ?? docTitle),
		description: decode(meta['og:description'] ?? meta['twitter:description'] ?? meta.description),
	};
}

async function fetchOnce(url: string): Promise<LinkPreview | null> {
	const fetched = await fetchHead(url);
	if (!fetched) return null;
	try {
		return parseHead(fetched.head, fetched.finalUrl);
	} catch {
		return null;
	}
}

const cache = new Map<string, Promise<LinkPreview | null>>();

/**
 * Fetch OpenGraph metadata for a URL. Used at Astro build time only —
 * the result is baked into the page HTML and shipped to the client as static
 * props on `<PreviewLink>`. The cache deduplicates calls within one build.
 *
 * Returns null for non-fetchable schemes (mailto:) and for scrape failures —
 * a failed scrape means no hover card (silent drop), by design.
 */
// Belt-and-suspenders hard cap. `AbortSignal.timeout` inside fetchHead
// should be enough, but on constrained CI build networks (Cloudflare Pages)
// a stalled connection or hung body read can leave the promise pending —
// and a single never-resolving call makes the rehype `Promise.all` (and
// therefore the whole MDX rollup transform) hang until the build is killed.
// This race guarantees every call settles, so the build can never stall.
function hardTimeout(ms: number): { promise: Promise<null>; cancel: () => void } {
	let timer: ReturnType<typeof setTimeout>;
	const promise = new Promise<null>((resolve) => {
		timer = setTimeout(() => resolve(null), ms);
		(timer as { unref?: () => void }).unref?.();
	});
	return { promise, cancel: () => clearTimeout(timer) };
}

export function fetchOgMetadata(url: string): Promise<LinkPreview | null> {
	if (!/^https?:/i.test(url)) return Promise.resolve(null);
	const existing = cache.get(url);
	if (existing) return existing;
	const promise = limit(async () => {
		const { promise: timeout, cancel } = hardTimeout(6000);
		try {
			return await Promise.race([fetchOnce(url), timeout]);
		} finally {
			cancel();
		}
	});
	cache.set(url, promise);
	return promise;
}
