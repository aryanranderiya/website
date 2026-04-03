'use client';

import { motion, AnimatePresence } from 'motion/react';
import * as Dialog from '@radix-ui/react-dialog';
import { useState, useEffect } from 'react';
import { RaisedButton } from '@/components/ui/raised-button';
import { HugeiconsIcon, Cancel01Icon, GithubIcon, LinkSquare02Icon, ImageNotFound01Icon, ArrowLeft01Icon, ArrowRight01Icon } from '@icons';
import { getTechIconUrl } from '../../utils/techIcons';

const TYPE_LABELS: Record<string, string> = {
  web:     'Web',
  mobile:  'Mobile',
  game:    'Game',
  cli:     'CLI',
  desktop: 'Desktop',
  macos:   'macOS',
  os:      'macOS',
  other:   'Other',
  api:     'API',
};

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
            <HugeiconsIcon icon={ImageNotFound01Icon} size={20} color="var(--text-ghost)" />
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

            {/* Right-side drawer */}
            <Dialog.Content asChild>
              <motion.div
                className="fixed top-0 right-0 bottom-0 z-50 flex flex-col"
                style={{
                  width: '420px',
                  maxWidth: '100vw',
                  background: 'var(--background)',
                  borderRadius: '16px 0 0 16px',
                  overflowX: 'hidden',
                }}
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
              >
                <Dialog.Title className="sr-only">{project.title}</Dialog.Title>

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
                    <HugeiconsIcon icon={Cancel01Icon} size={12} />
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
                      }}
                    >
                      {TYPE_LABELS[project.type] ?? project.type}
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
                      {images.length > 1 && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => setActiveImage(i => Math.max(0, i - 1))}
                            disabled={safeActiveImage === 0}
                            style={{
                              width: '32px', height: '32px', borderRadius: '6px', border: 'none',
                              background: 'var(--muted-bg)', cursor: safeActiveImage === 0 ? 'default' : 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              opacity: safeActiveImage === 0 ? 0.35 : 1,
                              transition: 'opacity 150ms ease',
                              color: 'var(--text-secondary)',
                            }}
                            aria-label="Previous image"
                          >
                            <HugeiconsIcon icon={ArrowLeft01Icon} size={13} />
                          </button>
                          <button
                            onClick={() => setActiveImage(i => Math.min(images.length - 1, i + 1))}
                            disabled={safeActiveImage === images.length - 1}
                            style={{
                              width: '32px', height: '32px', borderRadius: '6px', border: 'none',
                              background: 'var(--muted-bg)', cursor: safeActiveImage === images.length - 1 ? 'default' : 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              opacity: safeActiveImage === images.length - 1 ? 0.35 : 1,
                              transition: 'opacity 150ms ease',
                              color: 'var(--text-secondary)',
                            }}
                            aria-label="Next image"
                          >
                            <HugeiconsIcon icon={ArrowRight01Icon} size={13} />
                          </button>
                        </div>
                      )}
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
                          <HugeiconsIcon icon={GithubIcon} size={15} />
                        </a>
                      )}
                      {project.url && (
                        <RaisedButton asChild variant="accent" size="sm" className="gap-1.5">
                          <a href={project.url} target="_blank" rel="noopener noreferrer">
                            Visit
                            <HugeiconsIcon icon={LinkSquare02Icon} size={11} />
                          </a>
                        </RaisedButton>
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
                        {project.tags.map(tag => {
                          const iconUrl = getTechIconUrl(tag);
                          return (
                            <span
                              key={tag}
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
                              {iconUrl && (
                                <img
                                  src={iconUrl}
                                  alt=""
                                  width={12}
                                  height={12}
                                  style={{ display: 'inline-block', flexShrink: 0 }}
                                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                                />
                              )}
                              {tag}
                            </span>
                          );
                        })}
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
