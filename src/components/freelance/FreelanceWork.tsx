'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { buttonVariants } from '@/components/ui/raised-button';
import { HugeiconsIcon, Cancel01Icon, LinkSquare02Icon, ArrowRight02Icon } from '@icons';

interface FreelanceProject {
  name: string;
  type: string;
  tech: string[];
  url?: string;
  description: string;
  images: string[];
  testimonial?: {
    quote: string;
    author: string;
    role: string;
  };
}

const DEVICON_MAP: Record<string, string | null> = {
  React: 'react',
  TypeScript: 'typescript',
  TailwindCSS: 'tailwindcss',
  'Next.js': 'nextjs',
  'Node.js': 'nodejs',
  MongoDB: 'mongodb',
  Redis: 'redis',
  Express: 'express',
  Astro: 'astro',
};

const pastWork: FreelanceProject[] = [
  {
    name: 'BlinkAnalytics',
    type: 'Analytics Dashboard',
    tech: ['React', 'TypeScript', 'TailwindCSS'],
    url: 'https://blinkanalytics.in',
    description:
      'Official website and analytics dashboard for Blink Analytics, a generative AI and data analytics company. Real-time client reporting with custom charts, metrics, and data export.',
    images: [
      'https://storage.googleapis.com/aryanranderiya-portfolio.appspot.com/ProjectMedia/BlinkAnalytics/1.png',
      'https://storage.googleapis.com/aryanranderiya-portfolio.appspot.com/ProjectMedia/BlinkAnalytics/2.webp',
      'https://storage.googleapis.com/aryanranderiya-portfolio.appspot.com/ProjectMedia/BlinkAnalytics/3.webp',
      'https://storage.googleapis.com/aryanranderiya-portfolio.appspot.com/ProjectMedia/BlinkAnalytics/4.webp',
      'https://storage.googleapis.com/aryanranderiya-portfolio.appspot.com/ProjectMedia/BlinkAnalytics/5.webp',
      'https://storage.googleapis.com/aryanranderiya-portfolio.appspot.com/ProjectMedia/BlinkAnalytics/6.webp',
      'https://storage.googleapis.com/aryanranderiya-portfolio.appspot.com/ProjectMedia/BlinkAnalytics/7.webp',
      'https://storage.googleapis.com/aryanranderiya-portfolio.appspot.com/ProjectMedia/BlinkAnalytics/8.webp',
      'https://storage.googleapis.com/aryanranderiya-portfolio.appspot.com/ProjectMedia/BlinkAnalytics/9.webp',
    ],
  },
  {
    name: 'MWI',
    type: 'Brand & Web',
    tech: ['Next.js', 'TypeScript', 'TailwindCSS'],
    url: 'https://mwi.gg',
    description:
      'Brand identity and web platform for Move With Intention (MWI), a fitness and wellness company. Modern, clean aesthetic with performant Next.js architecture.',
    images: Array.from({ length: 14 }, (_, i) =>
      `https://storage.googleapis.com/aryanranderiya-portfolio.appspot.com/ProjectMedia/MWI/${i + 1}.webp`
    ),
  },
  {
    name: 'Encode PDEU',
    type: 'CS Club Platform',
    tech: ['React', 'Node.js', 'MongoDB'],
    url: 'https://encodepdeu.vercel.app',
    description:
      'The official website of Encode — the Computer Science Club at PDEU. Led the web dev core committee and built the site with event management, member profiles, and resource sharing.',
    images: [
      'https://storage.googleapis.com/aryanranderiya-portfolio.appspot.com/ProjectMedia/Encode_Official%20Website/encode.png',
      'https://storage.googleapis.com/aryanranderiya-portfolio.appspot.com/ProjectMedia/Encode_Official%20Website/1.webp',
      'https://storage.googleapis.com/aryanranderiya-portfolio.appspot.com/ProjectMedia/Encode_Official%20Website/2.webp',
      'https://storage.googleapis.com/aryanranderiya-portfolio.appspot.com/ProjectMedia/Encode_Official%20Website/3.webp',
      'https://storage.googleapis.com/aryanranderiya-portfolio.appspot.com/ProjectMedia/Encode_Official%20Website/4.webp',
      'https://storage.googleapis.com/aryanranderiya-portfolio.appspot.com/ProjectMedia/Encode_Official%20Website/5.webp',
    ],
  },
  {
    name: 'Rezrek',
    type: 'Content E-Commerce',
    tech: ['React', 'Node.js', 'MongoDB', 'Redis'],
    url: 'https://rezrek.com',
    description:
      'Content e-commerce platform enabling creators to sell digital products with integrated payments and delivery.',
    images: [
      'https://storage.googleapis.com/aryanranderiya-portfolio.appspot.com/ProjectMedia/Rezrek/image%20(1).png',
    ],
    testimonial: {
      quote:
        'Aryan delivered exactly what we needed, fast and clean. The platform has been running smoothly since day one.',
      author: 'Rezrek Founders',
      role: 'Co-Founders, Rezrek',
    },
  },
  {
    name: 'LyfeLane',
    type: 'Platform MVP',
    tech: ['React', 'Node.js', 'MongoDB', 'Express'],
    url: 'https://lyfelane.com',
    description:
      'Create personalized greeting cards, send them via email, and receive responses. Uses AI for card templates with an easy, Canva-like design interface.',
    images: [
      'https://storage.googleapis.com/aryanranderiya-portfolio.appspot.com/ProjectMedia/LyfeLane/2024-11-22_22-18.png',
      'https://storage.googleapis.com/aryanranderiya-portfolio.appspot.com/ProjectMedia/LyfeLane/1.webp',
      'https://storage.googleapis.com/aryanranderiya-portfolio.appspot.com/ProjectMedia/LyfeLane/2.webp',
      'https://storage.googleapis.com/aryanranderiya-portfolio.appspot.com/ProjectMedia/LyfeLane/3.webp',
      'https://storage.googleapis.com/aryanranderiya-portfolio.appspot.com/ProjectMedia/LyfeLane/4.webp',
      'https://storage.googleapis.com/aryanranderiya-portfolio.appspot.com/ProjectMedia/LyfeLane/5.webp',
    ],
  },
  {
    name: 'Brushstroke Studio',
    type: 'Agency Website',
    tech: ['Astro', 'React'],
    description: 'Marketing website for a creative design agency.',
    images: [],
  },
];

