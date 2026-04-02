'use client';

import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { useState, useEffect } from 'react';
import { buttonVariants } from '@/components/ui/raised-button';

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
  folder: string;
  url?: string;
  github?: string;
  coverImage?: string;
}

// Map tech names to devicon slugs
const DEVICON_MAP: Record<string, string | null> = {
  'React': 'react',
  'React Native': 'react',
  'TypeScript': 'typescript',
  'JavaScript': 'javascript',
  'Python': 'python',
  'FastAPI': 'fastapi',
  'MongoDB': 'mongodb',
  'Node.js': 'nodejs',
  'Nodejs': 'nodejs',
  'Tailwind': 'tailwindcss',
  'TailwindCSS': 'tailwindcss',
  'Next.js': 'nextjs',
  'Nextjs': 'nextjs',
  'Firebase': 'firebase',
  'PostgreSQL': 'postgresql',
  'WebSockets': null,
  'Supabase': 'supabase',
  'Express': 'express',
  'Java': 'java',
  'Android': 'android',
  'HTML': 'html5',
  'CSS': 'css3',
  'Redis': 'redis',
  'Flask': 'flask',
  'Astro': 'astro',
  'Vite': 'vitejs',
  'OpenAI': null,
};

function DeviconImg({ slug, size = 12 }: { slug: string; size?: number }) {
  return (
    <img
      src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-original.svg`}
      alt=""
      width={size}
      height={size}
      style={{ display: 'inline-block', flexShrink: 0 }}
      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
    />
  );
}

function CarouselImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <>
      {/* Placeholder shown while loading or on error */}
      {(!loaded || errored) && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--muted-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {errored ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-ghost)', opacity: 0.4 }}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          ) : (
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: '2px solid var(--border)',
                borderTopColor: 'var(--text-ghost)',
                animation: 'spin 0.7s linear infinite',
              }}
            />
          )}
        </div>
      )}
      {!errored && (
        <img
          key={src}
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => { setLoaded(true); setErrored(true); }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 200ms ease',
          }}
        />
      )}
    </>
  );
}

export default function ProjectDrawer({
  project,
  open,
  onClose,
}: {
  project: Project | null;
  open: boolean;
  onClose: () => void;
}) {
  const [activeImage, setActiveImage] = useState(0);

  // Reset carousel index whenever the project changes or drawer opens
  useEffect(() => {
    setActiveImage(0);
  }, [project?.slug, open]);

  const images = project?.images ?? [];
  // Clamp activeImage to valid range in case images array is shorter
  const safeActiveImage = images.length > 0 ? Math.min(activeImage, images.length - 1) : 0;

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <AnimatePresence>
        {open && project && (
          <Dialog.Portal forceMount>
            {/* Overlay */}
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

            {/* Bottom sheet drawer */}
            <Dialog.Content asChild>
              <motion.div
                className="fixed bottom-0 left-0 right-0 z-50 flex flex-col"
                style={{
                  maxHeight: '85vh',
                  background: 'var(--background)',
                  borderRadius: '16px 16px 0 0',
                  overflowX: 'hidden',
                }}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
              >
                <Dialog.Title className="sr-only">{project.title}</Dialog.Title>

                {/* Drag handle */}
                <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px', flexShrink: 0 }}>
                  <div
                    style={{
                      width: '40px',
                      height: '4px',
                      borderRadius: '9999px',
                      background: 'rgba(0,0,0,0.15)',
                    }}
                  />
                </div>

                {/* Close button */}
                <Dialog.Close asChild>
                  <button
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      zIndex: 10,
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'var(--muted-bg)',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'opacity 150ms ease',
                    }}
                    aria-label="Close"
                    onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.6')}
                    onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </Dialog.Close>

                {/* Scrollable content area */}
                <div style={{ overflowY: 'auto', flex: 1 }}>

                {/* Image carousel */}
                {images.length > 0 && (
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '16/9',
                      maxHeight: '260px',
                      background: 'var(--muted-bg)',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={`${project.slug}-${safeActiveImage}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ position: 'absolute', inset: 0 }}
                      >
                        <CarouselImage
                          src={images[safeActiveImage]}
                          alt={`${project.title} screenshot ${safeActiveImage + 1}`}
                        />
                      </motion.div>
                    </AnimatePresence>

                    {/* Dot indicators */}
                    {images.length > 1 && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '12px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          display: 'flex',
                          gap: '6px',
                          alignItems: 'center',
                          zIndex: 2,
                        }}
                      >
                        {images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveImage(i)}
                            style={{
                              width: i === safeActiveImage ? '16px' : '6px',
                              height: '6px',
                              borderRadius: '9999px',
                              border: 'none',
                              background: i === safeActiveImage ? '#fff' : 'rgba(255,255,255,0.45)',
                              cursor: 'pointer',
                              padding: 0,
                              transition: 'all 200ms ease',
                            }}
                            aria-label={`Image ${i + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div style={{ padding: '24px', flex: 1 }}>
                  {/* Status + type row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    {project.status === 'in-progress' && (
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          background: 'rgba(0,187,255,0.1)',
                          color: '#00bbff',
                          fontWeight: 500,
                          letterSpacing: '0.02em',
                        }}
                      >
                        In Progress
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        background: 'var(--muted-bg)',
                        color: 'var(--text-muted)',
                        letterSpacing: '0.02em',
                        textTransform: 'capitalize',
                      }}
                    >
                      {project.type}
                    </span>
                    {project.folder && project.folder !== 'Projects' && (
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          background: 'var(--muted-bg)',
                          color: 'var(--text-muted)',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {project.folder}
                      </span>
                    )}
                  </div>

                  {/* Title + action links */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
                    <h2
                      style={{
                        fontSize: '22px',
                        fontWeight: 600,
                        letterSpacing: '-0.03em',
                        color: 'var(--text-primary)',
                        lineHeight: 1.2,
                      }}
                    >
                      {project.title}
                    </h2>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, paddingTop: '2px' }}>
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'var(--muted-bg)',
                            color: 'var(--text-secondary)',
                            transition: 'opacity 150ms ease',
                          }}
                          title="View source"
                          onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = '0.65')}
                          onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = '1')}
                        >
                          <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                          </svg>
                        </a>
                      )}
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={buttonVariants({ variant: 'accent', size: 'sm' })}
                          style={{
                            backgroundColor: '#00bbff',
                            color: '#000000',
                            borderColor: 'rgba(0, 187, 255, 0.4)',
                            boxShadow: '0 2px 8px rgba(0, 187, 255, 0.3)',
                            textDecoration: 'none',
                            gap: '5px',
                          }}
                        >
                          Visit
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M7 17L17 7M7 7h10v10" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-muted)',
                      lineHeight: 1.65,
                      marginBottom: '24px',
                    }}
                  >
                    {project.description}
                  </p>

                  {/* Tech stack */}
                  {project.tech.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: 500,
                          letterSpacing: '0.07em',
                          textTransform: 'uppercase',
                          color: 'var(--text-ghost)',
                          marginBottom: '10px',
                        }}
                      >
                        Tech Stack
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {project.tech.map(t => {
                          const slug = DEVICON_MAP[t];
                          return (
                            <span
                              key={t}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                fontSize: '11px',
                                padding: '4px 9px',
                                borderRadius: '9999px',
                                background: 'var(--muted-bg)',
                                color: 'var(--text-secondary)',
                                letterSpacing: '0.01em',
                              }}
                            >
                              {slug !== undefined && slug !== null && (
                                <DeviconImg slug={slug} size={12} />
                              )}
                              {t}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {project.tags.length > 0 && (
                    <div>
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: 500,
                          letterSpacing: '0.07em',
                          textTransform: 'uppercase',
                          color: 'var(--text-ghost)',
                          marginBottom: '10px',
                        }}
                      >
                        Tags
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {project.tags.map(tag => (
                          <span
                            key={tag}
                            style={{
                              fontSize: '11px',
                              padding: '3px 8px',
                              borderRadius: '9999px',
                              background: 'var(--muted-bg)',
                              color: 'var(--text-muted)',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
