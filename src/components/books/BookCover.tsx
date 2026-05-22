'use client';

import { useEffect, useState } from 'react';

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

// Open Library serves -S/-M/-L sizes; start on the medium (fast) and hot-swap to the
// large once it's decoded, so high-res covers don't cause a loading lag.
function lowRes(cover?: string): string | undefined {
	if (cover?.includes('covers.openlibrary.org')) return cover.replace('-L.jpg', '-M.jpg');
	return cover;
}

// Measures a cover's true aspect ratio (h/w) so callers can size the box to the cover
// and never crop it. Probes the medium image (fast); returns the fallback until loaded.
export function useCoverAspect(cover?: string, fallback = 1.45): number {
	const [aspect, setAspect] = useState(fallback);
	useEffect(() => {
		if (!cover) {
			setAspect(fallback);
			return;
		}
		let active = true;
		const probe = new window.Image();
		probe.onload = () => {
			if (active && probe.naturalWidth > 0) setAspect(probe.naturalHeight / probe.naturalWidth);
		};
		probe.src = lowRes(cover) ?? cover;
		return () => {
			active = false;
		};
	}, [cover, fallback]);
	return aspect;
}

// The shared book-cover face, matched 1:1 to miskov.ee. Used on the shelf (Book3D),
// its reflection, and the detail sheet (BookDetail) — one source of truth:
//   • a per-title colored base, painted INSTANTLY so a book is never a blank white box
//     while its cover downloads; the cover image fades in over it once decoded
//   • progressive cover: medium (-M) first, hot-swapped to large (-L) when ready
//   • outline: 1px inner border rgba(0,0,0,0.15)
//   • bevel/gloss: radial-gradient (lit top-centre → dark edges) + 2px inset white rim,
//     blended with mix-blend overlay
//   • spine: a soft dark crease + a faint light highlight near the left edge
// The caller sets the size/position via `className` (e.g. "absolute inset-0" or "h-[118px] w-[84px]").
export default function BookCover({
	title,
	author,
	cover,
	className = '',
	style,
}: {
	title: string;
	author: string;
	cover?: string;
	className?: string;
	style?: React.CSSProperties;
}) {
	const [imgError, setImgError] = useState(false);
	const [loaded, setLoaded] = useState(false);
	const low = lowRes(cover);
	const [src, setSrc] = useState(low);

	useEffect(() => {
		setImgError(false);
		setSrc(low);
		// preload the full-res cover, then swap it in once decoded (no flash/lag)
		if (!cover || cover === low) return;
		let active = true;
		const hi = new window.Image();
		hi.onload = () => {
			if (active) setSrc(cover);
		};
		hi.src = cover;
		return () => {
			active = false;
		};
	}, [cover, low]);

	const hasCover = !!src && !imgError;
	const color = bookColor(title);

	return (
		// biome-ignore lint/nursery/noInlineStyles: caller sizes the box (e.g. height from cover aspect)
		<div className={`isolate overflow-hidden rounded-[3px] ${className}`} style={style}>
			{/* colored base — painted instantly so there is never a blank white flash while
			    the cover downloads; doubles as the fallback (with title/author) when no cover */}
			<div
				className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-[3px] px-2 py-3 text-center"
				// biome-ignore lint/nursery/noInlineStyles: dynamic per-title gradient from props
				style={{ background: `linear-gradient(150deg, ${color} 0%, ${color}cc 100%)` }}
			>
				{!hasCover && (
					<>
						<div className="h-px w-[46%] bg-white/20" />
						<span className="font-semibold text-[10px] text-white/90 leading-[1.3]">{title}</span>
						<div className="h-px w-[32%] bg-white/15" />
						<span className="text-[7.5px] text-white/55">{author}</span>
					</>
				)}
			</div>
			{hasCover && (
				<img
					ref={(el) => {
						// a cached cover fires `load` before React attaches onLoad — catch it here
						// so it doesn't stay stuck at opacity 0
						if (el?.complete && el.naturalWidth > 0) setLoaded(true);
					}}
					src={src}
					alt={`${title} cover`}
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
