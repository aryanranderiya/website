'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';
import * as Popover from '@radix-ui/react-popover';

type DogBreed = 'golden' | 'husky' | 'shepherd';

const DOG_BREEDS = [
  {
    id: 'golden' as DogBreed,
    label: 'Golden Retriever',
    emoji: '🐕',
    color: '#f59e0b',
    description: 'Friendly & loyal',
  },
  {
    id: 'husky' as DogBreed,
    label: 'Husky',
    emoji: '🐺',
    color: '#6366f1',
    description: 'Adventurous & free-spirited',
  },
  {
    id: 'shepherd' as DogBreed,
    label: 'German Shepherd',
    emoji: '🦮',
    color: '#92400e',
    description: 'Intelligent & brave',
  },
] as const;

const DOG_EMOJIS: Record<DogBreed, string> = {
  golden: '🐕',
  husky: '🐺',
  shepherd: '🦮',
};

export default function DogCursor() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedBreed, setSelectedBreed] = useState<DogBreed>('golden');
  const [isMobile, setIsMobile] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springX = useSpring(mouseX, { stiffness: 220, damping: 22, mass: 0.4 });
  const springY = useSpring(mouseY, { stiffness: 220, damping: 22, mass: 0.4 });

  useEffect(() => {
    setMounted(true);
    setIsMobile(window.matchMedia('(pointer: coarse)').matches);

    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 16);
      mouseY.set(e.clientY - 16);
      if (!isVisible) setIsVisible(true);
    };

    const onLeave = () => setIsVisible(false);
    const onEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
    };
  }, [isVisible]);

  const handleDogClick = useCallback(() => {
    if (!popoverOpen) {
      setShowTooltip(true);
    }
  }, [popoverOpen]);

  const handleTooltipClick = useCallback(() => {
    setShowTooltip(false);
    setPopoverOpen(true);
  }, []);

  const handleBreedSelect = useCallback((breed: DogBreed) => {
    setSelectedBreed(breed);
    setPopoverOpen(false);
    setShowTooltip(false);
  }, []);

  // Don't render on mobile or SSR
  if (!mounted || isMobile) return null;

  return (
    <>
      <motion.div
        className="fixed pointer-events-none z-[9999] select-none"
        style={{ x: springX, y: springY }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ opacity: { duration: 0.2 } }}
      >
        <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
          <Popover.Trigger asChild>
            <button
              onClick={handleDogClick}
              className="pointer-events-auto w-8 h-8 flex items-center justify-center cursor-pointer select-none"
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: '26px',
                lineHeight: 1,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
              }}
              aria-label="Dog cursor — click to interact"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={selectedBreed}
                  initial={{ scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0.5, rotate: 10 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  style={{ display: 'inline-block' }}
                >
                  {DOG_EMOJIS[selectedBreed]}
                </motion.span>
              </AnimatePresence>
            </button>
          </Popover.Trigger>

          {/* Woof tooltip */}
          <AnimatePresence>
            {showTooltip && !popoverOpen && (
              <motion.button
                onClick={handleTooltipClick}
                className="pointer-events-auto absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
                initial={{ opacity: 0, y: 4, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                aria-label="Click to choose breed"
              >
                Woof! 🐾 <span style={{ color: 'var(--muted-foreground)' }}>— click me</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Breed selector popover */}
          <Popover.Portal>
            <Popover.Content
              side="top"
              sideOffset={16}
              align="center"
              className="z-[10000]"
              style={{ outline: 'none' }}
            >
              <AnimatePresence>
                {popoverOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 8 }}
                    transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="rounded-2xl border shadow-xl p-4 w-64"
                    style={{
                      background: 'var(--card)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <div className="text-xs font-medium mb-3" style={{ color: 'var(--muted-foreground)' }}>
                      Choose your dog 🐾
                    </div>
                    <div className="flex flex-col gap-2">
                      {DOG_BREEDS.map(breed => (
                        <button
                          key={breed.id}
                          onClick={() => handleBreedSelect(breed.id)}
                          className="flex items-center gap-3 p-3 rounded-xl transition-all duration-150 text-left w-full cursor-pointer"
                          style={{
                            background: selectedBreed === breed.id ? 'var(--muted)' : 'transparent',
                            border: selectedBreed === breed.id
                              ? '1px solid var(--border)'
                              : '1px solid transparent',
                            color: 'var(--foreground)',
                          }}
                          onMouseEnter={e => {
                            if (selectedBreed !== breed.id) {
                              (e.currentTarget as HTMLButtonElement).style.background = 'var(--muted)';
                            }
                          }}
                          onMouseLeave={e => {
                            if (selectedBreed !== breed.id) {
                              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                            }
                          }}
                        >
                          <span style={{ fontSize: '28px', lineHeight: 1 }}>{breed.emoji}</span>
                          <div>
                            <div className="text-sm font-medium" style={{ letterSpacing: '-0.01em' }}>
                              {breed.label}
                            </div>
                            <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                              {breed.description}
                            </div>
                          </div>
                          {selectedBreed === breed.id && (
                            <span className="ml-auto" style={{ color: '#00bbff' }}>✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </motion.div>

      {/* Hide native cursor when dog is visible */}
      <style>{`
        body { cursor: none !important; }
        * { cursor: inherit !important; }
        button, a, input, select, textarea, [role="button"] {
          cursor: none !important;
        }
      `}</style>
    </>
  );
}
