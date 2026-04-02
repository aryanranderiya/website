'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PAGES, type NavPage } from '@/constants/navigation';

function AccordionItem({ page, index }: { page: NavPage; index: number }) {
  const [open, setOpen] = useState(false);
  const hasChildren = page.children && page.children.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-10px' }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div
        className="border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <button
          onClick={() => hasChildren && setOpen(o => !o)}
          className="flex items-center justify-between w-full py-4 text-left transition-all duration-150"
          style={{
            cursor: hasChildren ? 'pointer' : 'default',
            background: 'none',
            border: 'none',
            padding: '1rem 0',
          }}
        >
          <div className="flex items-center gap-4">
            <a
              href={page.href}
              className="text-sm font-medium transition-opacity hover:opacity-60"
              style={{ color: 'var(--foreground)', letterSpacing: '-0.01em' }}
              onClick={e => e.stopPropagation()}
            >
              {page.label}
            </a>
            <span className="text-xs hidden sm:block" style={{ color: 'var(--muted-foreground)' }}>
              {page.description}
            </span>
          </div>
          {hasChildren && (
            <motion.span
              animate={{ rotate: open ? 45 : 0 }}
              transition={{ duration: 0.2 }}
              style={{ color: 'var(--muted-foreground)', fontSize: '18px', lineHeight: 1, display: 'flex' }}
            >
              +
            </motion.span>
          )}
        </button>

        <AnimatePresence initial={false}>
          {open && hasChildren && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ overflow: 'hidden' }}
            >
              <div className="pb-3 pl-4 flex flex-col gap-1">
                {page.children!.map(child => (
                  <a
                    key={child.href}
                    href={child.href}
                    className="flex items-center gap-3 py-2 rounded-lg px-3 text-sm transition-all duration-150"
                    style={{ color: 'var(--muted-foreground)' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLAnchorElement).style.background = 'var(--muted)';
                      (e.currentTarget as HTMLAnchorElement).style.color = 'var(--foreground)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                      (e.currentTarget as HTMLAnchorElement).style.color = 'var(--muted-foreground)';
                    }}
                  >
                    <span
                      className="w-1 h-1 rounded-full flex-shrink-0"
                      style={{ background: 'var(--muted-foreground)' }}
                    />
                    <span>{child.label}</span>
                    {child.description && (
                      <span className="ml-auto text-xs hidden sm:block" style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}>
                        {child.description}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function PagesAccordion() {
  const pages = PAGES.filter(p => p.href !== '/');

  return (
    <section className="py-16">
      <div className="text-label mb-6" style={{ color: 'var(--muted-foreground)' }}>
        Explore
      </div>
      <div>
        {pages.map((page, i) => (
          <AccordionItem key={page.href} page={page} index={i} />
        ))}
      </div>
    </section>
  );
}
