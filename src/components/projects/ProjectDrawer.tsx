'use client';

import {
	ArrowLeft01Icon,
	ArrowRight01Icon,
	Cancel01Icon,
	CircleArrowUpRight02Icon,
	GithubIcon,
	HugeiconsIcon,
	ImageNotFound01Icon,
} from '@icons';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { useEffect, useState } from 'react';
import { RaisedButton } from '@/components/ui/raised-button';
import { getTechIconUrl } from '../../utils/techIcons';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

const TYPE_LABELS: Record<string, string> = {
	web: 'Web',
	mobile: 'Mobile',
	game: 'Game',
	cli: 'CLI',
	desktop: 'Desktop',
	macos: 'macOS',
	os: 'macOS',
	other: 'Other',
	api: 'API',
};

interface Project {
	slug: string;
	title: string;
	description: string;
	tags: string[];
	tech: string[];
	type: string;
	status: string;
	featured: boolean;
	images: string[];
	folder: string;
	url?: string;
	github?: string;
	coverImage?: string;
}

function CarouselImage({ src, alt }: { src: string; alt: string }) {
	const [loaded, setLoaded] = useState(false);
	const [errored, setErrored] = useState(false);

	return (
		<>
			{/* Placeholder shown while loading or on error */}
			{(!loaded || errored) && (
				<div className="absolute inset-0 flex items-center justify-center bg-[var(--muted-bg)]">
					{errored ? (
						<HugeiconsIcon icon={ImageNotFound01Icon} size={20} color="var(--text-ghost)" />
					) : (
						<div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--text-ghost)]" />
					)}
				</div>
			)}
			{!errored && (
				<img
					key={src}
					src={src}
					alt={alt}
					onLoad={() => setLoaded(true)}
					onError={() => {
						setLoaded(true);
						setErrored(true);
					}}
					className="block h-full w-full object-cover transition-opacity duration-200"
					// biome-ignore lint/nursery/noInlineStyles: dynamic opacity based on loaded state
					style={{ opacity: loaded ? 1 : 0 }}
				/>
			)}
		</>
	);
}

