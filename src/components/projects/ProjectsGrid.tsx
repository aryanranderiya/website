'use client';

import {
	Apple01Icon,
	Cancel01Icon,
	ComputerTerminalIcon,
	Delete02Icon,
	FilterIcon,
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
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckboxGroup, CheckboxItem } from '@/components/ui/checkbox-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getTechIconUrl } from '../../utils/techIcons';
import ProjectCard from './ProjectCard';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

interface Project {
	slug: string;
	title: string;
	description: string;
	shortDescription?: string;
	tech: string[];
	type: string;
	featured: boolean;
	images: { src: string; caption?: string }[];
	folder: string;
	url?: string;
	github?: string;
	coverImage?: string;
	date?: string;
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
	{ value: 'os', label: 'OS', icon: Apple01Icon },
];

// Lightweight fuzzy matcher: returns -1 when `query` is not an in-order
// subsequence of `text`, otherwise a score where consecutive characters and
// word-boundary hits are rewarded and tighter (shorter) matches rank higher.
// `text` and `query` must already be lowercased.
function fuzzyScore(query: string, text: string): number {
	if (!query) return 0;
	let qi = 0;
	let score = 0;
	let streak = 0;
	let prev = -2;
	for (let i = 0; i < text.length && qi < query.length; i++) {
		if (text[i] === query[qi]) {
			streak = prev === i - 1 ? streak + 1 : 0;
			let bonus = 1 + streak * 3;
			const before = text[i - 1];
			if (i === 0 || before === ' ' || before === '-' || before === '/') bonus += 4;
			score += bonus;
			prev = i;
			qi++;
		}
	}
	if (qi < query.length) return -1;
	return score + Math.max(0, 16 - text.length / 12);
}

function scoreProject(q: string, idx: { title: string; desc: string }, wordRe: RegExp): number {
	let score = 0;
	if (idx.title.includes(q)) score += wordRe.test(idx.title) ? 1200 : 1000;
	else {
		const ts = fuzzyScore(q, idx.title);
		if (ts >= 0) score += 180 + ts * 5;
	}
	if (idx.desc.includes(q)) score += wordRe.test(idx.desc) ? 600 : 420;
	else {
		const ds = fuzzyScore(q, idx.desc);
		if (ds >= 0) score += ds;
	}
	return score;
}

function useSearchIndex(projects: Project[]): Map<string, { title: string; desc: string }> {
	// Precompute the lowercased haystack once per project so the fuzzy pass
	// never re-lowercases on every keystroke.
	return useMemo(() => {
		const map = new Map<string, { title: string; desc: string }>();
		for (const p of projects) {
			map.set(p.slug, {
				title: p.title.toLowerCase(),
				desc: p.description.toLowerCase(),
			});
		}
		return map;
	}, [projects]);
}

function useTechCounts(projects: Project[]): [Record<string, number>, [string, number][]] {
	const techCounts = useMemo(() => {
		const counts: Record<string, number> = {};
		for (const p of projects) {
			if (!p.tech) continue;
			for (const t of p.tech) {
				counts[t] = (counts[t] || 0) + 1;
			}
		}
		return counts;
	}, [projects]);

	const sortedTech = useMemo(
		() => Object.entries(techCounts).sort((a, b) => b[1] - a[1]),
		[techCounts]
	);
	return [techCounts, sortedTech];
}

function useAvailableTypes(projects: Project[]) {
	// Only show type chips for types that have at least one project
	return useMemo(() => {
		const typeCounts: Record<string, number> = {};
		for (const p of projects) {
			typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
		}
		return TYPE_CHIPS.filter((c) => typeCounts[c.value] > 0);
	}, [projects]);
}

