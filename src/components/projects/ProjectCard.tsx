'use client';

import {
	ArrowUpRight01Icon,
	ComputerProgrammingIcon,
	ComputerTerminalIcon,
	GameController03Icon,
	HugeiconsIcon,
	MobileProgramming02Icon,
	WebDesignIcon,
} from '@icons';
import type { IconProps } from '@theexperiencecompany/gaia-icons';
import { motion } from 'motion/react';
import type { ComponentType } from 'react';
import { useRef, useState } from 'react';
import { getTechIconUrl } from '../../utils/techIcons';

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

// "Projects" folder is default/uncategorized - no chip shown for it
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

const TYPE_ICONS: Record<string, ComponentType<IconProps>> = {
	web: WebDesignIcon,
	mobile: MobileProgramming02Icon,
	cli: ComputerTerminalIcon,
	desktop: ComputerProgrammingIcon,
	macos: ComputerProgrammingIcon,
	os: ComputerProgrammingIcon,
	game: GameController03Icon,
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
	const _TypeIcon = TYPE_ICONS[project.type] ?? null;

	return (
		<motion.div
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
			className={`flex items-center gap-4 px-3 py-[10px] rounded-[10px] cursor-pointer min-w-0 transition-[background] duration-[120ms] ${hovered ? 'bg-[var(--muted-bg)]' : 'bg-transparent'}`}
		>
			{/* Title + description stacked */}
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-[7px] mb-[2px]">
					<span
						className={`text-[13px] font-semibold tracking-[-0.02em] truncate transition-colors duration-[120ms] ${hovered ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
					>
						{project.title}
					</span>
					{project.status === 'in-progress' && (
						<span className="text-[9px] px-[6px] py-[1px] rounded-full bg-[rgba(0,95,128,0.12)] text-[#005f80] font-medium shrink-0 tracking-[0.02em]">
							WIP
						</span>
					)}
				</div>
				<span className="text-[11px] text-[var(--text-ghost)] block truncate tracking-[-0.01em] leading-[1.4]">
					{project.description}
				</span>
			</div>

			{/* Right side: type + tags + folder chip + arrow */}
			<div className="flex items-center gap-1.5 shrink-0">
				{/* Type badge */}
				<span className="text-[10px] px-[7px] py-[2px] rounded-full bg-[var(--muted-bg)] text-[var(--text-ghost)] tracking-[0.01em]">
					{typeLabel}
				</span>

				{/* Tag chips */}
				{project.tags.slice(0, 2).map((t) => {
					const iconUrl = getTechIconUrl(t);
					return (
						<span
							key={t}
							className="text-[10px] px-[7px] py-[2px] rounded-full bg-[var(--border)] text-[var(--text-muted)] inline-flex items-center gap-[3px] transition-[background] duration-[120ms]"
						>
							{iconUrl && (
								<img
									src={iconUrl}
									alt={t}
									width={10}
									height={10}
									className="object-contain shrink-0"
									loading="lazy"
								/>
							)}
							{t}
						</span>
					);
				})}

				{chip && (
					<span
						className="text-[10px] px-2 py-[2px] rounded-full font-medium tracking-[0.01em] shrink-0"
						// biome-ignore lint/nursery/noInlineStyles: dynamic chip background and color from data
						style={{ background: chip.bg, color: chip.color }}
					>
						{chip.label}
					</span>
				)}

				<div className="w-4 flex items-center justify-center">
					{project.url && (
						<a
							href={project.url}
							target="_blank"
							rel="noopener noreferrer"
							onClick={(e) => e.stopPropagation()}
							className={`flex items-center transition-colors duration-[120ms] ${hovered ? 'text-[var(--text-muted)]' : 'text-transparent'}`}
						>
							<HugeiconsIcon icon={ArrowUpRight01Icon} size={13} color="currentColor" />
						</a>
					)}
				</div>
			</div>
		</motion.div>
	);
}
