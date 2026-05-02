'use client';

import {
	Apple01Icon,
	Cancel01Icon,
	ComputerTerminalIcon,
	Delete02Icon,
	FilterIcon,
	GameController03Icon,
	HugeiconsIcon,
	LaptopIcon,
	MobileProgramming02Icon,
	Search01Icon,
	WebDesignIcon,
} from '@icons';
import type { IconProps } from '@theexperiencecompany/gaia-icons';
import { AnimatePresence, LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import type { ComponentType } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckboxGroup, CheckboxItem } from '@/components/ui/checkbox-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TabItem, Tabs, TabsList } from '@/components/ui/tabs';
import { useAfterPreloader } from '@/hooks/useAfterPreloader';
import { getTechIconUrl } from '../../utils/techIcons';
import ProjectCard from './ProjectCard';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

interface Project {
	slug: string;
	title: string;
	description: string;
	shortDescription?: string;
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

const TYPE_CHIPS: { value: string; label: string; icon: ComponentType<IconProps> }[] = [
	{ value: 'web', label: 'Web', icon: WebDesignIcon },
	{ value: 'mobile', label: 'Mobile', icon: MobileProgramming02Icon },
	{ value: 'cli', label: 'CLI', icon: ComputerTerminalIcon },
	{ value: 'desktop', label: 'Desktop', icon: LaptopIcon },
	{ value: 'game', label: 'Game', icon: GameController03Icon },
	{ value: 'os', label: 'OS', icon: Apple01Icon },
];

type FilterTab = 'topics' | 'tech';

export default function ProjectsGrid({ projects: rawProjects }: { projects: Project[] }) {
	const projects = useMemo(() => rawProjects.filter((p) => p.type !== 'other'), [rawProjects]);

	const [search, setSearch] = useState('');
	const [searchFocused, setSearchFocused] = useState(false);
	const [hovered, setHovered] = useState<HoveredState | null>(null);
	const [activeTagFilters, setActiveTagFilters] = useState<string[]>([]);
	const [activeTechFilters, setActiveTechFilters] = useState<string[]>([]);
	const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);
	const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
	const [filterTab, setFilterTab] = useState<FilterTab>('tech');
	const [tagSearch, setTagSearch] = useState('');
	const ready = useAfterPreloader();
	const searchRef = useRef<HTMLInputElement>(null);
	const tagSearchRef = useRef<HTMLInputElement>(null);

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

	const tagCounts = useMemo(() => {
		const counts: Record<string, number> = {};
		projects.forEach((p) => {
			p.tags.forEach((t) => {
				counts[t] = (counts[t] || 0) + 1;
			});
		});
		return counts;
	}, [projects]);

	const techCounts = useMemo(() => {
		const counts: Record<string, number> = {};
		projects.forEach((p) => {
			p.tech?.forEach((t) => {
				counts[t] = (counts[t] || 0) + 1;
			});
		});
		return counts;
	}, [projects]);

	const sortedTags = useMemo(
		() => Object.entries(tagCounts).sort((a, b) => b[1] - a[1]),
		[tagCounts]
	);

	const sortedTech = useMemo(
		() => Object.entries(techCounts).sort((a, b) => b[1] - a[1]),
		[techCounts]
	);

