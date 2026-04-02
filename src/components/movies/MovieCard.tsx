'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

function StarRating({ rating, max = 10 }: { rating: number; max?: number }) {
  // Convert to 5-star display
  const stars = Math.round((rating / max) * 5);
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} style={{ color: i < stars ? '#00bbff' : 'var(--muted-foreground)', fontSize: '12px' }}>
            ★
          </span>
        ))}
      </div>
      <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{rating}/10</span>
    </div>
  );
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => onClick(movie)}
      className="cursor-pointer group"
    >
      {/* Poster */}
      <div
        className="relative rounded-xl overflow-hidden mb-3 transition-all duration-200"
        style={{
          aspectRatio: '2/3',
          background: 'var(--muted)',
          boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.15)',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          transition: 'all 0.25s ease',
        }}
      >
        {movie.cover ? (
          <img
            src={movie.cover}
            alt={`${movie.title} poster`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center"
            style={{ background: 'var(--muted)' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: 'var(--muted-foreground)', opacity: 0.4 }}>
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
              <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
              <line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/>
              <line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/>
              <line x1="17" y1="7" x2="22" y2="7"/>
            </svg>
            <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{movie.title}</span>
          </div>
        )}

        {/* Rating overlay */}
        {movie.myRating && (
          <div
            className="absolute bottom-2 right-2 px-2 py-1 rounded-lg text-xs font-bold"
            style={{
              background: 'rgba(0,0,0,0.8)',
              color: '#00bbff',
              backdropFilter: 'blur(4px)',
            }}
          >
            {movie.myRating}/10
          </div>
        )}

        {/* Hover overlay */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
            >
              <span className="text-white text-sm font-medium">View Details</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info */}
      <div>
        <h3 className="text-sm font-semibold truncate mb-0.5" style={{ color: 'var(--foreground)', letterSpacing: '-0.01em' }}>
          {movie.title}
        </h3>
        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          {movie.year} {movie.director && `· ${movie.director}`}
        </div>
      </div>
    </motion.div>
  );
}
