'use client';

import { ChevronRight } from '@icons';
import { LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { getTechIconUrl } from '../../utils/techIcons';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

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
	date?: string;
}

const EASE = [0.19, 1, 0.22, 1] as const;

function formatStatus(status: string): string | undefined {
	if (status === 'in-progress') return 'In Progress';
	return undefined;
}

export default function FeaturedProjects({ projects }: { projects: Project[] }) {
	const featured = projects.filter((p) => p.featured);
	return (
		<LazyMotion features={loadFeatures}>
			<section className="pb-12">
				{/* Section label */}
				<div className="section-header">Selected Work</div>

				{/* Cards */}
				<div className="flex flex-col gap-2">
					{featured.map((project, i) => {
						const statusLabel = formatStatus(project.status);
						const year = project.date ? new Date(project.date).getFullYear().toString() : undefined;
						return (
							<m.a
								key={project.slug}
								href={`/projects/${project.slug}`}
								initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
								whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
								viewport={{ once: true, margin: '-40px' }}
								transition={{ duration: 0.4, ease: EASE, delay: i * 0.05 }}
								className="block no-underline rounded-[14px] px-4 py-[14px] transition-[filter] duration-150 hover:brightness-[0.97] bg-[color-mix(in_srgb,var(--muted-bg)_70%,transparent)]"
							>
								{/* Header row */}
								<div className="flex items-center gap-2 mb-[6px]">
									<span className="text-[14px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
										{project.title}
									</span>
									{statusLabel && (
										<span className="text-[10px] px-[7px] py-[1px] rounded-full bg-[rgba(0,95,128,0.12)] text-[#005f80] font-medium">
											{statusLabel}
										</span>
									)}
									{year && (
										<span className="text-[11px] text-[var(--text-ghost)] ml-auto tabular-nums">
											{year}
										</span>
									)}
								</div>

								{/* Description */}
								<p className="text-[12px] text-[var(--text-muted)] m-0 mb-[10px] leading-[1.55] line-clamp-2">
									{project.description}
								</p>

								{/* Tech tags */}
								<div className="flex gap-[5px] flex-wrap">
									{project.tech.map((tag) => {
										const iconUrl = getTechIconUrl(tag);
										return (
											<span key={tag} className="tag inline-flex items-center gap-1">
												{iconUrl && (
													<img
														src={iconUrl}
														alt={tag}
														width={11}
														height={11}
														className="object-contain shrink-0"
														loading="lazy"
													/>
												)}
												{tag}
											</span>
										);
									})}
								</div>
							</m.a>
						);
					})}
				</div>

				{/* View all */}
				<div className="mt-4 flex justify-end">
					<a
						href="/projects"
						className="text-[12px] font-medium text-[var(--text-secondary)] no-underline inline-flex items-center gap-1 bg-[var(--muted-bg)] rounded-full px-[14px] py-[6px] transition-[filter] duration-150 hover:brightness-[0.96]"
					>
						View all projects <ChevronRight size={12} />
					</a>
				</div>
			</section>
		</LazyMotion>
	);
}
