'use client';

import { motion } from 'framer-motion';

const TOOLS = [
  { name: 'Arc',     domain: 'arc.net' },
  { name: 'VS Code', domain: 'code.visualstudio.com' },
  { name: 'Linear',  domain: 'linear.app' },
  { name: 'Mymind',  domain: 'mymind.com' },
  { name: 'Ghostty', domain: 'ghostty.org' },
  { name: 'Claude',  domain: 'claude.ai' },
  { name: 'Figma',   domain: 'figma.com' },
  { name: 'Notion',  domain: 'notion.so' },
];

const EASE = [0.19, 1, 0.22, 1] as const;

export default function Toolbox() {
  return (
    <div>
      <div className="section-header">Toolbox</div>
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
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              cursor: 'default',
            }}
          >
            {/* Favicon icon */}
            <img
              src={`https://www.google.com/s2/favicons?domain=${tool.domain}&sz=64`}
              width={24}
              height={24}
              alt={tool.name}
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
              {tool.name}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
