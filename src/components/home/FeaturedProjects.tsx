'use client';

import { motion } from 'framer-motion';

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
    tags: ['React Native', 'TypeScript', 'AI/ML'],
    href: '/projects',
    status: 'In Progress',
    year: '2025',
  },
  {
    title: 'TicketBus',
    description: 'Mobile app for real-time public transit ticketing and route tracking across Gujarat.',
    tags: ['React Native', 'Node.js', 'Maps'],
    href: '/projects',
    year: '2024',
  },
  {
    title: 'Blink Analytics',
    description: 'Analytics dashboard for client reporting — real-time metrics, custom charts, and data export.',
    tags: ['React', 'TypeScript', 'FastAPI'],
    href: '/projects',
    year: '2023',
  },
];

const EASE = [0.19, 1, 0.22, 1] as const;

export default function FeaturedProjects() {
  return (
    <section style={{ paddingBottom: 48 }}>
      {/* Section label */}
      <div className="section-header">Selected Work</div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {FEATURED.map((project, i) => (
          <motion.a
            key={project.title}
            href={project.href}
            initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, ease: EASE, delay: i * 0.05 }}
            style={{
              display: 'block',
              textDecoration: 'none',
              background: 'var(--muted-bg)',
              borderRadius: 10,
              padding: '14px 16px',
              transition: 'filter 150ms ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.filter = 'brightness(0.97)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.filter = 'brightness(1)'; }}
          >
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                {project.title}
              </span>
              {project.status && (
                <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 99, background: 'rgba(0,187,255,0.1)', color: '#00bbff', fontWeight: 500 }}>
                  {project.status}
                </span>
              )}
              {project.year && (
                <span style={{ fontSize: 11, color: 'var(--text-ghost)', marginLeft: 'auto', fontVariantNumeric: 'tabular-nums' }}>
                  {project.year}
                </span>
              )}
            </div>

            {/* Description */}
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, marginBottom: 10, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
              {project.description}
            </p>

            {/* Tags */}
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {project.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </motion.a>
        ))}
      </div>

      {/* View all */}
      <div style={{ marginTop: 16 }}>
        <a
          href="/projects"
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: 'var(--muted-bg)',
            borderRadius: 999,
            padding: '6px 14px',
            transition: 'filter 150ms ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.filter = 'brightness(0.96)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.filter = 'brightness(1)'; }}
        >
          View all projects →
        </a>
      </div>
    </section>
  );
}
