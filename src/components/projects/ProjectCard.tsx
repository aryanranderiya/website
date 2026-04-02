'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon, LinkSquare02Icon } from '@icons';

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
  url?: string;
  github?: string;
  coverImage?: string;
}

export default function ProjectCard({
  project,
  index,
  onClick,
}: {
  project: Project;
  index: number;
  onClick: (project: Project) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => onClick(project)}
      className="group relative cursor-pointer"
      style={{
        background: 'var(--muted-bg)',
        borderRadius: 16,
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
        filter: hovered ? 'brightness(0.97)' : 'brightness(1)',
        transition: 'transform 150ms ease, filter 150ms ease',
        overflow: 'hidden',
      }}
    >
      {/* Cover image */}
      {project.coverImage && (
        <img
          src={project.coverImage}
          alt={project.title}
          loading="lazy"
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          style={{
            width: '100%',
            aspectRatio: '16/9',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      )}

      {/* Card content */}
      <div style={{ padding: '14px 16px' }}>
        {/* Title row with status badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              lineHeight: 1.3,
              margin: 0,
            }}
          >
            {project.title}
          </h3>
          {project.status === 'in-progress' && (
            <span
              style={{
                fontSize: '10px',
                padding: '1px 7px',
                borderRadius: '9999px',
                background: 'rgba(0,187,255,0.1)',
                color: '#00bbff',
                letterSpacing: '0.02em',
                fontWeight: 500,
                flexShrink: 0,
              }}
            >
              In Progress
            </span>
          )}
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              title="Visit project"
              style={{
                color: 'var(--text-ghost)',
                display: 'flex',
                alignItems: 'center',
                marginLeft: 'auto',
                transition: 'color 150ms ease',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-ghost)')}
            >
              <HugeiconsIcon icon={LinkSquare02Icon} size={12} />
            </a>
          )}
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            margin: '0 0 10px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
          }}
        >
          {project.description}
        </p>

        {/* Tech tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {project.tags.slice(0, 3).map(t => (
            <span
              key={t}
              style={{
                fontSize: '10px',
                padding: '2px 7px',
                borderRadius: '9999px',
                background: 'var(--border)',
                color: 'var(--text-muted)',
                letterSpacing: '0.01em',
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
