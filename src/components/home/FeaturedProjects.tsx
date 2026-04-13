'use client';

import { motion } from 'motion/react';
import { ChevronRight } from '@icons';
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
  date?: string;
}

const EASE = [0.19, 1, 0.22, 1] as const;

function formatStatus(status: string): string | undefined {
  if (status === 'in-progress') return 'In Progress';
  return undefined;
}

export default function FeaturedProjects({ projects }: { projects: Project[] }) {
  const featured = projects.filter(p => p.featured);
  return (
    <section className="pb-12">
      {/* Section label */}
      <div className="section-header">Selected Work</div>

      {/* Cards */}
      <div className="flex flex-col gap-2">
        {featured.map((project, i) => {
          const statusLabel = formatStatus(project.status);
          const year = project.date ? new Date(project.date).getFullYear().toString() : undefined;
          return (
            <motion.a
              key={project.slug}
              href={`/projects/${project.slug}`}
              initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, ease: EASE, delay: i * 0.05 }}
              className="block no-underline rounded-[14px] px-4 py-[14px] transition-[filter] duration-150 hover:brightness-[0.97]"
              style={{ background: 'color-mix(in srgb, var(--muted-bg) 70%, transparent)' }}
            >
              {/* Header row */}
              <div className="flex items-center gap-2 mb-[6px]">
                <span className="text-[14px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                  {project.title}
                </span>
                {statusLabel && (
                  <span className="text-[10px] px-[7px] py-[1px] rounded-full bg-[rgba(0,187,255,0.1)] text-[#00bbff] font-medium">
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
                {project.tech.map(tag => {
                  const iconUrl = getTechIconUrl(tag);
                  return (
                    <span key={tag} className="tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {iconUrl && (
                        <img
                          src={iconUrl}
                          alt={tag}
                          width={11}
                          height={11}
                          style={{ objectFit: 'contain', flexShrink: 0 }}
                          loading="lazy"
                        />
                      )}
                      {tag}
                    </span>
                  );
                })}
              </div>
            </motion.a>
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
  );
}
