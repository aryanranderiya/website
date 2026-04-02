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
    <div className="mb-12">
      <div className="text-label mb-6" style={{ color: 'var(--muted-foreground)' }}>{label}</div>

      {/* Shelf */}
      <div
        className="relative rounded-2xl overflow-hidden p-6 pb-0"
        style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
      >
        {/* Books row */}
        <div className="flex gap-3 overflow-x-auto pb-6 items-end" style={{ minHeight: '180px' }}>
          {books.map((book, i) => (
            <Book3D
              key={book.slug}
              title={book.title}
              author={book.author}
              cover={book.cover}
              index={i}
              onClick={() => setSelected(book)}
            />
          ))}
        </div>

        {/* Shelf plank */}
        <div
          style={{
            height: '12px',
            background: 'linear-gradient(180deg, #8B6914 0%, #6B4F10 50%, #4A360C 100%)',
            borderRadius: '0 0 8px 8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '2px',
            }}
          />
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
