'use client';

import { Cancel01Icon, GithubIcon, HugeiconsIcon, LinkSquare02Icon } from '@icons';
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
									className="fixed left-1/2 top-1/2 z-50 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-2xl overflow-hidden bg-[var(--card)] max-h-[85vh] overflow-y-auto"
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
											className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70 bg-[var(--muted)] text-[var(--muted-foreground)] cursor-pointer"
											aria-label="Close"
										>
											<HugeiconsIcon icon={Cancel01Icon} size={14} color="currentColor" />
										</button>
									</Dialog.Close>

									{/* Image gallery */}
									{project.images && project.images.length > 0 && (
										<div className="aspect-video bg-[var(--muted)] relative overflow-hidden">
											<img
												src={project.images[activeImage]}
												alt={project.title}
												className="w-full h-full object-cover"
											/>
											{project.images.length > 1 && (
												<div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
													{project.images.map((_, i) => (
														<button
															type="button"
															// biome-ignore lint/suspicious/noArrayIndexKey: static array, order never changes
															key={i}
															onClick={() => setActiveImage(i)}
															className="w-1.5 h-1.5 rounded-full transition-all cursor-pointer p-0"
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
										<div className="flex items-start justify-between gap-4 mb-4">
											<div>
												<div className="flex items-center gap-2 mb-1">
													{project.status === 'in-progress' && (
														<span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(0,187,255,0.1)] text-[#00bbff]">
															In Progress
														</span>
													)}
													<span className="text-xs px-2 py-0.5 rounded-full capitalize text-[var(--muted-foreground)] bg-[var(--muted-bg)]">
														{project.type}
													</span>
												</div>
												<h2 className="text-2xl font-bold tracking-[-0.03em] text-[var(--foreground)] m-0">
													{project.title}
												</h2>
											</div>

											<div className="flex items-center gap-2 flex-shrink-0">
												{project.github && (
													<a
														href={project.github}
														target="_blank"
														rel="noopener noreferrer"
														className="w-9 h-9 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70 text-[var(--foreground)] bg-[var(--muted-bg)]"
													>
														<HugeiconsIcon icon={GithubIcon} size={16} color="currentColor" />
													</a>
												)}
												{project.url && (
													<a
														href={project.url}
														target="_blank"
														rel="noopener noreferrer"
														className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.97] bg-[#00bbff] text-black shadow-[0_2px_8px_rgba(0,187,255,0.2)]"
													>
														Visit
														<HugeiconsIcon icon={LinkSquare02Icon} size={12} color="currentColor" />
													</a>
												)}
											</div>
										</div>

										<p className="text-sm leading-relaxed mb-6 text-[var(--muted-foreground)]">
											{project.description}
										</p>

										{/* Tech stack */}
										<div className="mb-6">
											<div className="text-xs font-semibold mb-2 uppercase tracking-widest text-[var(--muted-foreground)]">
												Tech Stack
											</div>
											<div className="flex flex-wrap gap-2">
												{project.tech.map((t) => (
													<span
														key={t}
														className="text-xs px-2.5 py-1 rounded-full text-[var(--foreground)] bg-[var(--muted)]"
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
														className="text-xs px-2 py-0.5 rounded-full bg-[rgba(0,187,255,0.1)] text-[#00bbff]"
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
