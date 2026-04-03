'use client';

import { motion, AnimatePresence } from 'motion/react';
import * as Dialog from '@radix-ui/react-dialog';
import { HugeiconsIcon, Cancel01Icon } from '@icons';

interface Book {
  slug: string;
  title: string;
  author: string;
  cover?: string;
  status: string;
  rating?: number;
  review?: string;
  genre: string[];
  year?: number;
  pages?: number;
  dateRead?: string;
}

function Stars({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} style={{ color: i < rating ? '#00bbff' : 'var(--muted-foreground)', fontSize: '16px' }}>
          {i < rating ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
}

export default function BookDetail({ book, open, onClose }: { book: Book | null; open: boolean; onClose: () => void }) {
  if (!book) return null;

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    read: { bg: 'rgba(34,197,94,0.1)', text: '#16a34a', label: 'Read' },
    reading: { bg: 'rgba(0,187,255,0.1)', text: '#00bbff', label: 'Reading' },
    'to-read': { bg: 'rgba(161,161,170,0.1)', text: 'var(--muted-foreground)', label: 'Want to Read' },
  };

  const statusStyle = statusColors[book.status] ?? statusColors['to-read'];

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50"
                style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border overflow-hidden"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <Dialog.Title className="sr-only">{book.title}</Dialog.Title>
                <Dialog.Close asChild>
                  <button
                    className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: 'none', cursor: 'pointer' }}
                    aria-label="Close"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={14} color="currentColor" />
                  </button>
                </Dialog.Close>

                <div className="p-6">
                  <div className="flex gap-4 mb-5">
                    {/* Book mini cover */}
                    <div className="w-16 h-24 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'var(--muted)' }}>
                      {book.cover && <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold mb-1" style={{ letterSpacing: '-0.02em', color: 'var(--foreground)' }}>
                        {book.title}
                      </h2>
                      <div className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>{book.author}</div>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: statusStyle.bg, color: statusStyle.text }}>
                        {statusStyle.label}
                      </span>
                    </div>
                  </div>

                  {book.rating && (
                    <div className="mb-4">
                      <Stars rating={book.rating} />
                    </div>
                  )}

                  <div className="flex gap-4 mb-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {book.year && <span>{book.year}</span>}
                    {book.pages && <span>{book.pages} pages</span>}
                    {book.dateRead && <span>Read {new Date(book.dateRead).getFullYear()}</span>}
                  </div>

                  {book.genre.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {book.genre.map(g => (
                        <span key={g} className="text-xs px-2 py-0.5 rounded-full border capitalize" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                          {g}
                        </span>
                      ))}
                    </div>
                  )}

                  {book.review && (
                    <div className="p-3 rounded-xl" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                      <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted-foreground)' }}>My thoughts</div>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>{book.review}</p>
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
