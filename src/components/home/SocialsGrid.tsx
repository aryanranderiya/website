'use client';

import { HugeiconsIcon, KeyboardIcon, Location01Icon, RepositoryIcon, StarIcon } from '@icons';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { queryClient } from '@/utils/queryClient';
import GithubGraph, { fetchContributions } from './GithubGraph';

const AVATAR_URL = '/avatar-original.webp';
const _INSTAGRAM_GRADIENT =
	'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)';

// ── Brand SVG logos ──────────────────────────────────────────────────────────

function GitHubLogo({ size = 18 }: { size?: number }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 16 16"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
		</svg>
	);
}

function TwitterLogo({ size = 18 }: { size?: number }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.732-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
		</svg>
	);
}

function LinkedInLogo({ size = 18 }: { size?: number }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
		</svg>
	);
}

function InstagramLogo({ size = 18 }: { size?: number }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
		</svg>
	);
}

// ── Preview cards ─────────────────────────────────────────────────────────────

function GitHubPreview() {
	const { data } = useQuery({
		queryKey: ['github-contributions', 'aryanranderiya'],
		queryFn: () => fetchContributions('aryanranderiya'),
	});
	const total = data?.total;

	return (
		<div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 w-[420px] shadow-2xl overflow-hidden font-sans text-[#e6edf3]">
			<div className="flex items-center gap-3 mb-3">
				<img
					src={AVATAR_URL}
					alt="avatar"
					width={40}
					height={40}
					className="rounded-full border-2 border-[#30363d] shrink-0 w-10 h-10"
				/>
				<div className="min-w-0">
					<div className="font-semibold text-sm text-[#e6edf3] leading-tight">Aryan</div>
					<div className="text-xs text-[#8b949e] leading-tight">@aryanranderiya</div>
				</div>
			</div>

			<p className="text-xs text-[#8b949e] leading-relaxed mb-2">
				founder &amp; ceo <span className="text-[#58a6ff]">@theexperiencecompany</span>
			</p>

			<div className="flex items-center gap-1 mb-3">
				<span className="text-[#8b949e] flex items-center">
					<HugeiconsIcon icon={Location01Icon} size={12} />
				</span>
				<span className="text-xs text-[#8b949e]">Ahmedabad, India</span>
			</div>

			<div className="flex gap-4 mb-3 pb-3 border-b border-[#21262d] text-xs">
				<div className="flex items-center gap-1">
					<span className="text-[#8b949e] flex items-center">
						<HugeiconsIcon icon={RepositoryIcon} size={13} />
					</span>
					<span className="font-semibold text-[#e6edf3]">38</span>
					<span className="text-[#8b949e]">repos</span>
				</div>
				<div className="flex items-center gap-1">
					<span className="text-[#8b949e] flex items-center">
						<HugeiconsIcon icon={StarIcon} size={12} />
					</span>
					<span className="font-semibold text-[#e6edf3]">67</span>
					<span className="text-[#8b949e]">followers</span>
				</div>
				<div className="flex items-center gap-1">
					<span className="font-semibold text-[#e6edf3]">11</span>
					<span className="text-[#8b949e]">following</span>
				</div>
			</div>

			<div className="flex items-center justify-between mb-2">
				<div className="text-[11px] text-[#8b949e]">Contributions this year</div>
				{total !== undefined && (
					<div className="text-sm font-semibold text-[#e6edf3] tracking-[-0.02em]">
						{total.toLocaleString()}
					</div>
				)}
			</div>
			<GithubGraph compact />
		</div>
	);
}

function TwitterPreview() {
	return (
		<div className="bg-black border border-[#2f3336] rounded-xl overflow-hidden w-[280px] shadow-2xl font-sans text-[#e7e9ea]">
			{/* Banner */}
			<img
				src="/twitter-banner.webp"
				alt=""
				className="w-full h-[72px] object-cover object-center"
			/>

			<div className="px-4 pb-4 relative">
				<img
					src={AVATAR_URL}
					alt="avatar"
					width={44}
					height={44}
					className="rounded-full border-[3px] border-black absolute -top-[22px] left-4 shrink-0 w-11 h-11"
				/>
				<div className="pt-7">
					<div className="font-bold text-[15px] text-[#e7e9ea] leading-tight">aryan</div>
					<div className="text-xs text-[#71767b] mb-2">@aryanranderiya · 13.8K posts</div>
					<p className="text-[13px] text-[#e7e9ea] leading-relaxed mb-3">
						founder &amp; ceo <span className="text-[#1d9bf0]">@madebyexp</span>. building{' '}
						<span className="text-[#1d9bf0]">@trygaia</span>
					</p>
					<div className="flex gap-4 pt-2.5 border-t border-[#2f3336] text-xs">
						<div>
							<span className="font-bold text-[13px] text-[#e7e9ea]">767 </span>
							<span className="text-[#71767b]">Following</span>
						</div>
						<div>
							<span className="font-bold text-[13px] text-[#e7e9ea]">952 </span>
							<span className="text-[#71767b]">Followers</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function LinkedInPreview() {
	return (
		<div className="bg-[#1b1f23] border border-[#283339] rounded-xl overflow-hidden w-[260px] shadow-xl font-sans text-[#e7e9ea]">
			<img
				src="/linkedin-banner.webp"
				alt=""
				className="w-full h-[52px] object-cover object-center"
			/>
			<div className="px-4 pb-4 relative">
				<img
					src={AVATAR_URL}
					alt="avatar"
					width={48}
					height={48}
					className="rounded-full border-[3px] border-[#1b1f23] absolute -top-6 left-4 w-12 h-12"
				/>
				<div className="pt-8">
					<div className="font-bold text-sm text-[#e7e9ea] mb-0.5">Aryan Randeriya</div>
					<div className="text-xs text-[#a8a8a8] leading-snug">
						Founder &amp; CEO · The Experience Company
					</div>
					<div className="border-t border-[#283339] mt-2.5 pt-2.5">
						<div className="text-xs text-[#a8a8a8] leading-relaxed">
							I design and build cool stuff · heygaia.io · aryanranderiya.com
						</div>
					</div>
				</div>
			</div>
			<div className="border-t border-[#283339] px-4 py-2.5 bg-[rgba(0,119,181,0.08)]">
				<span className="text-xs text-[#0077b5] font-semibold">View full profile</span>
			</div>
		</div>
	);
}

function InstagramPreview() {
	return (
		<div className="bg-black border border-[#262626] rounded-xl p-4 w-[260px] shadow-2xl font-sans text-[#f5f5f5]">
			<div className="flex items-center gap-3 mb-3">
				<div className="p-[2px] rounded-full shrink-0 bg-[linear-gradient(45deg,#f09433_0%,#e6683c_25%,#dc2743_50%,#cc2366_75%,#bc1888_100%)]">
					<div className="bg-black rounded-full p-[2px]">
						<img
							src={AVATAR_URL}
							alt="avatar"
							width={36}
							height={36}
							className="rounded-full block w-9 h-9 shrink-0"
						/>
					</div>
				</div>
				<div className="min-w-0">
					<div className="font-semibold text-sm text-[#f5f5f5] leading-tight">aryanranderiya</div>
					<div className="text-xs text-[#a8a8a8] leading-tight">A'</div>
				</div>
			</div>
			<p className="text-xs text-[#f5f5f5] leading-relaxed mb-3">the world is yours</p>
			<div className="flex pt-3 border-t border-[#262626]">
				{[
					{ value: '1', label: 'post' },
					{ value: '543', label: 'followers' },
					{ value: '534', label: 'following' },
				].map((stat, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: static array, order never changes
						key={i}
						className={`flex-1 text-center ${i < 2 ? 'border-r border-[#262626]' : ''}`}
					>
						<div className="font-bold text-sm text-[#f5f5f5]">{stat.value}</div>
						<div className="text-[11px] text-[#a8a8a8]">{stat.label}</div>
					</div>
				))}
			</div>
		</div>
	);
}

interface PbEntry {
	wpm: number;
	raw: number;
	acc: number;
}
function bestPb(arr: PbEntry[]): PbEntry | null {
	if (!arr?.length) return null;
	return arr.reduce((best, cur) => (cur.wpm > best.wpm ? cur : best), arr[0]);
}

function fmtTime(seconds: number): string {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

async function fetchMonkeytype() {
	const res = await fetch('https://api.monkeytype.com/users/aryanranderiya/profile');
	if (!res.ok) throw new Error('Failed to fetch');
	const json = await res.json();
	const d = json.data;
	const pb = d?.personalBests?.time ?? {};
	return {
		modes: [
			{ label: '15s', pb: bestPb(pb['15']) },
			{ label: '30s', pb: bestPb(pb['30']) },
			{ label: '60s', pb: bestPb(pb['60']) },
		],
		tests: d?.typingStats?.completedTests ?? null,
		timeTyping: d?.typingStats?.timeTyping ?? null,
		streak: d?.streak ?? null,
		maxStreak: d?.maxStreak ?? null,
		rank15: d?.allTimeLbs?.time?.['15']?.english?.rank ?? null,
		rank60: d?.allTimeLbs?.time?.['60']?.english?.rank ?? null,
	};
}

function MonkeytypePreview() {
	const { data, isLoading } = useQuery({
		queryKey: ['monkeytype', 'aryanranderiya'],
		queryFn: fetchMonkeytype,
	});

	return (
		<div
			className="bg-[#323437] border border-[#2c2e31] rounded-xl p-4 w-[360px] shadow-2xl text-[#d1d0c5]"
			// biome-ignore lint/nursery/noInlineStyles: fontFamily with fallbacks has no Tailwind equivalent
			style={{ fontFamily: '"Roboto Mono", "Courier New", monospace' }}
		>
			{/* Header */}
			<div className="flex items-center justify-between mb-3">
				<div className="flex items-center gap-2.5">
					<HugeiconsIcon icon={KeyboardIcon} size={20} />
					<div>
						<div className="text-[17px] font-bold text-[#e2b714] tracking-tight leading-none">
							monkeytype
						</div>
						<div className="text-[13px] text-[#646669] mt-1">aryanranderiya</div>
					</div>
				</div>
				{!isLoading && data?.streak != null && (
					<div className="text-right">
						<div className="text-2xl font-bold text-[#e2b714]">{data.streak}d</div>
						<div className="text-[12px] text-[#646669]">streak</div>
					</div>
				)}
			</div>

			{/* PB table */}
			<div className="border-t border-[#2c2e31] pt-2 mb-3">
				<div className="grid grid-cols-4 gap-2 mb-1">
					{['mode', 'wpm', 'raw', 'acc'].map((h) => (
						<div
							key={h}
							className="text-[12px] text-[#646669] uppercase tracking-wider text-center first:text-left"
						>
							{h}
						</div>
					))}
				</div>
				{isLoading
					? [0, 1, 2].map((i) => (
							<div key={i} className="grid grid-cols-4 gap-2 py-2">
								{[0, 1, 2, 3].map((j) => (
									<div key={j} className="text-[14px] text-[#646669] text-center first:text-left">
										···
									</div>
								))}
							</div>
						))
					: data?.modes.map(({ label, pb }) => (
							<div
								key={label}
								className="grid grid-cols-4 gap-2 py-1.5 border-b border-[#2c2e31] last:border-0"
							>
								<div className="text-[14px] text-[#646669]">{label}</div>
								<div className="text-[17px] text-[#e2b714] font-bold text-center">
									{pb ? Math.round(pb.wpm) : '-'}
								</div>
								<div className="text-[14px] text-[#d1d0c5] text-center">
									{pb ? Math.round(pb.raw) : '-'}
								</div>
								<div className="text-[14px] text-[#d1d0c5] text-center">
									{pb ? `${Math.round(pb.acc)}%` : '-'}
								</div>
							</div>
						))}
			</div>

			{/* Footer stats */}
			<div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#2c2e31]">
				{[
					{ label: 'tests', value: isLoading ? '···' : (data?.tests?.toLocaleString() ?? '-') },
					{
						label: 'time',
						value: isLoading ? '···' : data?.timeTyping ? fmtTime(data.timeTyping) : '-',
					},
					{
						label: 'top rank',
						value: isLoading ? '···' : data?.rank15 ? `#${data.rank15.toLocaleString()}` : '-',
					},
				].map((s) => (
					<div key={s.label} className="text-center">
						<div className="text-[17px] font-bold text-[#d1d0c5] leading-tight">{s.value}</div>
						<div className="text-[12px] text-[#646669] mt-1">{s.label}</div>
					</div>
				))}
			</div>
		</div>
	);
}

// ── Social data ───────────────────────────────────────────────────────────────

interface SocialItem {
	id: string;
	label: string;
	href: string;
	icon: React.ReactNode;
	preview: React.ReactNode;
}

const SOCIALS: SocialItem[] = [
	{
		id: 'github',
		label: 'GitHub',
		href: 'https://github.com/aryanranderiya',
		icon: <GitHubLogo size={15} />,
		preview: <GitHubPreview />,
	},
	{
		id: 'twitter',
		label: 'Twitter / X',
		href: 'https://twitter.com/aryanranderiya',
		icon: <TwitterLogo size={15} />,
		preview: <TwitterPreview />,
	},
	{
		id: 'linkedin',
		label: 'LinkedIn',
		href: 'https://linkedin.com/in/aryanranderiya',
		icon: <LinkedInLogo size={15} />,
		preview: <LinkedInPreview />,
	},
	{
		id: 'instagram',
		label: 'Instagram',
		href: 'https://instagram.com/aryanranderiya',
		icon: <InstagramLogo size={15} />,
		preview: <InstagramPreview />,
	},
	{
		id: 'monkeytype',
		label: 'Monkeytype',
		href: 'https://monkeytype.com/profile/aryanranderiya',
		icon: <HugeiconsIcon icon={KeyboardIcon} size={15} />,
		preview: <MonkeytypePreview />,
	},
];

// ── Preview popover ───────────────────────────────────────────────────────────

interface PreviewCardProps {
	visible: boolean;
	rect: DOMRect;
	children: React.ReactNode;
	onMouseEnter: () => void;
	onMouseLeave: () => void;
}

function PreviewCard({ visible, rect, children, onMouseEnter, onMouseLeave }: PreviewCardProps) {
	const above = rect.top > window.innerHeight * 0.55;
	const anchorY = above ? rect.top : rect.bottom;
	const anchorX = rect.left + rect.width / 2;

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: hover-only tooltip container, no keyboard equivalent needed
		<div
			className="fixed z-[200]"
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			// biome-ignore lint/nursery/noInlineStyles: dynamic tooltip position and visibility from mouse coordinates
			style={{
				top: anchorY,
				left: anchorX,
				transform: `translateX(-50%) translateY(${above ? 'calc(-100% - 4px)' : '4px'})`,
				opacity: visible ? 1 : 0,
				pointerEvents: visible ? 'auto' : 'none',
				transition: 'opacity 0.15s ease',
			}}
		>
			{children}
		</div>
	);
}

// ── Chip ──────────────────────────────────────────────────────────────────────

interface SocialChipProps {
	social: SocialItem;
	activeId: string | null;
	setActiveId: (id: string | null) => void;
	leaveTimer: React.MutableRefObject<ReturnType<typeof setTimeout> | undefined>;
}

function SocialChip({ social, activeId, setActiveId, leaveTimer }: SocialChipProps) {
	const hovered = activeId === social.id;
	const [rect, setRect] = useState<DOMRect | null>(null);
	const anchorRef = useRef<HTMLDivElement>(null);

	const show = useCallback(() => {
		clearTimeout(leaveTimer.current);
		if (anchorRef.current) setRect(anchorRef.current.getBoundingClientRect());
		setActiveId(social.id);
	}, [social.id, setActiveId, leaveTimer]);

	// Small delay when leaving anchor so the user can reach the popover card
	const hideFromAnchor = useCallback(() => {
		leaveTimer.current = setTimeout(() => setActiveId(null), 150);
	}, [setActiveId, leaveTimer]);

	// Instant hide when leaving the popover card itself
	const hideFromCard = useCallback(() => {
		clearTimeout(leaveTimer.current);
		setActiveId(null);
	}, [setActiveId, leaveTimer]);

	return (
		<>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: hover-only anchor wrapper, no keyboard equivalent needed */}
			<div
				ref={anchorRef}
				className="inline-flex"
				onMouseEnter={show}
				onMouseLeave={hideFromAnchor}
			>
				<a
					href={social.href}
					target="_blank"
					rel="noopener noreferrer"
					className={[
						'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] outline-none',
						'text-xs font-medium tracking-[-0.01em] whitespace-nowrap select-none no-underline',
						'transition-all duration-150',
						hovered
							? 'bg-[var(--muted-bg)] text-[var(--text-primary)] -translate-y-px'
							: 'bg-transparent text-[var(--text-muted)] translate-y-0',
					].join(' ')}
				>
					<span
						className={`flex items-center transition-opacity duration-150 ${hovered ? 'opacity-100' : 'opacity-65'}`}
					>
						{social.icon}
					</span>
					{social.label}
				</a>
			</div>
			{rect &&
				typeof document !== 'undefined' &&
				createPortal(
					<PreviewCard
						visible={hovered}
						rect={rect}
						onMouseEnter={show}
						onMouseLeave={hideFromCard}
					>
						{social.preview}
					</PreviewCard>,
					document.body
				)}
		</>
	);
}

// ── Export ────────────────────────────────────────────────────────────────────

function SocialsGridInner() {
	const [activeId, setActiveId] = useState<string | null>(null);
	const leaveTimer = useRef<ReturnType<typeof setTimeout>>();

	useEffect(() => () => clearTimeout(leaveTimer.current), []);

	return (
		<div className="flex flex-wrap gap-2 items-center">
			{SOCIALS.map((social) => (
				<SocialChip
					key={social.id}
					social={social}
					activeId={activeId}
					setActiveId={setActiveId}
					leaveTimer={leaveTimer}
				/>
			))}
		</div>
	);
}

export default function SocialsGrid() {
	return (
		<QueryClientProvider client={queryClient}>
			<SocialsGridInner />
		</QueryClientProvider>
	);
}
