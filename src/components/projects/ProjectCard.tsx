'use client';

import { LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { useRef, useState } from 'react';

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

const FOLDER_CHIP: Record<string, { bg: string; color: string; label: string }> = {
	Featured: { bg: 'rgba(251,191,36,0.12)', color: '#f59e0b', label: 'Featured' },
	Client: { bg: 'rgba(52,211,153,0.12)', color: '#10b981', label: 'Freelance' },
	Hackathon: { bg: 'rgba(167,139,250,0.12)', color: '#a78bfa', label: 'Hackathon' },
};

const TYPE_LABELS: Record<string, string> = {
	web: 'Web',
	mobile: 'Mobile',
	game: 'Game',
	cli: 'CLI',
	desktop: 'Desktop',
	macos: 'macOS',
	os: 'macOS',
	other: 'Other',
	api: 'API',
};

export default function ProjectCard({
	project,
	index,
	onHoverChange,
}: {
	project: Project;
	index: number;
	onHoverChange?: (data: { project: Project; index: number; el: HTMLElement } | null) => void;
}) {
	const [hovered, setHovered] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const chip = FOLDER_CHIP[project.folder];
	const typeLabel = TYPE_LABELS[project.type] ?? project.type;

	return (
		<LazyMotion features={loadFeatures}>
			<m.div
				ref={ref}
				variants={{
					hidden: { opacity: 0, y: 4 },
					show: {
						opacity: 1,
						y: 0,
						transition: { duration: 0.3, ease: [0.19, 1, 0.22, 1] as const },
					},
				}}
				onHoverStart={() => {
					setHovered(true);
					if (ref.current) onHoverChange?.({ project, index, el: ref.current });
				}}
				onHoverEnd={() => {
					setHovered(false);
					onHoverChange?.(null);
				}}
				onClick={() => {
					window.location.href = `/projects/${project.slug}`;
				}}
				className={`flex min-w-0 cursor-pointer items-center gap-3 rounded-[10px] px-3 py-[9px] transition-[background] duration-[120ms] ${hovered ? 'bg-[var(--muted-bg)]' : 'bg-transparent'}`}
			>
				{/* Left: title + single chip — folder chip takes priority over type */}
				<div className="flex min-w-0 shrink items-center gap-1.5">
					<span
						className={`truncate font-medium text-[13px] tracking-[-0.02em] transition-colors duration-[120ms] ${hovered ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
					>
						{project.title}
					</span>
					{chip ? (
						<span
							className="shrink-0 rounded-full px-2 py-[2px] font-medium text-[10px] tracking-[0.01em]"
							// biome-ignore lint/nursery/noInlineStyles: dynamic chip background and color from data
							style={{ background: chip.bg, color: chip.color }}
						>
							{chip.label}
						</span>
					) : (
						<span className="shrink-0 rounded-full bg-[var(--muted-bg)] px-[7px] py-[2px] text-[10px] text-[var(--text-ghost)] tracking-[0.01em]">
							{typeLabel}
						</span>
					)}
				</div>

				{/* Right: short description */}
				{project.shortDescription && (
					<span className="ml-auto max-w-[42%] shrink-0 truncate text-right text-[12px] text-[var(--text-ghost)] tracking-[-0.01em]">
						{project.shortDescription}
					</span>
				)}
			</m.div>
		</LazyMotion>
	);
}
