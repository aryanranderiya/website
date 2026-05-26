'use client';

import { HugeiconsIcon, StarIcon } from '@icons';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import BookCover, { useCoverAspect } from './BookCover';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

interface Book {
	slug: string;
	title: string;
	author: string;
	cover?: string;
	coverHash?: string;
	coverW?: number;
	coverH?: number;
	status: string;
	rating?: number;
	review?: string;
	genre: string[];
	year?: number;
	pages?: number;
	dateRead?: string;
}

const STATUS_LABEL: Record<string, string> = {
	read: 'Read',
	reading: 'Reading',
	'to-read': 'Want to read',
};

function Stars({ rating, max = 5 }: { rating: number; max?: number }) {
	return (
		<div className="flex gap-[3px]" role="img" aria-label={`Rated ${rating} out of ${max}`}>
			{Array.from({ length: max }).map((_, i) => (
				<HugeiconsIcon
					// biome-ignore lint/suspicious/noArrayIndexKey: static array, order never changes
					key={i}
					icon={StarIcon}
					size={14}
					color={i < rating ? '#f4b740' : 'var(--text-ghost)'}
				/>
			))}
		</div>
	);
}

export default function BookDetail({
	book,
	open,
	onClose,
}: {
	book: Book | null;
	open: boolean;
	onClose: () => void;
}) {
	// called before the early return so hook order stays stable
	const aspect = useCoverAspect(book?.cover, book?.coverW, book?.coverH);
	if (!book) return null;

	const meta = [
		book.year ? String(book.year) : null,
		book.pages ? `${book.pages} pages` : null,
		STATUS_LABEL[book.status] ?? null,
	].filter(Boolean);

	return (
		<LazyMotion features={loadFeatures}>
			<Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
				<AnimatePresence>
					{open && (
						<Dialog.Portal forceMount>
							<Dialog.Overlay asChild>
								<m.div
									className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[3px]"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.2 }}
								/>
							</Dialog.Overlay>
							<Dialog.Content asChild>
								<m.div
									className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[500px] rounded-t-2xl bg-[var(--card)] pb-[max(20px,env(safe-area-inset-bottom))]"
									initial={{ y: '100%' }}
									animate={{ y: 0 }}
									exit={{ y: '100%' }}
									transition={{ type: 'spring', stiffness: 360, damping: 36 }}
								>
									<Dialog.Title className="sr-only">{book.title}</Dialog.Title>

									{/* Drag handle */}
									<div className="flex justify-center pt-2.5 pb-1">
										<div className="h-1 w-9 rounded-full bg-[var(--border-strong)]" />
									</div>

									{/* Big prominent cover on the left; all info right-aligned on the right */}
									<div className="flex items-start gap-5 px-6 pt-2 pb-1">
										<div className="shrink-0 [filter:drop-shadow(0_12px_26px_rgba(0,0,0,0.38))]">
											<BookCover
												title={book.title}
												author={book.author}
												cover={book.cover}
												hash={book.coverHash}
												className="relative"
												style={{ width: 168, height: Math.round(168 * aspect) }}
											/>
										</div>
										<div className="flex min-w-0 flex-1 flex-col items-end pt-1 text-right">
											<h2 className="m-0 font-semibold text-[19px] text-[var(--text-primary)] leading-snug tracking-[-0.02em]">
												{book.title}
											</h2>
											<div className="mt-1 text-[13px] text-[var(--text-secondary)]">
												{book.author}
											</div>
											{book.rating ? (
												<div className="mt-3">
													<Stars rating={book.rating} />
												</div>
											) : null}
											{meta.length > 0 && (
												<div className="mt-4 text-[12px] text-[var(--text-ghost)] tracking-[-0.01em]">
													{meta.join('  ·  ')}
												</div>
											)}
											{book.review && (
												<p className="mt-3 text-[13px] text-[var(--text-secondary)] leading-relaxed">
													{book.review}
												</p>
											)}
										</div>
									</div>
								</m.div>
							</Dialog.Content>
						</Dialog.Portal>
					)}
				</AnimatePresence>
			</Dialog.Root>
		</LazyMotion>
	);
}
