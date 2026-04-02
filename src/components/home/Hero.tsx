'use client';

import { motion } from 'framer-motion';
import SocialsGrid from './SocialsGrid';

const BLUR_FADE = {
  initial: { opacity: 0, y: 6, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
};

const EASE = [0.19, 1, 0.22, 1] as const;

export default function Hero() {
  return (
    <section style={{ paddingTop: 16, paddingBottom: 48 }}>
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
        Currently building GAIA, an AI companion for iOS and Android. Previously a freelance designer and developer working with clients across branding, product design, and web.
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
        Born in{' '}
        <img src="https://em-content.zobj.net/source/apple/118/flag-for-united-kingdom_1f1ec-1f1e7.png" alt="UK" style={{ display: 'inline', verticalAlign: 'middle', width: 'auto', height: '1em', marginBottom: 1 }} />{' '}
        England, based in{' '}
        <img src="https://em-content.zobj.net/source/apple/118/flag-for-india_1f1ee-1f1f3.png" alt="India" style={{ display: 'inline', verticalAlign: 'middle', width: 'auto', height: '1em', marginBottom: 1 }} />{' '}
        India. CS graduate and design engineer who loves building things end-to-end — from the idea to the interface. I care about craft: clean code, considered design, and products that feel good to use.
      </motion.p>

      {/* Links */}
      <motion.div
        {...BLUR_FADE}
        transition={{ duration: 0.4, ease: EASE, delay: 0.22 }}
        style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}
      >
        {[
          { label: 'Work', href: '/projects' },
          { label: 'Blog', href: '/blog' },
        ].map(({ label, href }) => (
          <a
            key={href}
            href={href}
            style={{
              fontSize: 12,
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: 'var(--muted-bg)',
              borderRadius: 10,
              padding: '5px 12px',
              fontWeight: 500,
              transition: 'filter 150ms ease',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.filter = 'brightness(0.96)')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.filter = 'brightness(1)')}
          >
            {label} →
          </a>
        ))}
      </motion.div>

      {/* Socials */}
      <motion.div
        {...BLUR_FADE}
        transition={{ duration: 0.4, ease: EASE, delay: 0.28 }}
      >
        <SocialsGrid />
      </motion.div>
    </section>
  );
}
