'use client';

import { motion, AnimatePresence } from 'motion/react';
import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { HugeiconsIcon, Cancel01Icon, GithubIcon, LinkSquare02Icon } from '@icons';

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
                    <HugeiconsIcon icon={Cancel01Icon} size={14} color="currentColor" />
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
                          <HugeiconsIcon icon={GithubIcon} size={16} color="currentColor" />
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
                          <HugeiconsIcon icon={LinkSquare02Icon} size={12} color="currentColor" />
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
