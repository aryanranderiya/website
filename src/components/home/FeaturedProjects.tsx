'use client';

import { LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import SectionLink from '@/components/ui/SectionLink';
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
						const year = project.date ? new Date(project.date).getFullYear().toString() : undefined;
						return (
							<m.a
								key={project.slug}
								href={`/projects/${project.slug}`}
								initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
								whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
								viewport={{ once: true, margin: '-40px' }}
								transition={{ duration: 0.4, ease: EASE, delay: i * 0.05 }}
								className="block rounded-[14px] bg-[color-mix(in_srgb,var(--muted-bg)_70%,transparent)] px-4 py-[14px] no-underline transition-[filter] duration-150 hover:brightness-[0.97]"
							>
								{/* Header row */}
								<div className="mb-[6px] flex items-center gap-2">
									<span className="font-semibold text-[14px] text-[var(--text-primary)] tracking-[-0.02em]">
										{project.title}
									</span>
									{year && (
										<span className="ml-auto text-[11px] text-[var(--text-ghost)] tabular-nums">
											{year}
										</span>
									)}
								</div>

								{/* Description */}
								<p className="m-0 mb-[10px] line-clamp-2 text-[12px] text-[var(--text-muted)] leading-[1.55]">
									{project.description}
								</p>

								{/* Tech tags */}
								<div className="flex flex-wrap gap-[5px]">
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
														className="shrink-0 object-contain"
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
					<SectionLink href="/projects" label="View all projects" />
				</div>
			</section>
		</LazyMotion>
	);
}
