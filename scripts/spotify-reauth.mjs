#!/usr/bin/env node
/**
 * spotify-reauth.mjs
 *
 * Spotify refresh tokens die every 6 months (and refreshing does NOT extend
 * them), which silently kills the homepage "now playing" widget. This script
 * turns the re-mint into one command + one browser click:
 *
 *   1. Starts a local callback server + Cloudflare quick tunnel (no account).
 *   2. Prints the Spotify authorize URL — open it, approve.
 *   3. Captures the callback code, exchanges it for tokens.
 *   4. `wrangler secret put`s the new refresh token (no redeploy needed).
 *   5. Verifies the live endpoint reports playback.
 *
 * Usage:
 *   SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=yyy bun run spotify:reauth
 *
 * Secrets are only ever held in memory / piped via stdin — nothing is written
 * to disk. Requires `cloudflared` and an authenticated `wrangler` on PATH.
 */

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';

const PORT = 8000;
const SCOPE = 'user-read-currently-playing';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
	console.error(
		'Missing SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET.\n' +
			'Run: SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=yyy bun run spotify:reauth'
	);
	process.exit(1);
}

function waitForCallback(port) {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			server.close();
			reject(new Error('Timed out waiting for Spotify callback (codes expire after 10 min).'));
		}, 9 * 60 * 1000);
		const server = createServer((req, res) => {
			const url = new URL(req.url ?? '/', 'http://127.0.0.1');
			if (url.pathname === '/success' && url.searchParams.has('code')) {
				clearTimeout(timer);
				res.writeHead(200, { 'Content-Type': 'text/plain' });
				res.end('OK — token captured, you can close this tab.');
				server.close();
				resolve(url.searchParams.get('code'));
			} else if (url.searchParams.has('error')) {
				clearTimeout(timer);
				server.close();
				reject(new Error(`Spotify refused: ${url.searchParams.get('error')}`));
			} else {
				res.writeHead(404);
				res.end();
			}
		});
		server.on('error', (e) => reject(new Error(`Callback server failed: ${e.message}`)));
		server.listen(port, '127.0.0.1');
	});
}

function startTunnel(port) {
	return new Promise((resolve, reject) => {
		const proc = spawn('cloudflared', ['tunnel', '--url', `http://127.0.0.1:${port}`], {
			stdio: ['ignore', 'pipe', 'pipe'],
		});
		let out = '';
		const timer = setTimeout(() => {
			proc.kill();
			reject(new Error('Timed out waiting for tunnel URL. Is `cloudflared` installed?'));
		}, 60 * 1000);
		const onData = (chunk) => {
			out += chunk.toString();
			const m = out.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
			if (m) {
				clearTimeout(timer);
				proc.stdout?.off('data', onData);
				proc.stderr?.off('data', onData);
				resolve({ proc, url: m[0] });
			}
		};
		proc.stdout?.on('data', onData);
		proc.stderr?.on('data', onData);
		proc.on('error', (e) => {
			clearTimeout(timer);
			reject(new Error(`Failed to start cloudflared: ${e.message} (brew install cloudflared)`));
		});
		proc.on('exit', (code) => {
			if (code !== 0 && code !== null) {
				clearTimeout(timer);
				reject(new Error(`cloudflared exited early (code ${code}).`));
			}
		});
	});
}

function run(cmd, args, { input, cwd } = {}) {
	return new Promise((resolve, reject) => {
		const proc = spawn(cmd, args, { stdio: ['pipe', 'pipe', 'pipe'], cwd });
		let stdout = '';
		let stderr = '';
		proc.stdout.on('data', (c) => (stdout += c));
		proc.stderr.on('data', (c) => (stderr += c));
		proc.on('error', reject);
		proc.on('close', (code) =>
			code === 0 ? resolve(stdout) : reject(new Error(`${cmd} failed: ${stderr.slice(0, 300)}`))
		);
		if (input) proc.stdin.write(input);
		proc.stdin.end();
	});
}

const { proc: tunnel, url: publicUrl } = await startTunnel(PORT);
const redirectUri = `${publicUrl}/success`;
console.log(`\nTunnel: ${publicUrl}\n`);
console.log('1. Add this Redirect URI in the Spotify dashboard (Settings), then open:');
console.log(
	`\nhttps://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${SCOPE}\n`
);
console.log('2. Approve — waiting for the callback…');

try {
	const code = await waitForCallback(PORT);
	console.log('Code captured. Exchanging…');

	const res = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
		},
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			code,
			redirect_uri: redirectUri,
		}),
	});
	const data = await res.json();
	if (!res.ok || !data.refresh_token) {
		throw new Error(`Token exchange failed: ${JSON.stringify(data).slice(0, 200)}`);
	}

	console.log('Storing new refresh token on the Worker…');
	const root = new URL('..', import.meta.url);
	await run('bunx', ['wrangler', 'secret', 'put', 'SPOTIFY_REFRESH_TOKEN'], {
		input: data.refresh_token,
		cwd: root,
	});

	console.log('Waiting for propagation + edge cache, then verifying…');
	await new Promise((r) => setTimeout(r, 25_000));
	const check = await fetch(
		`https://aryanranderiya.com/api/spotify.json?reauth=${Date.now()}`,
		{ cache: 'no-store' }
	);
	console.log('Live endpoint:', JSON.stringify(await check.json()));
} finally {
	tunnel.kill();
}
