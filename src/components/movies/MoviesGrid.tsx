'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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

export default function MoviesGrid({ movies }: { movies: Movie[] }) {
  const [selected, setSelected] = useState<Movie | null>(null);

  const watched = movies.filter(m => m.status === 'watched').sort((a, b) => (b.myRating ?? 0) - (a.myRating ?? 0));
  const watchlist = movies.filter(m => m.status === 'watchlist');

  return (
    <div>
      {/* Watched */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-label mb-1" style={{ color: 'var(--muted-foreground)' }}>Seen</div>
            <h2 className="text-heading-2">Watched</h2>
          </div>
          <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{watched.length} films</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {watched.map((movie, i) => (
            <MovieCard key={movie.slug} movie={movie} index={i} onClick={setSelected} />
          ))}
        </div>
      </section>

      {/* Watchlist */}
      {watchlist.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-label mb-1" style={{ color: 'var(--muted-foreground)' }}>Queue</div>
              <h2 className="text-heading-2">Watchlist</h2>
            </div>
            <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{watchlist.length} films</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
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