function DeviconImg({ slug, size = 12 }: { slug: string; size?: number }) {
  return (
    <img
      src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-original.svg`}
      alt=""
      width={size}
      height={size}
      style={{ display: 'inline-block', flexShrink: 0 }}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = 'none';
      }}
    />
  );
}

function FreelanceDrawer({
  project,
  open,
  onClose,
}: {
  project: FreelanceProject | null;
  open: boolean;
  onClose: () => void;
}) {
  const [activeImage, setActiveImage] = useState(0);

  // Reset image index when drawer closes
  if (!open && activeImage !== 0) setActiveImage(0);

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <AnimatePresence>
        {open && project && (
          <Dialog.Portal forceMount>
            {/* Overlay */}
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(4px)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={onClose}
              />
            </Dialog.Overlay>

            {/* Drawer panel */}
            <Dialog.Content asChild>
              <motion.div
                className="fixed top-0 right-0 bottom-0 z-50 flex flex-col"
                style={{
                  width: 'min(max(320px, 50%), 620px)',
                  background: 'var(--background)',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                }}
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
              >
                <Dialog.Title className="sr-only">
                  {project.name}
                </Dialog.Title>

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
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLButtonElement).style.opacity =
                        '0.6')
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLButtonElement).style.opacity =
                        '1')
                    }
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={12} color="currentColor" />
                  </button>
                </Dialog.Close>

                {/* Image carousel */}
                {project.images.length > 0 && (
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
                    <img
                      src={project.images[activeImage]}
                      alt={project.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                    {project.images.length > 1 && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '12px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          display: 'flex',
                          gap: '6px',
                          alignItems: 'center',
                        }}
                      >
                        {project.images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveImage(i)}
                            style={{
                              width: i === activeImage ? '16px' : '6px',
                              height: '6px',
                              borderRadius: '9999px',
                              border: 'none',
                              background:
                                i === activeImage
                                  ? '#fff'
                                  : 'rgba(255,255,255,0.45)',
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
                  {/* Type badge */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '10px',
                    }}
                  >
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
                  </div>

                  {/* Title + visit link */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '12px',
                      marginBottom: '12px',
                    }}
                  >
                    <h2
                      style={{
                        fontSize: '22px',
                        fontWeight: 600,
                        letterSpacing: '-0.03em',
                        color: 'var(--text-primary)',
                        lineHeight: 1.2,
                      }}
                    >
                      {project.name}
                    </h2>

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
                          flexShrink: 0,
                          gap: '5px',
                        }}
                      >
                        Visit
                        <HugeiconsIcon icon={LinkSquare02Icon} size={10} color="currentColor" />
                      </a>
                    )}
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
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '6px',
                        }}
                      >
                        {project.tech.map((t) => {
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

                  {/* Testimonial */}
                  {project.testimonial && (
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
                        Testimonial
                      </div>
                      <div
                        style={{
                          padding: '16px',
                          borderRadius: '8px',
                          background: 'var(--muted-bg)',
                        }}
                      >
                        <p
                          style={{
                            fontSize: '13px',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.6,
                            fontStyle: 'italic',
                            marginBottom: '10px',
                          }}
                        >
                          "{project.testimonial.quote}"
                        </p>
                        <div>
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: 'var(--text-primary)',
                            }}
                          >
                            {project.testimonial.author}
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              color: 'var(--text-ghost)',
                              marginLeft: '6px',
                            }}
                          >
                            {project.testimonial.role}
                          </span>
                        </div>
                      </div>
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

export default function FreelanceWork() {
  const [selected, setSelected] = useState<FreelanceProject | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpen = (project: FreelanceProject) => {
    setSelected(project);
    setDrawerOpen(true);
  };

  const handleClose = () => {
    setDrawerOpen(false);
  };

  return (
    <>
      <div>
        {pastWork.map((work) => (
          <button
            key={work.name}
            type="button"
            onClick={() => handleOpen(work)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 6px',
              margin: '0 -6px',
              borderBottom: '1px solid var(--border)',
              textDecoration: 'none',
              borderRadius: '4px',
              transition: 'background 150ms ease',
              cursor: 'pointer',
              width: 'calc(100% + 12px)',
              background: 'transparent',
              border: 'none',
              borderBlockEnd: '1px solid var(--border)',
              textAlign: 'left',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = 'rgba(0,0,0,0.02)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = 'transparent')
            }
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                minWidth: 0,
              }}
            >
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                }}
              >
                {work.name}
              </span>
              <span
                style={{
                  fontSize: '12px',
                  color: 'var(--text-ghost)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {work.type}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0,
                marginLeft: '12px',
              }}
            >
              {work.tech.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: '10px',
                    padding: '2px 7px',
                    borderRadius: '999px',
                    background: 'var(--muted-bg)',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tag}
                </span>
              ))}
              <HugeiconsIcon icon={ArrowRight02Icon} size={11} color="var(--text-ghost)" style={{ flexShrink: 0, marginLeft: '2px' }} />
            </div>
          </button>
        ))}
      </div>

      <FreelanceDrawer
        project={selected}
        open={drawerOpen}
        onClose={handleClose}
      />
    </>
  );
}
