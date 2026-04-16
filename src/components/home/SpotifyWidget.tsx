'use client';

import { AnimatePresence, LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { useEffect, useState } from 'react';
import { useAfterPreloader } from '@/hooks/useAfterPreloader';

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
}

async function getNowPlaying(): Promise<SpotifyTrack> {
	try {
		const res = await fetch('/api/spotify.json', { cache: 'no-store' });
		if (!res.ok) throw new Error('Not playing');
		return await res.json();
	} catch {
		return { isPlaying: false };
	}
}

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
			<div className="flex items-end gap-[2px] h-[10px]">
				{[1, 2, 3].map((i) => (
					<m.span
						key={i}
						className="w-[2px] rounded-full bg-[#1DB954] block"
						animate={{ height: ['40%', '100%', '60%', '80%', '40%'] }}
						transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
					/>
				))}
			</div>
		</LazyMotion>
	);
}

const SPOTIFY_LOGO = '/images/spotify-logo-small.webp';

function formatTime(ms?: number): string {
	if (!ms) return '0:00';
	const s = Math.floor(ms / 1000);
	return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

const ART_SIZE = 64;

export default function SpotifyWidget() {
	const [track, setTrack] = useState<SpotifyTrack>({ isPlaying: false });
	const [loading, setLoading] = useState(true);
	const [liveProgress, setLiveProgress] = useState(0);
	const ready = useAfterPreloader();

	useEffect(() => {
		getNowPlaying().then((t) => {
			setTrack(t);
			setLiveProgress(t.progress ?? 0);
			setLoading(false);
		});
		const interval = setInterval(
			() =>
				getNowPlaying().then((t) => {
					setTrack(t);
					setLiveProgress(t.progress ?? 0);
				}),
			30000
		);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		if (!track.isPlaying || !track.duration) return;
		const ticker = setInterval(() => {
			setLiveProgress((p) => Math.min(p + 1000, track.duration ?? 0));
		}, 1000);
		return () => clearInterval(ticker);
	}, [track.isPlaying, track.duration]);

	const progressPct = liveProgress && track.duration ? (liveProgress / track.duration) * 100 : 0;

	return (
		<LazyMotion features={loadFeatures}>
			<m.div
				initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
				animate={ready ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
				transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1], delay: 0.32 }}
				className="h-40 rounded-[20px] bg-[var(--muted-bg)] px-[17px] py-[15px] flex flex-col overflow-hidden relative"
			>
				{/* Header */}
				<div className="flex items-center justify-between relative">
					<img src={SPOTIFY_LOGO} alt="Spotify" width="85" height="24" className="h-3.5 w-auto" />

					<AnimatePresence>
						{track.isPlaying && (
							<m.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="flex items-center gap-[5px]"
							>
								<MusicBars />
								<span className="text-[9px] tracking-[0.07em] uppercase text-[var(--text-ghost)] font-medium">
									Now Playing
								</span>
							</m.div>
						)}
					</AnimatePresence>
				</div>

				{/* Main content */}
				<div className="flex-1 flex items-center relative">
					<AnimatePresence mode="wait">
						{loading ? (
							<m.div
								key="loading"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="flex gap-[13px] items-center w-full"
							>
								<ShimmerBlock w={ART_SIZE} h={ART_SIZE} r={10} />
								<div className="flex-1 flex flex-col gap-[7px]">
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
								className="flex gap-[13px] items-center w-full"
							>
								{/* Album art */}
								{track.albumArt ? (
									<img
										src={track.albumArt}
										alt={track.album ?? 'Album art'}
										className="rounded-[10px] object-cover shrink-0 w-16 h-16"
									/>
								) : (
									<div className="rounded-[10px] shrink-0 bg-[var(--border)] flex items-center justify-center text-[var(--text-ghost)] w-16 h-16">
										<img src={SPOTIFY_LOGO} alt="Spotify" className="w-10 opacity-40" />
									</div>
								)}

								{/* Track info */}
								<div className="flex-1 min-w-0 flex flex-col gap-0.5">
									<a
										href={track.songUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="text-[13px] font-semibold tracking-[-0.02em] text-[var(--text-primary)] no-underline overflow-hidden text-ellipsis whitespace-nowrap block leading-[1.3] transition-colors duration-150 hover:text-[#1DB954]"
									>
										{track.title}
									</a>
									<span className="text-xs text-[var(--text-secondary)] overflow-hidden text-ellipsis whitespace-nowrap tracking-[-0.01em]">
										{track.artist}
									</span>
									{track.album && (
										<span className="text-[11px] text-[var(--text-ghost)] overflow-hidden text-ellipsis whitespace-nowrap mt-0.5">
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
								<span className="text-[13px] font-medium text-[var(--text-secondary)] tracking-[-0.01em]">
									Not playing
								</span>
								<span className="text-[11px] text-[var(--text-ghost)]">Nothing in queue</span>
							</m.div>
						)}
					</AnimatePresence>
				</div>

				{/* Progress bar */}
				<div className="relative">
					<AnimatePresence>
						{track.isPlaying && track.duration ? (
							<m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
								<div className="flex justify-between mb-[5px]">
									<span className="text-[9px] text-[var(--text-ghost)] tracking-[0.02em]">
										{formatTime(liveProgress)}
									</span>
									<span className="text-[9px] text-[var(--text-ghost)] tracking-[0.02em]">
										{formatTime(track.duration)}
									</span>
								</div>
								<div className="h-1 bg-[var(--border)] rounded-full overflow-hidden">
									<m.div
										className="h-full bg-[#1DB954] rounded-full"
										animate={{ width: `${progressPct}%` }}
										transition={{ duration: 1, ease: 'linear' }}
									/>
								</div>
							</m.div>
						) : (
							<div className="h-[17px]" />
						)}
					</AnimatePresence>
				</div>
			</m.div>
		</LazyMotion>
	);
}