	const filtered = useMemo(() => {
		let list = projects;

		if (activeTypeFilter) {
			list = list.filter((p) => p.type === activeTypeFilter);
		}

		if (activeTagFilters.length > 0) {
			list = list.filter((p) => activeTagFilters.every((t) => p.tags.includes(t)));
		}

		if (activeTechFilters.length > 0) {
			list = list.filter((p) => activeTechFilters.every((t) => p.tech?.includes(t)));
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
	}, [projects, activeTypeFilter, activeTagFilters, activeTechFilters, search]);

	const activeListForTab = filterTab === 'topics' ? sortedTags : sortedTech;
	const visibleEntries = useMemo(() => {
		if (!tagSearch.trim()) return activeListForTab;
		const q = tagSearch.toLowerCase();
		return activeListForTab.filter(([t]) => t.toLowerCase().includes(q));
	}, [activeListForTab, tagSearch]);

	const totalActiveFacets = activeTagFilters.length + activeTechFilters.length;

	const hasAnyFilter = !!activeTypeFilter || totalActiveFacets > 0 || !!search.trim();

	const clearAllFilters = () => {
		setActiveTypeFilter(null);
		setActiveTagFilters([]);
		setActiveTechFilters([]);
		setSearch('');
	};

	useEffect(() => {
		if (tagPopoverOpen) {
			requestAnimationFrame(() => tagSearchRef.current?.focus());
		} else {
			setTagSearch('');
			setFilterTab('tech');
		}
	}, [tagPopoverOpen]);

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

	const toggleTechFilter = (tech: string) => {
		setActiveTechFilters((prev) =>
			prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
		);
	};

	const toggleEntry = (value: string) => {
		if (filterTab === 'topics') toggleTagFilter(value);
		else toggleTechFilter(value);
	};

	const isEntryActive = (value: string) =>
		filterTab === 'topics' ? activeTagFilters.includes(value) : activeTechFilters.includes(value);

	return (
		<LazyMotion features={loadFeatures}>
			<m.div
				initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
				animate={ready ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
				transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] as const, delay: 0.12 }}
			>
				{/* Type filter chips — softened active state, no "All" */}
				<div className="mb-[10px] flex flex-wrap items-center gap-[6px]">
					{availableTypes.map((chip) => {
						const isOn = activeTypeFilter === chip.value;
						return (
							<button
								type="button"
								key={chip.value}
								onClick={() => setActiveTypeFilter(isOn ? null : chip.value)}
								className={`inline-flex cursor-pointer items-center gap-[5px] rounded-full border-none px-[10px] py-[3px] text-[11px] tracking-[-0.01em] transition-colors duration-150 ${isOn ? 'bg-[var(--muted-bg-strong,var(--muted-bg))] font-medium text-[var(--text-primary)]' : 'bg-[var(--muted-bg)] font-normal text-[var(--text-ghost)] hover:text-[var(--text-secondary)]'}`}
							>
								<HugeiconsIcon icon={chip.icon} size={11} color="currentColor" />
								{chip.label}
							</button>
						);
					})}
				</div>

				{/* Filter row: filter button + popular tags + active chips + search */}
				<div className="mb-7 flex w-full flex-wrap items-center gap-1.5">
					{/* Tag filter popover */}
					<Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
						<PopoverTrigger asChild>
							<button
								type="button"
								className={`inline-flex shrink-0 cursor-pointer items-center gap-[5px] rounded-full bg-[var(--muted-bg)] px-[10px] py-1 text-[11px] leading-[1.45] tracking-[0.01em] transition-[color,opacity] duration-150 ${totalActiveFacets > 0 ? 'text-[var(--text-secondary)]' : 'text-[var(--text-ghost)]'} ${tagPopoverOpen ? 'opacity-70' : 'opacity-100'}`}
							>
								<HugeiconsIcon icon={FilterIcon} size={11} color="currentColor" />
								<span>
									{totalActiveFacets > 0
										? `${totalActiveFacets} filter${totalActiveFacets > 1 ? 's' : ''}`
										: 'Filter'}
								</span>
							</button>
						</PopoverTrigger>
						<PopoverContent
							side="bottom"
							align="start"
							sideOffset={6}
							onOpenAutoFocus={(e) => {
								e.preventDefault();
								requestAnimationFrame(() => tagSearchRef.current?.focus());
							}}
							className="flex max-h-[360px] min-w-[240px] flex-col"
						>
							{/* Tabs */}
							<div className="px-1 pt-1 pb-0.5">
								<Tabs
									value={filterTab}
									onValueChange={(v) => {
										setFilterTab(v as FilterTab);
										setTagSearch('');
										requestAnimationFrame(() => tagSearchRef.current?.focus());
									}}
								>
									<TabsList className="w-full">
										<TabItem value="tech" label="Tech" className="flex-1 justify-center" />
										<TabItem value="topics" label="Topic" className="flex-1 justify-center" />
									</TabsList>
								</Tabs>
							</div>

							{/* Popover search */}
							<div className="relative px-1 pt-1.5 pb-1">
								<span className="pointer-events-none absolute top-1/2 left-3 flex -translate-y-1/2 items-center text-[var(--text-ghost)]">
									<HugeiconsIcon icon={Search01Icon} size={11} />
								</span>
								<input
									ref={tagSearchRef}
									type="text"
									value={tagSearch}
									onChange={(e) => setTagSearch(e.target.value)}
									placeholder={filterTab === 'topics' ? 'Search topics…' : 'Search tech…'}
									className="w-full rounded-lg bg-[var(--muted-bg)] py-[5px] pr-2 pl-7 text-[12px] text-[var(--text-primary)] tracking-[-0.01em] outline-none placeholder:text-[var(--text-ghost)]"
								/>
							</div>

