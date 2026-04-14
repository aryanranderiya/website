'use client';

import {
	ArrowLeft01Icon,
	ArrowRight01Icon,
	Cancel01Icon,
	GithubIcon,
	HugeiconsIcon,
	ImageNotFound01Icon,
	LinkSquare02Icon,
} from '@icons';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { RaisedButton } from '@/components/ui/raised-button';
import { getTechIconUrl } from '../../utils/techIcons';

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
				<div className="absolute inset-0 bg-[var(--muted-bg)] flex items-center justify-center">
					{errored ? (
						<HugeiconsIcon icon={ImageNotFound01Icon} size={20} color="var(--text-ghost)" />
					) : (
						<div className="w-6 h-6 rounded-full border-2 border-[var(--border)] border-t-[var(--text-ghost)] animate-spin" />
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
					className="w-full h-full object-cover block transition-opacity duration-200"
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
		<Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
			<AnimatePresence>
				{open && project && (
					<Dialog.Portal forceMount>
						{/* Overlay */}
						<Dialog.Overlay asChild>
							<motion.div
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
							<motion.div
								className="fixed top-0 right-0 bottom-0 z-50 flex flex-col w-[420px] max-w-full bg-[var(--background)] rounded-tl-2xl rounded-bl-2xl overflow-x-hidden"
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
										className="absolute top-4 right-4 z-10 w-7 h-7 rounded-[6px] bg-[var(--muted-bg)] text-[var(--text-muted)] cursor-pointer flex items-center justify-center transition-opacity duration-150 hover:opacity-60"
										aria-label="Close"
									>
										<HugeiconsIcon icon={Cancel01Icon} size={12} />
									</button>
								</Dialog.Close>

								{/* Scrollable content area */}
								<div className="overflow-y-auto flex-1">
									{/* Image carousel */}
									{images.length > 0 && (
										<div className="relative w-full aspect-video bg-[var(--muted-bg)] overflow-hidden shrink-0">
											<AnimatePresence mode="wait" initial={false}>
												<motion.div
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
												</motion.div>
											</AnimatePresence>

											{/* Dot indicators */}
											{images.length > 1 && (
												<div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 items-center z-[2]">
													{images.map((_, i) => (
														<button
															type="button"
															// biome-ignore lint/suspicious/noArrayIndexKey: static array, order never changes
															key={i}
															onClick={() => setActiveImage(i)}
															className="h-1.5 rounded-full cursor-pointer p-0 transition-all duration-200"
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
									<div className="p-6 flex-1">
										{/* Status + type row */}
										<div className="flex items-center gap-1.5 mb-2.5">
											{project.status === 'in-progress' && (
												<span className="text-[10px] px-2 py-[2px] rounded-full bg-[rgba(0,187,255,0.1)] text-[#00bbff] font-medium tracking-[0.02em]">
													In Progress
												</span>
											)}
											<span className="text-[10px] px-2 py-[2px] rounded-full bg-[var(--muted-bg)] text-[var(--text-muted)] tracking-[0.02em]">
												{TYPE_LABELS[project.type] ?? project.type}
											</span>
											{project.folder && project.folder !== 'Projects' && (
												<span className="text-[10px] px-2 py-[2px] rounded-full bg-[var(--muted-bg)] text-[var(--text-muted)] tracking-[0.02em]">
													{project.folder}
												</span>
											)}
										</div>

										{/* Title + action links */}
										<div className="flex items-start justify-between gap-3 mb-3">
											<h2 className="text-[22px] font-semibold tracking-[-0.03em] text-[var(--text-primary)] leading-[1.2] m-0">
												{project.title}
											</h2>

											<div className="flex items-center gap-2 shrink-0 pt-[2px]">
												{images.length > 1 && (
													<div className="flex gap-1">
														<button
															type="button"
															onClick={() => setActiveImage((i) => Math.max(0, i - 1))}
															disabled={safeActiveImage === 0}
															className={`w-8 h-8 rounded-[6px] bg-[var(--muted-bg)] flex items-center justify-center text-[var(--text-secondary)] transition-opacity duration-150 ${safeActiveImage === 0 ? 'opacity-[0.35] cursor-default' : 'cursor-pointer'}`}
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
															className={`w-8 h-8 rounded-[6px] bg-[var(--muted-bg)] flex items-center justify-center text-[var(--text-secondary)] transition-opacity duration-150 ${safeActiveImage === images.length - 1 ? 'opacity-[0.35] cursor-default' : 'cursor-pointer'}`}
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
														className="w-8 h-8 rounded-[6px] flex items-center justify-center bg-[var(--muted-bg)] text-[var(--text-secondary)] transition-opacity duration-150 hover:opacity-65"
														title="View source"
													>
														<HugeiconsIcon icon={GithubIcon} size={15} />
													</a>
												)}
												{project.url && (
													<RaisedButton asChild variant="accent" size="sm" className="gap-1.5">
														<a href={project.url} target="_blank" rel="noopener noreferrer">
															Visit
															<HugeiconsIcon icon={LinkSquare02Icon} size={11} />
														</a>
													</RaisedButton>
												)}
											</div>
										</div>

										{/* Description */}
										<p className="text-[13px] text-[var(--text-muted)] leading-[1.65] mb-6 m-0">
											{project.description}
										</p>

										{/* Tags */}
										{project.tags.length > 0 && (
											<div>
												<div className="text-[10px] font-medium tracking-[0.07em] uppercase text-[var(--text-ghost)] mb-2.5">
													Tags
												</div>
												<div className="flex flex-wrap gap-1.5">
													{project.tags.map((tag) => {
														const iconUrl = getTechIconUrl(tag);
														return (
															<span
																key={tag}
																className="inline-flex items-center gap-[5px] text-[11px] px-[9px] py-1 rounded-full bg-[var(--muted-bg)] text-[var(--text-secondary)] tracking-[0.01em]"
															>
																{iconUrl && (
																	<img
																		src={iconUrl}
																		alt=""
																		width={12}
																		height={12}
																		className="inline-block shrink-0"
																		onError={(e) => {
																			(e.currentTarget as HTMLImageElement).style.display = 'none';
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
							</motion.div>
						</Dialog.Content>
					</Dialog.Portal>
				)}
			</AnimatePresence>
		</Dialog.Root>
	);
}
