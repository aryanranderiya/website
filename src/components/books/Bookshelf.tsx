'use client';

import { useState } from 'react';
import Book3D from './Book3D';
import BookDetail from './BookDetail';

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

function Shelf({ books, label }: { books: Book[]; label: string }) {
  const [selected, setSelected] = useState<Book | null>(null);

  if (books.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="text-label mb-4" style={{ color: 'var(--muted-foreground)' }}>{label}</div>

      {/*
        Key insight: the shelf casing border & outer styling must NOT use overflow:hidden
        so books can pop out of the shelf on hover. We fake the casing with a border/outline trick.
      */}
      <div style={{ position: 'relative' }}>

        {/* ── SHELF CASING OUTLINE (drawn with box-shadow, not overflow:hidden) ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 10,
            // Outer walnut casing via box-shadow + gradient border trick
            background: 'linear-gradient(180deg, #5c3a1e 0%, #3e2510 100%)',
            zIndex: 0,
          }}
        />
        {/* Casing top highlight strip */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, #8b6040 0%, #c09060 40%, #a07040 70%, #7a5030 100%)',
          borderRadius: '10px 10px 0 0',
          zIndex: 1,
        }} />

        {/* ── BACK WALL (absolute, fills behind books) ── */}
        <div
          style={{
            position: 'absolute',
            inset: 3,
            borderRadius: 8,
            // Dark walnut with grain
            background: [
              'repeating-linear-gradient(180deg, transparent 0px, transparent 9px, rgba(0,0,0,0.055) 9px, rgba(0,0,0,0.055) 10px)',
              'repeating-linear-gradient(182deg, transparent 0px, transparent 45px, rgba(255,255,255,0.01) 45px, rgba(255,255,255,0.01) 46px)',
              'linear-gradient(180deg, #2c1c0e 0%, #1a1008 100%)',
            ].join(', '),
            zIndex: 1,
            overflow: 'hidden',
          }}
        >
          {/* Overhead warm light cone */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 65% 50% at 50% -5%, rgba(255,195,100,0.16) 0%, rgba(255,160,60,0.05) 55%, transparent 80%)',
            pointerEvents: 'none',
          }} />
          {/* Left vignette */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: 48, bottom: 0,
            background: 'linear-gradient(90deg, rgba(0,0,0,0.28) 0%, transparent 100%)',
            pointerEvents: 'none',
          }} />
          {/* Right vignette */}
          <div style={{
            position: 'absolute', top: 0, right: 0, width: 48, bottom: 0,
            background: 'linear-gradient(270deg, rgba(0,0,0,0.28) 0%, transparent 100%)',
            pointerEvents: 'none',
          }} />
        </div>

        {/* ── BOOKS ROW — perspective set here, overflow VISIBLE so books can pop out ── */}
        <div
          className="flex overflow-x-auto"
          style={{
            position: 'relative',
            zIndex: 3,
            padding: '20px 20px 0 20px',
            alignItems: 'flex-end',
            gap: 2,
            // Perspective on the ROW so all books share the same 3D space
            perspective: '1000px',
            perspectiveOrigin: '50% 110%',
            // MUST be visible — this is what lets books tilt out of the shelf
            overflow: 'visible',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.08) transparent',
          }}
        >
          {books.map((book, i) => (
            <Book3D
              key={book.slug}
              title={book.title}
              author={book.author}
              cover={book.cover}
              pages={book.pages}
              index={i}
              onClick={() => setSelected(book)}
            />
          ))}
        </div>

        {/* ── SHELF PLANK (sits above books in z so shadow falls correctly) ── */}
        <div style={{ position: 'relative', zIndex: 4 }}>
          {/* Plank top — catches overhead light */}
          <div style={{
            height: 7,
            background: 'linear-gradient(180deg, #a07540 0%, #7a5428 55%, #5c3c18 100%)',
            position: 'relative',
            overflow: 'hidden',
            marginLeft: 3, marginRight: 3,
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 16px, rgba(0,0,0,0.06) 16px, rgba(0,0,0,0.06) 17px)',
            }} />
            {/* Light glint */}
            <div style={{
              position: 'absolute', top: 1, left: '15%', right: '15%', height: 1,
              background: 'rgba(255,230,170,0.4)',
            }} />
          </div>
          {/* Plank front face */}
          <div style={{
            height: 20,
            background: 'linear-gradient(180deg, #6b4820 0%, #4e3210 55%, #3a2408 100%)',
            position: 'relative',
            overflow: 'hidden',
            marginLeft: 3, marginRight: 3,
            borderRadius: '0 0 7px 7px',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 22px, rgba(0,0,0,0.07) 22px, rgba(0,0,0,0.07) 23px)',
            }} />
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 1,
              background: 'rgba(255,200,120,0.18)',
            }} />
          </div>
          {/* Underside shadow drip */}
          <div style={{
            height: 10,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
            marginLeft: 3, marginRight: 3,
          }} />
        </div>

      </div>

      <BookDetail
        book={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

export default function Bookshelf({ books }: { books: Book[] }) {
  const readBooks = books.filter(b => b.status === 'read');
  const readingBooks = books.filter(b => b.status === 'reading');
  const toReadBooks = books.filter(b => b.status === 'to-read');

  return (
    <div>
      {readingBooks.length > 0 && (
        <Shelf books={readingBooks} label="Currently Reading" />
      )}
      <Shelf books={readBooks} label="Have Read" />
      <Shelf books={toReadBooks} label="Want to Read" />
    </div>
  );
}
