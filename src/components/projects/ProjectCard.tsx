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
	tech: string[];
	type: string;
	featured: boolean;
	images: string[];
	url?: string;
	github?: string;
	coverImage?: string;
}

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
				className={`dim-list-row flex min-w-0 cursor-pointer items-center gap-3 rounded-[10px] px-3 py-[9px] transition-[background] duration-[120ms] ${hovered ? 'bg-[var(--muted-bg)]' : 'bg-transparent'}`}
			>
				{/* Left: title + type chip */}
				<div className="flex min-w-0 shrink items-center gap-1.5">
					<span
						// biome-ignore lint/nursery/noInlineStyles: view-transition-name must be unique per slug
						style={{ viewTransitionName: `project-title-${project.slug}` }}
						className={`truncate font-medium text-[13px] tracking-[-0.02em] transition-colors duration-[120ms] ${hovered ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
					>
						{project.title}
					</span>
					<span className="shrink-0 rounded-full bg-[var(--muted-bg)] px-[7px] py-[2px] text-[10px] text-[var(--text-ghost)] tracking-[0.01em]">
						{typeLabel}
					</span>
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
