'use client';

import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';

interface Project {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  tech: string[];
  type: string;
  status: string;
  featured: boolean;
  images: string[];
  url?: string;
  github?: string;
  body?: string;
}

export default function ProjectModal({
  project,
  open,
  onClose,
}: {
  project: Project | null;
  open: boolean;
  onClose: () => void;
}) {
  const [activeImage, setActiveImage] = useState(0);

  if (!project) return null;

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50"
                style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={onClose}
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                className="fixed left-1/2 top-1/2 z-50 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border overflow-hidden"
                style={{ background: 'var(--card)', borderColor: 'var(--border)', maxHeight: '85vh', overflowY: 'auto' }}
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <Dialog.Title className="sr-only">{project.title}</Dialog.Title>

                {/* Close */}
                <Dialog.Close asChild>
                  <button
                    className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70"
                    style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: 'none', cursor: 'pointer' }}
                    aria-label="Close"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </Dialog.Close>

                {/* Image gallery */}
                {project.images && project.images.length > 0 && (
                  <div className="aspect-video bg-muted relative overflow-hidden" style={{ background: 'var(--muted)' }}>
                    <img
                      src={project.images[activeImage]}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                    {project.images.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                        {project.images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveImage(i)}
                            className="w-1.5 h-1.5 rounded-full transition-all"
                            style={{
                              background: i === activeImage ? '#00bbff' : 'rgba(255,255,255,0.5)',
                              transform: i === activeImage ? 'scale(1.2)' : 'scale(1)',
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {project.status === 'in-progress' && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,187,255,0.1)', color: '#00bbff', border: '1px solid rgba(0,187,255,0.2)' }}>
                            In Progress
                          </span>
                        )}
                        <span className="text-xs px-2 py-0.5 rounded-full border capitalize" style={{ color: 'var(--muted-foreground)', borderColor: 'var(--border)' }}>
                          {project.type}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold" style={{ letterSpacing: '-0.03em', color: 'var(--foreground)' }}>
                        {project.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-lg flex items-center justify-center border transition-opacity hover:opacity-70"
                          style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                          </svg>
                        </a>
                      )}
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.97]"
                          style={{ background: '#00bbff', color: '#000', border: '1px solid rgba(0,187,255,0.5)', boxShadow: '0 2px 8px rgba(0,187,255,0.2)' }}
                        >
                          Visit
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M7 17L17 7M7 7h10v10"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--muted-foreground)' }}>
                    {project.description}
                  </p>

                  {/* Tech stack */}
                  <div className="mb-6">
                    <div className="text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
                      Tech Stack
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map(t => (
                        <span key={t} className="text-xs px-2.5 py-1 rounded-full border" style={{ color: 'var(--foreground)', borderColor: 'var(--border)', background: 'var(--muted)' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  {project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,187,255,0.1)', color: '#00bbff' }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