function useFilteredProjects(
	projects: Project[],
	activeTypeFilter: string | null,
	activeTechFilters: string[],
	deferredSearch: string,
	searchIndex: Map<string, { title: string; desc: string }>
): Project[] {
	return useMemo(() => {
		let list = projects;

		if (activeTypeFilter) {
			list = list.filter((p) => p.type === activeTypeFilter);
		}

		if (activeTechFilters.length > 0) {
			list = list.filter((p) => activeTechFilters.every((t) => p.tech?.includes(t)));
		}

		const q = deferredSearch.trim().toLowerCase();
		if (q) {
			const scored: { p: Project; score: number }[] = [];
			const wordRe = new RegExp(`\\b${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
			for (const p of list) {
				const idx = searchIndex.get(p.slug);
				if (!idx) continue;
				// Real substring hits are the strongest signal; a whole-word
				// hit beats a loose subsequence so a genuine keyword in the
				// description outranks an incidental title match. Fuzzy
				// subsequence fills in the rest. Title outweighs description.
				const score = scoreProject(q, idx, wordRe);
				if (score > 0) scored.push({ p, score });
			}
			scored.sort((a, b) => b.score - a.score);
			list = scored.map((s) => s.p);
		}

		return list;
	}, [projects, activeTypeFilter, activeTechFilters, deferredSearch, searchIndex]);
}

// Single-pass derivation of the checked checkbox indices (no map+filter chain).
function getCheckedIndices(
	visibleEntries: [string, number][],
	isActive: (value: string) => boolean
): Set<number> {
	const indices: number[] = [];
	for (let i = 0; i < visibleEntries.length; i++) {
		if (isActive(visibleEntries[i][0])) indices.push(i);
	}
	return new Set(indices);
}

function ProjectsSearchInput({
	search,
	onChange,
	focused,
	onFocusChange,
	inputRef,
}: {
	search: string;
	onChange: (value: string) => void;
	focused: boolean;
	onFocusChange: (value: boolean) => void;
	inputRef: React.RefObject<HTMLInputElement | null>;
}) {
	return (
		<div className="relative shrink-0">
			<label htmlFor="projects-search" className="sr-only">
				Search projects
			</label>
			<span className="pointer-events-none absolute top-1/2 left-2.5 flex -translate-y-1/2 items-center text-[var(--text-ghost)]">
				<HugeiconsIcon icon={Search01Icon} size={12} />
			</span>
			<input
				ref={inputRef}
				id="projects-search"
				type="text"
				value={search}
				onChange={(e) => onChange(e.target.value)}
				onFocus={() => onFocusChange(true)}
				onBlur={() => onFocusChange(false)}
				placeholder="Search..."
				className={`w-[160px] rounded-full bg-[var(--muted-bg)] py-[5px] pl-7 text-[12px] text-[var(--text-primary)] tracking-[-0.01em] outline-none transition-shadow duration-150 focus:ring-1 focus:ring-[var(--text-ghost)]/40 focus:ring-offset-0 focus-visible:outline-none ${!focused && !search ? 'pr-9' : 'pr-3.5'}`}
			/>
			{!focused && !search && (
				<kbd className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 font-[inherit] text-[10px] text-[var(--text-ghost)] tracking-[0]">
					⌘F
				</kbd>
			)}
		</div>
	);
}

function TypeFilterChips({
	availableTypes,
	activeTypeFilter,
	onSelect,
}: {
	availableTypes: { value: string; label: string; icon: ComponentType<IconProps> }[];
	activeTypeFilter: string | null;
	onSelect: (value: string | null, isOn: boolean) => void;
}) {
	return (
		<>
			{availableTypes.map((chip) => {
				const isOn = activeTypeFilter === chip.value;
				return (
					<button
						type="button"
						key={chip.value}
						onClick={() => onSelect(isOn ? null : chip.value, isOn)}
						className={`inline-flex cursor-pointer items-center gap-[5px] rounded-full border-none px-[10px] py-[3px] text-[11px] tracking-[-0.01em] transition-colors duration-150 ${isOn ? 'bg-[var(--muted-bg-strong,var(--muted-bg))] font-medium text-[var(--text-primary)]' : 'bg-[var(--muted-bg)] font-normal text-[var(--text-ghost)] hover:text-[var(--text-secondary)]'}`}
					>
						<HugeiconsIcon icon={chip.icon} size={11} color="currentColor" />
						{chip.label}
					</button>
				);
			})}
		</>
	);
}

function TagFilterPopover({
	open,
	onOpenChange,
	tagSearch,
	onTagSearchChange,
	tagSearchRef,
	visibleEntries,
	isEntryActive,
	onToggleTech,
	onClearTech,
	totalActiveFacets,
}: {
	open: boolean;
	onOpenChange: (value: boolean) => void;
	tagSearch: string;
	onTagSearchChange: (value: string) => void;
	tagSearchRef: React.RefObject<HTMLInputElement | null>;
	visibleEntries: [string, number][];
	isEntryActive: (value: string) => boolean;
	onToggleTech: (tech: string) => void;
	onClearTech: () => void;
	totalActiveFacets: number;
}) {
	return (
		<Popover open={open} onOpenChange={onOpenChange}>
			<PopoverTrigger asChild>
				<button
					type="button"
					className={`inline-flex shrink-0 cursor-pointer items-center gap-[5px] rounded-full bg-[var(--muted-bg)] px-[10px] py-1 text-[11px] leading-[1.45] tracking-[0.01em] transition-[color,opacity] duration-150 ${totalActiveFacets > 0 ? 'text-[var(--text-secondary)]' : 'text-[var(--text-ghost)]'} ${open ? 'opacity-70' : 'opacity-100'}`}
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
				{/* Popover search */}
				<div className="relative px-1 pt-1.5 pb-1">
					<label htmlFor="projects-tag-search" className="sr-only">
						Search tech
					</label>
					<span className="pointer-events-none absolute top-1/2 left-3 flex -translate-y-1/2 items-center text-[var(--text-ghost)]">
						<HugeiconsIcon icon={Search01Icon} size={11} />
					</span>
					<input
						ref={tagSearchRef}
						id="projects-tag-search"
						type="text"
						value={tagSearch}
						onChange={(e) => onTagSearchChange(e.target.value)}
						placeholder="Search tech…"
						className="w-full rounded-lg bg-[var(--muted-bg)] py-[5px] pr-2 pl-7 text-[12px] text-[var(--text-primary)] tracking-[-0.01em] outline-none placeholder:text-[var(--text-ghost)]"
					/>
				</div>

				{/* Clear-all row — always rendered (no layout shift) */}
				<div className="flex h-[22px] items-center justify-end px-2">
					<button
						type="button"
						onClick={onClearTech}
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
							No tech matches.
						</p>
					) : (
						<CheckboxGroup checkedIndices={getCheckedIndices(visibleEntries, isEntryActive)}>
							{visibleEntries.map(([entry, count], i) => {
								const iconUrl = getTechIconUrl(entry);
								return (
									<CheckboxItem
										key={entry}
										index={i}
										checked={isEntryActive(entry)}
										onToggle={() => onToggleTech(entry)}
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
	);
}

function ActiveTechChips({
	activeTechFilters,
	onToggle,
	onClear,
}: {
	activeTechFilters: string[];
	onToggle: (tech: string) => void;
	onClear: () => void;
}) {
	if (activeTechFilters.length === 0) return null;
	return (
		<>
			{activeTechFilters.map((tech) => {
				const iconUrl = getTechIconUrl(tech);
				return (
					<button
						type="button"
						key={`tech-${tech}`}
						onClick={() => onToggle(tech)}
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

			<button
				type="button"
				onClick={onClear}
				className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border-none bg-transparent px-[8px] py-[3px] text-[11px] text-[var(--text-ghost)] tracking-[-0.01em] transition-colors duration-100 hover:text-[var(--text-secondary)]"
			>
				<HugeiconsIcon icon={Delete02Icon} size={11} color="currentColor" />
				Clear all
			</button>
		</>
	);
}

function ProjectsList({
	filtered,
	listAnimKey,
	onHoverChange,
	hasAnyFilter,
	onClearAll,
}: {
	filtered: Project[];
	listAnimKey: string;
	onHoverChange: (data: { project: Project; index: number; el: HTMLElement } | null) => void;
	hasAnyFilter: boolean;
	onClearAll: () => void;
}) {
	if (filtered.length === 0) {
		return (
			<div className="flex flex-col items-center gap-3 py-16 text-center text-[13px] text-[var(--text-ghost)]">
				<span>No projects found.</span>
				{hasAnyFilter && (
					<button
						type="button"
						onClick={onClearAll}
						className="inline-flex cursor-pointer items-center rounded-full border-none bg-[var(--muted-bg)] px-3 py-[5px] text-[11px] text-[var(--text-secondary)] tracking-[-0.01em] transition-colors duration-100 hover:text-[var(--text-primary)]"
					>
						Clear all filters
					</button>
				)}
			</div>
		);
	}
	return (
		<div key={listAnimKey} className="dim-list flex flex-col gap-0.5">
			{filtered.map((project: Project, i: number) => (
				<ProjectCard key={project.slug} project={project} index={i} onHoverChange={onHoverChange} />
			))}
		</div>
	);
}

// Preview image portal — always mounted so AnimatePresence outlives the
// exiting child and can run its exit animation. Rendered at body to avoid a
// filter/transform containing block.
function HoverPreviewPortal({
	hovered,
	rotation,
	previewTop,
}: {
	hovered: HoveredState | null;
	rotation: number;
	previewTop: number;
}) {
	if (typeof document === 'undefined') return null;
	return createPortal(
		<AnimatePresence>
			{hovered && (hovered.project.coverImage ?? hovered.project.images?.[0]?.src) && (
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
					className="pointer-events-none fixed z-[9999] w-[200px] overflow-hidden rounded-xl ring-1 ring-[var(--border)]"
					style={{
						left: hovered.rect.right + 24,
						top: previewTop,
						y: '-50%',
					}}
				>
					<img
						src={hovered.project.coverImage ?? hovered.project.images?.[0]?.src}
						alt={hovered.project.title}
						className="block aspect-video h-auto w-full object-cover"
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
	);
}

export default function ProjectsGrid({ projects: rawProjects }: { projects: Project[] }) {
	const projects = useMemo(() => rawProjects.filter((p) => p.type !== 'other'), [rawProjects]);

	const [search, setSearch] = useState('');
	// Keep the input snappy: the heavy fuzzy pass runs against the deferred
	// value so keystrokes never block on filtering/sorting.
	const deferredSearch = useDeferredValue(search);
	const [searchFocused, setSearchFocused] = useState(false);
	const [hovered, setHovered] = useState<HoveredState | null>(null);
	const [activeTechFilters, setActiveTechFilters] = useState<string[]>([]);
	const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);
	const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
	const [tagSearch, setTagSearch] = useState('');
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

	const searchIndex = useSearchIndex(projects);
	const [, sortedTech] = useTechCounts(projects);
	const filtered = useFilteredProjects(
		projects,
		activeTypeFilter,
		activeTechFilters,
		deferredSearch,
		searchIndex
	);

	const visibleEntries = useMemo(() => {
		if (!tagSearch.trim()) return sortedTech;
		const q = tagSearch.toLowerCase();
		return sortedTech.filter(([t]) => t.toLowerCase().includes(q));
	}, [sortedTech, tagSearch]);

	const totalActiveFacets = activeTechFilters.length;

	const hasAnyFilter = !!activeTypeFilter || totalActiveFacets > 0 || !!search.trim();

	const clearAllFilters = () => {
		setActiveTypeFilter(null);
		setActiveTechFilters([]);
		setSearch('');
	};

	useEffect(() => {
		if (tagPopoverOpen) {
			requestAnimationFrame(() => tagSearchRef.current?.focus());
		} else {
			setTagSearch('');
		}
	}, [tagPopoverOpen]);

	const availableTypes = useAvailableTypes(projects);

	const handleHoverChange = (data: { project: Project; index: number; el: HTMLElement } | null) => {
		if (!data) {
			setHovered(null);
			return;
		}
		setHovered({ project: data.project, index: data.index, rect: data.el.getBoundingClientRect() });
	};

	const rotation = hovered ? ROTATIONS[hovered.index % 2] : 0;
	const previewTop = hovered ? hovered.rect.top + hovered.rect.height / 2 : 0;

	const toggleTechFilter = (tech: string) => {
		setActiveTechFilters((prev) =>
			prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
		);
	};

	const isEntryActive = (value: string) => activeTechFilters.includes(value);

	// Re-trigger the list entrance whenever the chip / tech filters change. CSS
	// animations only run on mount, so we remount the list subtree via a key that
	// reflects the active filters — the entrance replays on every toggle. Search
	// is deliberately excluded so the list doesn't re-animate on each keystroke.
	const listAnimKey = `${activeTypeFilter ?? 'all'}|${activeTechFilters.toSorted().join(',')}`;

	return (
		<LazyMotion features={loadFeatures}>
			{/* CSS-driven entrance (animate-fade-in) instead of a JS-gated Framer
			    initial:opacity-0. The list must stay visible even if the island is
			    slow to hydrate or the preloader 'done' signal is missed — CSS always
			    resolves to opacity:1, so it can never get stranded invisible. */}
			<div className="animate-fade-in">
				{/* Header row: title left, search right — same pattern as the blog page */}
				<div className="mb-3 flex items-center justify-between gap-3">
					<h1 className="m-0 text-heading-1">Projects</h1>

					{/* Pill search */}
					<ProjectsSearchInput
						search={search}
						onChange={setSearch}
						focused={searchFocused}
						onFocusChange={setSearchFocused}
						inputRef={searchRef}
					/>
				</div>

				{/* Subtitle */}
				<p className="m-0 mb-6 text-body">A collection of things I have built!</p>

				{/* Type filter chips + tag filter — one row */}
				<div className="mb-7 flex flex-wrap items-center gap-[6px]">
					<TypeFilterChips
						availableTypes={availableTypes}
						activeTypeFilter={activeTypeFilter}
						onSelect={(value) => setActiveTypeFilter(value)}
					/>
					<TagFilterPopover
						open={tagPopoverOpen}
						onOpenChange={setTagPopoverOpen}
						tagSearch={tagSearch}
						onTagSearchChange={setTagSearch}
						tagSearchRef={tagSearchRef}
						visibleEntries={visibleEntries}
						isEntryActive={isEntryActive}
						onToggleTech={toggleTechFilter}
						onClearTech={() => setActiveTechFilters([])}
						totalActiveFacets={totalActiveFacets}
					/>

					{/* Active filter chips (tech, removable) */}
					<ActiveTechChips
						activeTechFilters={activeTechFilters}
						onToggle={toggleTechFilter}
						onClear={() => setActiveTechFilters([])}
					/>
				</div>

				{/* Project list — plain DOM so it renders visible from SSR and never
				    depends on hydration/preloader timing to be seen. */}
				<ProjectsList
					filtered={filtered}
					listAnimKey={listAnimKey}
					onHoverChange={handleHoverChange}
					hasAnyFilter={hasAnyFilter}
					onClearAll={clearAllFilters}
				/>
			</div>

			<HoverPreviewPortal hovered={hovered} rotation={rotation} previewTop={previewTop} />
		</LazyMotion>
	);
}
