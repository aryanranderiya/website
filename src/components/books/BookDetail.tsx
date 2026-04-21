'use client';

import { Cancel01Icon, HugeiconsIcon } from '@icons';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

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
				<span
					// biome-ignore lint/suspicious/noArrayIndexKey: static array, order never changes
					key={i}
					className={`text-[16px] ${i < rating ? 'text-[#00bbff]' : 'text-[var(--muted-foreground)]'}`}
				>
					{i < rating ? '★' : '☆'}
				</span>
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
	if (!book) return null;

	const statusColors: Record<string, { bg: string; text: string; label: string }> = {
		read: { bg: 'rgba(34,197,94,0.1)', text: '#16a34a', label: 'Read' },
		reading: { bg: 'rgba(0,187,255,0.1)', text: '#00bbff', label: 'Reading' },
		'to-read': {
			bg: 'rgba(161,161,170,0.1)',
			text: 'var(--muted-foreground)',
			label: 'Want to Read',
		},
	};

	const statusStyle = statusColors[book.status] ?? statusColors['to-read'];

	return (
		<LazyMotion features={loadFeatures}>
			<Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
				<AnimatePresence>
					{open && (
						<Dialog.Portal forceMount>
							<Dialog.Overlay asChild>
								<m.div
									className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[6px]"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.2 }}
								/>
							</Dialog.Overlay>
							<Dialog.Content asChild>
								<m.div
									className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-[var(--card)]"
									initial={{ opacity: 0, scale: 0.95, y: 12 }}
									animate={{ opacity: 1, scale: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.95, y: 12 }}
									transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
								>
									<Dialog.Title className="sr-only">{book.title}</Dialog.Title>
									<Dialog.Close asChild>
										<button
											type="button"
											className="absolute top-4 right-4 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)]"
											aria-label="Close"
										>
											<HugeiconsIcon icon={Cancel01Icon} size={14} color="currentColor" />
										</button>
									</Dialog.Close>

									<div className="p-6">
										<div className="mb-5 flex gap-4">
											{/* Book mini cover */}
											<div className="h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--muted)]">
												{book.cover && (
													<img
														src={book.cover}
														alt={book.title}
														className="h-full w-full object-cover"
													/>
												)}
											</div>
											<div className="min-w-0 flex-1">
												<h2 className="m-0 mb-1 font-bold text-[var(--foreground)] text-lg tracking-[-0.02em]">
													{book.title}
												</h2>
												<div className="mb-2 text-[var(--muted-foreground)] text-sm">
													{book.author}
												</div>
												<span
													className="rounded-full px-2 py-0.5 text-xs"
													// biome-ignore lint/nursery/noInlineStyles: dynamic status-based background and color
													style={{ background: statusStyle.bg, color: statusStyle.text }}
												>
													{statusStyle.label}
												</span>
											</div>
										</div>

										{book.rating && (
											<div className="mb-4">
												<Stars rating={book.rating} />
											</div>
										)}

										<div className="mb-4 flex gap-4 text-[var(--muted-foreground)] text-xs">
											{book.year && <span>{book.year}</span>}
											{book.pages && <span>{book.pages} pages</span>}
											{book.dateRead && <span>Read {new Date(book.dateRead).getFullYear()}</span>}
										</div>

										{book.genre.length > 0 && (
											<div className="mb-4 flex flex-wrap gap-1.5">
												{book.genre.map((g) => (
													<span
														key={g}
														className="rounded-full bg-[var(--muted-bg)] px-2 py-0.5 text-[var(--muted-foreground)] text-xs capitalize"
													>
														{g}
													</span>
												))}
											</div>
										)}

										{book.review && (
											<div className="rounded-xl bg-[var(--muted)] p-3">
												<div className="mb-2 font-semibold text-[var(--muted-foreground)] text-xs uppercase tracking-widest">
													My thoughts
												</div>
												<p className="m-0 text-[var(--foreground)] text-sm leading-relaxed">
													{book.review}
												</p>
											</div>
										)}
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
