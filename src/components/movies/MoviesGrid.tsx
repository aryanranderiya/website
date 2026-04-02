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
    <div className="flex items-center gap-3 mb-7">
      <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-foreground)', opacity: 0.6, whiteSpace: 'nowrap' }}>
        {label} — {count}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
    </div>
  );
}

export default function MoviesGrid({ movies }: { movies: Movie[] }) {
  const [selected, setSelected] = useState<Movie | null>(null);

  const watched = movies.filter(m => m.status === 'watched').sort((a, b) => (b.myRating ?? 0) - (a.myRating ?? 0));
  const watchlist = movies.filter(m => m.status === 'watchlist');

  return (
    <div>
      {/* Watched */}
      <section className="mb-14">
        <SectionHeader label="Watched" count={watched.length} />
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {watched.map((movie, i) => (
            <MovieCard key={movie.slug} movie={movie} index={i} onClick={setSelected} />
          ))}
        </div>
      </section>

      {/* Watchlist */}
      {watchlist.length > 0 && (
        <section>
          <SectionHeader label="Watchlist" count={watchlist.length} />
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
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
