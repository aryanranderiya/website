'use client';

import { motion } from 'motion/react';

const TOOLS = [
  { name: 'Arc',     icon: '/icons/favicons/arc-net.png' },
  { name: 'VS Code', icon: '/icons/favicons/code-visualstudio-com.png' },
  { name: 'Linear',  icon: '/icons/favicons/linear-app.png' },
  { name: 'Mymind',  icon: '/icons/favicons/mymind-com.png' },
  { name: 'Ghostty', icon: '/icons/favicons/ghostty-org.png' },
  { name: 'Claude',  icon: '/icons/favicons/claude-ai.png' },
  { name: 'Figma',   icon: '/icons/favicons/figma-com.png' },
  { name: 'Notion',  icon: '/icons/favicons/notion-so.png' },
];

const EASE = [0.19, 1, 0.22, 1] as const;

export default function Toolbox() {
  return (
    <div>
      <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Toolbox</span>
        <a
          href="/tools"
          style={{
            fontSize: '11px',
            color: 'var(--text-ghost)',
            textDecoration: 'none',
            letterSpacing: '-0.01em',
            transition: 'color 150ms ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-ghost)'; }}
        >
          See all →
        </a>
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        {TOOLS.map((tool, i) => (
          <motion.div
            key={tool.name}
            initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, ease: EASE, delay: i * 0.04 }}
            whileHover={{ scale: 1.08 }}
            className="toolbox-item"
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              cursor: 'default',
              position: 'relative',
            }}
          >
            {/* Favicon icon */}
            <img
              src={tool.icon}
              width={24}
              height={24}
              alt={tool.name}
              style={{ display: 'block', borderRadius: 6 }}
            />

            {/* Name — visible on hover */}
            <span className="toolbox-label">
              {tool.name}
            </span>
          </motion.div>
        ))}
      </div>
      <style>{`
        .toolbox-label {
          position: absolute;
          bottom: -18px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 10px;
          color: var(--text-ghost);
          letter-spacing: -0.01em;
          line-height: 1;
          white-space: nowrap;
          opacity: 0;
          transition: opacity 150ms ease;
          pointer-events: none;
        }
        .toolbox-item:hover .toolbox-label {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