export default function ProjectDrawer({
	project,
	open,
	onClose,
}: {
	project: Project | null;
	open: boolean;
	onClose: () => void;
}) {
	const [activeImage, setActiveImage] = useState(0);

	// Reset carousel index whenever the project changes or drawer opens
	useEffect(() => {
		setActiveImage(0);
	}, []);

	const images = project?.images ?? [];
	// Clamp activeImage to valid range in case images array is shorter
	const safeActiveImage = images.length > 0 ? Math.min(activeImage, images.length - 1) : 0;

	return (
		<LazyMotion features={loadFeatures}>
			<Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
				<AnimatePresence>
					{open && project && (
						<Dialog.Portal forceMount>
							{/* Overlay */}
							<Dialog.Overlay asChild>
								<m.div
									className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[4px]"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.2 }}
									onClick={onClose}
								/>
							</Dialog.Overlay>

							{/* Right-side drawer */}
							<Dialog.Content asChild>
								<m.div
									className="fixed top-0 right-0 bottom-0 z-50 flex w-[420px] max-w-full flex-col overflow-x-hidden rounded-tl-2xl rounded-bl-2xl bg-[var(--background)]"
									initial={{ x: '100%' }}
									animate={{ x: 0 }}
									exit={{ x: '100%' }}
									transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
								>
									<Dialog.Title className="sr-only">{project.title}</Dialog.Title>

									{/* Close button */}
									<Dialog.Close asChild>
										<button
											type="button"
											className="absolute top-4 right-4 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] bg-[var(--muted-bg)] text-[var(--text-muted)] transition-opacity duration-150 hover:opacity-60"
											aria-label="Close"
										>
											<HugeiconsIcon icon={Cancel01Icon} size={12} />
										</button>
									</Dialog.Close>

									{/* Scrollable content area */}
									<div className="flex-1 overflow-y-auto">
										{/* Image carousel */}
										{images.length > 0 && (
											<div className="relative aspect-video w-full shrink-0 overflow-hidden bg-[var(--muted-bg)]">
												<AnimatePresence mode="wait" initial={false}>
													<m.div
														key={`${project.slug}-${safeActiveImage}`}
														initial={{ opacity: 0 }}
														animate={{ opacity: 1 }}
														exit={{ opacity: 0 }}
														transition={{ duration: 0.2 }}
														className="absolute inset-0"
													>
														<CarouselImage
															src={images[safeActiveImage]}
															alt={`${project.title} screenshot ${safeActiveImage + 1}`}
														/>
													</m.div>
												</AnimatePresence>

												{/* Dot indicators */}
												{images.length > 1 && (
													<div className="absolute bottom-3 left-1/2 z-[2] flex -translate-x-1/2 items-center gap-1.5">
														{images.map((_, i) => (
															<button
																type="button"
																// biome-ignore lint/suspicious/noArrayIndexKey: static array, order never changes
																key={i}
																onClick={() => setActiveImage(i)}
																className="h-1.5 cursor-pointer rounded-full p-0 transition-all duration-200"
																// biome-ignore lint/nursery/noInlineStyles: dynamic dot indicator width and color based on active state
																style={{
																	width: i === safeActiveImage ? '16px' : '6px',
																	background:
																		i === safeActiveImage ? '#fff' : 'rgba(255,255,255,0.45)',
																}}
																aria-label={`Image ${i + 1}`}
															/>
														))}
													</div>
												)}
											</div>
										)}

										{/* Content */}
										<div className="flex-1 p-6">
											{/* Type row */}
											<div className="mb-2.5 flex items-center gap-1.5">
												<span className="rounded-full bg-[var(--muted-bg)] px-2 py-[2px] text-[10px] text-[var(--text-muted)] tracking-[0.02em]">
													{TYPE_LABELS[project.type] ?? project.type}
												</span>
												{project.folder && project.folder !== 'Projects' && (
													<span className="rounded-full bg-[var(--muted-bg)] px-2 py-[2px] text-[10px] text-[var(--text-muted)] tracking-[0.02em]">
														{project.folder}
													</span>
												)}
											</div>

											{/* Title + action links */}
											<div className="mb-3 flex items-start justify-between gap-3">
												<h2 className="m-0 font-semibold text-[22px] text-[var(--text-primary)] leading-[1.2] tracking-[-0.03em]">
													{project.title}
												</h2>

												<div className="flex shrink-0 items-center gap-2 pt-[2px]">
													{images.length > 1 && (
														<div className="flex gap-1">
															<button
																type="button"
																onClick={() => setActiveImage((i) => Math.max(0, i - 1))}
																disabled={safeActiveImage === 0}
																className={`flex h-8 w-8 items-center justify-center rounded-[6px] bg-[var(--muted-bg)] text-[var(--text-secondary)] transition-opacity duration-150 ${safeActiveImage === 0 ? 'cursor-default opacity-[0.35]' : 'cursor-pointer'}`}
																aria-label="Previous image"
															>
																<HugeiconsIcon icon={ArrowLeft01Icon} size={13} />
															</button>
															<button
																type="button"
																onClick={() =>
																	setActiveImage((i) => Math.min(images.length - 1, i + 1))
																}
																disabled={safeActiveImage === images.length - 1}
																className={`flex h-8 w-8 items-center justify-center rounded-[6px] bg-[var(--muted-bg)] text-[var(--text-secondary)] transition-opacity duration-150 ${safeActiveImage === images.length - 1 ? 'cursor-default opacity-[0.35]' : 'cursor-pointer'}`}
																aria-label="Next image"
															>
																<HugeiconsIcon icon={ArrowRight01Icon} size={13} />
															</button>
														</div>
													)}
													{project.github && (
														<a
															href={project.github}
															target="_blank"
															rel="noopener noreferrer"
															className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[var(--muted-bg)] text-[var(--text-secondary)] transition-opacity duration-150 hover:opacity-65"
															title="View source"
														>
															<HugeiconsIcon icon={GithubIcon} size={15} />
														</a>
													)}
													{project.url && (
														<RaisedButton asChild variant="default" size="sm" className="gap-1.5">
															<a href={project.url} target="_blank" rel="noopener noreferrer">
																Visit
																<HugeiconsIcon icon={CircleArrowUpRight02Icon} size={11} />
															</a>
														</RaisedButton>
													)}
												</div>
											</div>

											{/* Description */}
											<p className="m-0 mb-6 text-[13px] text-[var(--text-muted)] leading-[1.65]">
												{project.description}
											</p>

											{/* Tags */}
											{project.tags.length > 0 && (
												<div>
													<div className="mb-2.5 font-medium text-[10px] text-[var(--text-ghost)] uppercase tracking-[0.07em]">
														Tags
													</div>
													<div className="flex flex-wrap gap-1.5">
														{project.tags.map((tag) => {
															const iconUrl = getTechIconUrl(tag);
															return (
																<span
																	key={tag}
																	className="inline-flex items-center gap-[5px] rounded-full bg-[var(--muted-bg)] px-[9px] py-1 text-[11px] text-[var(--text-secondary)] tracking-[0.01em]"
																>
																	{iconUrl && (
																		<img
																			src={iconUrl}
																			alt=""
																			width={12}
																			height={12}
																			className="inline-block shrink-0"
																			onError={(e) => {
																				(e.currentTarget as HTMLImageElement).style.display =
																					'none';
																			}}
																		/>
																	)}
																	{tag}
																</span>
															);
														})}
													</div>
												</div>
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
