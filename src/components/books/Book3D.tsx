'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface BookProps {
  title: string;
  author: string;
  cover?: string;
  color?: string;
  width?: number;
  height?: number;
  onClick?: () => void;
  index?: number;
}

// Generate a deterministic color from book title
function bookColor(title: string): string {
  const colors = [
    '#1a1a2e', '#16213e', '#0f3460', '#533483',
    '#2d132c', '#1b1b2f', '#2c003e', '#1a0a2e',
    '#0d1b2a', '#1b2838', '#2a1a0e', '#1a2e0d',
  ];
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function Book3D({ title, author, cover, color, width = 100, height = 140, onClick, index = 0 }: BookProps) {
  const [hovered, setHovered] = useState(false);
  const spineWidth = 20;
  const bookColor_ = color || bookColor(title);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: -10 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      className="relative flex-shrink-0 cursor-pointer select-none"
      style={{
        width: `${width + spineWidth}px`,
        height: `${height}px`,
        perspective: '800px',
        transformStyle: 'preserve-3d',
      }}
      aria-label={`${title} by ${author}`}
    >
      {/* Book container with 3D transform */}
      <motion.div
        animate={{
          rotateY: hovered ? -25 : 0,
          x: hovered ? 8 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          position: 'relative',
        }}
      >
        {/* Spine */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: `${spineWidth}px`,
            height: `${height}px`,
            background: `linear-gradient(180deg, ${bookColor_}dd, ${bookColor_})`,
            borderRadius: '2px 0 0 2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.3)',
            transform: 'translateZ(0)',
          }}
        >
          <span
            style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transform: 'rotate(180deg)',
              fontSize: '8px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.8)',
              letterSpacing: '0.05em',
              maxHeight: `${height - 16}px`,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </span>
        </div>

        {/* Cover */}
        <div
          style={{
            position: 'absolute',
            left: `${spineWidth}px`,
            top: 0,
            width: `${width}px`,
            height: `${height}px`,
            borderRadius: '0 4px 4px 0',
            overflow: 'hidden',
            boxShadow: hovered
              ? '6px 6px 24px rgba(0,0,0,0.4), 2px 2px 8px rgba(0,0,0,0.2)'
              : '3px 3px 12px rgba(0,0,0,0.3)',
          }}
        >
          {cover ? (
            <img
              src={cover}
              alt={`${title} cover`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            /* Generated cover */
            <div
              style={{
                width: '100%',
                height: '100%',
                background: `linear-gradient(135deg, ${bookColor_}, ${bookColor_}99)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 8px',
                gap: '6px',
              }}
            >
              {/* Decorative line */}
              <div style={{ width: '60%', height: '1px', background: 'rgba(255,255,255,0.3)', marginBottom: '4px' }} />
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.95)',
                  textAlign: 'center',
                  lineHeight: 1.3,
                  letterSpacing: '0.02em',
                }}
              >
                {title}
              </span>
              <div style={{ width: '40%', height: '1px', background: 'rgba(255,255,255,0.2)' }} />
              <span
                style={{
                  fontSize: '7px',
                  color: 'rgba(255,255,255,0.6)',
                  textAlign: 'center',
                  letterSpacing: '0.05em',
                }}
              >
                {author}
              </span>
            </div>
          )}

          {/* Shine overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%)',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Shadow under book */}
        <motion.div
          animate={{ opacity: hovered ? 0.5 : 0.25, scaleX: hovered ? 1.1 : 1 }}
          style={{
            position: 'absolute',
            bottom: '-8px',
            left: `${spineWidth}px`,
            width: `${width}px`,
            height: '8px',
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, transparent 100%)',
            filter: 'blur(3px)',
          }}
        />
      </motion.div>
    </motion.div>
  );
}
