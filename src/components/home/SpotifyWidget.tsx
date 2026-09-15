'use client';

import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { AnimatePresence, LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { useEffect, useRef, useState } from 'react';
import { useAfterPreloader } from '@/hooks/useAfterPreloader';
import { queryClient } from '@/utils/queryClient';
import { VinylDisk } from './VinylDisk';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

interface SpotifyTrack {
	isPlaying: boolean;
	title?: string;
	artist?: string;
	album?: string;
	albumArt?: string;
	songUrl?: string;
	progress?: number;
	duration?: number;
	/** 30s iTunes sample. Absent when unmatched — vinyl stays hidden. */
	previewUrl?: string;
}

async function getNowPlaying(): Promise<SpotifyTrack> {
	try {
		// Local demo: `/?vinyl-demo` fakes a playing track (DEV only, stripped
		// from prod) so the vinyl + preview can be seen without Spotify creds.
		if (import.meta.env.DEV && new URLSearchParams(location.search).has('vinyl-demo')) {
			return getDemoTrack();
		}
		const res = await fetch('/api/spotify.json', { cache: 'no-store' });
		if (!res.ok) throw new Error('Not playing');
		return await res.json();
	} catch {
		return { isPlaying: false };
	}
}

async function getDemoTrack(): Promise<SpotifyTrack> {
	const res = await fetch(
		'https://itunes.apple.com/search?term=arctic%20monkeys%20do%20i%20wanna%20know&media=music&entity=song&limit=2'
	);
	if (!res.ok) throw new Error(`iTunes demo lookup failed: ${res.status}`);
	const data = (await res.json()) as {
		results?: {
			trackName?: string;
			artistName?: string;
			collectionName?: string;
			artworkUrl100?: string;
			trackViewUrl?: string;
			previewUrl?: string;
		}[];
	};
	const r = data.results?.[0] ?? {};
	return {
		isPlaying: true,
		title: r.trackName ?? 'Do I Wanna Know?',
		artist: r.artistName ?? 'Arctic Monkeys',
		album: r.collectionName,
		albumArt: r.artworkUrl100?.replace('100x100', '300x300'),
		songUrl: r.trackViewUrl,
		progress: 30000,
		duration: 184000,
		previewUrl: r.previewUrl,
	};
}

const SPOTIFY_QUERY_KEY = ['spotify-now-playing'] as const;

function ShimmerBlock({ w, h, r = 6 }: { w: string | number; h: number; r?: number }) {
	return (
		<div
			className="shrink-0 animate-[shimmer_1.4s_ease-in-out_infinite] bg-[length:200%_100%] bg-[linear-gradient(90deg,var(--border)_25%,var(--border-strong)_50%,var(--border)_75%)]"
			// biome-ignore lint/nursery/noInlineStyles: dynamic dimensions from props
			style={{ width: w, height: h, borderRadius: r }}
		/>
	);
}

function MusicBars() {
	return (
		<LazyMotion features={loadFeatures}>
			<div className="flex h-[10px] items-end gap-[2px]">
				{[1, 2, 3].map((i) => (
					<m.span
						key={i}
						className="block h-full w-[2px] origin-bottom rounded-full bg-[#1DB954]"
						animate={{ scaleY: [0.4, 1, 0.6, 0.8, 0.4] }}
						transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
					/>
				))}
			</div>
		</LazyMotion>
	);
}

const SPOTIFY_LOGO = '/images/site/spotify-logo.webp';

function formatTime(ms?: number): string {
	if (!ms) return '0:00';
	const s = Math.floor(ms / 1000);
	return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

const ART_SIZE = 64;

/** Ticking progress bar, re-anchored whenever a poll lands. */
function useLiveProgress(track: SpotifyTrack): number {
	const [liveProgress, setLiveProgress] = useState(0);

	useEffect(() => {
		setLiveProgress(track.progress ?? 0);
	}, [track.progress]);

	useEffect(() => {
		if (!track.isPlaying || !track.duration) return;
		const ticker = setInterval(() => {
			setLiveProgress((p) => Math.min(p + 1000, track.duration ?? 0));
		}, 1000);
		return () => clearInterval(ticker);
	}, [track.isPlaying, track.duration]);

	return liveProgress;
}

function WidgetHeader({ isPlaying }: { isPlaying: boolean }) {
	return (
		<div className="relative flex items-center justify-between">
			<img src={SPOTIFY_LOGO} alt="Spotify" width="320" height="87" className="h-3.5 w-auto" />

			<AnimatePresence>
				{isPlaying && (
					<m.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="flex items-center gap-[5px]"
					>
						<MusicBars />
						<span className="font-medium text-[9px] text-[var(--text-ghost)] uppercase tracking-[0.07em]">
							Now Playing
						</span>
					</m.div>
				)}
			</AnimatePresence>
		</div>
	);
}

interface TrackArtProps {
	track: SpotifyTrack;
	previewPlaying: boolean;
	showVinyl: boolean;
	onTogglePreview: () => void;
}

/** Album art slot: spinning vinyl with the cover as its label when a sample
 * exists, otherwise the plain cover (or logo placeholder). */
function TrackArt({ track, previewPlaying, showVinyl, onTogglePreview }: TrackArtProps) {
	if (showVinyl && track.albumArt) {
		return (
			<button
				type="button"
				onClick={onTogglePreview}
				aria-label={previewPlaying ? 'Pause preview' : 'Play preview'}
				aria-pressed={previewPlaying}
				title={previewPlaying ? 'Pause preview' : 'Play preview'}
				className="relative block h-[55px] w-16 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DB954]"
			>
				<VinylDisk isPlaying={previewPlaying} spinDuration={4000} className="h-[55px] w-16" />
				<img
					src={track.albumArt}
					alt=""
					aria-hidden="true"
					className={`absolute top-[36.9%] left-[31.9%] aspect-square w-[21.3%] animate-spin rounded-full object-cover [animation-duration:4000ms] ${previewPlaying ? '[animation-play-state:running]' : '[animation-play-state:paused]'}`}
				/>
				<span
					aria-hidden="true"
					className="absolute top-[49.4%] left-[42.6%] size-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/70"
				/>
			</button>
		);
	}
	if (track.albumArt) {
		return (
			<img
				src={track.albumArt}
				alt={track.album ?? 'Album art'}
				className="h-16 w-16 shrink-0 rounded-[10px] object-cover"
			/>
		);
	}
	return (
		<div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[10px] bg-[var(--border)] text-[var(--text-ghost)]">
			<img src={SPOTIFY_LOGO} alt="Spotify" className="w-10 opacity-40" />
		</div>
	);
}

interface WidgetMainProps {
	track: SpotifyTrack;
	loading: boolean;
	previewPlaying: boolean;
	showVinyl: boolean;
	onTogglePreview: () => void;
}

function WidgetMain({
	track,
	loading,
	previewPlaying,
	showVinyl,
	onTogglePreview,
}: WidgetMainProps) {
	return (
		<div className="relative flex flex-1 items-center">
			<AnimatePresence mode="wait">
				{loading ? (
					<m.div
						key="loading"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="flex w-full items-center gap-[13px]"
					>
						<ShimmerBlock w={ART_SIZE} h={ART_SIZE} r={10} />
						<div className="flex flex-1 flex-col gap-[7px]">
							<ShimmerBlock w="75%" h={12} r={5} />
							<ShimmerBlock w="55%" h={10} r={5} />
							<ShimmerBlock w="40%" h={9} r={5} />
						</div>
					</m.div>
				) : track.isPlaying && track.title ? (
					<m.div
						key={track.title}
						initial={{ opacity: 0, y: 5 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -5 }}
						transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
						className="flex w-full items-center gap-[13px]"
					>
						<TrackArt
							track={track}
							previewPlaying={previewPlaying}
							showVinyl={showVinyl}
							onTogglePreview={onTogglePreview}
						/>

						{/* Track info */}
						<div className="flex min-w-0 flex-1 flex-col gap-0.5">
							<a
								href={track.songUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="block overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[13px] text-[var(--text-primary)] leading-[1.3] tracking-[-0.02em] no-underline transition-colors duration-150 hover:text-[#1DB954]"
							>
								{track.title}
							</a>
							<span className="overflow-hidden text-ellipsis whitespace-nowrap text-[var(--text-secondary)] text-xs tracking-[-0.01em]">
								{track.artist}
							</span>
							{track.album && (
								<span className="mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-[var(--text-ghost)]">
									{track.album}
								</span>
							)}
						</div>
					</m.div>
				) : (
					<m.div
						key="not-playing"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="flex flex-col gap-[3px]"
					>
						<span className="font-medium text-[13px] text-[var(--text-secondary)] tracking-[-0.01em]">
							Not playing
						</span>
						<span className="text-[11px] text-[var(--text-ghost)]">Nothing in queue</span>
					</m.div>
				)}
			</AnimatePresence>
		</div>
	);
}

function WidgetProgress({
	isPlaying,
	duration,
	liveProgress,
}: {
	isPlaying: boolean;
	duration?: number;
	liveProgress: number;
}) {
	const progressPct = liveProgress && duration ? (liveProgress / duration) * 100 : 0;
	return (
		<div className="relative">
			<AnimatePresence>
				{isPlaying && duration ? (
					<m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
						<div className="mb-[5px] flex justify-between">
							<span className="text-[9px] text-[var(--text-ghost)] tracking-[0.02em]">
								{formatTime(liveProgress)}
							</span>
							<span className="text-[9px] text-[var(--text-ghost)] tracking-[0.02em]">
								{formatTime(duration)}
							</span>
						</div>
						<div className="h-1 overflow-hidden rounded-full bg-[var(--border)]">
							<m.div
								className="h-full w-full origin-left rounded-full bg-[#1DB954]"
								animate={{ scaleX: progressPct / 100 }}
								transition={{ duration: 1, ease: 'linear' }}
							/>
						</div>
					</m.div>
				) : (
					<div className="h-[17px]" />
				)}
			</AnimatePresence>
		</div>
	);
}

function SpotifyWidgetInner() {
	// Polling lives in the query cache (deduped, race-free, shared across
	// mounts) instead of a hand-rolled fetch + setInterval effect.
	const { data: track = { isPlaying: false }, isLoading: loading } = useQuery({
		queryKey: SPOTIFY_QUERY_KEY,
		queryFn: getNowPlaying,
		refetchInterval: 30000,
	});
	const liveProgress = useLiveProgress(track);
	const ready = useAfterPreloader();

	// 30s preview sample playback (iTunes). The disk spins while it plays.
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [previewPlaying, setPreviewPlaying] = useState(false);
	const previewUrl = track.previewUrl;

	// A new track invalidates the old sample.
	useEffect(() => {
		const audio = audioRef.current;
		if (audio && audio.src !== previewUrl) {
			audio.pause();
			audio.removeAttribute('src');
		}
		setPreviewPlaying(false);
	}, [previewUrl]);

	const togglePreview = () => {
		const audio = audioRef.current;
		if (!audio || !previewUrl) return;
		if (previewPlaying) {
			audio.pause();
			setPreviewPlaying(false);
			return;
		}
		if (audio.src !== previewUrl) audio.src = previewUrl;
		audio
			.play()
			.then(() => setPreviewPlaying(true))
			.catch(() => setPreviewPlaying(false));
	};

	const showVinyl = track.isPlaying && !!track.title && !!previewUrl;

	return (
		<LazyMotion features={loadFeatures}>
			<m.div
				initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
				animate={ready ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
				transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1], delay: 0.32 }}
				className="relative flex min-h-40 flex-col overflow-hidden rounded-[20px] bg-[var(--muted-bg)] px-[17px] py-[15px]"
			>
				{/* biome-ignore lint/a11y/useMediaCaption: short music sample, captions N/A */}
				<audio
					ref={audioRef}
					preload="none"
					onEnded={() => setPreviewPlaying(false)}
					className="hidden"
				/>
				<WidgetHeader isPlaying={track.isPlaying} />
				<WidgetMain
					track={track}
					loading={loading}
					previewPlaying={previewPlaying}
					showVinyl={showVinyl}
					onTogglePreview={togglePreview}
				/>
				<WidgetProgress
					isPlaying={track.isPlaying}
					duration={track.duration}
					liveProgress={liveProgress}
				/>
			</m.div>
		</LazyMotion>
	);
}

export default function SpotifyWidget() {
	return (
		<QueryClientProvider client={queryClient}>
			<SpotifyWidgetInner />
		</QueryClientProvider>
	);
}
