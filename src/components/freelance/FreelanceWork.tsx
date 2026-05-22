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

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { buttonVariants } from '@/components/ui/raised-button';
import { type FreelanceProject, pastWork } from '@/data/freelance';

// domMax (not the shared domAnimation bundle) — the layoutId zoom from the
// in-sheet image to the fullscreen lightbox needs the layout feature.
const loadFeatures = () => import('motion/react').then((mod) => mod.domMax);

const PANEL_WIDTH = 580;

// Shared layout id + timing for the seamless image → lightbox morph.
const IMG_LAYOUT_ID = 'freelance-detail-image';
const IMG_MORPH = { duration: 0.42, ease: [0.19, 1, 0.22, 1] as const };

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
	const [hovering, setHovering] = useState(false);
	// Which half of the lightbox image the cursor is over → which arrow shows.
	const [side, setSide] = useState<'left' | 'right'>('right');

	const total = project.images.length;
	const go = useCallback(
		(dir: 1 | -1) => setActiveImage((i) => (i + dir + total) % total),
		[total]
	);

	// Reset to the first shot (and close the lightbox) whenever the project changes.
	useEffect(() => {
		setActiveImage(0);
		setLightboxOpen(false);
		setSide('right');
	}, [project.slug]);

	// Auto-cycle the project's shots — paused while hovering or in the lightbox.
	useEffect(() => {
		if (hovering || lightboxOpen || total <= 1) return;
		const id = setInterval(() => setActiveImage((i) => (i + 1) % total), 3200);
		return () => clearInterval(id);
	}, [hovering, lightboxOpen, total]);

	// Keyboard nav while the lightbox is open.
	useEffect(() => {
		if (!lightboxOpen) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setLightboxOpen(false);
			else if (e.key === 'ArrowLeft') go(-1);
			else if (e.key === 'ArrowRight') go(1);
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [lightboxOpen, go]);

	const handleLightboxMove = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		setSide(e.clientX - rect.left < rect.width / 2 ? 'left' : 'right');
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
				{/* Right: visit + close */}
				<div className="flex shrink-0 items-center gap-1.5">
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

			{/* Image — auto-cycles; click to open the lightbox. No buttons. */}
			{total > 0 && (
				<button
					type="button"
					onMouseEnter={() => setHovering(true)}
					onMouseLeave={() => setHovering(false)}
					onClick={() => setLightboxOpen(true)}
					aria-label="Open image fullscreen"
					className="mx-5 block shrink-0 cursor-zoom-in select-none border-none bg-transparent p-0"
				>
					<m.div
						layoutId={IMG_LAYOUT_ID}
						transition={IMG_MORPH}
						className="relative aspect-video w-full overflow-hidden rounded-xl bg-[var(--muted-bg)]"
					>
						<AnimatePresence initial={false}>
							<m.img
								key={activeImage}
								src={project.images[activeImage]}
								alt={project.name}
								className="absolute inset-0 block h-full w-full object-cover"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.5, ease: 'easeInOut' }}
								draggable={false}
							/>
						</AnimatePresence>
						{total > 1 && (
							<div className="pointer-events-none absolute right-3 bottom-2.5 rounded-full bg-black/35 px-2 py-0.5 text-[10px] text-white/85 tabular-nums backdrop-blur-sm">
								{activeImage + 1} / {total}
							</div>
						)}
					</m.div>
				</button>
			)}

			{/* Lightbox — same layoutId so the sheet image zooms seamlessly to full.
			    Hover a half to reveal its arrow, click that half to move. Click the
			    backdrop (or Esc) to close. No buttons. */}
			{typeof document !== 'undefined' &&
				createPortal(
					<AnimatePresence>
						{lightboxOpen && (
							<m.div
								key="freelance-lightbox"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
								onClick={() => setLightboxOpen(false)}
								className="fixed inset-0 z-[9999] flex items-center justify-center bg-[color-mix(in_srgb,var(--background)_55%,transparent)] p-6 backdrop-blur-[16px]"
							>
								<m.div
									layoutId={IMG_LAYOUT_ID}
									transition={IMG_MORPH}
									onMouseMove={handleLightboxMove}
									onClick={(e) => {
										e.stopPropagation();
										go(side === 'left' ? -1 : 1);
									}}
									className={`relative aspect-video max-h-[88vh] w-[min(92vw,1280px)] overflow-hidden rounded-xl bg-[var(--muted-bg)] shadow-2xl ${
										side === 'left' ? 'cursor-w-resize' : 'cursor-e-resize'
									}`}
								>
									<img
										src={project.images[activeImage]}
										alt={project.name}
										className="absolute inset-0 block h-full w-full object-cover"
										draggable={false}
									/>

									{total > 1 && (
										<>
											<div
												className={`pointer-events-none absolute inset-y-0 left-0 flex w-1/2 items-center justify-start pl-4 transition-opacity duration-200 ${
													side === 'left' ? 'opacity-100' : 'opacity-0'
												}`}
											>
												<span className="flex h-11 w-11 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--background)_70%,transparent)] text-[var(--text-primary)] backdrop-blur-sm">
													<HugeiconsIcon icon={ArrowLeft02Icon} size={18} color="currentColor" />
												</span>
											</div>
											<div
												className={`pointer-events-none absolute inset-y-0 right-0 flex w-1/2 items-center justify-end pr-4 transition-opacity duration-200 ${
													side === 'right' ? 'opacity-100' : 'opacity-0'
												}`}
											>
												<span className="flex h-11 w-11 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--background)_70%,transparent)] text-[var(--text-primary)] backdrop-blur-sm">
													<HugeiconsIcon icon={ArrowRight02Icon} size={18} color="currentColor" />
												</span>
											</div>
											<div className="pointer-events-none absolute right-5 bottom-4 text-[11px] text-white/75 tabular-nums drop-shadow">
												{activeImage + 1} / {total}
											</div>
										</>
									)}
								</m.div>
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
	// Track whether the panel has ever been opened so the reset animation
	// only runs when actually closing a panel, not on every initial mount.
	const hadSelectedRef = useRef(false);

	// Sync URL with selected project
	useEffect(() => {
		if (selected) {
			history.pushState({}, '', `/freelance/${selected.slug}`);
		} else {
			// replaceState avoids adding a duplicate /freelance history entry on mount
			history.replaceState({}, '', '/freelance');
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
			hadSelectedRef.current = true;
			el.style.transition = TRANSITION;
			const currentLeft = (window.innerWidth - Math.min(window.innerWidth, CONTENT_MAX_WIDTH)) / 2;
			const panelLeft = window.innerWidth - PANEL_WIDTH;
			el.style.marginLeft = `${currentLeft}px`;
			el.style.marginRight = '0px';
			el.style.maxWidth = `${panelLeft - currentLeft}px`;
		} else if (!selected && hadSelectedRef.current) {
			// Only animate back when actually closing a panel — not on initial mount
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
				hadSelectedRef.current = false;
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
