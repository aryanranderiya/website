'use client';

import { ArrowDown01Icon, HugeiconsIcon } from '@icons';
import { useState } from 'react';

interface Experience {
	company: string;
	role: string;
	period: string;
	location?: string;
	logo?: string; // URL or undefined → letter avatar
	color?: string; // accent color for letter avatar bg
	description: string;
	highlights: string[];
	type?: 'work' | 'founder' | 'education';
}

const experiences: Experience[] = [
	{
		company: 'GAIA',
		role: 'Founder & Lead Developer',
		period: 'Jul 2024 - Present',
		location: 'Ahmedabad, India',
		logo: 'https://heygaia.io/favicon.ico',
		color: '#00bbff',
		description:
			'Building GAIA - an AI-powered personal companion platform exploring the future of human-AI interaction. Designed and developed the entire product end-to-end.',
		highlights: [
			'React Native + TypeScript mobile app with voice-first UX',
			'Python/FastAPI backend with OpenAI and custom model integrations',
			'Selected for buildspace nights & weekends S5',
			'Designed the full product experience from 0 → 1',
		],
		type: 'founder',
	},
	{
		company: 'Freelance',
		role: 'Full-Stack Developer & Designer',
		period: '2022 - Present',
		location: 'Remote',
		color: '#6366f1',
		description:
			'Independent contractor building web and mobile products for startups and established companies. End-to-end: design → development → deployment.',
		highlights: [
			'Built BlinkAnalytics - analytics dashboard (React, TypeScript)',
			'Built MWI (Move With Intention) brand site - Next.js, TypeScript',
			'Built Rezrek - content e-commerce platform - React, Node.js, Redis',
			'Led web development for Encode PDEU, the university CS club',
			'Delivered Brushstroke Studio agency website in Astro',
		],
		type: 'work',
	},
	{
		company: 'Encode PDEU',
		role: 'Web Development Lead',
		period: 'Aug 2023 - May 2024',
		location: 'PDEU, Ahmedabad',
		color: '#f59e0b',
		description:
			'Led the web development core committee of Encode - the Computer Science club at Pandit Deendayal Energy University.',
		highlights: [
			'Built and shipped the official Encode club website',
			'Mentored junior developers in React and modern web practices',
			'Organized coding events and hackathons for 200+ students',
		],
		type: 'work',
	},
	{
		company: 'NASA Space Apps Hackathon',
		role: 'Lead Developer - Team SUSTAIN',
		period: 'Oct 2024',
		location: 'Global',
		color: '#0ea5e9',
		description:
			'Led development for SUSTAIN - a tool to analyze soil moisture and water data for farmers, built in 48 hours.',
		highlights: [
			'Finished Top 15 out of 100+ teams globally',
			'Built full React + TypeScript frontend in 48 hours',
			'Integrated NASA Earth data APIs for real-time soil moisture analysis',
		],
		type: 'work',
	},
	{
		company: 'Pandit Deendayal Energy University',
		role: 'B.Tech - Computer Engineering',
		period: '2022 - 2026',
		location: 'Ahmedabad, India',
		color: '#10b981',
		description:
			'Bachelor of Technology in Computer Engineering. Coursework spanning algorithms, systems programming, computer architecture, AI, and networks.',
		highlights: [
			'Coursework: DSA, OS, Computer Networks, AI/ML, DBMS',
			'Active in hackathons and inter-college competitions',
			'Led the CS club web development committee',
		],
		type: 'education',
	},
];

function LogoAvatar({
	company,
	logo,
	color,
	size = 36,
}: {
	company: string;
	logo?: string;
	color?: string;
	size?: number;
}) {
	const [imgError, setImgError] = useState(false);
	const letter = company.charAt(0).toUpperCase();
	const bg = color ?? '#52525b';

	if (logo && !imgError) {
		return (
			<div
				className="flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[var(--muted)]"
				// biome-ignore lint/nursery/noInlineStyles: dynamic dimensions from size prop
				style={{ width: size, height: size }}
			>
				<img
					src={logo}
					alt={company}
					width={size}
					height={size}
					onError={() => setImgError(true)}
					className="h-full w-full object-cover"
				/>
			</div>
		);
	}

	return (
		<div
			className="flex shrink-0 items-center justify-center rounded-lg font-bold tracking-[-0.02em]"
			// biome-ignore lint/nursery/noInlineStyles: dynamic dimensions, background, color, and fontSize from props
			style={{
				width: size,
				height: size,
				background: `${bg}22`,
				color: bg,
				fontSize: size * 0.42,
			}}
		>
			{letter}
		</div>
	);
}

function ChevronIcon({ open }: { open: boolean }) {
	return (
		<span
			className={`flex shrink-0 text-[var(--muted-foreground)] transition-transform duration-[250ms] ${open ? 'rotate-180' : 'rotate-0'}`}
		>
			<HugeiconsIcon icon={ArrowDown01Icon} size={16} />
		</span>
	);
}

function ExperienceItem({ exp, index }: { exp: Experience; index: number }) {
	const [open, setOpen] = useState(index === 0);

	return (
		<div
			className={`overflow-hidden rounded-xl transition-[background] duration-200 ${open ? 'bg-[var(--muted)]' : 'bg-transparent'}`}
		>
			{/* Header row -- always visible, clickable */}
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				className="flex w-full cursor-pointer select-none items-center gap-3 bg-transparent px-4 py-[14px] text-left"
			>
				<LogoAvatar company={exp.company} logo={exp.logo} color={exp.color} />

				<div className="min-w-0 flex-1">
					<div className="truncate font-semibold text-[0.875rem] text-[var(--foreground)] tracking-[-0.01em]">
						{exp.company}
					</div>
					<div className="mt-[2px] truncate text-[0.75rem] text-[var(--muted-foreground)]">
						{exp.role}
					</div>
				</div>

				<div className="flex shrink-0 flex-col items-end gap-[2px]">
					<span className="whitespace-nowrap text-[0.7rem] text-[var(--muted-foreground)]">
						{exp.period}
					</span>
					{exp.location && (
						<span className="whitespace-nowrap text-[0.65rem] text-[var(--muted-foreground)] opacity-70">
							{exp.location}
						</span>
					)}
				</div>

				<ChevronIcon open={open} />
			</button>

			{/* Expandable body -- CSS grid row animation */}
			<div
				className={`grid transition-[grid-template-rows] duration-[280ms] ${open ? '[grid-template-rows:1fr]' : '[grid-template-rows:0fr]'}`}
			>
				<div className="overflow-hidden">
					<div className="px-4 pb-4 pl-16">
						<p className="m-0 mb-3 text-[0.8125rem] text-[var(--muted-foreground)] leading-[1.65]">
							{exp.description}
						</p>
						<ul className="m-0 flex list-none flex-col gap-1.5 p-0">
							{exp.highlights.map((h, i) => (
								<li
									// biome-ignore lint/suspicious/noArrayIndexKey: static array, order never changes
									key={i}
									className="flex items-start gap-2 text-[0.75rem] text-[var(--muted-foreground)]"
								>
									<span className="mt-[1px] shrink-0 font-semibold text-[var(--accent-blue)]">
										→
									</span>
									{h}
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function ExperienceAccordion() {
	return (
		<div className="flex flex-col gap-1">
			{experiences.map((exp, i) => (
				<ExperienceItem key={exp.company} exp={exp} index={i} />
			))}
		</div>
	);
}
