'use client';

import { motion } from 'framer-motion';

const BLUR_FADE = {
  initial: { opacity: 0, y: 6, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
};

const EASE = [0.19, 1, 0.22, 1] as const;

export default function Hero() {
  return (
    <section style={{ paddingTop: 80, paddingBottom: 48 }}>
      {/* Label */}
      <motion.div
        {...BLUR_FADE}
        transition={{ duration: 0.4, ease: EASE, delay: 0 }}
        style={{
          fontSize: 11,
          color: 'var(--text-ghost)',
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          fontWeight: 500,
          marginBottom: 32,
        }}
      >
        Aryan Randeriya
      </motion.div>

      {/* Headline */}
      <motion.h1
        {...BLUR_FADE}
        transition={{ duration: 0.4, ease: EASE, delay: 0.06 }}
        style={{
          fontSize: 36,
          fontWeight: 600,
          letterSpacing: '-0.035em',
          lineHeight: 1.1,
          color: 'var(--text-primary)',
          margin: 0,
          marginBottom: 16,
        }}
      >
        Founder, designer,
        <br />
        and developer.
      </motion.h1>

      {/* Bio */}
      <motion.p
        {...BLUR_FADE}
        transition={{ duration: 0.4, ease: EASE, delay: 0.12 }}
        style={{
          fontSize: 14,
          color: 'var(--text-muted)',
          maxWidth: 440,
          lineHeight: 1.65,
          margin: 0,
          marginBottom: 12,
        }}
      >
        Currently building GAIA — an AI companion for iOS and Android. Previously a freelance designer and developer.
      </motion.p>
      <motion.p
        {...BLUR_FADE}
        transition={{ duration: 0.4, ease: EASE, delay: 0.16 }}
        style={{
          fontSize: 14,
          color: 'var(--text-muted)',
          maxWidth: 440,
          lineHeight: 1.65,
          margin: 0,
          marginBottom: 28,
        }}
      >
        CS student at Pandit Deendayal Energy University with a background in graphic design — esports banners, apparel, thumbnails. Now focused on full-stack product work with React, React Native, Python, and TypeScript.
      </motion.p>

      {/* Links */}
      <motion.div
        {...BLUR_FADE}
        transition={{ duration: 0.4, ease: EASE, delay: 0.22 }}
        style={{ display: 'flex', gap: 20 }}
      >
        {[
          { label: 'Work', href: '/projects' },
          { label: 'Writing', href: '/blog' },
        ].map(({ label, href }) => (
          <a
            key={href}
            href={href}
            className="hero-link"
            style={{
              fontSize: 13,
              color: 'var(--text-muted)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              transition: 'color 150ms ease',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)')}
          >
            → {label}
          </a>
        ))}
      </motion.div>
    </section>
  );
}
