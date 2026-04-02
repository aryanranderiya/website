'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HugeiconsIcon, Cancel01Icon, ArrowLeft01Icon, ArrowRight01Icon } from '@icons';

interface DesignGalleryProps {
  apparel: string[];
  headers: string[];
  thumbnails: string[];
  adMockups: string[];
}

function apparelSrc(file: string) { return '/design/apparel/' + file; }
function headerSrc(file: string) { return '/design/headers/' + file; }
function thumbnailSrc(file: string) { return '/design/thumbnails/' + file; }
function adMockupSrc(file: string) { return '/design/ad_mockups/' + file; }

function altText(file: string) {
  return file.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
}

export default function DesignGallery({ apparel, headers, thumbnails, adMockups }: DesignGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const goPrev = useCallback(() => {
    setLightboxIndex(i => (i - 1 + lightboxImages.length) % lightboxImages.length);
  }, [lightboxImages.length]);

  const goNext = useCallback(() => {
    setLightboxIndex(i => (i + 1) % lightboxImages.length);
  }, [lightboxImages.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxOpen, goPrev, goNext]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [lightboxOpen]);

  const apparelSrcs = apparel.map(apparelSrc);
  const headerSrcs = headers.map(headerSrc);
  const thumbnailSrcs = thumbnails.map(thumbnailSrc);
  const adMockupSrcs = adMockups.map(adMockupSrc);

  return (
    <>
      {/* Apparel & Streetwear */}
      <section style={{ marginBottom: 56 }}>
        <div className="section-header">Apparel &amp; Streetwear</div>
        <div className="apparel-grid">
          {apparel.map((file, i) => (
            <ApparelItem
              key={file}
              src={apparelSrcs[i]}
              alt={altText(file)}
              onClick={() => openLightbox(apparelSrcs, i)}
            />
          ))}
        </div>
      </section>

      {/* Banners & Headers */}
      <section style={{ marginBottom: 56 }}>
        <div className="section-header">Banners &amp; Headers</div>
        <div className="masonry-2col">
          {headers.map((file, i) => (
            <MasonryItem
              key={file}
              src={headerSrcs[i]}
              alt={altText(file)}
              onClick={() => openLightbox(headerSrcs, i)}
            />
          ))}
        </div>
      </section>

      {/* Thumbnails */}
      <section style={{ marginBottom: 56 }}>
        <div className="section-header">Thumbnails</div>
        <div className="masonry-2col">
          {thumbnails.map((file, i) => (
            <MasonryItem
              key={file}
              src={thumbnailSrcs[i]}
              alt={altText(file)}
              onClick={() => openLightbox(thumbnailSrcs, i)}
            />
          ))}
        </div>
      </section>

      {/* Ad Mockups */}
      <section style={{ marginBottom: 56 }}>
        <div className="section-header">Ad Mockups</div>
        <div className="masonry-2col">
          {adMockups.map((file, i) => (
            <MasonryItem
              key={file}
              src={adMockupSrcs[i]}
              alt={altText(file)}
              onClick={() => openLightbox(adMockupSrcs, i)}
            />
          ))}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox
            src={lightboxImages[lightboxIndex]}
            alt={altText(lightboxImages[lightboxIndex]?.split('/').pop() ?? '')}
            index={lightboxIndex}
            total={lightboxImages.length}
            onClose={closeLightbox}
            onPrev={goPrev}
            onNext={goNext}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function ApparelItem({ src, alt, onClick }: { src: string; alt: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="apparel-item"
      style={{ cursor: 'pointer' }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="apparel-img"
        style={{
          transform: hovered ? 'scale(1.03)' : 'scale(1)',
          filter: hovered ? 'brightness(1.04)' : 'brightness(1)',
          transition: 'transform 200ms ease, filter 200ms ease',
        }}
      />
    </div>
  );
}

function MasonryItem({ src, alt, onClick }: { src: string; alt: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="masonry-item"
      style={{ cursor: 'pointer' }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="masonry-img"
        style={{
          transform: hovered ? 'scale(1.03)' : 'scale(1)',
          filter: hovered ? 'brightness(1.04)' : 'brightness(1)',
          transition: 'transform 200ms ease, filter 200ms ease',
        }}
      />
    </div>
  );
}

interface LightboxProps {
  src: string;
  alt: string;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function Lightbox({ src, alt, index, total, onClose, onPrev, onNext }: LightboxProps) {
  return (
    <motion.div
      key="lightbox-overlay"
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Backdrop layer — backdrop-filter is set as a static style (never animated)
          because animating backdropFilter is poorly supported and breaks blur in
          most browsers. Only opacity is animated. */}
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        }}
        transition={{ duration: 0.12 }}
        style={{
          position: 'absolute',
          inset: 0,
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          backgroundColor: 'rgba(0,0,0,0.35)',
        }}
      />
      {/* Image */}
      <AnimatePresence mode="wait">
        <motion.img
          key={src}
          src={src}
          alt={alt}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.97, opacity: 0 }}
          transition={{
            default: { duration: 0.25, ease: [0.19, 1, 0.22, 1] },
            exit: { duration: 0.12, ease: 'easeIn' },
          }}
          onClick={e => e.stopPropagation()}
          style={{
            position: 'relative',
            maxHeight: '90vh',
            maxWidth: '90vw',
            objectFit: 'contain',
            display: 'block',
            borderRadius: 4,
            pointerEvents: 'auto',
          }}
          draggable={false}
        />
      </AnimatePresence>

      {/* Close button */}
      <button
        onClick={e => { e.stopPropagation(); onClose(); }}
        aria-label="Close"
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          color: '#fff',
          flexShrink: 0,
        }}
      >
        <HugeiconsIcon icon={Cancel01Icon} size={16} color="currentColor" />
      </button>

      {/* Prev button */}
      {total > 1 && (
        <button
          onClick={e => { e.stopPropagation(); onPrev(); }}
          aria-label="Previous image"
          style={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            color: '#fff',
            flexShrink: 0,
          }}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} color="currentColor" />
        </button>
      )}

      {/* Next button */}
      {total > 1 && (
        <button
          onClick={e => { e.stopPropagation(); onNext(); }}
          aria-label="Next image"
          style={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            color: '#fff',
            flexShrink: 0,
          }}
        >
          <HugeiconsIcon icon={ArrowRight01Icon} size={16} color="currentColor" />
        </button>
      )}

      {/* Counter */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.5)',
          fontSize: 12,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '0.04em',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {index + 1} / {total}
      </div>
    </motion.div>
  );
}
