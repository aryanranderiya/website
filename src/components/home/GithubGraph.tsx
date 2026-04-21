'use client';

import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { queryClient } from '@/utils/queryClient';

interface ContributionDay {
	date: string;
	count: number;
	level: 0 | 1 | 2 | 3 | 4;
}

interface ContributionWeek {
	days: ContributionDay[];
}

export interface ContributionData {
	weeks: ContributionWeek[];
	total: number;
}

export async function fetchContributions(username: string): Promise<ContributionData> {
	const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
	if (!res.ok) throw new Error('Failed to fetch contributions');
	const data = await res.json();

	const days: ContributionDay[] = (data.contributions || []).map((d: Record<string, unknown>) => ({
		date: d.date as string,
		count: d.count as number,
		level: d.level as 0 | 1 | 2 | 3 | 4,
	}));

	const weeks: ContributionWeek[] = [];
	for (let i = 0; i < days.length; i += 7) {
		weeks.push({ days: days.slice(i, i + 7) });
	}

	const total = days.reduce((sum, d) => sum + d.count, 0);
	return { weeks, total };
}

export const GITHUB_QUERY_KEY = ['github-contributions', 'aryanranderiya'] as const;

// Same green (#40c463), varying opacity
const LEVEL_COLORS = [
	'rgba(64, 196, 99, 0.08)', // 0 -- no contributions
	'rgba(64, 196, 99, 0.30)', // 1 -- low
	'rgba(64, 196, 99, 0.55)', // 2 -- medium
	'rgba(64, 196, 99, 0.80)', // 3 -- high
	'rgba(64, 196, 99, 1.00)', // 4 -- max
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(dateStr: string): string {
	const date = new Date(`${dateStr}T00:00:00`);
	return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Returns month label positions: { label, weekIndex } for the first week of each month
function getMonthLabels(weeks: ContributionWeek[]): { label: string; index: number }[] {
	const labels: { label: string; index: number }[] = [];
	let lastMonth = -1;
	weeks.forEach((week, wi) => {
		const firstDay = week.days.find((d) => d.date);
		if (!firstDay) return;
		const month = new Date(`${firstDay.date}T00:00:00`).getMonth();
		if (month !== lastMonth) {
			labels.push({ label: MONTHS[month], index: wi });
			lastMonth = month;
		}
	});
	return labels;
}

function ContributionCell({
	day,
	animated,
}: {
	day: ContributionDay;
	animated: boolean;
	delay: number;
}) {
	const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);

	return (
		<div className="relative aspect-square flex-1">
			{/* biome-ignore lint/a11y/noStaticElementInteractions: tooltip-only hover on visual grid cell */}
			<div
				onMouseEnter={(e) => {
					const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
					setTooltip({ x: rect.left + rect.width / 2, y: rect.top });
				}}
				onMouseLeave={() => setTooltip(null)}
				className={`h-full w-full cursor-default rounded-[2px] ${animated ? 'github-cell' : ''}`}
				// biome-ignore lint/nursery/noInlineStyles: per-cell color from data
				style={{ backgroundColor: LEVEL_COLORS[day.level] }}
			/>
			{tooltip && (
				<div
					className="pointer-events-none fixed z-[9999]"
					// biome-ignore lint/nursery/noInlineStyles: dynamic position from mouse coordinates
					style={{
						left: tooltip.x,
						top: tooltip.y - 8,
						transform: 'translate(-50%, -100%)',
					}}
				>
					<div className="whitespace-nowrap rounded-[6px] bg-[#111] px-[10px] py-[6px] text-[#fdfdfc] text-[11px] leading-[1.5] tracking-[-0.01em]">
						<div className="font-semibold">
							{day.count === 0
								? 'No contributions'
								: `${day.count} contribution${day.count !== 1 ? 's' : ''}`}
						</div>
						<div className="mt-[1px] text-[10px] opacity-50">{formatDate(day.date)}</div>
					</div>
				</div>
			)}
		</div>
	);
}

function GithubGraphInner({ compact = false }: { compact?: boolean }) {
	const { data, isLoading } = useQuery({
		queryKey: GITHUB_QUERY_KEY,
		queryFn: () => fetchContributions('aryanranderiya'),
		staleTime: Infinity,
	});

	const weeks = data?.weeks.slice(-52) ?? [];
	const totalContributions = data?.total ?? 0;
	const monthLabels = getMonthLabels(weeks);

	const graph = (
		<div className="w-full">
			{isLoading ? (
				// Skeleton - full width grid
				<div className="grid w-full gap-[3px] [grid-template-columns:repeat(52,1fr)]">
					{Array.from({ length: 52 }).map((_, i) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: static array, order never changes
							key={i}
							className="flex flex-col gap-[3px]"
						>
							{Array.from({ length: 7 }).map((_, j) => (
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: static array, order never changes
									key={j}
									className="aspect-square w-full animate-pulse rounded-[2px] bg-[rgba(64,196,99,0.10)]"
								/>
							))}
						</div>
					))}
				</div>
			) : (
				<div className="relative w-full">
					{/* Month labels */}
					{!compact && (
						<div className="relative mb-1 h-4 w-full">
							{monthLabels.map(({ label, index }) => (
								<span
									key={label + index}
									className="absolute text-[10px] text-[var(--text-muted)] leading-none tracking-[0.02em]"
									// biome-ignore lint/nursery/noInlineStyles: dynamic computed left position
									style={{ left: `${(index / 52) * 100}%` }}
								>
									{label}
								</span>
							))}
						</div>
					)}

					{/* Grid */}
					<div className="grid w-full gap-[3px] [grid-template-columns:repeat(52,1fr)]">
						{weeks.map((week, wi) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: static array, order never changes
								key={wi}
								className="flex flex-col gap-[3px]"
							>
								{week.days.map((day, di) => (
									<ContributionCell
										key={day.date}
										day={day}
										animated={!compact}
										delay={(wi * 7 + di) * 5}
									/>
								))}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);

	if (compact) return graph;

	return (
		<section className="pb-12">
			<div className="mb-4 flex min-h-[42px] items-center justify-between">
				<div className="section-header mb-0">GitHub Contributions</div>
				<div className="text-right">
					<div className="font-bold text-2xl tracking-[-0.03em] [font-variant-numeric:tabular-nums]">
						{isLoading ? '\u00A0' : totalContributions.toLocaleString()}
					</div>
					<div className="text-[var(--text-muted)] text-xs">contributions this year</div>
				</div>
			</div>

			{graph}

			<div className="mt-3 flex items-center justify-end gap-2">
				<span className="text-[var(--text-muted)] text-xs">Less</span>
				{[0, 1, 2, 3, 4].map((level) => (
					<div
						key={level}
						className="h-[10px] w-[10px] rounded-[2px]"
						// biome-ignore lint/nursery/noInlineStyles: dynamic background from level color lookup
						style={{ background: LEVEL_COLORS[level] }}
					/>
				))}
				<span className="text-[var(--text-muted)] text-xs">More</span>
			</div>
		</section>
	);
}

function GithubGraphFixture({ compact = false }: { compact?: boolean }) {
	// The cells themselves stay a flat low-alpha green; a gradient sweep
	// rides above the grid to read as "loading" without looking like
	// random contribution levels.
	const grid = (
		<div className="github-graph-shimmer relative w-full">
			<div className="grid w-full gap-[3px] [grid-template-columns:repeat(52,1fr)]">
				{Array.from({ length: 52 }).map((_, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: static array, order never changes
						key={i}
						className="flex flex-col gap-[3px]"
					>
						{Array.from({ length: 7 }).map((_, j) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: static array, order never changes
								key={j}
								className="aspect-square w-full rounded-[2px] bg-[rgba(64,196,99,0.10)]"
							/>
						))}
					</div>
				))}
			</div>
		</div>
	);
	if (compact) return grid;
	return (
		<section className="pb-12">
			<div className="mb-4 flex items-center justify-between">
				<div className="h-[14px] w-[160px] rounded-[4px] bg-black/[0.08]" />
				<div className="h-9 w-16 rounded-[4px] bg-black/[0.08]" />
			</div>
			{grid}
		</section>
	);
}

function GithubGraphRoot(props: { compact?: boolean }) {
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return <GithubGraphFixture compact={props.compact} />;
	return <GithubGraphInner {...props} />;
}

export default function GithubGraph(props: { compact?: boolean }) {
	return (
		<QueryClientProvider client={queryClient}>
			<GithubGraphRoot {...props} />
		</QueryClientProvider>
	);
}
