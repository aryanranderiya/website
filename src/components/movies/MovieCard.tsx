'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon, ImageNotFound01Icon, StarIcon } from '@icons';

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
    <motion.div
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
        className="relative overflow-hidden mb-2.5"
        style={{
          aspectRatio: '2/3',
          background: 'var(--muted)',
          borderRadius: '8px',
          transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
          boxShadow: hovered ? '0 10px 28px rgba(0,0,0,0.18)' : '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
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
            <HugeiconsIcon icon={ImageNotFound01Icon} size={24} color="var(--muted-foreground)" style={{ opacity: 0.3 }} />
            <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', opacity: 0.5 }}>{movie.title}</span>
          </div>
        )}

        {/* Rating badge */}
        {movie.myRating && (
          <div
            className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md"
            style={{
              background: 'rgba(0,0,0,0.72)',
              backdropFilter: 'blur(6px)',
            }}
          >
            <HugeiconsIcon icon={StarIcon} size={9} color="rgba(255,255,255,0.7)" />
            <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.01em' }}>
              {movie.myRating}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-end justify-center pb-7"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        >
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', fontWeight: 500, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
            View details
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-0.5">
        <h3
          className="truncate"
          style={{ fontSize: '12px', fontWeight: 600, color: 'var(--foreground)', letterSpacing: '-0.02em', lineHeight: 1.3 }}
        >
          {movie.title}
        </h3>
        <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', opacity: 0.6 }}>
          {movie.year}
        </div>
      </div>
    </motion.div>
  );
}
