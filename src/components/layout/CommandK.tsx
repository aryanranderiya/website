'use client';

import { useState, useEffect, useCallback } from 'react';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { ALL_PAGES_FLAT, SOCIAL_LINKS, PAGES } from '@/constants/navigation';

// Extra commands
const ACTIONS = [
  { id: 'theme', label: 'Toggle Theme', description: 'Switch between light and dark', icon: '🌓' },
  { id: 'resume-download', label: 'Download Resume', description: 'Get my CV as PDF', href: '/resume.pdf', icon: '📄' },
];

export default function CommandK() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Open on ⌘K / Ctrl+K
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Listen for custom event from Navbar ⌘K button
  useEffect(() => {
    function onOpen() { setOpen(true); }
    window.addEventListener('open-cmdk', onOpen);
    return () => window.removeEventListener('open-cmdk', onOpen);
  }, []);

  const runAction = useCallback((id: string) => {
    if (id === 'theme') {
      const html = document.documentElement;
      const isDark = html.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
    setOpen(false);
    setQuery('');
  }, []);

  const navigate = useCallback((href: string, external?: boolean) => {
    setOpen(false);
    setQuery('');
    if (external) {
      window.open(href, '_blank', 'noopener');
    } else {
      window.location.href = href;
    }
  }, []);

  const allPages = ALL_PAGES_FLAT;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-[100]"
                style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                className="fixed left-1/2 top-[20%] z-[101] w-full max-w-lg -translate-x-1/2 rounded-2xl border overflow-hidden shadow-2xl"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                initial={{ opacity: 0, scale: 0.96, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -8 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <Dialog.Title className="sr-only">Command Palette</Dialog.Title>

                <Command
                  className="w-full"
                  label="Command palette"
                  shouldFilter={true}
                >
                  {/* Search input */}
                  <div
                    className="flex items-center gap-3 px-4 border-b"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <svg
                      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      style={{ color: 'var(--muted-foreground)', flexShrink: 0 }}
                    >
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    <Command.Input
                      value={query}
                      onValueChange={setQuery}
                      placeholder="Search pages, actions..."
                      className="flex-1 py-4 text-sm outline-none bg-transparent"
                      style={{ color: 'var(--foreground)', caretColor: 'var(--foreground)' }}
                    />
                    <kbd
                      className="hidden sm:inline-flex text-xs px-1.5 py-0.5 rounded"
                      style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
                    >
                      esc
                    </kbd>
                  </div>

                  {/* Results list */}
                  <Command.List className="max-h-80 overflow-y-auto py-2">
                    <Command.Empty className="py-8 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      No results found.
                    </Command.Empty>

                    {/* Pages */}
                    <Command.Group
                      heading="Pages"
                      className="px-2"
                    >
                      <style>{`
                        [cmdk-group-heading] {
                          font-size: 0.7rem;
                          font-weight: 600;
                          letter-spacing: 0.08em;
                          text-transform: uppercase;
                          color: var(--muted-foreground);
                          padding: 0.5rem 0.75rem 0.25rem;
                        }
                        [cmdk-item] {
                          display: flex;
                          align-items: center;
                          gap: 0.75rem;
                          padding: 0.6rem 0.75rem;
                          border-radius: 0.5rem;
                          cursor: pointer;
                          font-size: 0.875rem;
                          transition: background 0.1s;
                          color: var(--foreground);
                          outline: none;
                        }
                        [cmdk-item][aria-selected="true"],
                        [cmdk-item]:hover {
                          background: var(--muted);
                        }
                      `}</style>
                      {allPages.map(page => (
                        <Command.Item
                          key={page.href}
                          value={`${page.label} ${page.description}`}
                          onSelect={() => navigate(page.href)}
                        >
                          <span
                            className="w-7 h-7 rounded-md flex items-center justify-center text-xs flex-shrink-0"
                            style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
                          >
                            →
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium" style={{ letterSpacing: '-0.01em' }}>{page.label}</div>
                            {page.description && (
                              <div className="text-xs truncate mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                                {page.description}
                              </div>
                            )}
                          </div>
                          <kbd className="text-xs flex-shrink-0 hidden sm:block" style={{ color: 'var(--muted-foreground)' }}>
                            ↵
                          </kbd>
                        </Command.Item>
                      ))}
                    </Command.Group>

                    {/* Social links */}
                    <Command.Group heading="Social" className="px-2">
                      {SOCIAL_LINKS.map(link => (
                        <Command.Item
                          key={link.href}
                          value={`${link.label} social`}
                          onSelect={() => navigate(link.href, true)}
                        >
                          <span
                            className="w-7 h-7 rounded-md flex items-center justify-center text-xs flex-shrink-0"
                            style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
                          >
                            ↗
                          </span>
                          <div className="flex-1">
                            <div className="font-medium" style={{ letterSpacing: '-0.01em' }}>{link.label}</div>
                          </div>
                        </Command.Item>
                      ))}
                    </Command.Group>

                    {/* Actions */}
                    <Command.Group heading="Actions" className="px-2">
                      {ACTIONS.map(action => (
                        <Command.Item
                          key={action.id}
                          value={`${action.label} ${action.description}`}
                          onSelect={() => {
                            if (action.href) navigate(action.href);
                            else runAction(action.id);
                          }}
                        >
                          <span
                            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                            style={{ background: 'var(--muted)', border: '1px solid var(--border)', fontSize: '14px' }}
                          >
                            {action.icon}
                          </span>
                          <div className="flex-1">
                            <div className="font-medium" style={{ letterSpacing: '-0.01em' }}>{action.label}</div>
                            {action.description && (
                              <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{action.description}</div>
                            )}
                          </div>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  </Command.List>

                  {/* Footer */}
                  <div
                    className="flex items-center gap-3 px-4 py-2.5 border-t"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>↑↓</kbd>
                      <span>navigate</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>↵</kbd>
                      <span>open</span>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>⌘K</kbd>
                      <span>toggle</span>
                    </div>
                  </div>
                </Command>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
