'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { experience } from '@/data/experience';

const EASE = [0.19, 1, 0.22, 1] as const;

const LOGO_URLS: Record<string, string> = {
  'The Experience Company': 'https://www.google.com/s2/favicons?domain=heygaia.io&sz=128',
  'IGNOSIS':                'https://www.google.com/s2/favicons?domain=ignosis.ai&sz=128',
  'Encode PDEU':            'https://storage.googleapis.com/aryanranderiya-portfolio.appspot.com/ProjectMedia/Encode_Official%20Website/encode.png',
  'Developer Student Clubs PDEU': 'https://www.google.com/s2/favicons?domain=gdsc.community.dev&sz=128',
  'Rezrek':                 'https://www.google.com/s2/favicons?domain=rezrek.com&sz=128',
  'Govardhan Infotech':     'https://www.google.com/s2/favicons?domain=govardhaninfotech.com&sz=128',
  'Freelance':              null as unknown as string,
};

function CompanyFallbackIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  );
}

function LogoAvatar({ company }: { company: string }) {
  const [imgFailed, setImgFailed] = useState(false);
  const src = LOGO_URLS[company];

  if (!src || imgFailed) {
    return (
      <div style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--text-ghost)' }}>
        <CompanyFallbackIcon size={16} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={company}
      width={28}
      height={28}
      onError={() => setImgFailed(true)}
      style={{ objectFit: 'contain', borderRadius: 6, flexShrink: 0 }}
    />
  );
}

const TYPE_LABEL: Record<string, string> = {
  'full-time': 'Full-time',
  'internship': 'Internship',
  'freelance': 'Freelance',
  'volunteer': 'Volunteer',
  'contract': 'Contract',
};

export default function ExperienceStrip() {
  const featured = experience.filter(e => e.featured !== false).slice(0, 6);

  return (
    <section style={{ paddingBottom: 48 }}>
      <div className="section-header">Experience</div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {featured.map((exp, i) => (
          <motion.div
            key={exp.company + exp.role}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ duration: 0.35, ease: EASE, delay: i * 0.05 }}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: '12px 0',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <LogoAvatar company={exp.company} />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 2 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                    {exp.company}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>·</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', letterSpacing: '-0.01em' }}>
                    {exp.role}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-ghost)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                  {exp.startDate} – {exp.endDate}
                </span>
              </div>

              {exp.description && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0', lineHeight: 1.55, letterSpacing: '-0.005em' }}>
                  {exp.description}
                </p>
              )}

              {exp.skills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                  {exp.skills.slice(0, 4).map(skill => (
                    <span key={skill} className="tag">{skill}</span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
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
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.filter = 'brightness(0.96)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.filter = 'brightness(1)'; }}
        >
          Full resume →
        </a>
      </div>
    </section>
  );
}
