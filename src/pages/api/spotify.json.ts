// Spotify "now playing" endpoint, served live from a Cloudflare Worker
// on every request, never prerendered. Set SPOTIFY_CLIENT_ID /
// SPOTIFY_CLIENT_SECRET / SPOTIFY_REFRESH_TOKEN as secrets
// (`bunx wrangler secret put <KEY>` or the dashboard).

import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';

// Run on the edge on every request, never prerender.
export const prerender = false;

// 15s of edge cache, 30s of stale-while-revalidate. Browser must always
// refetch (no-store) so the 30s widget poll keeps working; Cloudflare's
// edge absorbs the load so Spotify sees at most ~4 token refreshes/min
// across the world even under burst traffic.
const RESPONSE_HEADERS = {
	'Content-Type': 'application/json',
	'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
	'CDN-Cache-Control': 'max-age=15',
} as const;

const NOT_PLAYING = JSON.stringify({ isPlaying: false });

/**
 * Spotify's own `preview_url` is effectively dead (null for almost every
 * track since 2024), so 30s samples come from the iTunes Search API instead:
 * no auth, CORS-open, `previewUrl` is a playable m4a. We match loosely
 * (Spotify titles carry "Remastered"/"Live"/"feat." suffixes iTunes lacks)
 * and return null rather than the wrong song.
 */
function norm(s: string): string {
	return s
		.toLowerCase()
		.replace(/\(.*?\)/g, '')
		.replace(/\[.*?\]/g, '')
		.replace(/\s+-\s+.*$/, '')
		.replace(/feat\.?.*$/, '')
		.replace(/[^a-z0-9\s]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

async function lookupPreviewUrl(title: string, artist: string): Promise<string | null> {
	const wantTrack = norm(title);
	const wantArtist = norm(artist).split(' ')[0];
	if (!wantTrack) return null;
	try {
		const res = await fetch(
			`https://itunes.apple.com/search?term=${encodeURIComponent(`${artist} ${title}`)}&media=music&entity=song&limit=6`,
			{ signal: AbortSignal.timeout(4000) }
		);
		if (!res.ok) return null;
		const data = (await res.json()) as {
			results?: { trackName?: string; artistName?: string; previewUrl?: string }[];
		};
		let best: string | null = null;
		let bestScore = 0;
		const wantTokens = new Set(wantTrack.split(' ').filter(Boolean));
		for (const r of data.results ?? []) {
			const gotTrack = norm(r.trackName ?? '');
			const gotArtist = norm(r.artistName ?? '');
			let overlap = 0;
			for (const token of gotTrack.split(' ')) {
				if (token && wantTokens.has(token)) overlap++;
			}
			const trackScore = gotTrack === wantTrack ? 2 : overlap > 0 ? 1 : 0;
			const artistScore = wantArtist && new Set(gotArtist.split(' ')).has(wantArtist) ? 1 : 0;
			if (trackScore + artistScore > bestScore && r.previewUrl) {
				bestScore = trackScore + artistScore;
				best = r.previewUrl;
			}
		}
		// Require at least a contains-match on the title plus the artist.
		return bestScore >= 2 ? best : null;
	} catch {
		return null;
	}
}

interface SpotifyEnv {
	SPOTIFY_CLIENT_ID?: string;
	SPOTIFY_CLIENT_SECRET?: string;
	SPOTIFY_REFRESH_TOKEN?: string;
}

function readEnv(): SpotifyEnv {
	// On Cloudflare Workers, secrets live on the `cloudflare:workers` env
	// binding. In local dev (workerd via the Cloudflare Vite plugin) they
	// come from `.dev.vars` / `.env`.
	return (env ?? {}) as SpotifyEnv;
}

async function getAccessToken(env: SpotifyEnv): Promise<string | null> {
	const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = env;
	if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) return null;

	// btoa is available in the Workers runtime; Buffer is not.
	const basic = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);

	try {
		const res = await fetch('https://accounts.spotify.com/api/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Authorization: `Basic ${basic}`,
			},
			body: new URLSearchParams({
				grant_type: 'refresh_token',
				refresh_token: SPOTIFY_REFRESH_TOKEN,
			}),
		});
		if (!res.ok) return null;
		const data = (await res.json()) as { access_token?: string };
		return data.access_token ?? null;
	} catch {
		return null;
	}
}

export const GET: APIRoute = async () => {
	const env = readEnv();

	const token = await getAccessToken(env);
	if (!token) {
		return new Response(NOT_PLAYING, { status: 200, headers: RESPONSE_HEADERS });
	}

	let res: Response;
	try {
		res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
			headers: { Authorization: `Bearer ${token}` },
		});
	} catch {
		return new Response(NOT_PLAYING, { status: 200, headers: RESPONSE_HEADERS });
	}

	if (res.status !== 200) {
		return new Response(NOT_PLAYING, { status: 200, headers: RESPONSE_HEADERS });
	}

	const data = (await res.json()) as {
		is_playing: boolean;
		progress_ms: number;
		item: {
			name: string;
			duration_ms: number;
			external_urls: { spotify: string };
			artists: { name: string }[];
			album: { name: string; images: { url: string }[] };
		} | null;
	};

	if (!data.item) {
		return new Response(NOT_PLAYING, { status: 200, headers: RESPONSE_HEADERS });
	}

	const artist = data.item.artists.map((a) => a.name).join(', ');

	const track = {
		isPlaying: data.is_playing,
		title: data.item.name,
		artist,
		album: data.item.album.name,
		albumArt: data.item.album.images[0]?.url,
		songUrl: data.item.external_urls.spotify,
		progress: data.progress_ms,
		duration: data.item.duration_ms,
		// 30s playable sample (see lookupPreviewUrl). Null when unmatched —
		// the widget hides the vinyl player in that case.
		previewUrl: await lookupPreviewUrl(data.item.name, artist),
	};

	return new Response(JSON.stringify(track), { status: 200, headers: RESPONSE_HEADERS });
};