							{/* Clear-all row — always rendered (no layout shift) */}
							<div className="flex h-[22px] items-center justify-end px-2">
								<button
									type="button"
									onClick={() => {
										setActiveTagFilters([]);
										setActiveTechFilters([]);
									}}
									disabled={totalActiveFacets === 0}
									className={`inline-flex items-center gap-1 rounded-[6px] bg-transparent px-1.5 py-[2px] text-[10px] tracking-[0.01em] transition-opacity duration-100 ${totalActiveFacets > 0 ? 'cursor-pointer text-[var(--text-ghost)] opacity-100 hover:text-[var(--text-secondary)]' : 'pointer-events-none opacity-0'}`}
									aria-hidden={totalActiveFacets === 0}
								>
									<HugeiconsIcon icon={Delete02Icon} size={11} color="currentColor" />
									Clear all
								</button>
							</div>

							<div className="min-h-0 flex-1 overflow-y-auto px-1 pb-1">
								{visibleEntries.length === 0 ? (
									<p className="px-2 py-3 text-center text-[11px] text-[var(--text-ghost)]">
										{filterTab === 'topics' ? 'No topics match.' : 'No tech matches.'}
									</p>
								) : (
									<CheckboxGroup
										key={filterTab}
										checkedIndices={
											new Set(
												visibleEntries
													.map(([entry], i) => (isEntryActive(entry) ? i : -1))
													.filter((i) => i !== -1)
											)
										}
									>
										{visibleEntries.map(([entry, count], i) => {
											const iconUrl = getTechIconUrl(entry);
											return (
												<CheckboxItem
													key={entry}
													index={i}
													checked={isEntryActive(entry)}
													onToggle={() => toggleEntry(entry)}
													ariaLabel={entry}
													label={
														<>
															{iconUrl ? (
																<img
																	src={iconUrl}
																	alt=""
																	width={13}
																	height={13}
																	className="shrink-0 object-contain"
																/>
															) : (
																<span className="w-[13px] shrink-0" />
															)}
															<span className="flex-1 text-left">{entry}</span>
															<span className="text-[10px] text-[var(--text-muted)] [font-variant-numeric:tabular-nums]">
																{count}
															</span>
														</>
													}
												/>
											);
										})}
									</CheckboxGroup>
								)}
							</div>
						</PopoverContent>
					</Popover>

					{/* Active filter chips (tags + tech, removable) */}
					{activeTagFilters.map((tag) => {
						const iconUrl = getTechIconUrl(tag);
						return (
							<button
								type="button"
								key={`tag-${tag}`}
								onClick={() => toggleTagFilter(tag)}
								className="group/chip inline-flex shrink-0 cursor-pointer items-center gap-[5px] rounded-full border-none bg-[var(--muted-bg-strong,var(--muted-bg))] px-[8px] py-[3px] text-[11px] text-[var(--text-primary)] tracking-[-0.01em] transition-colors duration-100 hover:bg-[var(--muted-bg)]"
								aria-label={`Remove filter ${tag}`}
							>
								{iconUrl && (
									<img
										src={iconUrl}
										alt=""
										width={11}
										height={11}
										className="shrink-0 object-contain"
									/>
								)}
								<span>{tag}</span>
								<HugeiconsIcon
									icon={Cancel01Icon}
									size={10}
									color="currentColor"
									className="text-[var(--text-ghost)] transition-colors duration-100 group-hover/chip:text-[var(--text-primary)]"
								/>
							</button>
						);
					})}
					{activeTechFilters.map((tech) => {
						const iconUrl = getTechIconUrl(tech);
						return (
							<button
								type="button"
								key={`tech-${tech}`}
								onClick={() => toggleTechFilter(tech)}
								className="group/chip inline-flex shrink-0 cursor-pointer items-center gap-[5px] rounded-full border-none bg-[var(--muted-bg-strong,var(--muted-bg))] px-[8px] py-[3px] text-[11px] text-[var(--text-primary)] tracking-[-0.01em] transition-colors duration-100 hover:bg-[var(--muted-bg)]"
								aria-label={`Remove filter ${tech}`}
							>
								{iconUrl && (
									<img
										src={iconUrl}
										alt=""
										width={11}
										height={11}
										className="shrink-0 object-contain"
									/>
								)}
								<span>{tech}</span>
								<HugeiconsIcon
									icon={Cancel01Icon}
									size={10}
									color="currentColor"
									className="text-[var(--text-ghost)] transition-colors duration-100 group-hover/chip:text-[var(--text-primary)]"
								/>
							</button>
						);
					})}

