'use client';

import { useEffect, useState } from 'react';
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
	const [aspect, setAspect] = useState(known ?? fallback);
	useEffect(() => {
		if (known) {
			setAspect(known);
			return;
		}
		if (!cover) {
			setAspect(fallback);
			return;
		}
		let active = true;
		const probe = new window.Image();
		probe.onload = () => {
			if (active && probe.naturalWidth > 0) setAspect(probe.naturalHeight / probe.naturalWidth);
		};
		probe.src = cover;
		return () => {
			active = false;
		};
	}, [cover, known, fallback]);
	return aspect;
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
	const [placeholder, setPlaceholder] = useState<string | null>(null);

	// Decode the thumbhash → data URL on mount (pure math, instant — no request).
	useEffect(() => {
		if (!hash) {
			setPlaceholder(null);
			return;
		}
		try {
			const bytes = Uint8Array.from(atob(hash), (c) => c.charCodeAt(0));
			setPlaceholder(thumbHashToDataURL(bytes));
		} catch {
			setPlaceholder(null);
		}
	}, [hash]);

	useEffect(() => {
		setImgError(false);
		setLoaded(false);
	}, []);

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
