'use client';

import { HugeiconsIcon, ImageNotFound01Icon, StarIcon } from '@icons';
import { LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { useState } from 'react';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

interface Movie {
	slug: string;
	title: string;
	year: number;
	cover?: string;
	imdbId?: string;
	myRating?: number;
	status: string;
	review?: string;
	thoughts?: string;
	favCharacters: string[];
	genre: string[];
	director?: string;
	dateWatched?: string;
}

export default function MovieCard({
	movie,
	index,
	onClick,
}: {
	movie: Movie;
	index: number;
	onClick: (movie: Movie) => void;
}) {
	const [hovered, setHovered] = useState(false);

	return (
		<LazyMotion features={loadFeatures}>
			<m.div
				initial={{ opacity: 0, y: 10 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ delay: index * 0.05, duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
				onClick={() => onClick(movie)}
				onMouseEnter={() => setHovered(true)}
				onMouseLeave={() => setHovered(false)}
				className="cursor-pointer"
			>
				{/* Poster */}
				<div
					className={`relative overflow-hidden mb-2.5 aspect-[2/3] bg-[var(--muted)] rounded-lg transition-[transform,box-shadow] duration-200 ${hovered ? '-translate-y-[3px] shadow-[0_10px_28px_rgba(0,0,0,0.18)]' : 'translate-y-0 shadow-[0_2px_8px_rgba(0,0,0,0.08)]'}`}
				>
					{movie.cover ? (
						<img
							src={movie.cover}
							alt={`${movie.title} poster`}
							className="w-full h-full object-cover"
						/>
					) : (
						<div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center bg-[var(--muted)]">
							<HugeiconsIcon
								icon={ImageNotFound01Icon}
								size={24}
								color="var(--muted-foreground)"
								className="opacity-30"
							/>
							<span className="text-[11px] text-[var(--muted-foreground)] opacity-50">
								{movie.title}
							</span>
						</div>
					)}

					{/* Rating badge */}
					{movie.myRating && (
						<div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/[0.72] backdrop-blur-[6px]">
							<HugeiconsIcon icon={StarIcon} size={9} color="rgba(255,255,255,0.7)" />
							<span className="text-[10px] font-semibold text-white/90 tracking-[-0.01em]">
								{movie.myRating}
							</span>
						</div>
					)}

					{/* Hover overlay */}
					<div
						className={`absolute inset-0 flex items-end justify-center pb-7 bg-[linear-gradient(to_top,rgba(0,0,0,0.65)_0%,transparent_55%)] transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}
					>
						<span className="text-[11px] text-white/85 font-medium tracking-[0.03em] uppercase">
							View details
						</span>
					</div>
				</div>

				{/* Info */}
				<div className="space-y-0.5">
					<h2 className="truncate text-[12px] font-semibold text-[var(--foreground)] tracking-[-0.02em] leading-[1.3]">
						{movie.title}
					</h2>
					<div className="text-[11px] text-[var(--muted-foreground)] opacity-60">{movie.year}</div>
				</div>
			</m.div>
		</LazyMotion>
	);
}
