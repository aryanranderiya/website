import { defineMiddleware } from 'astro:middleware';
import aboutMarkdown from '@/markdown/about.md?raw';
import contactMarkdown from '@/markdown/contact.md?raw';
import homeMarkdown from '@/markdown/home.md?raw';
import privacyMarkdown from '@/markdown/privacy.md?raw';

/**
 * Markdown mirrors of the pages that render on demand. An agent that sends
 * `Accept: text/markdown` gets one of these instead of the HTML page — same
 * content, none of the layout/hydration markup. Keys are pathnames without a
 * trailing slash; lookups normalize before matching.
 */
const MARKDOWN_ROUTES: Record<string, string> = {
	'/': homeMarkdown,
	'/about': aboutMarkdown,
	'/contact': contactMarkdown,
	'/privacy': privacyMarkdown,
};

const HTML_TYPE = 'text/html';
const MARKDOWN_TYPE = 'text/markdown';
// Everything this site can produce for a negotiable page, most to least
// preferred — also the list reported in 406 bodies.
const PRODUCES = [HTML_TYPE, MARKDOWN_TYPE];

interface AcceptEntry {
	type: string;
	q: number;
	/** 2 = exact type, 1 = subtype wildcard (text/star), 0 = catch-all */
	specificity: number;
}

function parseAccept(header: string): AcceptEntry[] {
	return header.split(',').map((raw) => {
		const parts = raw.trim().split(';').map((s) => s.trim());
		const type = parts[0]?.toLowerCase() ?? '*/*';
		let q = 1;
		for (const param of parts.slice(1)) {
			const [name, value] = param.split('=').map((s) => s.trim());
			if (name === 'q') {
				const parsed = Number(value);
				if (!Number.isNaN(parsed)) q = Math.max(0, Math.min(1, parsed));
			}
		}
		const specificity = type === '*/*' ? 0 : type.endsWith('/*') ? 1 : 2;
		return { type, q, specificity };
	});
}

function matches(entry: AcceptEntry, candidate: string): boolean {
	if (entry.type === '*/*') return true;
	if (entry.type.endsWith('/*')) return candidate.startsWith(entry.type.slice(0, -1));
	return entry.type === candidate;
}

/**
 * Pick which producible type best satisfies the client's Accept header.
 *
 * RFC 9110 §12.5.1 rules: each candidate scores by its most specific matching
 * range (a specific range overrides a wildcard regardless of q, so a catch-all
 * with q=1 does not rescue text/html explicitly rejected at q=0); highest q
 * wins across candidates; client order breaks ties. A missing header and a
 * lone catch-all mean "no constraint" — both return the HTML default. Returns
 * null when every candidate is unmatched or explicitly rejected (q=0), i.e. a
 * 406.
 */
function preferredType(header: string | null): string | null {
	if (!header) return PRODUCES[0];
	const entries = parseAccept(header);
	if (entries.length === 0) return PRODUCES[0];

	let best: string | null = null;
	let bestQ = -1;
	let bestPosition = Number.POSITIVE_INFINITY;

	for (const candidate of PRODUCES) {
		let matched: AcceptEntry | null = null;
		let matchedPosition = Number.POSITIVE_INFINITY;
		for (const [idx, entry] of entries.entries()) {
			if (!matches(entry, candidate)) continue;
			if (
				matched === null ||
				entry.specificity > matched.specificity ||
				(entry.specificity === matched.specificity && idx < matchedPosition)
			) {
				matched = entry;
				matchedPosition = idx;
			}
		}
		if (matched === null || matched.q <= 0) continue;

		if (matched.q > bestQ || (matched.q === bestQ && matchedPosition < bestPosition)) {
			bestQ = matched.q;
			bestPosition = matchedPosition;
			best = candidate;
		}
	}

	return best;
}

/** Add `Accept` to an existing Vary header without duplicating tokens. */
function appendVaryAccept(headers: Headers): void {
	const existing = headers.get('Vary');
	if (!existing) {
		headers.set('Vary', 'Accept');
		return;
	}
	const tokens = existing.split(',').map((s) => s.trim().toLowerCase());
	if (!tokens.includes('accept')) {
		headers.set('Vary', `${existing}, Accept`);
	}
}

export const onRequest = defineMiddleware(async (context, next) => {
	const { pathname } = context.url;
	const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') || '/' : pathname;
	const markdown = MARKDOWN_ROUTES[normalizedPath];

	// Only negotiable routes vary by Accept; prerendered pages never pass
	// through here, so their cached assets stay untouched.
	if (!markdown) return next();

	const chosen = preferredType(context.request.headers.get('accept'));

	if (chosen === null) {
		// Every producible representation is unmatched or q=0. RFC 9110 §15.5.7
		// recommends a body listing what IS available so the client can retry.
		return new Response(
			`This resource is available in:\n- ${PRODUCES.join('\n- ')}\n\nYou requested: ${context.request.headers.get('accept')}\n`,
			{
				status: 406,
				headers: {
					'Content-Type': 'text/plain; charset=utf-8',
					Vary: 'Accept',
					'Cache-Control': 'no-store',
				},
			},
		);
	}

	if (chosen === MARKDOWN_TYPE) {
		return new Response(markdown, {
			status: 200,
			headers: {
				'Content-Type': 'text/markdown; charset=utf-8',
				Vary: 'Accept',
				'Cache-Control': 'public, max-age=0, must-revalidate',
			},
		});
	}

	const response = await next();
	appendVaryAccept(response.headers);
	return response;
});
