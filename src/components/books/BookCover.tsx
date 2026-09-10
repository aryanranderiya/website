'use client';

import { useEffect, useMemo, useState } from 'react';
import { thumbHashToDataURL } from 'thumbhash';

const PALETTES = [
	'#2f4a63',
	'#43335a',
	'#2f4a36',
	'#6a4326',
	'#2c2c52',
	'#5a2e2e',
	'#3c4a2a',
	'#2c4a4a',
];

function bookColor(title: string): string {
	let hash = 0;
	for (let i = 0; i < title.length; i++) {
		hash = title.charCodeAt(i) + ((hash << 5) - hash);
	}
	return PALETTES[Math.abs(hash) % PALETTES.length];
}

// Cover dimensions are baked into src/data/book-covers.json at build time, so the box can
// be sized from the real aspect ratio with no layout shift and no network probe. This hook
// only runs (probing the image) as a fallback for covers missing from the manifest.
export function useCoverAspect(cover?: string, w?: number, h?: number, fallback = 1.45): number {
	const known = w && h ? h / w : null;
	// Only the async probe result lives in state. The sync values (known dims,
	// fallback) derive during render so they never need a sync-back effect.
	const [probed, setProbed] = useState(fallback);
	const [prevCover, setPrevCover] = useState(cover);
	const [prevFallback, setPrevFallback] = useState(fallback);
	if (prevCover !== cover || prevFallback !== fallback) {
		setPrevCover(cover);
		setPrevFallback(fallback);
		// Deliberately keep the previous probed value (no reset to fallback):
		// it avoids a wrong-aspect flash + layout shift while the new cover
		// probes. `probed` is only read when `cover && !known`, so a stale
		// value can never leak into the known-dims or no-cover paths below.
	}
	useEffect(() => {
		if (known != null) return;
		if (!cover) return;
		let active = true;
		const probe = new window.Image();
		probe.onload = () => {
			if (active && probe.naturalWidth > 0) setProbed(probe.naturalHeight / probe.naturalWidth);
		};
		probe.src = cover;
		return () => {
			active = false;
		};
	}, [cover, known]);
	if (known != null) return known;
	if (!cover) return fallback;
	return probed;
}

// The shared book-cover face, matched 1:1 to miskov.ee. Used on the shelf (Book3D),
// its reflection, and the detail sheet (BookDetail) — one source of truth:
//   • a thumbhash placeholder (decoded to a data URL with NO network request) shows
//     instantly, then crossfades to the optimized local WebP once it loads
//   • a per-title colored card with title/author, shown ONLY as a fallback when a book
//     has no cover image (or its cover errors)
//   • outline: 1px inner border rgba(0,0,0,0.15)
//   • bevel/gloss: radial-gradient (lit top-centre → dark edges) + 2px inset white rim,
//     blended with mix-blend overlay
//   • spine: a soft dark crease + a faint light highlight near the left edge
// The caller sets the size/position via `className` (e.g. "absolute inset-0" or "h-[118px] w-[84px]").
export default function BookCover({
	title,
	author,
	cover,
	hash,
	className = '',
	style,
}: {
	title: string;
	author: string;
	cover?: string;
	/** base64 thumbhash for an instant blur placeholder (from src/data/book-covers.json) */
	hash?: string;
	className?: string;
	style?: React.CSSProperties;
}) {
	const [imgError, setImgError] = useState(false);
	const [loaded, setLoaded] = useState(false);

	// Reset when the cover changes (the detail sheet reuses this component
	// across books). Render-phase reset — NOT a mount effect: an effect with
	// [] would clobber the ref callback's setLoaded(true) for cached covers
	// (complete at mount, `load` never refires) and stick them on the blur
	// placeholder forever. Same prev-value pattern as useCoverAspect above.
	const [prevCoverProp, setPrevCoverProp] = useState(cover);
	if (prevCoverProp !== cover) {
		setPrevCoverProp(cover);
		setImgError(false);
		setLoaded(false);
	}

	// Decode the thumbhash → data URL (pure math, instant — no request).
	// Pure derivation from the `hash` prop, so it is memoized, not synced via effect.
	const placeholder = useMemo<string | null>(() => {
		if (!hash) return null;
		try {
			const bytes = Uint8Array.from(atob(hash), (c) => c.charCodeAt(0));
			return thumbHashToDataURL(bytes);
		} catch {
			return null;
		}
	}, [hash]);

	const hasImage = !!cover && !imgError;
	const color = bookColor(title);

	return (
		// biome-ignore lint/nursery/noInlineStyles: caller sizes the box (e.g. height from cover aspect)
		<div className={`isolate overflow-hidden rounded-[3px] ${className}`} style={style}>
			{/* colored card — ONLY a fallback for books with no cover image (or a load error) */}
			{!hasImage && (
				<div
					className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-[3px] px-2 py-3 text-center"
					// biome-ignore lint/nursery/noInlineStyles: dynamic per-title gradient from props
					style={{ background: `linear-gradient(150deg, ${color} 0%, ${color}cc 100%)` }}
				>
					<div className="h-px w-[46%] bg-white/20" />
					<span className="font-semibold text-[10px] text-white/90 leading-[1.3]">{title}</span>
					<div className="h-px w-[32%] bg-white/15" />
					<span className="text-[7.5px] text-white/55">{author}</span>
				</div>
			)}
			{/* thumbhash placeholder — instant blur, sits under the real cover until it loads */}
			{hasImage && placeholder && !loaded && (
				<img
					src={placeholder}
					alt=""
					aria-hidden
					className="absolute inset-0 h-full w-full scale-[1.05] rounded-[3px] object-cover blur-[6px]"
				/>
			)}
			{hasImage && (
				<img
					ref={(el) => {
						// a cached cover fires `load` before React attaches onLoad — catch it here
						// so it doesn't stay stuck at opacity 0
						if (el?.complete && el.naturalWidth > 0) setLoaded(true);
					}}
					src={cover}
					alt={`${title} cover`}
					loading="lazy"
					decoding="async"
					onLoad={() => setLoaded(true)}
					onError={() => setImgError(true)}
					className="absolute inset-0 h-full w-full rounded-[3px] object-cover transition-opacity duration-300 ease-out"
					// biome-ignore lint/nursery/noInlineStyles: fade-in opacity driven by load state
					style={{ opacity: loaded ? 1 : 0 }}
				/>
			)}
			{/* bevel + gloss: lit top-centre, shaded edges, inner white rim */}
			<div className="absolute inset-0 rounded-[3px] [background:radial-gradient(110%_97%_at_50%_0%,rgba(255,255,255,0.33)_0%,rgba(0,0,0,0.35)_100%)] [box-shadow:inset_0_0_0_2px_rgba(255,255,255,0.5)] [mix-blend-mode:overlay]" />
			{/* spine — a SOFT crease (gradient, not a hard bar) + a faint light highlight */}
			<div className="absolute inset-y-0 left-0 w-[11px] [background:linear-gradient(90deg,rgba(0,0,0,0.32)_0%,rgba(0,0,0,0.05)_55%,transparent_100%)]" />
			<div className="absolute inset-y-0 left-[5px] w-[5px] [background:linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.5)_50%,transparent_100%)] [mix-blend-mode:overlay]" />
			{/* outline */}
			<div className="absolute inset-0 rounded-[3px] [box-shadow:inset_0_0_0_1px_rgba(0,0,0,0.15)]" />
		</div>
	);
}
