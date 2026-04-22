'use client';

import {
	ArrowLeft02Icon,
	ArrowRight02Icon,
	Cancel01Icon,
	CircleArrowUpRight02Icon,
	HugeiconsIcon,
} from '@icons';
import { AnimatePresence, LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { buttonVariants } from '@/components/ui/raised-button';
import { type FreelanceProject, pastWork } from '@/data/freelance';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

const PANEL_WIDTH = 580;

const DEVICON_MAP: Record<string, string> = {
	React: 'react',
	TypeScript: 'typescript',
	TailwindCSS: 'tailwindcss',
	'Next.js': 'nextjs',
	'Node.js': 'nodejs',
	MongoDB: 'mongodb',
	Redis: 'redis',
	Express: 'express',
	PostgreSQL: 'postgresql',
	Python: 'python',
	FastAPI: 'fastapi',
	Figma: 'figma',
};

function DeviconImg({ slug, size = 12 }: { slug: string; size?: number }) {
	return (
		<img
			src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-original.svg`}
			alt=""
			width={size}
			height={size}
			className="inline-block shrink-0"
			onError={(e) => {
				(e.currentTarget as HTMLImageElement).style.display = 'none';
			}}
		/>
	);
}

function ProjectDetail({
	project,
	onClose,
	onPrev,
	onNext,
	hasPrev,
	hasNext,
}: {
	project: FreelanceProject;
	onClose: () => void;
	onPrev: () => void;
	onNext: () => void;
	hasPrev: boolean;
	hasNext: boolean;
}) {
	const [activeImage, setActiveImage] = useState(0);
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const wheelAccumRef = useRef(0);
	const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const total = project.images.length;
	const prevImg = () => setActiveImage((i) => Math.max(0, i - 1));
	const nextImg = () => setActiveImage((i) => Math.min(total - 1, i + 1));

	// Reset image index and close lightbox when project changes
	useEffect(() => {
		setActiveImage(0);
		setLightboxOpen(false);
	}, []);

	// Keyboard nav for lightbox
	useEffect(() => {
		if (!lightboxOpen) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setLightboxOpen(false);
			if (e.key === 'ArrowLeft') setActiveImage((i) => Math.max(0, i - 1));
			if (e.key === 'ArrowRight') setActiveImage((i) => Math.min(total - 1, i + 1));
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [lightboxOpen, total]);

	const handleWheel = (e: React.WheelEvent) => {
		const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
		wheelAccumRef.current += delta;
		if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
		wheelTimerRef.current = setTimeout(() => {
			wheelAccumRef.current = 0;
		}, 200);
		if (wheelAccumRef.current > 60) {
			wheelAccumRef.current = 0;
			nextImg();
		} else if (wheelAccumRef.current < -60) {
			wheelAccumRef.current = 0;
			prevImg();
		}
	};

	const NavBtn = ({
		onClick,
		disabled,
		icon,
		label,
	}: {
		onClick: () => void;
		disabled: boolean;
		icon: typeof ArrowLeft02Icon;
		label: string;
	}) => (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border-none bg-[var(--muted-bg)] transition-opacity duration-150 hover:opacity-60 disabled:opacity-25"
			aria-label={label}
		>
			<HugeiconsIcon icon={icon} size={11} color="var(--text-muted)" />
		</button>
	);

	return (
		<m.div
			key={project.name}
			className="flex h-full w-full flex-col overflow-y-auto bg-[var(--background)]"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.18 }}
		>
			{/* Header */}
			<div className="flex shrink-0 items-center justify-between gap-3 px-6 pt-5 pb-4">
				{/* Left: type + project nav */}
				<div className="flex min-w-0 items-center gap-2">
					<NavBtn
						onClick={onPrev}
						disabled={!hasPrev}
						icon={ArrowLeft02Icon}
						label="Previous project"
					/>
					<span className="truncate rounded-full bg-[var(--muted-bg)] px-2 py-[3px] text-[11px] text-[var(--text-muted)] tracking-[0.02em]">
						{project.type}
					</span>
					<NavBtn
						onClick={onNext}
						disabled={!hasNext}
						icon={ArrowRight02Icon}
						label="Next project"
					/>
				</div>
				{/* Right: image nav + visit + close */}
				<div className="flex shrink-0 items-center gap-1.5">
					{total > 1 && (
						<>
							<NavBtn
								onClick={prevImg}
								disabled={activeImage === 0}
								icon={ArrowLeft02Icon}
								label="Previous image"
							/>
							<span className="w-[28px] text-center text-[10px] text-[var(--text-ghost)] tabular-nums">
								{activeImage + 1}/{total}
							</span>
							<NavBtn
								onClick={nextImg}
								disabled={activeImage === total - 1}
								icon={ArrowRight02Icon}
								label="Next image"
							/>
						</>
					)}
					{project.url && (
						<a
							href={project.url}
							target="_blank"
							rel="noopener noreferrer"
							className={`${buttonVariants({ variant: 'default', size: 'sm' })} ml-1 shrink-0 gap-[5px] no-underline`}
						>
							Visit
							<HugeiconsIcon icon={CircleArrowUpRight02Icon} size={10} color="currentColor" />
						</a>
					)}
					<button
						type="button"
						onClick={onClose}
						className="ml-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border-none bg-[var(--muted-bg)] text-[var(--text-muted)] transition-opacity duration-150 hover:opacity-60"
						aria-label="Close"
					>
						<HugeiconsIcon icon={Cancel01Icon} size={11} color="currentColor" />
					</button>
				</div>
			</div>

			{/* Image carousel -- no overlaid buttons, just dots */}
			{total > 0 && (
				<button
					type="button"
					className="relative mx-5 aspect-video shrink-0 cursor-pointer select-none overflow-hidden rounded-xl bg-[var(--muted-bg)]"
					onWheel={handleWheel}
					onClick={() => setLightboxOpen(true)}
				>
					<AnimatePresence mode="wait" initial={false}>
						<m.img
							key={activeImage}
							src={project.images[activeImage]}
							alt={project.name}
							className="absolute inset-0 block h-full w-full object-cover"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.15 }}
						/>
					</AnimatePresence>
				</button>
			)}

			{/* Lightbox */}
			{typeof document !== 'undefined' &&
				createPortal(
					<AnimatePresence>
						{lightboxOpen && (
							<m.div
								key="freelance-lightbox"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
								onClick={() => setLightboxOpen(false)}
								className="fixed inset-0 z-[9999] flex items-center justify-center bg-[color-mix(in_srgb,var(--background)_60%,transparent)]"
							>
								<m.img
									key={activeImage}
									src={project.images[activeImage]}
									alt={project.name}
									initial={{ scale: 0.94, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									exit={{ scale: 0.94, opacity: 0 }}
									transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
									onClick={(e) => e.stopPropagation()}
									className="block max-h-[90vh] max-w-[90vw] rounded-[6px] object-contain"
									draggable={false}
								/>
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										setLightboxOpen(false);
									}}
									aria-label="Close"
									className="absolute top-4 right-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--foreground)_10%,transparent)] text-[var(--foreground)]"
								>
									<HugeiconsIcon icon={Cancel01Icon} size={16} color="currentColor" />
								</button>
								{total > 1 && (
									<>
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												setActiveImage((i) => Math.max(0, i - 1));
											}}
											disabled={activeImage === 0}
											aria-label="Previous"
											className="absolute top-1/2 left-4 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--foreground)_10%,transparent)] text-[var(--foreground)] disabled:opacity-25"
										>
											<HugeiconsIcon icon={ArrowLeft02Icon} size={16} color="currentColor" />
										</button>
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												setActiveImage((i) => Math.min(total - 1, i + 1));
											}}
											disabled={activeImage === total - 1}
											aria-label="Next"
											className="absolute top-1/2 right-4 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--foreground)_10%,transparent)] text-[var(--foreground)] disabled:opacity-25"
										>
											<HugeiconsIcon icon={ArrowRight02Icon} size={16} color="currentColor" />
										</button>
										<div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 text-[12px] text-[color-mix(in_srgb,var(--foreground)_45%,transparent)] tracking-[0.04em]">
											{activeImage + 1} / {total}
										</div>
									</>
								)}
							</m.div>
						)}
					</AnimatePresence>,
					document.body
				)}

			{/* Content */}
			<div className="flex flex-col gap-5 px-6 py-5">
				{/* Title */}
				<div>
					<h2 className="font-semibold text-[22px] text-[var(--text-primary)] leading-[1.2] tracking-[-0.03em]">
						{project.name}
					</h2>
				</div>

				{/* Description */}
				<p className="text-[13px] text-[var(--text-muted)] leading-[1.65]">{project.description}</p>

				{/* Tech stack */}
				{project.tech.length > 0 && (
					<div>
						<div className="mb-2 font-medium text-[10px] text-[var(--text-ghost)] uppercase tracking-[0.07em]">
							Tech Stack
						</div>
						<div className="flex flex-wrap gap-[6px]">
							{project.tech.map((t) => {
								const slug = DEVICON_MAP[t];
								return (
									<span
										key={t}
										className="inline-flex items-center gap-[5px] rounded-full bg-[var(--muted-bg)] px-[9px] py-1 text-[11px] text-[var(--text-secondary)]"
									>
										{slug && <DeviconImg slug={slug} size={12} />}
										{t}
									</span>
								);
							})}
						</div>
					</div>
				)}

				{/* Testimonial */}
				{project.testimonial && (
					<div>
						<div className="mb-2 font-medium text-[10px] text-[var(--text-ghost)] uppercase tracking-[0.07em]">
							Testimonial
						</div>
						<div className="rounded-xl bg-[var(--muted-bg)] p-4">
							<p className="mb-2 text-[13px] text-[var(--text-secondary)] italic leading-[1.6]">
								"{project.testimonial.quote}"
							</p>
							<span className="font-semibold text-[12px] text-[var(--text-primary)]">
								{project.testimonial.author}
							</span>
							<span className="ml-[6px] text-[11px] text-[var(--text-ghost)]">
								{project.testimonial.role}
							</span>
						</div>
					</div>
				)}
			</div>
		</m.div>
	);
}

export default function FreelanceWork({ initialSlug }: { initialSlug?: string }) {
	const [selected, setSelected] = useState<FreelanceProject | null>(() =>
		initialSlug ? (pastWork.find((p) => p.slug === initialSlug) ?? null) : null
	);

	// Sync URL with selected project
	useEffect(() => {
		if (selected) {
			history.pushState({}, '', `/freelance/${selected.slug}`);
		} else {
			history.pushState({}, '', '/freelance');
		}
	}, [selected]);

	// Escape to close
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setSelected(null);
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, []);

	// Collapse content width to fit left of the panel.
	// Only applies on wide viewports where there's room for both content + panel side-by-side.
	// On narrow screens the panel overlays the full screen, so no layout manipulation needed.
	useEffect(() => {
		const el = document.getElementById('page-content');
		if (!el) return;
		const CONTENT_MAX_WIDTH = 640;
		const MIN_VIEWPORT_FOR_SIDE_BY_SIDE = PANEL_WIDTH + 400; // ~980px
		const TRANSITION =
			'max-width 0.35s cubic-bezier(0.19, 1, 0.22, 1), margin-left 0.35s cubic-bezier(0.19, 1, 0.22, 1), margin-right 0.35s cubic-bezier(0.19, 1, 0.22, 1)';

		if (selected && window.innerWidth >= MIN_VIEWPORT_FOR_SIDE_BY_SIDE) {
			el.style.transition = TRANSITION;
			const currentLeft = (window.innerWidth - Math.min(window.innerWidth, CONTENT_MAX_WIDTH)) / 2;
			const panelLeft = window.innerWidth - PANEL_WIDTH;
			el.style.marginLeft = `${currentLeft}px`;
			el.style.marginRight = '0px';
			el.style.maxWidth = `${panelLeft - currentLeft}px`;
		} else if (!selected) {
			el.style.transition = TRANSITION;
			// Animate back to centered px values - can't transition to 'auto'
			const centeredMargin = Math.max(0, (window.innerWidth - CONTENT_MAX_WIDTH) / 2);
			el.style.marginLeft = `${centeredMargin}px`;
			el.style.marginRight = `${centeredMargin}px`;
			el.style.maxWidth = `${CONTENT_MAX_WIDTH}px`;
			// After transition, hand back to CSS
			const t = setTimeout(() => {
				el.style.marginLeft = '';
				el.style.marginRight = '';
				el.style.maxWidth = '';
				el.style.transition = '';
			}, 400);
			return () => clearTimeout(t);
		}
		// On narrow viewports with selected: leave layout alone, panel overlays content
	}, [selected]);

	const handleSelect = (project: FreelanceProject) => {
		setSelected((prev) => (prev?.name === project.name ? null : project));
	};

	const selectedIdx = selected ? pastWork.findIndex((p) => p.name === selected.name) : -1;
	const handlePrevProject = () => {
		if (selectedIdx > 0) setSelected(pastWork[selectedIdx - 1]);
	};
	const handleNextProject = () => {
		if (selectedIdx < pastWork.length - 1) setSelected(pastWork[selectedIdx + 1]);
	};

	return (
		<LazyMotion features={loadFeatures}>
			{/* Project list -- always full width of its container */}
				<div>
					{pastWork.map((work) => {
						const isActive = selected?.name === work.name;
						return (
							<button
								key={work.name}
								type="button"
								onClick={() => handleSelect(work)}
								className={`-mx-[6px] flex w-[calc(100%+12px)] cursor-pointer items-center justify-between border-none px-[6px] py-[10px] text-left font-[inherit] transition-[background] duration-150 [border-block-end:1px_solid_var(--border)] hover:bg-[var(--muted-bg)] ${isActive ? 'bg-[var(--muted-bg)]' : 'bg-transparent'}`}
							>
								<div className="flex min-w-0 items-center gap-3">
									<span className="truncate whitespace-nowrap font-semibold text-[13px] text-[var(--text-primary)]">
										{work.name}
									</span>
									<span className="shrink-0 whitespace-nowrap text-[12px] text-[var(--text-ghost)]">
										{work.type}
									</span>
								</div>
								<div className="ml-2 flex shrink-0 items-center gap-[5px]">
									{work.tech.slice(0, 2).map((tag) => (
										<span
											key={tag}
											className="whitespace-nowrap rounded-full bg-[var(--muted-bg)] px-[7px] py-[2px] text-[10px] text-[var(--text-muted)]"
										>
											{tag}
										</span>
									))}
									<HugeiconsIcon
										icon={ArrowRight02Icon}
										size={11}
										color={isActive ? 'var(--text-secondary)' : 'var(--text-ghost)'}
										className={`ml-[2px] shrink-0 transition-transform duration-200 ${isActive ? 'rotate-90' : ''}`}
									/>
								</div>
							</button>
						);
					})}
				</div>

				{/* Detail panel -- portalled to body so position:fixed is relative to viewport,
          not to the transformed #page-content ancestor */}
				{typeof document !== 'undefined' &&
					createPortal(
						<AnimatePresence>
							{selected && (
								<m.div
									className="fixed top-0 right-0 z-40 h-screen w-[580px] overflow-hidden"
									initial={{ x: PANEL_WIDTH }}
									animate={{ x: 0 }}
									exit={{ x: PANEL_WIDTH }}
									transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
								>
									<ProjectDetail
										project={selected}
										onClose={() => setSelected(null)}
										onPrev={handlePrevProject}
										onNext={handleNextProject}
										hasPrev={selectedIdx > 0}
										hasNext={selectedIdx < pastWork.length - 1}
									/>
								</m.div>
							)}
						</AnimatePresence>,
						document.body
					)}
		</LazyMotion>
	);
}
