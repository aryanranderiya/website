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

// Plank silhouette (viewBox 576x42, stretched to width). Two distinct planes:
//   • TOP surface — a trapezoid, narrow at the very top (inset by FLARE each side) and
//     flaring to full width by y=22, so the plank has beveled ends. Greyish. Made tall
//     enough (22px) that the book's reflection fits on it without touching the front face.
//   • FRONT face  — full width below, white, rounded bottom corners.
// Both are stroked, so the layers (and the line between them) read as crisp outlines.
// Both planes have softly rounded corners (top surface all round; front face round too).
const TOP_PLANE =
	'M31 0 L545 0 Q548 0 550.4 1.85 L573.6 20.15 Q576 22 573 22 L3 22 Q0 22 2.4 20.15 L25.64 1.85 Q28 0 31 0 Z';
const FRONT_PLANE =
	'M3 22 L573 22 Q576 22 576 25 L576 39 Q576 42 573 42 L3 42 Q0 42 0 39 L0 25 Q0 22 3 22 Z';

/** The 3D plank: greyish top surface + white front face, each outlined, with a real soft floor shadow. */
function ShelfPlank() {
	return (
		<div className="pointer-events-none absolute right-8 bottom-0 left-8 z-0 h-[42px] [filter:drop-shadow(0_4px_4px_rgba(20,21,23,0.10))_drop-shadow(0_10px_13px_rgba(20,21,23,0.07))]">
			<svg
				viewBox="0 0 576 42"
				preserveAspectRatio="none"
				className="h-full w-full overflow-visible"
				aria-hidden="true"
			>
				<title>shelf</title>
				<defs>
					<linearGradient id="shelf-top" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="var(--shelf-top-a)" />
						<stop offset="1" stopColor="var(--shelf-top-b)" />
					</linearGradient>
					<linearGradient id="shelf-front" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="var(--shelf-front-a)" />
						<stop offset="1" stopColor="var(--shelf-front-b)" />
					</linearGradient>
				</defs>
				{/* white front face (bottom layer) */}
				<path
					d={FRONT_PLANE}
					fill="url(#shelf-front)"
					stroke="var(--shelf-line)"
					strokeWidth="1"
					vectorEffect="non-scaling-stroke"
				/>
				{/* greyish top surface with beveled ends (drawn on top) */}
				<path
					d={TOP_PLANE}
					fill="url(#shelf-top)"
					stroke="var(--shelf-line)"
					strokeWidth="1"
					vectorEffect="non-scaling-stroke"
				/>
			</svg>
		</div>
	);
}

// 5 books per shelf; long lists wrap into a stack of planks (a bookcase).
const BOOK_WIDTH = 102;
const PER_SHELF = 5;

function Shelf({
	books,
	label,
	onSelect,
}: {
	books: Book[];
	label: string;
	onSelect: (b: Book) => void;
}) {
	if (books.length === 0) return null;

	const rows: Book[][] = [];
	for (let i = 0; i < books.length; i += PER_SHELF) rows.push(books.slice(i, i + PER_SHELF));

	return (
		<div className="pt-12 first:pt-1">
			<div className="mb-3 px-1 text-center text-[13px] text-[var(--text-secondary)] tracking-[-0.01em]">
				{label}
			</div>
			{rows.map((row, ri) => (
				<div key={row[0].slug} className={ri > 0 ? 'relative mt-7' : 'relative'}>
					{/* L/R padding sits the books on the inset TOP surface, not the wider front face */}
					<div className="relative z-10 flex items-end justify-start gap-[16px] pr-[60px] pl-[60px]">
						{row.map((book, i) => (
							<Book3D
								key={book.slug}
								title={book.title}
								author={book.author}
								cover={book.cover}
								width={BOOK_WIDTH}
								index={i}
								onClick={() => onSelect(book)}
							/>
						))}
					</div>
					<div className="relative -mt-2 h-[42px]">
						<ShelfPlank />
					</div>
				</div>
			))}
		</div>
	);
}

export default function Bookshelf({ books }: { books: Book[] }) {
	const [selected, setSelected] = useState<Book | null>(null);

	const readingBooks = books.filter((b) => b.status === 'reading');
	const readBooks = books.filter((b) => b.status === 'read');
	const toReadBooks = books.filter((b) => b.status === 'to-read');

	return (
		<div>
			<div>
				<Shelf books={readingBooks} label="Currently Reading" onSelect={setSelected} />
				<Shelf books={readBooks} label="Have Read" onSelect={setSelected} />
				<Shelf books={toReadBooks} label="Want to Read" onSelect={setSelected} />
			</div>

			<BookDetail book={selected} open={!!selected} onClose={() => setSelected(null)} />
		</div>
	);
}
