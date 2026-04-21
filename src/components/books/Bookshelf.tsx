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
			<div className="mb-4 text-[var(--muted-foreground)] text-label">{label}</div>

			{/*
        Key insight: the shelf casing border & outer styling must NOT use overflow:hidden
        so books can pop out of the shelf on hover. We fake the casing with a border/outline trick.
      */}
			<div className="relative">
				{/* ── SHELF CASING OUTLINE (drawn with box-shadow, not overflow:hidden) ── */}
				<div
					className="absolute inset-0 z-0 rounded-[10px]"
					// biome-ignore lint/nursery/noInlineStyles: complex gradient background has no Tailwind equivalent
					style={{
						background: 'linear-gradient(180deg, #5c3a1e 0%, #3e2510 100%)',
					}}
				/>
				{/* Casing top highlight strip */}
				<div
					className="absolute top-0 right-0 left-0 z-[1] h-[3px] rounded-t-[10px]"
					// biome-ignore lint/nursery/noInlineStyles: complex gradient background has no Tailwind equivalent
					style={{
						background:
							'linear-gradient(90deg, #8b6040 0%, #c09060 40%, #a07040 70%, #7a5030 100%)',
					}}
				/>

				{/* ── BACK WALL (absolute, fills behind books) ── */}
				<div
					className="absolute z-[1] overflow-hidden rounded-[8px]"
					// biome-ignore lint/nursery/noInlineStyles: complex multi-layer gradient background has no Tailwind equivalent
					style={{
						inset: 3,
						background: [
							'repeating-linear-gradient(180deg, transparent 0px, transparent 9px, rgba(0,0,0,0.055) 9px, rgba(0,0,0,0.055) 10px)',
							'repeating-linear-gradient(182deg, transparent 0px, transparent 45px, rgba(255,255,255,0.01) 45px, rgba(255,255,255,0.01) 46px)',
							'linear-gradient(180deg, #2c1c0e 0%, #1a1008 100%)',
						].join(', '),
					}}
				>
					{/* Overhead warm light cone */}
					<div
						className="pointer-events-none absolute inset-0"
						// biome-ignore lint/nursery/noInlineStyles: complex radial-gradient has no Tailwind equivalent
						style={{
							background:
								'radial-gradient(ellipse 65% 50% at 50% -5%, rgba(255,195,100,0.16) 0%, rgba(255,160,60,0.05) 55%, transparent 80%)',
						}}
					/>
					{/* Left vignette */}
					<div
						className="pointer-events-none absolute top-0 bottom-0 left-0 w-[48px]"
						// biome-ignore lint/nursery/noInlineStyles: gradient has no Tailwind equivalent
						style={{
							background: 'linear-gradient(90deg, rgba(0,0,0,0.28) 0%, transparent 100%)',
						}}
					/>
					{/* Right vignette */}
					<div
						className="pointer-events-none absolute top-0 right-0 bottom-0 w-[48px]"
						// biome-ignore lint/nursery/noInlineStyles: gradient has no Tailwind equivalent
						style={{
							background: 'linear-gradient(270deg, rgba(0,0,0,0.28) 0%, transparent 100%)',
						}}
					/>
				</div>

				{/* ── BOOKS ROW -- perspective set here, overflow VISIBLE so books can pop out ── */}
				<div
					className="relative z-[3] flex overflow-x-auto"
					// biome-ignore lint/nursery/noInlineStyles: perspective/perspectiveOrigin/scrollbarColor have no Tailwind equivalent
					style={{
						padding: '20px 20px 0 20px',
						alignItems: 'flex-end',
						gap: 2,
						// Perspective on the ROW so all books share the same 3D space
						perspective: '1000px',
						perspectiveOrigin: '50% 110%',
						// MUST be visible -- this is what lets books tilt out of the shelf
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
				<div className="relative z-[4]">
					{/* Plank top -- catches overhead light */}
					<div
						className="relative mr-[3px] ml-[3px] h-[7px] overflow-hidden"
						// biome-ignore lint/nursery/noInlineStyles: complex gradient has no Tailwind equivalent
						style={{
							background: 'linear-gradient(180deg, #a07540 0%, #7a5428 55%, #5c3c18 100%)',
						}}
					>
						<div
							className="absolute inset-0"
							// biome-ignore lint/nursery/noInlineStyles: repeating gradient has no Tailwind equivalent
							style={{
								backgroundImage:
									'repeating-linear-gradient(90deg, transparent 0px, transparent 16px, rgba(0,0,0,0.06) 16px, rgba(0,0,0,0.06) 17px)',
							}}
						/>
						{/* Light glint */}
						<div
							className="absolute top-[1px] right-[15%] left-[15%] h-[1px]"
							// biome-ignore lint/nursery/noInlineStyles: rgba background has no Tailwind equivalent
							style={{ background: 'rgba(255,230,170,0.4)' }}
						/>
					</div>
					{/* Plank front face */}
					<div
						className="relative mr-[3px] ml-[3px] h-[20px] overflow-hidden rounded-b-[7px]"
						// biome-ignore lint/nursery/noInlineStyles: complex gradient has no Tailwind equivalent
						style={{
							background: 'linear-gradient(180deg, #6b4820 0%, #4e3210 55%, #3a2408 100%)',
						}}
					>
						<div
							className="absolute inset-0"
							// biome-ignore lint/nursery/noInlineStyles: repeating gradient has no Tailwind equivalent
							style={{
								backgroundImage:
									'repeating-linear-gradient(90deg, transparent 0px, transparent 22px, rgba(0,0,0,0.07) 22px, rgba(0,0,0,0.07) 23px)',
							}}
						/>
						<div
							className="absolute top-0 right-0 left-0 h-[1px]"
							// biome-ignore lint/nursery/noInlineStyles: rgba background has no Tailwind equivalent
							style={{ background: 'rgba(255,200,120,0.18)' }}
						/>
					</div>
					{/* Underside shadow drip */}
					<div
						className="mr-[3px] ml-[3px] h-[10px]"
						// biome-ignore lint/nursery/noInlineStyles: gradient has no Tailwind equivalent
						style={{
							background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
						}}
					/>
				</div>
			</div>

			<BookDetail book={selected} open={!!selected} onClose={() => setSelected(null)} />
		</div>
	);
}

export default function Bookshelf({ books }: { books: Book[] }) {
	const readBooks = books.filter((b) => b.status === 'read');
	const readingBooks = books.filter((b) => b.status === 'reading');
	const toReadBooks = books.filter((b) => b.status === 'to-read');

	return (
		<div>
			{readingBooks.length > 0 && <Shelf books={readingBooks} label="Currently Reading" />}
			<Shelf books={readBooks} label="Have Read" />
			<Shelf books={toReadBooks} label="Want to Read" />
		</div>
	);
}
