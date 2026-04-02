'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon, Briefcase01Icon } from '@icons';
import { experience } from '@/data/experience';
import type { Experience } from '@/data/experience';

const EMPLOYMENT_LABELS: Record<Experience['employmentType'], string> = {
  'full-time': 'Full-time',
  internship: 'Internship',
  freelance: 'Freelance',
  volunteer: 'Volunteer',
  contract: 'Contract',
};

function LogoAvatar({ company, logo, logoInvert, size = 28 }: { company: string; logo?: string; logoInvert?: boolean; size?: number }) {
  const [imgError, setImgError] = useState(false);

  if (logo && !imgError) {
    return (
      <img
        src={logo}
        alt={company}
        width={size}
        height={size}
        onError={() => setImgError(true)}
        className={logoInvert ? 'exp-logo-invert' : undefined}
        style={{ borderRadius: 6, objectFit: 'contain', flexShrink: 0 }}
      />
    );
  }

  return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--text-ghost)' }}>
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

function ExperienceItem({ exp, isLast, compact = false }: { exp: Experience; isLast: boolean; compact?: boolean }) {
  const period = `${exp.startDate} — ${exp.endDate}`;

  return (
    <motion.div
      variants={itemVariants}
      style={{
        padding: compact ? '10px 0' : '16px 0',
        borderBottom: isLast ? 'none' : '1px solid var(--border)',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
      }}
    >
      {/* Logo */}
      <div style={{ paddingTop: 1, flexShrink: 0 }}>
        <LogoAvatar company={exp.company} logo={exp.logo} logoInvert={exp.logoInvert} size={28} />
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
            marginBottom: compact ? 0 : 2,
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

          {!compact && (
            <span
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                fontWeight: 400,
              }}
            >
              {exp.role}
            </span>
          )}

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

        {/* Role below company name in compact mode */}
        {compact && (
          <div style={{ fontSize: 12, color: 'var(--text-ghost)', marginBottom: 0, marginTop: 1 }}>
            {exp.role}
          </div>
        )}

        {/* Employment type + location */}
        {!compact && (
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
        )}

        {/* Description */}
        {!compact && exp.description && (
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
        {!compact && exp.highlights.length > 0 && (
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
        {!compact && exp.skills.length > 0 && (
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

export default function ExperienceList({ featuredOnly = false, compact = false }: { featuredOnly?: boolean; compact?: boolean }) {
  const items = featuredOnly
    ? experience.filter((e) => e.featured !== false).slice(0, 6)
    : experience;

  return (
    <section style={{ paddingBottom: 48 }}>
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
          <ExperienceItem key={`${exp.company}-${exp.startDate}`} exp={exp} isLast={i === items.length - 1} compact={compact} />
        ))}
      </motion.div>

      {featuredOnly && (
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <a
            href="/resume"
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
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.filter = 'brightness(0.96)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.filter = 'brightness(1)'; }}
          >
            Full resume →
          </a>
        </div>
      )}
      <style>{`
        .exp-logo-invert { filter: invert(1); }
        .dark .exp-logo-invert { filter: invert(0); }
      `}</style>
    </section>
  );
}
