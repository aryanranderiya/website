'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { buttonVariants } from '@/components/ui/raised-button';
import {
  HugeiconsIcon,
  Cancel01Icon,
  LinkSquare02Icon,
  ArrowRight02Icon,
  ArrowLeft02Icon,
} from '@icons';
import { pastWork, type FreelanceProject } from '@/data/freelance';

const PANEL_WIDTH = 580;

const DEVICON_MAP: Record<string, string> = {
  'React': 'react',
  'TypeScript': 'typescript',
  'TailwindCSS': 'tailwindcss',
  'Next.js': 'nextjs',
  'Node.js': 'nodejs',
  'MongoDB': 'mongodb',
  'Redis': 'redis',
  'Express': 'express',
  'PostgreSQL': 'postgresql',
  'Python': 'python',
  'FastAPI': 'fastapi',
  'Figma': 'figma',
};

function DeviconImg({ slug, size = 12 }: { slug: string; size?: number }) {
  return (
    <img
      src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-original.svg`}
      alt=""
      width={size}
      height={size}
      className="inline-block shrink-0"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = 'none';
      }}
    />
  );
}

function ProjectDetail({
  project,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  project: FreelanceProject;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const wheelAccumRef = useRef(0);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = project.images.length;
  const prevImg = () => setActiveImage((i) => Math.max(0, i - 1));
  const nextImg = () => setActiveImage((i) => Math.min(total - 1, i + 1));

  // Reset image index and close lightbox when project changes
  useEffect(() => { setActiveImage(0); setLightboxOpen(false); }, [project.name]);

  // Keyboard nav for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') setActiveImage(i => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setActiveImage(i => Math.min(total - 1, i + 1));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxOpen, total]);

  const handleWheel = (e: React.WheelEvent) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    wheelAccumRef.current += delta;
    if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    wheelTimerRef.current = setTimeout(() => { wheelAccumRef.current = 0; }, 200);
    if (wheelAccumRef.current > 60) { wheelAccumRef.current = 0; nextImg(); }
    else if (wheelAccumRef.current < -60) { wheelAccumRef.current = 0; prevImg(); }
  };

  const NavBtn = ({ onClick, disabled, icon, label }: { onClick: () => void; disabled: boolean; icon: typeof ArrowLeft02Icon; label: string }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-6 h-6 rounded-md bg-[var(--muted-bg)] flex items-center justify-center border-none cursor-pointer transition-opacity duration-150 disabled:opacity-25 hover:opacity-60"
      aria-label={label}
    >
      <HugeiconsIcon icon={icon} size={11} color="var(--text-muted)" />
    </button>
  );

  return (
    <motion.div
      key={project.name}
      className="flex flex-col bg-[var(--background)] w-full h-full overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0 gap-3">
        {/* Left: type + project nav */}
        <div className="flex items-center gap-2 min-w-0">
          <NavBtn onClick={onPrev} disabled={!hasPrev} icon={ArrowLeft02Icon} label="Previous project" />
          <span className="text-[11px] px-2 py-[3px] rounded-full bg-[var(--muted-bg)] text-[var(--text-muted)] tracking-[0.02em] truncate">
            {project.type}
          </span>
          <NavBtn onClick={onNext} disabled={!hasNext} icon={ArrowRight02Icon} label="Next project" />
        </div>
        {/* Right: image nav + visit + close */}
        <div className="flex items-center gap-1.5 shrink-0">
          {total > 1 && (
            <>
              <NavBtn onClick={prevImg} disabled={activeImage === 0} icon={ArrowLeft02Icon} label="Previous image" />
              <span className="text-[10px] text-[var(--text-ghost)] tabular-nums w-[28px] text-center">
                {activeImage + 1}/{total}
              </span>
              <NavBtn onClick={nextImg} disabled={activeImage === total - 1} icon={ArrowRight02Icon} label="Next image" />
            </>
          )}
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: 'accent', size: 'sm' })}
              style={{
                backgroundColor: '#00bbff',
                color: '#000',
                borderColor: 'rgba(0,187,255,0.4)',
                boxShadow: '0 2px 8px rgba(0,187,255,0.3)',
                textDecoration: 'none',
                flexShrink: 0,
                gap: '5px',
                marginLeft: '4px',
              }}
            >
              Visit
              <HugeiconsIcon icon={LinkSquare02Icon} size={10} color="currentColor" />
            </a>
          )}
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-md bg-[var(--muted-bg)] text-[var(--text-muted)] cursor-pointer flex items-center justify-center transition-opacity duration-150 hover:opacity-60 border-none ml-1"
            aria-label="Close"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={11} color="currentColor" />
          </button>
        </div>
      </div>

      {/* Image carousel — no overlaid buttons, just dots */}
      {total > 0 && (
        <div
          className="relative mx-5 rounded-xl overflow-hidden shrink-0 bg-[var(--muted-bg)] select-none cursor-pointer"
          style={{ aspectRatio: '16/9' }}
          onWheel={handleWheel}
          onClick={() => setLightboxOpen(true)}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={activeImage}
              src={project.images[activeImage]}
              alt={project.name}
              className="w-full h-full object-cover block absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
          </AnimatePresence>
        </div>
      )}

      {/* Lightbox */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {lightboxOpen && (
            <motion.div
              key="freelance-lightbox"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
              onClick={() => setLightboxOpen(false)}
              className="fixed inset-0 flex items-center justify-center"
              style={{ zIndex: 9999, backgroundColor: 'color-mix(in srgb, var(--background) 60%, transparent)' }}
            >
              <motion.img
                key={activeImage}
                src={project.images[activeImage]}
                alt={project.name}
                initial={{ scale: 0.94, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.94, opacity: 0 }}
                transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
                onClick={e => e.stopPropagation()}
                className="max-h-[90vh] max-w-[90vw] object-contain block rounded-[6px]"
                draggable={false}
              />
              <button
                onClick={e => { e.stopPropagation(); setLightboxOpen(false); }}
                aria-label="Close"
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full border-none cursor-pointer"
                style={{ background: 'color-mix(in srgb, var(--foreground) 10%, transparent)', color: 'var(--foreground)' }}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} color="currentColor" />
              </button>
              {total > 1 && (
                <>
                  <button
                    onClick={e => { e.stopPropagation(); setActiveImage(i => Math.max(0, i - 1)); }}
                    disabled={activeImage === 0}
                    aria-label="Previous"
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full border-none cursor-pointer disabled:opacity-25"
                    style={{ background: 'color-mix(in srgb, var(--foreground) 10%, transparent)', color: 'var(--foreground)' }}
                  >
                    <HugeiconsIcon icon={ArrowLeft02Icon} size={16} color="currentColor" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setActiveImage(i => Math.min(total - 1, i + 1)); }}
                    disabled={activeImage === total - 1}
                    aria-label="Next"
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full border-none cursor-pointer disabled:opacity-25"
                    style={{ background: 'color-mix(in srgb, var(--foreground) 10%, transparent)', color: 'var(--foreground)' }}
                  >
                    <HugeiconsIcon icon={ArrowRight02Icon} size={16} color="currentColor" />
                  </button>
                  <div
                    className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[12px] pointer-events-none"
                    style={{ color: 'color-mix(in srgb, var(--foreground) 45%, transparent)', letterSpacing: '0.04em' }}
                  >
                    {activeImage + 1} / {total}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Content */}
      <div className="px-6 py-5 flex flex-col gap-5">
        {/* Title */}
        <div>
          <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-[var(--text-primary)] leading-[1.2]">
            {project.name}
          </h2>
        </div>

        {/* Description */}
        <p className="text-[13px] text-[var(--text-muted)] leading-[1.65]">
          {project.description}
        </p>

        {/* Tech stack */}
        {project.tech.length > 0 && (
          <div>
            <div className="text-[10px] font-medium tracking-[0.07em] uppercase text-[var(--text-ghost)] mb-2">
              Tech Stack
            </div>
            <div className="flex flex-wrap gap-[6px]">
              {project.tech.map((t) => {
                const slug = DEVICON_MAP[t];
                return (
                  <span
                    key={t}
                    className="inline-flex items-center gap-[5px] text-[11px] px-[9px] py-1 rounded-full bg-[var(--muted-bg)] text-[var(--text-secondary)]"
                  >
                    {slug && <DeviconImg slug={slug} size={12} />}
                    {t}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Testimonial */}
        {project.testimonial && (
          <div>
            <div className="text-[10px] font-medium tracking-[0.07em] uppercase text-[var(--text-ghost)] mb-2">
              Testimonial
            </div>
            <div className="p-4 rounded-xl bg-[var(--muted-bg)]">
              <p className="text-[13px] text-[var(--text-secondary)] leading-[1.6] italic mb-2">
                "{project.testimonial.quote}"
              </p>
              <span className="text-[12px] font-semibold text-[var(--text-primary)]">
                {project.testimonial.author}
              </span>
              <span className="text-[11px] text-[var(--text-ghost)] ml-[6px]">
                {project.testimonial.role}
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function FreelanceWork({ initialSlug }: { initialSlug?: string }) {
  const [selected, setSelected] = useState<FreelanceProject | null>(
    () => initialSlug ? (pastWork.find(p => p.slug === initialSlug) ?? null) : null
  );

  // Sync URL with selected project
  useEffect(() => {
    if (selected) {
      history.pushState({}, '', `/freelance/${selected.slug}`);
    } else {
      history.pushState({}, '', '/freelance');
    }
  }, [selected]);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Collapse content width to fit left of the panel.
  // Only applies on wide viewports where there's room for both content + panel side-by-side.
  // On narrow screens the panel overlays the full screen, so no layout manipulation needed.
  useEffect(() => {
    const el = document.getElementById('page-content');
    if (!el) return;
    const CONTENT_MAX_WIDTH = 640;
    const MIN_VIEWPORT_FOR_SIDE_BY_SIDE = PANEL_WIDTH + 400; // ~980px
    const TRANSITION = 'max-width 0.35s cubic-bezier(0.19, 1, 0.22, 1), margin-left 0.35s cubic-bezier(0.19, 1, 0.22, 1), margin-right 0.35s cubic-bezier(0.19, 1, 0.22, 1)';

    if (selected && window.innerWidth >= MIN_VIEWPORT_FOR_SIDE_BY_SIDE) {
      el.style.transition = TRANSITION;
      const currentLeft = (window.innerWidth - Math.min(window.innerWidth, CONTENT_MAX_WIDTH)) / 2;
      const panelLeft = window.innerWidth - PANEL_WIDTH;
      el.style.marginLeft = `${currentLeft}px`;
      el.style.marginRight = '0px';
      el.style.maxWidth = `${panelLeft - currentLeft}px`;
    } else if (!selected) {
      el.style.transition = TRANSITION;
      // Animate back to centered px values — can't transition to 'auto'
      const centeredMargin = Math.max(0, (window.innerWidth - CONTENT_MAX_WIDTH) / 2);
      el.style.marginLeft = `${centeredMargin}px`;
      el.style.marginRight = `${centeredMargin}px`;
      el.style.maxWidth = `${CONTENT_MAX_WIDTH}px`;
      // After transition, hand back to CSS
      const t = setTimeout(() => {
        el.style.marginLeft = '';
        el.style.marginRight = '';
        el.style.maxWidth = '';
        el.style.transition = '';
      }, 400);
      return () => clearTimeout(t);
    }
    // On narrow viewports with selected: leave layout alone, panel overlays content
  }, [selected]);


  const handleSelect = (project: FreelanceProject) => {
    setSelected((prev) => (prev?.name === project.name ? null : project));
  };

  const selectedIdx = selected ? pastWork.findIndex(p => p.name === selected.name) : -1;
  const handlePrevProject = () => { if (selectedIdx > 0) setSelected(pastWork[selectedIdx - 1]); };
  const handleNextProject = () => { if (selectedIdx < pastWork.length - 1) setSelected(pastWork[selectedIdx + 1]); };

  return (
    <>
      {/* Project list — always full width of its container */}
      <div>
        {pastWork.map((work) => {
          const isActive = selected?.name === work.name;
          return (
            <button
              key={work.name}
              type="button"
              onClick={() => handleSelect(work)}
              className="flex items-center justify-between py-[10px] px-[6px] -mx-[6px] transition-[background] duration-150 cursor-pointer w-[calc(100%+12px)] bg-transparent border-none [border-block-end:1px_solid_var(--border)] text-left font-[inherit] hover:bg-[var(--muted-bg)]"
              style={{ background: isActive ? 'var(--muted-bg)' : undefined }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-[13px] font-semibold text-[var(--text-primary)] whitespace-nowrap truncate">
                  {work.name}
                </span>
                <span className="text-[12px] text-[var(--text-ghost)] whitespace-nowrap shrink-0">
                  {work.type}
                </span>
              </div>
              <div className="flex items-center gap-[5px] shrink-0 ml-2">
                {work.tech.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-[7px] py-[2px] rounded-full bg-[var(--muted-bg)] text-[var(--text-muted)] whitespace-nowrap"
                  >
                    {tag}
                  </span>
                ))}
                <HugeiconsIcon
                  icon={ArrowRight02Icon}
                  size={11}
                  color={isActive ? 'var(--text-secondary)' : 'var(--text-ghost)'}
                  className="shrink-0 ml-[2px]"
                  style={{
                    transform: isActive ? 'rotate(90deg)' : undefined,
                    transition: 'transform 0.2s',
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail panel — portalled to body so position:fixed is relative to viewport,
          not to the transformed #page-content ancestor */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selected && (
            <motion.div
              className="fixed top-0 right-0 h-screen z-40 overflow-hidden"
              style={{ width: PANEL_WIDTH }}
              initial={{ x: PANEL_WIDTH }}
              animate={{ x: 0 }}
              exit={{ x: PANEL_WIDTH }}
              transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
            >
              <ProjectDetail
                project={selected}
                onClose={() => setSelected(null)}
                onPrev={handlePrevProject}
                onNext={handleNextProject}
                hasPrev={selectedIdx > 0}
                hasNext={selectedIdx < pastWork.length - 1}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
