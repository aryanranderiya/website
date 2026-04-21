'use client';

import { Cancel01Icon, CircleArrowUpRight02Icon, GithubIcon, HugeiconsIcon } from '@icons';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { useState } from 'react';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

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
	url?: string;
	github?: string;
	body?: string;
}

export default function ProjectModal({
	project,
	open,
	onClose,
}: {
	project: Project | null;
	open: boolean;
	onClose: () => void;
}) {
	const [activeImage, setActiveImage] = useState(0);

	if (!project) return null;

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
									onClick={onClose}
								/>
							</Dialog.Overlay>

							<Dialog.Content asChild>
								<m.div
									className="fixed top-1/2 left-1/2 z-50 max-h-[85vh] w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-hidden overflow-y-auto rounded-2xl bg-[var(--card)]"
									initial={{ opacity: 0, scale: 0.95, y: 12 }}
									animate={{ opacity: 1, scale: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.95, y: 12 }}
									transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
								>
									<Dialog.Title className="sr-only">{project.title}</Dialog.Title>

									{/* Close */}
									<Dialog.Close asChild>
										<button
											type="button"
											className="absolute top-4 right-4 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)] transition-opacity hover:opacity-70"
											aria-label="Close"
										>
											<HugeiconsIcon icon={Cancel01Icon} size={14} color="currentColor" />
										</button>
									</Dialog.Close>

									{/* Image gallery */}
									{project.images && project.images.length > 0 && (
										<div className="relative aspect-video overflow-hidden bg-[var(--muted)]">
											<img
												src={project.images[activeImage]}
												alt={project.title}
												className="h-full w-full object-cover"
											/>
											{project.images.length > 1 && (
												<div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
													{project.images.map((_, i) => (
														<button
															type="button"
															// biome-ignore lint/suspicious/noArrayIndexKey: static array, order never changes
															key={i}
															onClick={() => setActiveImage(i)}
															className="h-1.5 w-1.5 cursor-pointer rounded-full p-0 transition-all"
															// biome-ignore lint/nursery/noInlineStyles: dynamic dot indicator color and scale based on active state
															style={{
																background: i === activeImage ? '#00bbff' : 'rgba(255,255,255,0.5)',
																transform: i === activeImage ? 'scale(1.2)' : 'scale(1)',
															}}
														/>
													))}
												</div>
											)}
										</div>
									)}

									{/* Content */}
									<div className="p-6">
										<div className="mb-4 flex items-start justify-between gap-4">
											<div>
												<div className="mb-1 flex items-center gap-2">
													<span className="rounded-full bg-[var(--muted-bg)] px-2 py-0.5 text-[var(--muted-foreground)] text-xs capitalize">
														{project.type}
													</span>
												</div>
												<h2 className="m-0 font-bold text-2xl text-[var(--foreground)] tracking-[-0.03em]">
													{project.title}
												</h2>
											</div>

											<div className="flex flex-shrink-0 items-center gap-2">
												{project.github && (
													<a
														href={project.github}
														target="_blank"
														rel="noopener noreferrer"
														className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--muted-bg)] text-[var(--foreground)] transition-opacity hover:opacity-70"
													>
														<HugeiconsIcon icon={GithubIcon} size={16} color="currentColor" />
													</a>
												)}
												{project.url && (
													<a
														href={project.url}
														target="_blank"
														rel="noopener noreferrer"
														className="flex items-center gap-2 rounded-lg bg-[#00bbff] px-3 py-2 font-medium text-black text-sm shadow-[0_2px_8px_rgba(0,187,255,0.2)] transition-all active:scale-[0.97]"
													>
														Visit
														<HugeiconsIcon
															icon={CircleArrowUpRight02Icon}
															size={12}
															color="currentColor"
														/>
													</a>
												)}
											</div>
										</div>

										<p className="mb-6 text-[var(--muted-foreground)] text-sm leading-relaxed">
											{project.description}
										</p>

										{/* Tech stack */}
										<div className="mb-6">
											<div className="mb-2 font-semibold text-[var(--muted-foreground)] text-xs uppercase tracking-widest">
												Tech Stack
											</div>
											<div className="flex flex-wrap gap-2">
												{project.tech.map((t) => (
													<span
														key={t}
														className="rounded-full bg-[var(--muted)] px-2.5 py-1 text-[var(--foreground)] text-xs"
													>
														{t}
													</span>
												))}
											</div>
										</div>

										{/* Tags */}
										{project.tags.length > 0 && (
											<div className="flex flex-wrap gap-1.5">
												{project.tags.map((tag) => (
													<span
														key={tag}
														className="rounded-full bg-[rgba(0,187,255,0.1)] px-2 py-0.5 text-[#00bbff] text-xs"
													>
														#{tag}
													</span>
												))}
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
