'use client';

import { Cancel01Icon, HugeiconsIcon, StarIcon } from '@icons';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

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
						// biome-ignore lint/suspicious/noArrayIndexKey: static array, order never changes
						key={i}
						icon={StarIcon}
						size={12}
						color={i < filled ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)'}
					/>
				))}
			</div>
			<span className="font-semibold text-[13px] text-white/90 tracking-[-0.02em]">
				{rating}/10
			</span>
		</div>
	);
}

export default function MovieDetail({
	movie,
	open,
	onClose,
}: {
	movie: Movie | null;
	open: boolean;
	onClose: () => void;
}) {
	if (!movie) return null;

	return (
		<LazyMotion features={loadFeatures}>
			<Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
				<AnimatePresence>
					{open && (
						<Dialog.Portal forceMount>
							<Dialog.Overlay asChild>
								<m.div
									className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[8px]"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.2 }}
								/>
							</Dialog.Overlay>
							<Dialog.Content asChild>
								<m.div
									className="fixed top-1/2 left-1/2 z-50 max-h-[88vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden overflow-y-auto rounded-2xl bg-[var(--background)]"
									initial={{ opacity: 0, scale: 0.96, y: 10 }}
									animate={{ opacity: 1, scale: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.96, y: 10 }}
									transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
								>
									<Dialog.Title className="sr-only">{movie.title}</Dialog.Title>

									{/* Close button */}
									<Dialog.Close asChild>
										<button
											type="button"
											className="absolute top-3 right-3 z-20 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black/35 backdrop-blur-[4px]"
											aria-label="Close"
										>
											<HugeiconsIcon icon={Cancel01Icon} size={12} color="rgba(255,255,255,0.8)" />
										</button>
									</Dialog.Close>

									{/* Hero header - blurred poster bg */}
									<div className="relative h-[200px] overflow-hidden">
										{/* Background blur */}
										{movie.cover && (
											<img
												src={movie.cover}
												alt=""
												aria-hidden="true"
												className="absolute inset-0 h-full w-full scale-[1.2] object-cover blur-[24px] brightness-50 saturate-[0.8]"
											/>
										)}
										<div
											className="absolute inset-0"
											// biome-ignore lint/nursery/noInlineStyles: dynamic gradient based on movie.cover presence
											style={{
												background: movie.cover
													? 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.75) 100%)'
													: 'var(--muted)',
											}}
										/>

										{/* Poster + info row */}
										<div className="absolute inset-0 flex items-end gap-4 p-5">
											{/* Poster */}
											<div className="aspect-[2/3] w-[72px] shrink-0 overflow-hidden rounded-lg bg-black/30 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
												{movie.cover && (
													<img
														src={movie.cover}
														alt={movie.title}
														className="h-full w-full object-cover"
													/>
												)}
											</div>

											{/* Title & meta */}
											<div className="min-w-0 flex-1 pb-1">
												<h2 className="m-0 mb-1 font-bold text-[20px] text-white/95 leading-[1.2] tracking-[-0.03em]">
													{movie.title}
												</h2>
												<div className="mb-2 text-[12px] text-white/50 tracking-[-0.01em]">
													{movie.year}
													{movie.director && ` · ${movie.director}`}
												</div>
												{movie.myRating && <RatingDots rating={movie.myRating} />}
											</div>
										</div>
									</div>

									{/* Body */}
									<div className="space-y-5 p-5">
										{/* Genre tags */}
										{movie.genre.length > 0 && (
											<div className="flex flex-wrap gap-1.5">
												{movie.genre.map((g) => (
													<span
														key={g}
														className="rounded-full bg-[var(--muted)] px-[10px] py-[3px] font-medium text-[11px] text-[var(--muted-foreground)] capitalize"
													>
														{g}
													</span>
												))}
											</div>
										)}

										{/* Review */}
										{movie.review && (
											<div>
												<div className="mb-2 font-medium text-[10px] text-[var(--muted-foreground)] uppercase tracking-[0.08em] opacity-60">
													My Review
												</div>
												<p className="m-0 text-[13px] text-[var(--foreground)] leading-[1.65] tracking-[-0.01em] opacity-75">
													{movie.review}
												</p>
											</div>
										)}

										{/* Pre-watch thoughts */}
										{movie.thoughts && (
											<div>
												<div className="mb-2 font-medium text-[10px] text-[var(--muted-foreground)] uppercase tracking-[0.08em] opacity-60">
													Why I Want to Watch
												</div>
												<p className="m-0 text-[13px] text-[var(--foreground)] leading-[1.65] tracking-[-0.01em] opacity-75">
													{movie.thoughts}
												</p>
											</div>
										)}

										{/* Favourite characters */}
										{movie.favCharacters.length > 0 && (
											<div>
												<div className="mb-2 font-medium text-[10px] text-[var(--muted-foreground)] uppercase tracking-[0.08em] opacity-60">
													Favourite Characters
												</div>
												<div className="flex flex-wrap gap-1.5">
													{movie.favCharacters.map((char) => (
														<span
															key={char}
															className="rounded-full bg-[var(--muted)] px-3 py-1 font-medium text-[12px] text-[var(--foreground)] opacity-80"
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
												className="inline-flex items-center gap-1 rounded-[6px] bg-[#f5c518] px-3 py-[5px] font-bold text-[11px] text-black tracking-[0.02em] no-underline opacity-90 transition-opacity duration-150 hover:opacity-100"
											>
												IMDB ↗
											</a>
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
