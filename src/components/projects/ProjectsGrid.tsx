'use client';

import {
	ComputerProgrammingIcon,
	ComputerTerminalIcon,
	Delete01Icon,
	FilterIcon,
	GameController03Icon,
	HugeiconsIcon,
	MobileProgramming02Icon,
	Search01Icon,
	WebDesignIcon,
} from '@icons';
import type { IconProps } from '@theexperiencecompany/gaia-icons';
import { AnimatePresence, motion } from 'motion/react';
import type { ComponentType } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAfterPreloader } from '@/hooks/useAfterPreloader';
import { getTechIconUrl } from '../../utils/techIcons';
import ProjectCard from './ProjectCard';

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

interface HoveredState {
	project: Project;
	index: number;
	rect: DOMRect;
}

// Alternating tilt: even rows lean left, odd rows lean right
const ROTATIONS = [-7, 6] as const;

const TYPE_CHIPS: { value: string; label: string; icon?: ComponentType<IconProps> }[] = [
	{ value: 'web', label: 'Web', icon: WebDesignIcon },
	{ value: 'mobile', label: 'Mobile', icon: MobileProgramming02Icon },
	{ value: 'cli', label: 'CLI', icon: ComputerTerminalIcon },
	{ value: 'desktop', label: 'Desktop', icon: ComputerProgrammingIcon },
	{ value: 'game', label: 'Game', icon: GameController03Icon },
	{ value: 'os', label: 'OS', icon: ComputerProgrammingIcon },
	{ value: 'other', label: 'Other' },
];

