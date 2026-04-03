'use client';

import { motion } from 'motion/react';
import { getTechIconUrl } from '../../utils/techIcons';

interface Project {
  title: string;
  description: string;
  tags: string[];
  href: string;
  status?: string;
  year?: string;
}

const FEATURED: Project[] = [
  {
    title: 'GAIA',
    description: 'An AI-powered personal companion exploring the future of human-AI interaction. Built for iOS and Android.',
    tags: ['React Native', 'TypeScript', 'FastAPI'],
    href: '/projects/gaia',
    status: 'In Progress',
    year: '2025',
  },
  {
    title: 'TicketBus',
    description: 'Public transportation app with QR-based ticketing, bus passes, e-wallets, and a comprehensive map module. Won 1st place in college Project Fair.',
    tags: ['Java', 'Android', 'Firebase'],
    href: '/projects/ticketbus',
    year: '2023',
  },
  {
    title: 'Blink Analytics',
    description: 'Analytics dashboard for client reporting — real-time metrics, custom charts, and data export.',
    tags: ['React', 'TypeScript', 'TailwindCSS'],
    href: '/projects/blink-analytics',
    year: '2025',
  },
];

const EASE = [0.19, 1, 0.22, 1] as const;

export default function FeaturedProjects() {
  return (
    <section className="pb-12">
      {/* Section label */}
      <div className="section-header">Selected Work</div>

      {/* Cards */}
      <div className="flex flex-col gap-2">
        {FEATURED.map((project, i) => (
          <motion.a
            key={project.title}
            href={project.href}
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
              {project.status && (
                <span className="text-[10px] px-[7px] py-[1px] rounded-full bg-[rgba(0,187,255,0.1)] text-[#00bbff] font-medium">
                  {project.status}
                </span>
              )}
              {project.year && (
                <span className="text-[11px] text-[var(--text-ghost)] ml-auto tabular-nums">
                  {project.year}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-[12px] text-[var(--text-muted)] m-0 mb-[10px] leading-[1.55] line-clamp-2">
              {project.description}
            </p>

            {/* Tags */}
            <div className="flex gap-[5px] flex-wrap">
              {project.tags.map(tag => {
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
        ))}
      </div>

      {/* View all */}
      <div className="mt-4 flex justify-end">
        <a
          href="/projects"
          className="text-[12px] font-medium text-[var(--text-secondary)] no-underline inline-flex items-center gap-1 bg-[var(--muted-bg)] rounded-full px-[14px] py-[6px] transition-[filter] duration-150 hover:brightness-[0.96]"
        >
          View all projects →
        </a>
      </div>
    </section>
  );
}
