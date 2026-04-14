'use client';

import { Briefcase01Icon, ChevronRight, HugeiconsIcon } from '@icons';
import { motion } from 'motion/react';
import { useState } from 'react';
import type { Experience } from '@/data/experience';
import { experience } from '@/data/experience';

const EMPLOYMENT_LABELS: Record<Experience['employmentType'], string> = {
	'full-time': 'Full-time',
	internship: 'Internship',
	freelance: 'Freelance',
	volunteer: 'Volunteer',
	contract: 'Contract',
};

function LogoAvatar({
	company,
	logo,
	logoInvert,
	size = 28,
}: {
	company: string;
	logo?: string;
	logoInvert?: boolean;
	size?: number;
}) {
	const [imgError, setImgError] = useState(false);

	if (logo && !imgError) {
		return (
			<img
				src={logo}
				alt={company}
				width={size}
				height={size}
				onError={() => setImgError(true)}
				className={`rounded-[6px] object-contain shrink-0 ${logoInvert ? 'invert dark:invert-0' : ''}`}
			/>
		);
	}

	return (
		<div
			className="flex items-center justify-center shrink-0 text-[var(--text-ghost)]"
			// biome-ignore lint/nursery/noInlineStyles: dynamic dimensions from size prop
			style={{ width: size, height: size }}
		>
			<HugeiconsIcon icon={Briefcase01Icon} size={Math.round(size * 0.57)} />
		</div>
	);
}

const containerVariants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.05,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 6 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.3,
			ease: [0.19, 1, 0.22, 1] as [number, number, number, number],
		},
	},
};

function ExperienceItem({
	exp,
	isLast,
	compact = false,
}: {
	exp: Experience;
	isLast: boolean;
	compact?: boolean;
}) {
	const period = `${exp.startDate} — ${exp.endDate}`;

	return (
		<motion.div
			variants={itemVariants}
			className={[
				'flex gap-3 items-start',
				compact ? 'py-[10px]' : 'py-4',
				isLast ? '' : 'border-b border-border',
			].join(' ')}
		>
			{/* Logo */}
			<div className="pt-[1px] shrink-0">
				<LogoAvatar company={exp.company} logo={exp.logo} logoInvert={exp.logoInvert} size={28} />
			</div>

			{/* Content */}
			<div className="flex-1 min-w-0">
				{/* Header row */}
				<div
					className={[
						'flex items-baseline flex-wrap gap-x-[10px] gap-y-1',
						compact ? 'mb-0' : 'mb-[2px]',
					].join(' ')}
				>
					{exp.website ? (
						<a
							href={exp.website}
							target="_blank"
							rel="noopener noreferrer"
							className="text-[13px] font-semibold text-[var(--text-secondary)] tracking-[-0.01em] transition-colors duration-150 hover:text-[var(--text-primary)] cursor-pointer no-underline"
						>
							{exp.company}
						</a>
					) : (
						<span className="text-[13px] font-semibold text-[var(--text-secondary)] tracking-[-0.01em] transition-colors duration-150 hover:text-[var(--text-primary)] cursor-default">
							{exp.company}
						</span>
					)}

					{!compact && (
						<span className="text-[12px] text-[var(--text-muted)] font-normal">{exp.role}</span>
					)}

					<span className="text-[11px] text-[var(--text-ghost)] ml-auto whitespace-nowrap">
						{period}
					</span>
				</div>

				{/* Role below company name in compact mode */}
				{compact && (
					<div className="text-[12px] text-[var(--text-ghost)] mb-0 mt-[1px]">{exp.role}</div>
				)}

				{/* Employment type + location */}
				{!compact && (
					<div
						className={[
							'text-[11px] text-[var(--text-ghost)] flex gap-[6px]',
							exp.description || exp.highlights.length > 0 || exp.skills.length > 0
								? 'mb-2'
								: 'mb-0',
						].join(' ')}
					>
						<span>{EMPLOYMENT_LABELS[exp.employmentType]}</span>
						{exp.location && (
							<>
								<span>·</span>
								<span>{exp.location}</span>
							</>
						)}
					</div>
				)}

				{/* Description */}
				{!compact && exp.description && (
					<p className="text-[12px] text-[var(--text-muted)] leading-[1.6] m-0 mb-2">
						{exp.description}
					</p>
				)}

				{/* Highlights */}
				{!compact && exp.highlights.length > 0 && (
					<ul className="list-none p-0 m-0 mb-2 flex flex-col gap-1">
						{exp.highlights.map((h, i) => (
							<li
								// biome-ignore lint/suspicious/noArrayIndexKey: static array, order never changes
								key={i}
								className="flex items-start gap-2 text-[12px] text-[var(--text-muted)] leading-[1.55]"
							>
								<span className="w-1 h-1 rounded-full bg-[var(--text-ghost)] shrink-0 mt-[6px]" />
								{h}
							</li>
						))}
					</ul>
				)}

				{/* Skill tags */}
				{!compact && exp.skills.length > 0 && (
					<div className="flex flex-wrap gap-1">
						{exp.skills.map((skill) => (
							<span
								key={skill}
								className="text-[10px] text-[var(--text-muted)] bg-[var(--muted-bg)] rounded-full px-2 py-[2px] font-medium tracking-[0.01em]"
							>
								{skill}
							</span>
						))}
					</div>
				)}
			</div>
		</motion.div>
	);
}

export default function ExperienceList({
	featuredOnly = false,
	compact = false,
	includeTypes,
	excludeTypes,
}: {
	featuredOnly?: boolean;
	compact?: boolean;
	includeTypes?: Experience['employmentType'][];
	excludeTypes?: Experience['employmentType'][];
}) {
	let items = featuredOnly
		? experience.filter((e) => e.featured !== false).slice(0, 6)
		: experience;
	if (includeTypes) items = items.filter((e) => includeTypes.includes(e.employmentType));
	if (excludeTypes) items = items.filter((e) => !excludeTypes.includes(e.employmentType));

	return (
		<section className="pb-12">
			{featuredOnly && (
				<motion.div
					initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
					whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
					viewport={{ once: true, margin: '-40px' }}
					transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
				>
					<div className="section-header">Experience</div>
				</motion.div>
			)}

			<motion.div
				variants={containerVariants}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, margin: '-40px' }}
			>
				{items.map((exp, i) => (
					<ExperienceItem
						key={`${exp.company}-${exp.startDate}`}
						exp={exp}
						isLast={i === items.length - 1}
						compact={compact}
					/>
				))}
			</motion.div>

			{featuredOnly && (
				<div className="mt-3 flex justify-end">
					<a
						href="/resume"
						className="text-[12px] font-medium text-[var(--text-secondary)] no-underline inline-flex items-center gap-1 bg-[var(--muted-bg)] rounded-full px-[14px] py-[6px] transition-[filter] duration-150 hover:brightness-[0.96]"
					>
						Full resume <ChevronRight size={12} />
					</a>
				</div>
			)}
		</section>
	);
}