export default function ProjectsGrid({ projects }: { projects: Project[] }) {
	const [search, setSearch] = useState('');
	const [searchFocused, setSearchFocused] = useState(false);
	const [hovered, setHovered] = useState<HoveredState | null>(null);
	const [activeTagFilters, setActiveTagFilters] = useState<string[]>([]);
	const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);
	const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
	const ready = useAfterPreloader();
	const filterBtnRef = useRef<HTMLButtonElement>(null);
	const popoverRef = useRef<HTMLDivElement>(null);
	const searchRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
				e.preventDefault();
				searchRef.current?.focus();
				searchRef.current?.select();
			}
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, []);

	useEffect(() => {
		if (!tagPopoverOpen) return;
		const handler = (e: MouseEvent) => {
			if (
				popoverRef.current &&
				!popoverRef.current.contains(e.target as Node) &&
				filterBtnRef.current &&
				!filterBtnRef.current.contains(e.target as Node)
			) {
				setTagPopoverOpen(false);
			}
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, [tagPopoverOpen]);

	// Count projects per tag
	const tagCounts = useMemo(() => {
		const counts: Record<string, number> = {};
		projects.forEach((p) => {
			p.tags.forEach((t) => {
				counts[t] = (counts[t] || 0) + 1;
			});
		});
		return counts;
	}, [projects]);

	const sortedTags = useMemo(
		() => Object.entries(tagCounts).sort((a, b) => b[1] - a[1]),
		[tagCounts]
	);

	const filtered = useMemo(() => {
		let list = projects;

		if (activeTypeFilter) {
			list = list.filter((p) => p.type === activeTypeFilter);
		}

		if (activeTagFilters.length > 0) {
			list = list.filter((p) => activeTagFilters.every((t) => p.tags.includes(t)));
		}

		if (search.trim()) {
			const q = search.toLowerCase();
			list = list.filter(
				(p) =>
					p.title.toLowerCase().includes(q) ||
					p.description.toLowerCase().includes(q) ||
					p.tags.some((t) => t.toLowerCase().includes(q))
			);
		}

		return list;
	}, [projects, activeTypeFilter, activeTagFilters, search]);

	// Only show type chips for types that have at least one project
	const availableTypes = useMemo(() => {
		const typeCounts: Record<string, number> = {};
		projects.forEach((p) => {
			typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
		});
		return TYPE_CHIPS.filter((c) => typeCounts[c.value] > 0);
	}, [projects]);

	const handleHoverChange = (data: { project: Project; index: number; el: HTMLElement } | null) => {
		if (!data) {
			setHovered(null);
			return;
		}
		setHovered({ project: data.project, index: data.index, rect: data.el.getBoundingClientRect() });
	};

	const rotation = hovered ? ROTATIONS[hovered.index % 2] : 0;
	const previewTop = hovered ? hovered.rect.top + hovered.rect.height / 2 : 0;

	const toggleTagFilter = (tag: string) => {
		setActiveTagFilters((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
		);
	};

	return (
		<>
			<motion.div
				initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
				animate={ready ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
				transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] as const, delay: 0.12 }}
			>
				{/* Type filter chips */}
				<div className="flex items-center gap-[6px] mb-[16px] flex-wrap">
					<button
						type="button"
						onClick={() => setActiveTypeFilter(null)}
						// biome-ignore lint/nursery/noInlineStyles: dynamic active-state background, color, and fontWeight
						style={{
							padding: '3px 10px',
							borderRadius: '9999px',
							border: 'none',
							background: activeTypeFilter === null ? 'var(--text-primary)' : 'var(--muted-bg)',
							color: activeTypeFilter === null ? 'var(--background)' : 'var(--text-muted)',
							cursor: 'pointer',
							fontSize: '11px',
							fontWeight: activeTypeFilter === null ? 500 : 400,
							letterSpacing: '-0.01em',
							transition: 'all 150ms ease',
						}}
					>
						All
					</button>
					{availableTypes.map((chip) => (
						<button
							type="button"
							key={chip.value}
							onClick={() =>
								setActiveTypeFilter(activeTypeFilter === chip.value ? null : chip.value)
							}
							// biome-ignore lint/nursery/noInlineStyles: dynamic active-state background, color, and fontWeight
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: 5,
								padding: '3px 10px',
								borderRadius: '9999px',
								border: 'none',
								background:
									activeTypeFilter === chip.value ? 'var(--text-primary)' : 'var(--muted-bg)',
								color: activeTypeFilter === chip.value ? 'var(--background)' : 'var(--text-muted)',
								cursor: 'pointer',
								fontSize: '11px',
								fontWeight: activeTypeFilter === chip.value ? 500 : 400,
								letterSpacing: '-0.01em',
								transition: 'all 150ms ease',
							}}
						>
							{chip.icon && <HugeiconsIcon icon={chip.icon} size={11} color="currentColor" />}
							{chip.label}
						</button>
					))}
				</div>

				{/* Filter button + search */}
				<div className="flex items-center gap-2 mb-7 w-full">
					{/* Tag filter button */}
					<div className="relative shrink-0">
						<button
							type="button"
							ref={filterBtnRef}
							onClick={() => setTagPopoverOpen((o) => !o)}
							className={`inline-flex items-center gap-[5px] px-[10px] py-1 rounded-full bg-[var(--muted-bg)] cursor-pointer transition-all duration-150 text-[11px] tracking-[0.01em] leading-[1.45] ${activeTagFilters.length > 0 ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'} ${tagPopoverOpen ? 'opacity-70' : 'opacity-100'}`}
						>
							<HugeiconsIcon icon={FilterIcon} size={11} color="currentColor" />
							<span>
								{activeTagFilters.length > 0
									? `${activeTagFilters.length} filter${activeTagFilters.length > 1 ? 's' : ''}`
									: 'Filter'}
							</span>
						</button>

						{tagPopoverOpen && (
							<div
								ref={popoverRef}
								className="absolute top-[calc(100%+6px)] left-0 z-[100] bg-[var(--background)] rounded-[20px] p-1.5 min-w-[210px] max-h-[300px] overflow-y-auto shadow-[var(--shadow-lg)]"
							>
								<div className="flex items-center justify-between px-2 pb-1.5 pt-1">
									<span className="text-[11px] font-normal text-[var(--text-ghost)] tracking-[-0.01em]">
										Filter by tag
									</span>
									{activeTagFilters.length > 0 && (
										<button
											type="button"
											onClick={() => setActiveTagFilters([])}
											className="inline-flex items-center gap-1 px-1.5 py-[2px] text-[10px] text-[#ef4444] bg-transparent cursor-pointer rounded-[6px] tracking-[0.01em]"
										>
											Clear
											<HugeiconsIcon icon={Delete01Icon} size={11} color="currentColor" />
										</button>
									)}
								</div>
								{sortedTags.map(([tag, count]) => {
									const isOn = activeTagFilters.includes(tag);
									const iconUrl = getTechIconUrl(tag);
									return (
										<button
											type="button"
											key={tag}
											onClick={() => toggleTagFilter(tag)}
											className={`flex items-center w-full px-2 py-[5px] rounded-lg cursor-pointer text-[12px] tracking-[-0.01em] transition-[background] duration-100 gap-[7px] ${isOn ? 'bg-[var(--muted-bg)] text-[var(--text-primary)] font-medium' : 'bg-transparent text-[var(--text-secondary)] font-normal'}`}
										>
											{/* Checkbox */}
											<span
												className={`w-3.5 h-3.5 rounded-[4px] shrink-0 flex items-center justify-center transition-all duration-100 ${isOn ? 'bg-[var(--text-primary)]' : 'bg-[var(--muted-bg)]'}`}
											>
												{isOn && (
													<svg width="9" height="9" viewBox="0 0 12 12" fill="none">
														<title>Checked</title>
														<path
															d="M2.5 6L5 8.5L9.5 3.5"
															stroke="var(--popover)"
															strokeWidth="1.8"
															strokeLinecap="round"
															strokeLinejoin="round"
														/>
													</svg>
												)}
											</span>
											{iconUrl ? (
												<img
													src={iconUrl}
													alt={tag}
													width={13}
													height={13}
													className={`object-contain shrink-0 ${isOn ? 'opacity-100' : 'opacity-70'}`}
												/>
											) : (
												<span className="w-[13px] shrink-0" />
											)}
											<span className="flex-1 text-left">{tag}</span>
											<span className="text-[10px] text-[var(--text-muted)] [font-variant-numeric:tabular-nums]">
												{count}
											</span>
										</button>
									);
								})}
							</div>
						)}
					</div>

					<div className="flex-1" />

					<div className="relative shrink-0">
						<span className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center text-[var(--text-ghost)] pointer-events-none">
							<HugeiconsIcon icon={Search01Icon} size={12} />
						</span>
						<input
							ref={searchRef}
							type="text"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							onFocus={() => setSearchFocused(true)}
							onBlur={() => setSearchFocused(false)}
							placeholder="Search..."
							className={`bg-[var(--muted-bg)] rounded-full pl-7 text-[12px] text-[var(--text-primary)] outline-none tracking-[-0.01em] w-[140px] py-[5px] ${!searchFocused && !search ? 'pr-9' : 'pr-3.5'}`}
						/>
						{!searchFocused && !search && (
							<kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-ghost)] pointer-events-none font-[inherit] tracking-[0]">
								⌘F
							</kbd>
						)}
					</div>
				</div>

				{/* Project list */}
				<AnimatePresence mode="sync" initial={false}>
					{filtered.length > 0 ? (
						<motion.div
							key={search + activeTagFilters.join(',') + (activeTypeFilter ?? '')}
							initial="hidden"
							animate={ready ? 'show' : 'hidden'}
							exit={{ opacity: 0 }}
							variants={{
								hidden: {},
								show: { transition: { staggerChildren: 0.04, delayChildren: 0.15 } },
							}}
							className="flex flex-col gap-0.5"
						>
							{filtered.map((project: Project, i: number) => (
								<ProjectCard
									key={project.slug}
									project={project}
									index={i}
									onHoverChange={handleHoverChange}
								/>
							))}
						</motion.div>
					) : (
						<motion.div
							key="empty"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="py-16 text-center text-[13px] text-[var(--text-ghost)]"
						>
							No projects found.
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>

			{/* Preview image portal -- rendered at body to avoid filter/transform containing block */}
			{typeof document !== 'undefined' &&
				createPortal(
					<AnimatePresence>
						{hovered?.project.coverImage && (
							<motion.div
								key={hovered.project.slug}
								initial={{
									opacity: 0,
									scale: 0.84,
									rotate: rotation > 0 ? rotation + 12 : rotation - 12,
								}}
								animate={{ opacity: 1, scale: 1, rotate: rotation }}
								exit={{ opacity: 0, scale: 0.84 }}
								transition={{ duration: 0.22, ease: [0.19, 1, 0.22, 1] }}
								className="fixed rounded-xl overflow-hidden pointer-events-none z-[9999] w-[200px]"
								style={{
									left: hovered.rect.right + 24,
									top: previewTop,
									y: '-50%',
								}}
							>
								<img
									src={hovered.project.coverImage}
									alt={hovered.project.title}
									className="w-full h-auto block"
								/>
								<div className="px-[10px] pt-[8px] pb-[10px] bg-[var(--background)]">
									<p className="text-[10px] text-[var(--text-muted)] leading-[1.5] tracking-[-0.01em] m-0">
										{hovered.project.description}
									</p>
								</div>
							</motion.div>
						)}
					</AnimatePresence>,
					document.body
				)}
		</>
	);
}
