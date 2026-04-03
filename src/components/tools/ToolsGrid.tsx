'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { HugeiconsIcon, Cancel01Icon, LinkSquare02Icon } from '@icons';
import { TOOLS, TOOL_CATEGORIES, type Tool, type ToolCategory } from '@/data/tools';

const EASE = [0.19, 1, 0.22, 1] as const;

const CATEGORY_COLORS: Record<ToolCategory, string> = {
  Development: 'rgba(0,187,255,0.12)',
  Design:      'rgba(180,90,255,0.12)',
  Productivity:'rgba(255,160,50,0.12)',
  AI:          'rgba(100,220,130,0.12)',
  Utility:     'rgba(200,200,200,0.10)',
  Media:       'rgba(255,80,100,0.12)',
  Communication:'rgba(50,150,255,0.12)',
};

const CATEGORY_TEXT: Record<ToolCategory, string> = {
  Development: '#00bbff',
  Design:      '#b45aff',
  Productivity:'#ffa032',
  AI:          '#64dc82',
  Utility:     'var(--text-muted)',
  Media:       '#ff5064',
  Communication:'#3296ff',
};

function ToolIcon({ src, name, size = 40 }: { src: string; name: string; size?: number }) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.225,
          background: 'var(--muted-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.4,
          fontWeight: 600,
          color: 'var(--text-ghost)',
        }}
      >
        {name[0]}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      onError={() => setErrored(true)}
      style={{
        display: 'block',
        borderRadius: size * 0.225,
        objectFit: 'cover',
        flexShrink: 0,
      }}
    />
  );
}

function ToolDrawer({ tool, open, onClose }: { tool: Tool | null; open: boolean; onClose: () => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <AnimatePresence>
        {open && tool && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50"
                style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={onClose}
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                className="fixed top-0 right-0 bottom-0 z-50"
                style={{
                  width: 'min(360px, 100vw)',
                  background: 'var(--background)',
                  borderRadius: '12px 0 0 12px',
                  overflowY: 'auto',
                  boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
                }}
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.32, ease: EASE }}
              >
                <Dialog.Title className="sr-only">{tool.name}</Dialog.Title>

                {/* Close */}
                <Dialog.Close asChild>
                  <button
                    style={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      border: 'none',
                      background: 'var(--muted-bg)',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    aria-label="Close"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={12} />
                  </button>
                </Dialog.Close>

                {/* Content */}
                <div style={{ padding: '56px 24px 40px' }}>
                  {/* Icon centered at top */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
                    <ToolIcon src={tool.icon} name={tool.name} size={64} />
                    <h2
                      style={{
                        fontSize: 20,
                        fontWeight: 600,
                        letterSpacing: '-0.03em',
                        color: 'var(--text-primary)',
                        lineHeight: 1.2,
                        marginTop: 12,
                        marginBottom: 6,
                        textAlign: 'center',
                      }}
                    >
                      {tool.name}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                      <span
                        style={{
                          fontSize: 10,
                          padding: '2px 8px',
                          borderRadius: 9999,
                          background: CATEGORY_COLORS[tool.category],
                          color: CATEGORY_TEXT[tool.category],
                          letterSpacing: '0.02em',
                          fontWeight: 500,
                        }}
                      >
                        {tool.category}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-ghost)', letterSpacing: '-0.01em' }}>
                        {tool.tagline}
                      </span>
                    </div>

                    {/* Flat visit link */}
                    <a
                      href={tool.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: 12,
                        color: 'var(--text-muted)',
                        textDecoration: 'none',
                        letterSpacing: '-0.01em',
                        transition: 'color 150ms ease',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)'; }}
                    >
                      {tool.website.replace(/^https?:\/\//, '')}
                      <HugeiconsIcon icon={LinkSquare02Icon} size={11} />
                    </a>
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: 'var(--border)', marginBottom: 20 }} />

                  {/* Thoughts */}
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 500,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      color: 'var(--text-ghost)',
                      marginBottom: 10,
                    }}
                  >
                    My thoughts
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: 'var(--text-muted)',
                      lineHeight: 1.7,
                    }}
                  >
                    {tool.thoughts}
                  </p>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

export default function ToolsGrid() {
  const [selected, setSelected] = useState<Tool | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'All'>('All');

  const filtered = activeCategory === 'All'
    ? TOOLS
    : TOOLS.filter(t => t.category === activeCategory);

  const openTool = (tool: Tool) => {
    setSelected(tool);
    setDrawerOpen(true);
  };

  return (
    <div>
      {/* Category filters */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          marginBottom: 28,
        }}
      >
        {(['All', ...TOOL_CATEGORIES] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              fontSize: 11,
              padding: '3px 10px',
              borderRadius: 9999,
              border: '1px solid',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              background: activeCategory === cat ? 'var(--foreground)' : 'transparent',
              color: activeCategory === cat ? 'var(--background)' : 'var(--text-ghost)',
              borderColor: activeCategory === cat ? 'var(--foreground)' : 'var(--border)',
              letterSpacing: '0.01em',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
          gap: '24px 16px',
        }}
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((tool, i) => (
            <motion.button
              key={tool.id}
              layout
              initial={{ opacity: 0, scale: 0.85, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.85, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease: EASE, delay: i * 0.03 }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => openTool(tool)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 4px',
                borderRadius: 10,
              }}
            >
              <ToolIcon src={tool.icon} name={tool.name} size={44} />
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                  textAlign: 'center',
                  maxWidth: 72,
                }}
              >
                {tool.name}
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <ToolDrawer tool={selected} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
