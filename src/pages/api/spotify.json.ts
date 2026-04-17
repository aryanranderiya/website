// Spotify "now playing" endpoint, served live from a Cloudflare Pages
// Function. Set SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET /
// SPOTIFY_REFRESH_TOKEN as encrypted secrets in the CF Pages dashboard
// (Project → Settings → Environment Variables → "Encrypt").

import type { APIRoute } from 'astro';

// Run as a Pages Function on every request, never prerender.
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

interface SpotifyEnv {
	SPOTIFY_CLIENT_ID?: string;
	SPOTIFY_CLIENT_SECRET?: string;
	SPOTIFY_REFRESH_TOKEN?: string;
}

function readEnv(locals: unknown): SpotifyEnv {
	// On Cloudflare Pages, secrets live on `Astro.locals.runtime.env`.
	// `astro dev` (with platformProxy enabled) populates the same path
	// from .dev.vars / .env.
	const runtime = (locals as { runtime?: { env?: SpotifyEnv } } | undefined)?.runtime;
	return runtime?.env ?? {};
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

export const GET: APIRoute = async ({ locals }) => {
	const env = readEnv(locals);

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

	const track = {
		isPlaying: data.is_playing,
		title: data.item.name,
		artist: data.item.artists.map((a) => a.name).join(', '),
		album: data.item.album.name,
		albumArt: data.item.album.images[0]?.url,
		songUrl: data.item.external_urls.spotify,
		progress: data.progress_ms,
		duration: data.item.duration_ms,
	};

	return new Response(JSON.stringify(track), { status: 200, headers: RESPONSE_HEADERS });
};
