/**
 * Tweet embed data pipeline (extracted from Tweet.astro frontmatter).
 * Pure fetch/parse/shape helpers with unit-testable boundaries: the .astro
 * file keeps only per-tweet wiring (fetch → summarize → render).
 */

const escapeHtml = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Minimal structural shape shared by tweets and nested quoted tweets — the
// syndication API omits half these fields on some tweets, so everything
// except the resolved display fields is optional with a fallback.
interface RawTweet {
	id_str?: string;
	user?: {
		name?: string;
		screen_name?: string;
		profile_image_url_https?: string;
		verified?: boolean;
		is_blue_verified?: boolean;
	} | null;
	text?: string | null;
	entities?: { urls?: { url: string; expanded_url: string; display_url: string }[] } | null;
	note_tweet?: unknown;
	conversation_count?: number | null;
	favorite_count?: number | null;
	created_at?: string | null;
	video?: { poster?: string; variants?: { type?: string; src?: string }[] } | null;
	photos?: { url: string; width?: number; height?: number }[] | null;
	mediaDetails?: { original_info?: { width?: number; height?: number } }[] | null;
	quoted_tweet?: RawTweet | null;
}

// Escape first, then linkify: t.co → real url (known ones) or a self-link,
// @mentions and #hashtags → Twitter links. Newlines preserved via pre-wrap.
function linkify(
	text: string,
	urlMap: Record<string, { expanded_url: string; display_url: string }>,
	dropUnknownTc: boolean
): string {
	let s = escapeHtml(text);
	s = s.replace(/https:\/\/t\.co\/\w+/g, (m) => {
		const u = urlMap[m];
		if (u)
			return `<a href="${escapeHtml(u.expanded_url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(u.display_url)}</a>`;
		return dropUnknownTc
			? ''
			: `<a href="${escapeHtml(m)}" target="_blank" rel="noopener noreferrer">${escapeHtml(m)}</a>`;
	});
	s = s.replace(
		/(^|[^\w@/])@(\w{1,15})/g,
		(_, p, h) =>
			`${p}<a href="https://twitter.com/${h}" target="_blank" rel="noopener noreferrer">@${h}</a>`
	);
	s = s.replace(
		/(^|[^\w&/])#(\w+)/g,
		(_, p, h) =>
			`${p}<a href="https://twitter.com/hashtag/${h}" target="_blank" rel="noopener noreferrer">#${h}</a>`
	);
	return s.trim();
}

function urlMapOf(t: RawTweet): Record<string, { expanded_url: string; display_url: string }> {
	const urlMap: Record<string, { expanded_url: string; display_url: string }> = {};
	for (const u of t.entities?.urls ?? []) urlMap[u.url] = u;
	return urlMap;
}

function buildTextHtml(t: RawTweet): string {
	return linkify(t.text ?? '', urlMapOf(t), true);
}

// Long-form notes are truncated by the syndication API (~280 chars) with no
// full text attached, and it exposes no retweet count either. FxTwitter fills
// both gaps — best-effort at build time, silent fallback on any failure.
async function fetchFxTweet(
	handle: string,
	statusId: string
): Promise<{ text: string | null; retweets: number | null }> {
	const fallback = { text: null, retweets: null };
	try {
		const res = await fetch(`https://api.fxtwitter.com/${handle}/status/${statusId}`, {
			headers: {
				'user-agent':
					'Mozilla/5.0 (compatible; aryanranderiya.com/tweet-embed; +https://aryanranderiya.com)',
				accept: 'application/json',
			},
			signal: AbortSignal.timeout(5000),
		});
		if (!res.ok) return fallback;
		const data = (await res.json()) as {
			tweet?: { text?: string; retweets?: number };
		};
		const text = data.tweet?.text?.trim();
		return {
			text: text ? text : null,
			retweets: typeof data.tweet?.retweets === 'number' ? data.tweet.retweets : null,
		};
	} catch {
		return fallback;
	}
}

// Collapse point for the inline "Show more" — long enough that typical notes
// render whole with no toggle at all.
const VISIBLE_CHARS = 600;

function splitVisible(s: string): [string, string] {
	if (s.length <= VISIBLE_CHARS) return [s, ''];
	const cut = s.indexOf(' ', VISIBLE_CHARS);
	if (cut < 0) return [s, ''];
	return [s.slice(0, cut), s.slice(cut + 1)];
}

