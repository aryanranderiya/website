'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon, ArrowUpRight01Icon } from '@icons';
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

// "Projects" folder is default/uncategorized — no chip shown for it
const FOLDER_CHIP: Record<string, { bg: string; color: string; label: string }> = {
  Featured:  { bg: 'rgba(251,191,36,0.12)',  color: '#f59e0b', label: 'Featured'  },
  Client:    { bg: 'rgba(52,211,153,0.12)',   color: '#10b981', label: 'Freelance' },
  Hackathon: { bg: 'rgba(167,139,250,0.12)', color: '#a78bfa', label: 'Hackathon' },
};

const TYPE_LABELS: Record<string, string> = {
  web:     'Web',
  mobile:  'Mobile',
  game:    'Game',
  cli:     'CLI',
  desktop: 'Desktop',
  macos:   'macOS',
  os:      'macOS',
  other:   'Other',
  api:     'API',
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

  return (
    <motion.div
      ref={ref}
      variants={{
        hidden: { opacity: 0, y: 4 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.19, 1, 0.22, 1] as const } },
      }}
      onHoverStart={() => {
        setHovered(true);
        if (ref.current) onHoverChange?.({ project, index, el: ref.current });
      }}
      onHoverEnd={() => {
        setHovered(false);
        onHoverChange?.(null);
      }}
      onClick={() => { window.location.href = `/projects/${project.slug}`; }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '10px 12px',
        borderRadius: 10,
        cursor: 'pointer',
        background: hovered ? 'var(--muted-bg)' : 'transparent',
        transition: 'background 120ms ease',
        minWidth: 0,
      }}
    >
      {/* Title + description stacked */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: hovered ? 'var(--text-primary)' : 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              transition: 'color 120ms ease',
            }}
          >
            {project.title}
          </span>
          {project.status === 'in-progress' && (
            <span
              style={{
                fontSize: '9px',
                padding: '1px 6px',
                borderRadius: '9999px',
                background: 'rgba(0,187,255,0.1)',
                color: '#00bbff',
                fontWeight: 500,
                flexShrink: 0,
                letterSpacing: '0.02em',
              }}
            >
              WIP
            </span>
          )}
        </div>
        <span
          style={{
            fontSize: '11px',
            color: 'var(--text-ghost)',
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            letterSpacing: '-0.01em',
            lineHeight: 1.4,
          }}
        >
          {project.description}
        </span>
      </div>

      {/* Right side: type + tags + folder chip + arrow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {/* Type badge */}
        <span
          style={{
            fontSize: '10px',
            padding: '2px 7px',
            borderRadius: '9999px',
            background: 'var(--muted-bg)',
            color: 'var(--text-ghost)',
            letterSpacing: '0.01em',
          }}
        >
          {typeLabel}
        </span>

        {/* Tag chips */}
        {project.tags.slice(0, 2).map(t => {
          const iconUrl = getTechIconUrl(t);
          return (
            <span
              key={t}
              style={{
                fontSize: '10px',
                padding: '2px 7px',
                borderRadius: '9999px',
                background: 'var(--border)',
                color: 'var(--text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                transition: 'background 120ms ease',
              }}
            >
              {iconUrl && (
                <img
                  src={iconUrl}
                  alt={t}
                  width={10}
                  height={10}
                  style={{ objectFit: 'contain', flexShrink: 0 }}
                  loading="lazy"
                />
              )}
              {t}
            </span>
          );
        })}

        {chip && (
          <span
            style={{
              fontSize: '10px',
              padding: '2px 8px',
              borderRadius: '9999px',
              background: chip.bg,
              color: chip.color,
              fontWeight: 500,
              letterSpacing: '0.01em',
              flexShrink: 0,
            }}
          >
            {chip.label}
          </span>
        )}

        <div style={{ width: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                color: hovered ? 'var(--text-muted)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 120ms ease',
              }}
            >
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={13} color="currentColor" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
