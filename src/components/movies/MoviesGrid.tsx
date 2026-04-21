'use client';

import { useState } from 'react';
import MovieCard from './MovieCard';
import MovieDetail from './MovieDetail';

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

function SectionHeader({ label, count }: { label: string; count: number }) {
	return (
		<div className="mb-7 flex items-center gap-3">
			<span className="whitespace-nowrap font-medium text-[11px] text-[var(--muted-foreground)] uppercase tracking-[0.08em] opacity-60">
				{label}: {count}
			</span>
			<div className="h-px flex-1 bg-[var(--border)]" />
		</div>
	);
}

export default function MoviesGrid({ movies }: { movies: Movie[] }) {
	const [selected, setSelected] = useState<Movie | null>(null);

	const watched = movies
		.filter((m) => m.status === 'watched')
		.sort((a, b) => (b.myRating ?? 0) - (a.myRating ?? 0));
	const watchlist = movies.filter((m) => m.status === 'watchlist');

	return (
		<div>
			{/* Watched */}
			<section className="mb-14">
				<SectionHeader label="Watched" count={watched.length} />
				<div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
					{watched.map((movie, i) => (
						<MovieCard key={movie.slug} movie={movie} index={i} onClick={setSelected} />
					))}
				</div>
			</section>

			{/* Watchlist */}
			{watchlist.length > 0 && (
				<section>
					<SectionHeader label="Watchlist" count={watchlist.length} />
					<div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
						{watchlist.map((movie, i) => (
							<MovieCard key={movie.slug} movie={movie} index={i} onClick={setSelected} />
						))}
					</div>
				</section>
			)}

			<MovieDetail movie={selected} open={!!selected} onClose={() => setSelected(null)} />
		</div>
	);
}
