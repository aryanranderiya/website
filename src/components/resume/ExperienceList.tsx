'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { experience } from '@/data/experience';
import type { Experience } from '@/data/experience';

const EMPLOYMENT_LABELS: Record<Experience['employmentType'], string> = {
  'full-time': 'Full-time',
  internship: 'Internship',
  freelance: 'Freelance',
  volunteer: 'Volunteer',
  contract: 'Contract',
};

function CompanyFallbackIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  );
}

function LogoAvatar({ company, logo, size = 28 }: { company: string; logo?: string; size?: number }) {
  const [imgError, setImgError] = useState(false);

  if (logo && !imgError) {
    return (
      <img
        src={logo}
        alt={company}
        width={size}
        height={size}
        onError={() => setImgError(true)}
        style={{ borderRadius: 6, objectFit: 'contain', flexShrink: 0 }}
      />
    );
  }

  return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--text-ghost)' }}>
      <CompanyFallbackIcon size={Math.round(size * 0.57)} />
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

function ExperienceItem({ exp, isLast }: { exp: Experience; isLast: boolean }) {
  const period = `${exp.startDate} — ${exp.endDate}`;

  return (
    <motion.div
      variants={itemVariants}
      style={{
        padding: '16px 0',
        borderBottom: isLast ? 'none' : '1px solid var(--border)',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
      }}
    >
      {/* Logo */}
      <div style={{ paddingTop: 1, flexShrink: 0 }}>
        <LogoAvatar company={exp.company} logo={exp.logo} size={28} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            flexWrap: 'wrap',
            gap: '4px 10px',
            marginBottom: 2,
          }}
        >
          <span
            className="exp-company-name"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              letterSpacing: '-0.01em',
              transition: 'color 0.15s ease',
              cursor: exp.website ? 'pointer' : 'default',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
            }}
            onClick={() => {
              if (exp.website) window.open(exp.website, '_blank', 'noopener');
            }}
          >
            {exp.company}
          </span>

          <span
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              fontWeight: 400,
            }}
          >
            {exp.role}
          </span>

          <span
            style={{
              fontSize: 11,
              color: 'var(--text-ghost)',
              marginLeft: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            {period}
          </span>
        </div>

        {/* Employment type + location */}
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-ghost)',
            marginBottom: exp.description || exp.highlights.length > 0 || exp.skills.length > 0 ? 8 : 0,
            display: 'flex',
            gap: 6,
          }}
        >
          <span>{EMPLOYMENT_LABELS[exp.employmentType]}</span>
          {exp.location && (
            <>
              <span>·</span>
              <span>{exp.location}</span>
            </>
          )}
        </div>

        {/* Description */}
        {exp.description && (
          <p
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              margin: '0 0 8px 0',
            }}
          >
            {exp.description}
          </p>
        )}

        {/* Highlights */}
        {exp.highlights.length > 0 && (
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 0 8px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            {exp.highlights.map((h, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  lineHeight: 1.55,
                }}
              >
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: 'var(--text-ghost)',
                    flexShrink: 0,
                    marginTop: 6,
                  }}
                />
                {h}
              </li>
            ))}
          </ul>
        )}

        {/* Skill tags */}
        {exp.skills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {exp.skills.map((skill) => (
              <span
                key={skill}
                style={{
                  fontSize: 10,
                  color: 'var(--text-muted)',
                  background: 'var(--muted-bg)',
                  borderRadius: 999,
                  padding: '2px 8px',
                  fontWeight: 500,
                  letterSpacing: '0.01em',
                }}
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

export default function ExperienceList() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
    >
      {experience.map((exp, i) => (
        <ExperienceItem key={`${exp.company}-${exp.startDate}`} exp={exp} isLast={i === experience.length - 1} />
      ))}
    </motion.div>
  );
}