// Pick a sensibly-sized mp4 (largest variant ≤ 1280px wide) for native playback.
function pickMp4(t: RawTweet): { src: string } | null {
	// Single pass: filter to mp4-with-src and project to { src, w, h } together.
	const mp4s: { src: string; w: number; h: number }[] = [];
	for (const v of t.video?.variants ?? []) {
		if (v.type !== 'video/mp4' || !v.src) continue;
		const m = v.src.match(/\/(\d+)x(\d+)\//);
		mp4s.push({ src: v.src, w: m ? Number(m[1]) : 0, h: m ? Number(m[2]) : 0 });
	}
	mp4s.sort((a, b) => a.w - b.w);
	if (!mp4s.length) return null;
	const capped = mp4s.filter((v) => v.w <= 1280);
	return capped.length ? capped[capped.length - 1] : mp4s[mp4s.length - 1];
}

function mediaAspect(t: RawTweet): string {
	const info = t.mediaDetails?.[0]?.original_info;
	return info?.width && info?.height ? `${info.width} / ${info.height}` : '16 / 9';
}

// Twitter's video CDN 403s hotlinked playback from our referer (verified:
// ranged GET returns 206 with no/x.com referer, 403 with ours). Check with
// OUR referer at build time; on failure drop the video and show its poster
// as a plain photo instead of a dead player.
async function videoAllowed(src: string): Promise<boolean> {
	try {
		const res = await fetch(src, {
			method: 'GET',
			headers: {
				Range: 'bytes=0-0',
				Referer: 'https://aryanranderiya.com/',
				'user-agent':
					'Mozilla/5.0 (compatible; aryanranderiya.com/tweet-embed; +https://aryanranderiya.com)',
			},
			signal: AbortSignal.timeout(5000),
		});
		if (!res.ok) return false;
		try {
			await res.body?.cancel();
		} catch {
			// body already closed — status is all we needed
		}
		return true;
	} catch {
		return false;
	}
}

// Tweets whose video CDN blocks our referer: serve a vendored copy instead
// (verified playable — the remote URL 403s only when hotlinked from us).
const LOCAL_VIDEO_OVERRIDES: Record<string, string> = {
	'2095038928625733911': '/images/experiments/footer-glow-tweet.mp4',
};

export async function summarize(
	raw: RawTweet,
	fallbackId: string,
	fxRetweets: number | null = null
) {
	const handle = raw.user?.screen_name;
	if (!handle) return null;
	const statusId = raw.id_str ?? fallbackId;
	const video = pickMp4(raw);
	const photos = [...(raw.photos ?? [])];
	let resolvedVideo = video;
	if (LOCAL_VIDEO_OVERRIDES[statusId]) {
		resolvedVideo = { src: LOCAL_VIDEO_OVERRIDES[statusId] };
	} else if (video) {
		if (!(await videoAllowed(video.src))) {
			// Dead player → poster photo (opens in the lightbox like photos).
			resolvedVideo = null;
			if (raw.video?.poster) photos.unshift({ url: raw.video.poster });
		}
	}
	return {
		name: raw.user?.name ?? `@${handle}`,
		handle,
		avatar: (raw.user?.profile_image_url_https ?? '').replace('_normal', '_bigger'),
		verified: Boolean(raw.user?.is_blue_verified || raw.user?.verified),
		textHtml: buildTextHtml(raw),
		// Long-form ("note") tweets are truncated by the syndication API; the
		// remainder only lives on Twitter, so offer a working "Show more".
		isLongform: Boolean(raw.note_tweet),
		replies: raw.conversation_count ?? 0,
		likes: raw.favorite_count ?? 0,
		retweets: fxRetweets,
		date: raw.created_at
			? new Date(raw.created_at).toLocaleDateString('en-US', {
					month: 'long',
					day: 'numeric',
					year: 'numeric',
				})
			: '',
		tweetUrl: `https://twitter.com/${handle}/status/${statusId}`,
		profileUrl: `https://twitter.com/${handle}`,
		video: resolvedVideo,
		videoPoster: raw.video?.poster,
		photos,
		aspect: mediaAspect(raw),
		moreHtml: '',
	};
}

/**
 * Full note text + retweet count for the inline expander (outer tweet only).
 * FxTwitter supplements what the syndication API omits. Returns null when
 * there is nothing to expand; pure apart from the two network calls.
 */
export async function resolveNoteExpansion(
	tweet: RawTweet,
	id: string
): Promise<{ textHtml: string; moreHtml: string; retweets: number | null } | null> {
	const screenName = tweet.user?.screen_name;
	if (!screenName) return null;
	const fx = await fetchFxTweet(screenName, id);
	if (!tweet.note_tweet) return { textHtml: '', moreHtml: '', retweets: fx.retweets };
	const full = fx.text;
	if (!full || full === (tweet.text ?? '').trim()) {
		return { textHtml: '', moreHtml: '', retweets: fx.retweets };
	}
	const [visible, rest] = splitVisible(full);
	if (!rest) return { textHtml: '', moreHtml: '', retweets: fx.retweets };
	const map = urlMapOf(tweet);
	return {
		textHtml: linkify(visible, map, false),
		moreHtml: ` ${linkify(rest, map, false)}`,
		retweets: fx.retweets,
	};
}
