'use client';

import { motion } from 'motion/react';

const EASE = [0.19, 1, 0.22, 1] as const;

const SOCIALS = [
  {
    name: 'GitHub',
    url: 'https://github.com/aryanranderiya',
    domain: 'github.com',
  },
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com/in/aryanranderiya',
    domain: 'linkedin.com',
  },
  {
    name: 'Twitter',
    url: 'https://twitter.com/aryanranderiya',
    domain: 'twitter.com',
  },
  {
    name: 'Instagram',
    url: 'https://instagram.com/aryanranderiya',
    domain: 'instagram.com',
  },
  {
    name: 'Behance',
    url: 'https://behance.net/aryanranderiya',
    domain: 'behance.net',
  },
  {
    name: 'Stack Overflow',
    url: 'https://stackoverflow.com/users/21615084/aryan',
    domain: 'stackoverflow.com',
  },
  {
    name: 'Monkeytype',
    url: 'https://monkeytype.com/profile/aryanranderiya',
    domain: 'monkeytype.com',
  },
  {
    name: 'Discord',
    url: 'https://discord.com/users/521279231284609032',
    domain: 'discord.com',
  },
];

export default function SocialsRow() {
  return (
    <div>
      <div className="section-header">Online</div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        {SOCIALS.map((social, i) => (
          <motion.a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, ease: EASE, delay: i * 0.04 }}
            whileHover={{ scale: 1.08, transition: { duration: 0.15, ease: 'easeOut' } }}
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            {/* Favicon icon */}
            <img
              src={`https://www.google.com/s2/favicons?domain=${social.domain}&sz=64`}
              width={24}
              height={24}
              alt={social.name}
              style={{ display: 'block', borderRadius: 6 }}
            />

            {/* Name */}
            <span
              style={{
                fontSize: 10,
                color: 'var(--text-ghost)',
                letterSpacing: '-0.01em',
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}
            >
              {social.name}
            </span>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
