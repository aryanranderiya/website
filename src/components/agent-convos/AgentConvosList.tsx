'use client';

import { ArrowDown01Icon, ArrowUp01Icon, ArrowUpDownIcon, HugeiconsIcon } from '@icons';
import { LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { useMemo, useRef, useState } from 'react';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

interface ConvoEntry {
	slug: string;
	title: string;
	description: string;
	date: string;
	platform: 'claude-code' | 'opencode' | 'codex';
	model: string;
	harness: string;
	featured: boolean;
	tokens?: string;
	tokenCount?: number;
	messageCount?: number;
	duration?: string;
	agentCount?: number;
	agents: string[];
}

const PLATFORM_LABELS: Record<string, string> = {
	'claude-code': 'Claude Code',
	opencode: 'OpenCode',
	codex: 'Codex CLI',
};

// Google's favicon service -- reliable, works for any domain, returns crisp icons
const PLATFORM_ICONS: Record<string, string> = {
	'claude-code': 'https://www.google.com/s2/favicons?domain=claude.ai&sz=32',
	opencode: 'https://www.google.com/s2/favicons?domain=opencode.ai&sz=32',
	codex: 'https://www.google.com/s2/favicons?domain=openai.com&sz=32',
};

type SortKey = 'date' | 'title' | 'tokens';
type SortDir = 'asc' | 'desc';

function formatDate(dateStr: string) {
	const d = new Date(dateStr);
	return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function parseTokenCount(tokens?: string, tokenCount?: number): number {
	if (tokenCount) return tokenCount;
	if (!tokens) return 0;
	const n = parseFloat(tokens.replace(/[^0-9.]/g, ''));
	if (tokens.toLowerCase().includes('m')) return n * 1_000_000;
	if (tokens.toLowerCase().includes('k')) return n * 1_000;
	return n;
}

function formatTokensExact(tokenCount?: number, tokens?: string): string {
	if (tokenCount) {
		if (tokenCount >= 1_000_000) return `${(tokenCount / 1_000_000).toFixed(1)}M`;
		if (tokenCount >= 1_000) return `${(tokenCount / 1_000).toFixed(0)}K`;
		return tokenCount.toLocaleString();
	}
	if (tokens) {
		return tokens
			.replace(/~/g, '')
			.replace(/\s+(session|across\s+sessions?|across\s+\d+\s+sessions?).*/i, '')
			.replace(/MB/gi, 'M')
			.trim();
	}
	return '-';
}

function SortIcon({ dir }: { dir: SortDir | null }) {
	if (!dir)
		return (
			<HugeiconsIcon
				icon={ArrowUpDownIcon}
				size={10}
				color="var(--text-ghost)"
				className="ml-[3px] shrink-0 opacity-40"
			/>
		);
	if (dir === 'asc')
		return (
			<HugeiconsIcon
				icon={ArrowUp01Icon}
				size={10}
				color="var(--text-secondary)"
				className="ml-[3px] shrink-0"
			/>
		);
	return (
		<HugeiconsIcon
			icon={ArrowDown01Icon}
			size={10}
			color="var(--text-secondary)"
			className="ml-[3px] shrink-0"
		/>
	);
}

function PlatformIcon({ platform, model }: { platform: string; model: string }) {
	const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
	const ref = useRef<HTMLSpanElement>(null);
	const label = PLATFORM_LABELS[platform] ?? platform;
	const iconSrc = PLATFORM_ICONS[platform];

	const handleMouseEnter = () => {
		if (ref.current) {
			const rect = ref.current.getBoundingClientRect();
			setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
		}
	};

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: hover-only tooltip trigger, no keyboard equivalent needed
		<span
			ref={ref}
			className="inline-flex shrink-0 cursor-default items-center"
			onMouseEnter={handleMouseEnter}
			onMouseLeave={() => setTooltipPos(null)}
		>
			<img
				src={iconSrc}
				alt={label}
				width={14}
				height={14}
				className="block h-[14px] w-[14px] shrink-0 rounded-[3px] opacity-70"
			/>
			<style>{`
        @keyframes tooltip-in {
          from { opacity: 0; transform: translate(-50%, calc(-100% + 5px)); }
          to   { opacity: 1; transform: translate(-50%, -100%); }
        }
      `}</style>
			{tooltipPos && (
				<span
					// biome-ignore lint/nursery/noInlineStyles: dynamic position from mouse coordinates
					style={{
						position: 'fixed',
						left: tooltipPos.x,
						top: tooltipPos.y,
						transform: 'translate(-50%, -100%)',
						background: 'var(--foreground)',
						color: 'var(--background)',
						fontSize: '11px',
						fontVariationSettings: '"wght" 450',
						letterSpacing: '-0.01em',
						padding: '5px 9px',
						borderRadius: '7px',
						whiteSpace: 'nowrap',
						pointerEvents: 'none',
						zIndex: 9999,
						boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
						animation: 'tooltip-in 0.22s cubic-bezier(0.19,1,0.22,1) forwards',
					}}
				>
					{label}
					<span className="mx-[4px] opacity-30">/</span>
					<span
						// biome-ignore lint/nursery/noInlineStyles: fontFamily/fontSize have no Tailwind equivalent for var(--font-mono)
						style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', opacity: 0.8 }}
					>
						{model}
					</span>
				</span>
			)}
		</span>
	);
}

const rowVariants = {
	initial: { opacity: 0 },
	animate: (i: number) => ({
		opacity: 1,
		transition: { duration: 0.2, ease: 'easeOut' as const, delay: i * 0.025 },
	}),
};

export default function AgentConvosList({ convos }: { convos: ConvoEntry[] }) {
	const [sortKey, setSortKey] = useState<SortKey>('date');
	const [sortDir, setSortDir] = useState<SortDir>('desc');

	function handleSort(key: SortKey) {
		if (sortKey === key) {
			setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
		} else {
			setSortKey(key);
			setSortDir('desc');
		}
	}

	const sorted = useMemo(() => {
		return [...convos].sort((a, b) => {
			let cmp = 0;
			switch (sortKey) {
				case 'date':
					cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
					break;
				case 'title':
					cmp = a.title.localeCompare(b.title);
					break;
				case 'tokens':
					cmp = parseTokenCount(a.tokens, a.tokenCount) - parseTokenCount(b.tokens, b.tokenCount);
					break;
			}
			return sortDir === 'asc' ? cmp : -cmp;
		});
	}, [convos, sortKey, sortDir]);

	const colStyle = (key: SortKey): React.CSSProperties => ({
		fontSize: '10px',
		fontVariationSettings: sortKey === key ? '"wght" 600' : '"wght" 500',
		color: sortKey === key ? 'var(--text-secondary)' : 'var(--text-ghost)',
		letterSpacing: '0.06em',
		textTransform: 'uppercase',
		padding: '0 0 10px 0',
		textAlign: 'left',
		cursor: 'pointer',
		userSelect: 'none',
		whiteSpace: 'nowrap',
		background: 'none',
		border: 'none',
		borderBottom: '1px solid var(--border)',
	});

	return (
		<LazyMotion features={loadFeatures}>
			<div className="overflow-x-auto">
				<table className="w-full border-collapse [table-layout:fixed]">
					<colgroup>
						<col className="w-[72%]" />
						<col className="w-[13%]" />
						<col className="w-[15%]" />
					</colgroup>
					<thead>
						<tr>
							{(
								[
									['title', 'Title'],
									['tokens', 'Tokens'],
									['date', 'Date'],
								] as [SortKey, string][]
							).map(([key, label]) => (
								<th
									key={key}
									onClick={() => handleSort(key)}
									// biome-ignore lint/nursery/noInlineStyles: dynamic styles based on sort state
									style={colStyle(key)}
								>
									<span className="inline-flex items-center">
										{label}
										<SortIcon dir={sortKey === key ? sortDir : null} />
									</span>
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{sorted.map((convo, i) => (
							<m.tr
								key={convo.slug}
								custom={i}
								variants={rowVariants}
								initial="initial"
								animate="animate"
								className="group cursor-pointer"
								onClick={() => {
									window.location.href = `/agent-convos/${convo.slug}`;
								}}
							>
								{/* Title with platform icon -- no overflow:hidden on td so tooltip can escape */}
								<td className="border-[var(--border)] border-b py-[9px] pr-[16px]">
									<span className="flex min-w-0 items-center gap-[7px]">
										<PlatformIcon platform={convo.platform} model={convo.model} />
										<a
											href={`/agent-convos/${convo.slug}`}
											className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-[var(--text-primary)] no-underline"
											// biome-ignore lint/nursery/noInlineStyles: fontVariationSettings has no Tailwind equivalent
											style={{
												fontVariationSettings: '"wght" 480',
												letterSpacing: '-0.012em',
											}}
											onClick={(e) => e.stopPropagation()}
										>
											{convo.title}
										</a>
									</span>
								</td>

								{/* Tokens */}
								<td className="whitespace-nowrap border-[var(--border)] border-b py-[9px] pr-[12px]">
									<span
										className="text-[11px] tracking-[-0.02em]"
										// biome-ignore lint/nursery/noInlineStyles: dynamic color based on token availability; fontFamily is var(--font-mono)
										style={{
											color:
												convo.tokens || convo.tokenCount
													? 'var(--text-muted)'
													: 'var(--text-ghost)',
											fontFamily: 'var(--font-mono)',
										}}
									>
										{formatTokensExact(convo.tokenCount, convo.tokens)}
									</span>
								</td>

								{/* Date */}
								<td className="whitespace-nowrap border-[var(--border)] border-b py-[9px]">
									<time
										dateTime={convo.date}
										className="text-[11px] text-[var(--text-ghost)]"
										// biome-ignore lint/nursery/noInlineStyles: fontVariationSettings has no Tailwind equivalent
										style={{ fontVariationSettings: '"wght" 400' }}
									>
										{formatDate(convo.date)}
									</time>
								</td>
							</m.tr>
						))}
					</tbody>
				</table>

				{sorted.length === 0 && (
					<p className="py-12 text-center text-[13px] text-[var(--text-ghost)]">
						No conversations found.
					</p>
				)}
			</div>
		</LazyMotion>
	);
}
