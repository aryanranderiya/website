'use client';

import { motion, AnimatePresence } from 'motion/react';
import * as Dialog from '@radix-ui/react-dialog';
import { HugeiconsIcon, Cancel01Icon, StarIcon } from '@icons';

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

function RatingDots({ rating, max = 10 }: { rating: number; max?: number }) {
  const filled = Math.round((rating / max) * 5);
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <HugeiconsIcon
            key={i}
            icon={StarIcon}
            size={12}
            color={i < filled ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)'}
          />
        ))}
      </div>
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em' }}>
        {rating}/10
      </span>
    </div>
  );
}

export default function MovieDetail({ movie, open, onClose }: { movie: Movie | null; open: boolean; onClose: () => void }) {
  if (!movie) return null;

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50"
                style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden"
                style={{
                  background: 'var(--background)',
                  borderRadius: '16px',
                  maxHeight: '88vh',
                  overflowY: 'auto',
                }}
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
              >
                <Dialog.Title className="sr-only">{movie.title}</Dialog.Title>

                {/* Close button */}
                <Dialog.Close asChild>
                  <button
                    className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)', border: 'none', cursor: 'pointer' }}
                    aria-label="Close"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={12} color="rgba(255,255,255,0.8)" />
                  </button>
                </Dialog.Close>

                {/* Hero header — blurred poster bg */}
                <div className="relative overflow-hidden" style={{ height: '200px' }}>
                  {/* Background blur */}
                  {movie.cover && (
                    <img
                      src={movie.cover}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover scale-110"
                      style={{ filter: 'blur(24px) saturate(0.8) brightness(0.5)', transform: 'scale(1.2)' }}
                    />
                  )}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: movie.cover
                        ? 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.75) 100%)'
                        : 'var(--muted)',
                    }}
                  />

                  {/* Poster + info row */}
                  <div className="absolute inset-0 flex items-end p-5 gap-4">
                    {/* Poster */}
                    <div
                      className="flex-shrink-0 overflow-hidden"
                      style={{
                        width: '72px',
                        aspectRatio: '2/3',
                        borderRadius: '8px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                        background: 'rgba(0,0,0,0.3)',
                      }}
                    >
                      {movie.cover && (
                        <img src={movie.cover} alt={movie.title} className="w-full h-full object-cover" />
                      )}
                    </div>

                    {/* Title & meta */}
                    <div className="flex-1 min-w-0 pb-1">
                      <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '4px' }}>
                        {movie.title}
                      </h2>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', letterSpacing: '-0.01em' }}>
                        {movie.year}{movie.director && ` · ${movie.director}`}
                      </div>
                      {movie.myRating && <RatingDots rating={movie.myRating} />}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-5">
                  {/* Genre tags */}
                  {movie.genre.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {movie.genre.map(g => (
                        <span
                          key={g}
                          className="capitalize"
                          style={{
                            fontSize: '11px',
                            fontWeight: 500,
                            padding: '3px 10px',
                            borderRadius: '999px',
                            background: 'var(--muted)',
                            color: 'var(--muted-foreground)',
                          }}
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Review */}
                  {movie.review && (
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-foreground)', opacity: 0.6, marginBottom: '8px' }}>
                        My Review
                      </div>
                      <p style={{ fontSize: '13px', lineHeight: 1.65, color: 'var(--foreground)', opacity: 0.75, letterSpacing: '-0.01em' }}>
                        {movie.review}
                      </p>
                    </div>
                  )}

                  {/* Pre-watch thoughts */}
                  {movie.thoughts && (
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-foreground)', opacity: 0.6, marginBottom: '8px' }}>
                        Why I Want to Watch
                      </div>
                      <p style={{ fontSize: '13px', lineHeight: 1.65, color: 'var(--foreground)', opacity: 0.75, letterSpacing: '-0.01em' }}>
                        {movie.thoughts}
                      </p>
                    </div>
                  )}

                  {/* Favourite characters */}
                  {movie.favCharacters.length > 0 && (
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-foreground)', opacity: 0.6, marginBottom: '8px' }}>
                        Favourite Characters
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {movie.favCharacters.map(char => (
                          <span
                            key={char}
                            style={{
                              fontSize: '12px',
                              fontWeight: 500,
                              padding: '4px 12px',
                              borderRadius: '999px',
                              background: 'var(--muted)',
                              color: 'var(--foreground)',
                              opacity: 0.8,
                            }}
                          >
                            {char}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* IMDB link */}
                  {movie.imdbId && (
                    <a
                      href={`https://www.imdb.com/title/${movie.imdbId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '5px 12px',
                        borderRadius: '6px',
                        background: '#f5c518',
                        color: '#000',
                        textDecoration: 'none',
                        letterSpacing: '0.02em',
                        opacity: 0.9,
                        transition: 'opacity 0.15s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '0.9')}
                    >
                      IMDB ↗
                    </a>
                  )}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