					{totalActiveFacets > 0 && (
						<button
							type="button"
							onClick={() => {
								setActiveTagFilters([]);
								setActiveTechFilters([]);
							}}
							className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border-none bg-transparent px-[8px] py-[3px] text-[11px] text-[var(--text-ghost)] tracking-[-0.01em] transition-colors duration-100 hover:text-[var(--text-secondary)]"
						>
							<HugeiconsIcon icon={Delete02Icon} size={11} color="currentColor" />
							Clear all
						</button>
					)}

					<div className="flex-1" />

					<div className="relative shrink-0">
						<span className="pointer-events-none absolute top-1/2 left-2.5 flex -translate-y-1/2 items-center text-[var(--text-ghost)]">
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
							className={`w-[160px] rounded-full bg-[var(--muted-bg)] py-[5px] pl-7 text-[12px] text-[var(--text-primary)] tracking-[-0.01em] outline-none transition-shadow duration-150 focus:ring-1 focus:ring-[var(--text-ghost)]/40 focus:ring-offset-0 focus-visible:outline-none ${!searchFocused && !search ? 'pr-9' : 'pr-3.5'}`}
						/>
						{!searchFocused && !search && (
							<kbd className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 font-[inherit] text-[10px] text-[var(--text-ghost)] tracking-[0]">
								⌘F
							</kbd>
						)}
					</div>
				</div>

				{/* Project list */}
				<AnimatePresence mode="sync" initial={false}>
					{filtered.length > 0 ? (
						<m.div
							key={
								search +
								activeTagFilters.join(',') +
								activeTechFilters.join(',') +
								(activeTypeFilter ?? '')
							}
							initial="hidden"
							animate={ready ? 'show' : 'hidden'}
							exit={{ opacity: 0 }}
							variants={{
								hidden: {},
								show: { transition: { staggerChildren: 0.04, delayChildren: 0.15 } },
							}}
							className="dim-list flex flex-col gap-0.5"
						>
							{filtered.map((project: Project, i: number) => (
								<ProjectCard
									key={project.slug}
									project={project}
									index={i}
									onHoverChange={handleHoverChange}
								/>
							))}
						</m.div>
					) : (
						<m.div
							key="empty"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="flex flex-col items-center gap-3 py-16 text-center text-[13px] text-[var(--text-ghost)]"
						>
							<span>No projects found.</span>
							{hasAnyFilter && (
								<button
									type="button"
									onClick={clearAllFilters}
									className="inline-flex cursor-pointer items-center rounded-full border-none bg-[var(--muted-bg)] px-3 py-[5px] text-[11px] text-[var(--text-secondary)] tracking-[-0.01em] transition-colors duration-100 hover:text-[var(--text-primary)]"
								>
									Clear all filters
								</button>
							)}
						</m.div>
					)}
				</AnimatePresence>
			</m.div>

			{/* Preview image portal -- rendered at body to avoid filter/transform containing block */}
			{typeof document !== 'undefined' &&
				createPortal(
					<AnimatePresence>
						{hovered?.project.coverImage && (
							<m.div
								key={hovered.project.slug}
								initial={{
									opacity: 0,
									scale: 0.84,
									rotate: rotation > 0 ? rotation + 12 : rotation - 12,
								}}
								animate={{ opacity: 1, scale: 1, rotate: rotation }}
								exit={{ opacity: 0, scale: 0.84 }}
								transition={{ duration: 0.22, ease: [0.19, 1, 0.22, 1] }}
								className="pointer-events-none fixed z-[9999] w-[200px] overflow-hidden rounded-xl"
								style={{
									left: hovered.rect.right + 24,
									top: previewTop,
									y: '-50%',
								}}
							>
								<img
									src={hovered.project.coverImage}
									alt={hovered.project.title}
									className="block h-auto w-full"
								/>
								<div className="bg-[var(--background)] px-[10px] pt-[8px] pb-[10px]">
									<p className="m-0 text-[10px] text-[var(--text-muted)] leading-[1.5] tracking-[-0.01em]">
										{hovered.project.description}
									</p>
								</div>
							</m.div>
						)}
					</AnimatePresence>,
					document.body
				)}
		</LazyMotion>
	);
}
