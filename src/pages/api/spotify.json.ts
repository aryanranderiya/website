// TODO: Set SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN in .env
// This endpoint returns currently playing track from Spotify API

import type { APIRoute } from 'astro';

const CLIENT_ID = import.meta.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = import.meta.env.SPOTIFY_REFRESH_TOKEN;

async function getAccessToken() {
	if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) return null;
	try {
		const res = await fetch('https://accounts.spotify.com/api/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
			},
			body: new URLSearchParams({
				grant_type: 'refresh_token',
				refresh_token: REFRESH_TOKEN,
			}),
		});
		const data = await res.json();
		return data.access_token as string;
	} catch {
		return null;
	}
}

export const GET: APIRoute = async () => {
	try {
		const token = await getAccessToken();
		if (!token) {
			return new Response(JSON.stringify({ isPlaying: false }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
			headers: { Authorization: `Bearer ${token}` },
		});

		if (res.status === 204 || res.status !== 200) {
			return new Response(JSON.stringify({ isPlaying: false }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const data = await res.json();
		const isPlaying = data.is_playing;
		const item = data.item;

		if (!item) {
			return new Response(JSON.stringify({ isPlaying: false }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const track = {
			isPlaying,
			title: item.name,
			artist: item.artists.map((a: { name: string }) => a.name).join(', '),
			album: item.album.name,
			albumArt: item.album.images[0]?.url,
			songUrl: item.external_urls.spotify,
			progress: data.progress_ms,
			duration: item.duration_ms,
		};

		return new Response(JSON.stringify(track), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'no-store, no-cache',
			},
		});
	} catch {
		return new Response(JSON.stringify({ isPlaying: false }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
