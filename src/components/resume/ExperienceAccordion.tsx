'use client';

import { useState, useRef } from 'react';
import { HugeiconsIcon, ArrowDown01Icon } from '@icons';

interface Experience {
  company: string;
  role: string;
  period: string;
  location?: string;
  logo?: string; // URL or undefined → letter avatar
  color?: string; // accent color for letter avatar bg
  description: string;
  highlights: string[];
  type?: 'work' | 'founder' | 'education';
}

const experiences: Experience[] = [
  {
    company: 'GAIA',
    role: 'Founder & Lead Developer',
    period: 'Jul 2024 — Present',
    location: 'Ahmedabad, India',
    logo: 'https://heygaia.io/favicon.ico',
    color: '#00bbff',
    description:
      'Building GAIA — an AI-powered personal companion platform exploring the future of human-AI interaction. Designed and developed the entire product end-to-end.',
    highlights: [
      'React Native + TypeScript mobile app with voice-first UX',
      'Python/FastAPI backend with OpenAI and custom model integrations',
      'Selected for buildspace nights & weekends S5',
      'Designed the full product experience from 0 → 1',
    ],
    type: 'founder',
  },
  {
    company: 'Freelance',
    role: 'Full-Stack Developer & Designer',
    period: '2022 — Present',
    location: 'Remote',
    color: '#6366f1',
    description:
      'Independent contractor building web and mobile products for startups and established companies. End-to-end: design → development → deployment.',
    highlights: [
      'Built BlinkAnalytics — analytics dashboard (React, TypeScript)',
      'Built MWI (Move With Intention) brand site — Next.js, TypeScript',
      'Built Rezrek — content e-commerce platform — React, Node.js, Redis',
      'Led web development for Encode PDEU, the university CS club',
      'Delivered Brushstroke Studio agency website in Astro',
    ],
    type: 'work',
  },
  {
    company: 'Encode PDEU',
    role: 'Web Development Lead',
    period: 'Aug 2023 — May 2024',
    location: 'PDEU, Ahmedabad',
    color: '#f59e0b',
    description:
      'Led the web development core committee of Encode — the Computer Science club at Pandit Deendayal Energy University.',
    highlights: [
      'Built and shipped the official Encode club website',
      'Mentored junior developers in React and modern web practices',
      'Organized coding events and hackathons for 200+ students',
    ],
    type: 'work',
  },
  {
    company: 'NASA Space Apps Hackathon',
    role: 'Lead Developer — Team SUSTAIN',
    period: 'Oct 2024',
    location: 'Global',
    color: '#0ea5e9',
    description:
      'Led development for SUSTAIN — a tool to analyze soil moisture and water data for farmers, built in 48 hours.',
    highlights: [
      'Finished Top 15 out of 100+ teams globally',
      'Built full React + TypeScript frontend in 48 hours',
      'Integrated NASA Earth data APIs for real-time soil moisture analysis',
    ],
    type: 'work',
  },
  {
    company: 'Pandit Deendayal Energy University',
    role: 'B.Tech — Computer Engineering',
    period: '2022 — 2026',
    location: 'Ahmedabad, India',
    color: '#10b981',
    description:
      'Bachelor of Technology in Computer Engineering. Coursework spanning algorithms, systems programming, computer architecture, AI, and networks.',
    highlights: [
      'Coursework: DSA, OS, Computer Networks, AI/ML, DBMS',
      'Active in hackathons and inter-college competitions',
      'Led the CS club web development committee',
    ],
    type: 'education',
  },
];

function LogoAvatar({
  company,
  logo,
  color,
  size = 36,
}: {
  company: string;
  logo?: string;
  color?: string;
  size?: number;
}) {
  const [imgError, setImgError] = useState(false);
  const letter = company.charAt(0).toUpperCase();
  const bg = color ?? '#52525b';

  if (logo && !imgError) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 8,
          overflow: 'hidden',
          background: 'var(--muted)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={logo}
          alt={company}
          width={size}
          height={size}
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        background: bg + '22',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: bg,
        fontWeight: 700,
        fontSize: size * 0.42,
        letterSpacing: '-0.02em',
      }}
    >
      {letter}
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <span style={{ transition: 'transform 0.25s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', color: 'var(--muted-foreground)', flexShrink: 0, display: 'flex' }}>
      <HugeiconsIcon icon={ArrowDown01Icon} size={16} />
    </span>
  );
}

function ExperienceItem({ exp, index }: { exp: Experience; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const bodyRef = useRef<HTMLDivElement>(null);

  return (
    <div
      style={{
        borderRadius: 'var(--radius-lg, 12px)',
        background: open ? 'var(--muted)' : 'transparent',
        transition: 'background 0.2s ease',
        overflow: 'hidden',
      }}
    >
      {/* Header row — always visible, clickable */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <LogoAvatar company={exp.company} logo={exp.logo} color={exp.color} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--foreground)',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {exp.company}
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--muted-foreground)',
              marginTop: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {exp.role}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 2,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>
            {exp.period}
          </span>
          {exp.location && (
            <span style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', opacity: 0.7, whiteSpace: 'nowrap' }}>
              {exp.location}
            </span>
          )}
        </div>

        <ChevronIcon open={open} />
      </button>

      {/* Expandable body */}
      <div
        ref={bodyRef}
        style={{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.28s ease',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div style={{ padding: '0 16px 16px 64px' }}>
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--muted-foreground)',
                lineHeight: 1.65,
                marginBottom: 12,
              }}
            >
              {exp.description}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {exp.highlights.map((h, i) => (
                <li
                  key={i}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.75rem', color: 'var(--muted-foreground)' }}
                >
                  <span style={{ color: 'var(--accent-blue)', flexShrink: 0, marginTop: 1, fontWeight: 600 }}>→</span>
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExperienceAccordion() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {experiences.map((exp, i) => (
        <ExperienceItem key={exp.company} exp={exp} index={i} />
      ))}
    </div>
  );
}
