'use client';

import { Skeleton } from 'boneyard-js/react';
import { useEffect, useState } from 'react';
import { useLazyMount } from '@/hooks/useLazyMount';

interface ContributionDay {
	date: string;
	count: number;
	level: 0 | 1 | 2 | 3 | 4;
}

interface ContributionWeek {
	days: ContributionDay[];
}

export async function fetchContributions(
	username: string
): Promise<{ weeks: ContributionWeek[]; total: number }> {
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
	delay,
}: {
	day: ContributionDay;
	animated: boolean;
	delay: number;
}) {
	const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);

	return (
		<div className="flex-1 aspect-square relative">
			<div
				onMouseEnter={(e) => {
					const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
					setTooltip({ x: rect.left + rect.width / 2, y: rect.top });
				}}
				onMouseLeave={() => setTooltip(null)}
				className={`w-full h-full rounded-[2px] cursor-default ${animated ? 'github-cell' : ''}`}
			/>
			{tooltip && (
				<div
					className="fixed z-[9999] pointer-events-none"
					// biome-ignore lint/nursery/noInlineStyles: dynamic position from mouse coordinates
					style={{
						left: tooltip.x,
						top: tooltip.y - 8,
						transform: 'translate(-50%, -100%)',
					}}
				>
					<div className="bg-[#111] text-[#fdfdfc] text-[11px] leading-[1.5] px-[10px] py-[6px] rounded-[6px] whitespace-nowrap tracking-[-0.01em]">
						<div className="font-semibold">
							{day.count === 0
								? 'No contributions'
								: `${day.count} contribution${day.count !== 1 ? 's' : ''}`}
						</div>
						<div className="opacity-50 text-[10px] mt-[1px]">{formatDate(day.date)}</div>
					</div>
				</div>
			)}
		</div>
	);
}

function GithubGraphInner({ compact = false }: { compact?: boolean }) {
	const [data, setData] = useState<{ weeks: ContributionWeek[]; total: number } | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;

		fetchContributions('aryanranderiya')
			.then((result) => {
				if (cancelled) return;
				setData(result);
			})
			.catch(() => {
				if (cancelled) return;
				setData(null);
			})
			.finally(() => {
				if (cancelled) return;
				setIsLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, []);

	const weeks = data?.weeks.slice(-52) ?? [];
	const totalContributions = data?.total ?? 0;
	const monthLabels = getMonthLabels(weeks);

	const graph = (
		<div className="w-full">
			{isLoading ? (
				// Skeleton - full width grid
				<div className="grid [grid-template-columns:repeat(52,1fr)] gap-[3px] w-full">
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
									className="animate-pulse aspect-square rounded-[2px] w-full bg-[rgba(64,196,99,0.10)]"
								/>
							))}
						</div>
					))}
				</div>
			) : (
				<div className="relative w-full">
					{/* Month labels */}
					{!compact && (
						<div className="relative h-4 mb-1 w-full">
							{monthLabels.map(({ label, index }) => (
								<span
									key={label + index}
									className="absolute text-[10px] text-[var(--text-muted)] tracking-[0.02em] leading-none"
									// biome-ignore lint/nursery/noInlineStyles: dynamic computed left position
									style={{ left: `${(index / 52) * 100}%` }}
								>
									{label}
								</span>
							))}
						</div>
					)}

					{/* Grid */}
					<div className="grid [grid-template-columns:repeat(52,1fr)] gap-[3px] w-full">
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
			<div className="flex items-center justify-between mb-4">
				<div className="section-header mb-0">GitHub Contributions</div>
				{!isLoading && (
					<div className="text-right">
						<div className="text-2xl font-bold tracking-[-0.03em]">
							{totalContributions.toLocaleString()}
						</div>
						<div className="text-xs text-[var(--text-muted)]">contributions this year</div>
					</div>
				)}
			</div>

			{graph}

			<div className="flex items-center gap-2 mt-3 justify-end">
				<span className="text-xs text-[var(--text-muted)]">Less</span>
				{[0, 1, 2, 3, 4].map((level) => (
					<div
						key={level}
						className="w-[10px] h-[10px] rounded-[2px]"
						// biome-ignore lint/nursery/noInlineStyles: dynamic background from level color lookup
						style={{ background: LEVEL_COLORS[level] }}
					/>
				))}
				<span className="text-xs text-[var(--text-muted)]">More</span>
			</div>
		</section>
	);
}

function GithubGraphFixture() {
	// Mimics the visual shape of the full graph section
	return (
		<section className="pb-12">
			<div className="flex items-center justify-between mb-4">
				<div className="h-[14px] w-[160px] rounded-[4px] bg-black/[0.08]" />
				<div className="h-9 w-16 rounded-[4px] bg-black/[0.08]" />
			</div>
			<div className="grid [grid-template-columns:repeat(52,1fr)] gap-[3px] w-full">
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
								className="aspect-square rounded-[2px] bg-[rgba(64,196,99,0.10)] w-full"
							/>
						))}
					</div>
				))}
			</div>
		</section>
	);
}

export default function GithubGraph(props: { compact?: boolean }) {
	const { ref, mounted } = useLazyMount('300px');

	return (
		<div ref={ref}>
			<Skeleton
				name="github-graph"
				loading={!mounted}
				fixture={<GithubGraphFixture />}
				color="rgba(64, 196, 99, 0.08)"
				fallback={<GithubGraphFixture />}
			>
				{mounted && <GithubGraphInner {...props} />}
			</Skeleton>
		</div>
	);
}
