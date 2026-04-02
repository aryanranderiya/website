'use client';

import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { HugeiconsIcon, Cancel01Icon } from '@icons';

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
                style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border overflow-hidden"
                style={{ background: 'var(--card)', borderColor: 'var(--border)', maxHeight: '85vh', overflowY: 'auto' }}
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <Dialog.Title className="sr-only">{movie.title}</Dialog.Title>
                <Dialog.Close asChild>
                  <button
                    className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: 'none', cursor: 'pointer' }}
                    aria-label="Close"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={14} color="currentColor" />
                  </button>
                </Dialog.Close>

                {/* Header with poster */}
                <div className="flex gap-4 p-6 pb-4">
                  <div className="w-24 rounded-xl overflow-hidden flex-shrink-0" style={{ aspectRatio: '2/3', background: 'var(--muted)' }}>
                    {movie.cover && <img src={movie.cover} alt={movie.title} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold mb-1" style={{ letterSpacing: '-0.02em', color: 'var(--foreground)' }}>
                      {movie.title}
                    </h2>
                    <div className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>
                      {movie.year}{movie.director && ` · ${movie.director}`}
                    </div>

                    {movie.myRating && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => {
                            const stars = Math.round((movie.myRating! / 10) * 5);
                            return <span key={i} style={{ color: i < stars ? '#00bbff' : 'var(--muted-foreground)', fontSize: '14px' }}>★</span>;
                          })}
                        </div>
                        <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{movie.myRating}/10</span>
                      </div>
                    )}

                    {movie.imdbId && (
                      <a
                        href={`https://www.imdb.com/title/${movie.imdbId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-opacity hover:opacity-70"
                        style={{ background: '#f5c518', color: '#000', fontWeight: 600 }}
                      >
                        IMDB ↗
                      </a>
                    )}
                  </div>
                </div>

                <div className="px-6 pb-6 space-y-4">
                  {/* Genre */}
                  {movie.genre.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {movie.genre.map(g => (
                        <span key={g} className="text-xs px-2 py-0.5 rounded-full border capitalize" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                          {g}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Favourite characters */}
                  {movie.favCharacters.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted-foreground)' }}>
                        Favourite Characters
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {movie.favCharacters.map(char => (
                          <span key={char} className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
                            {char}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Review */}
                  {movie.review && (
                    <div className="p-4 rounded-xl" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                      <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted-foreground)' }}>My Review</div>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>{movie.review}</p>
                    </div>
                  )}

                  {/* Pre-watch thoughts */}
                  {movie.thoughts && (
                    <div className="p-4 rounded-xl" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                      <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted-foreground)' }}>Why I Want to Watch</div>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>{movie.thoughts}</p>
                    </div>
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
