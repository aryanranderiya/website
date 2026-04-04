import { useState, useEffect, useRef, useCallback } from 'react';
import { HugeiconsIcon, Github01Icon, Add01Icon } from '@icons';
import { WebPet } from './web-pet';

const ANIMAL_MAP: Record<string, { color: string; label: string }> = {
  chicken:      { color: 'brown',     label: 'Chicken' },
  clippy:       { color: 'black',     label: 'Clippy' },
  cockatiel:    { color: 'brown',     label: 'Cockatiel' },
  crab:         { color: 'red',       label: 'Crab' },
  deno:         { color: 'green',     label: 'Deno' },
  dog:          { color: 'brown',     label: 'Dog' },
  fox:          { color: 'red',       label: 'Fox' },
  horse:        { color: 'brown',     label: 'Horse' },
  mod:          { color: 'purple',    label: 'Mod' },
  monkey:       { color: 'gray',      label: 'Monkey' },
  morph:        { color: 'purple',    label: 'Morph' },
  panda:        { color: 'black',     label: 'Panda' },
  rat:          { color: 'brown',     label: 'Rat' },
  rocky:        { color: 'gray',      label: 'Rocky' },
  'rubber-duck':{ color: 'yellow',    label: 'Duck' },
  skeleton:     { color: 'blue',      label: 'Skeleton' },
  snail:        { color: 'brown',     label: 'Snail' },
  snake:        { color: 'green',     label: 'Snake' },
  totoro:       { color: 'gray',      label: 'Totoro' },
  turtle:       { color: 'green',     label: 'Turtle' },
  vampire:      { color: 'converted', label: 'Vampire' },
  zappy:        { color: 'yellow',    label: 'Zappy' },
};

const ANIMALS = Object.keys(ANIMAL_MAP);
const STORAGE_KEY = 'portfolio-pet';
const NO_PET = 'none';

const RANDOM_DEFAULTS: Array<{ animal: string; color: string }> = [
  { animal: 'dog',   color: 'brown' },
  { animal: 'deno',  color: 'green' },
  { animal: 'panda', color: 'black' },
];

function getStored(): { animal: string; color: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // No stored preference — pick randomly between dog, deno, panda
  const pick = RANDOM_DEFAULTS[Math.floor(Math.random() * RANDOM_DEFAULTS.length)];
  return pick!;
}

export function PetLauncher() {
  const [pet, setPet] = useState<{ animal: string; color: string }>({ animal: 'dog', color: 'brown' });
  const [open, setOpen] = useState(false);
  const [petPos, setPetPos] = useState<{ x: number; y: number } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setPet(getStored());
  }, []);

  const trackPos = useCallback(() => {
    const el = document.querySelector('[data-webpet-container]') as HTMLElement;
    if (el) {
      const rect = el.getBoundingClientRect();
      setPetPos({ x: rect.left + rect.width / 2, y: rect.top });
    }
    rafRef.current = requestAnimationFrame(trackPos);
  }, []);

  useEffect(() => {
    if (open) {
      rafRef.current = requestAnimationFrame(trackPos);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [open, trackPos]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const petEl = document.querySelector('[data-webpet-container]');
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        (!petEl || !petEl.contains(e.target as Node))
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const select = (animal: string) => {
    const color = ANIMAL_MAP[animal]?.color ?? 'brown';
    const next = { animal, color };
    setPet(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setOpen(false);
  };

  const getPopoverStyle = (): React.CSSProperties => {
    const popW = 272;
    const gap = 10;
    if (!petPos) {
      return { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: popW, zIndex: 10000 };
    }
    const left = Math.min(Math.max(8, petPos.x - popW / 2), window.innerWidth - popW - 8);
    return {
      position: 'fixed',
      top: petPos.y - gap,
      left,
      width: popW,
      zIndex: 10000,
      transform: 'translateY(-100%)',
    };
  };

  const isNone = pet.animal === NO_PET;

  return (
    <>
      {!isNone && (
        <WebPet
          animal={pet.animal}
          color={pet.color}
          followMouse={true}
          paused={open}
          speed={12}
          onClick={() => setOpen(o => !o)}
        />
      )}

      {open && (
        <div ref={popoverRef} style={getPopoverStyle()}>
          <div
            style={{
              background: 'var(--card, #fafafa)',
              border: '1px solid var(--border, rgba(0,0,0,0.08))',
              borderRadius: 18,
              padding: '10px 10px 8px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
            }}
          >
            <p style={{
              fontSize: 9,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text-ghost, rgba(0,0,0,0.3))',
              marginBottom: 7,
              fontWeight: 500,
            }}>
              Choose pet
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 3 }}>
              {/* No pet option */}
              <PetButton
                isSelected={isNone}
                onClick={() => select(NO_PET)}
                title="None"
              >
                <span style={{
                  width: 28, height: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                  color: isNone ? 'var(--text-primary, rgba(0,0,0,0.7))' : 'var(--text-ghost, rgba(0,0,0,0.3))',
                }}>✕</span>
                <span style={labelStyle(isNone)}>None</span>
              </PetButton>

              {ANIMALS.map((animal) => {
                const isSelected = !isNone && pet.animal === animal;
                return (
                  <PetButton key={animal} isSelected={isSelected} onClick={() => select(animal)} title={ANIMAL_MAP[animal]?.label}>
                    <img
                      src={`/media/${animal}/icon.png`}
                      alt={ANIMAL_MAP[animal]?.label}
                      width={28}
                      height={28}
                      style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
                    />
                    <span style={labelStyle(isSelected)}>{ANIMAL_MAP[animal]?.label}</span>
                  </PetButton>
                );
              })}
            </div>

            <a
              href="https://github.com/sankalpaacharya/webpets"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                marginTop: 8,
                fontSize: 9,
                color: 'var(--text-ghost, rgba(0,0,0,0.28))',
                textDecoration: 'none',
                transition: 'color 0.12s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted, rgba(0,0,0,0.5))'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-ghost, rgba(0,0,0,0.28))'; }}
            >
              <HugeiconsIcon icon={Github01Icon} size={10} />
              webpets by sankalpa
            </a>
          </div>
        </div>
      )}

      {/* Floating trigger when pet is hidden */}
      {isNone && (
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: '1px solid var(--border, rgba(0,0,0,0.08))',
            background: 'var(--card, #fafafa)',
            cursor: 'pointer',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            color: 'var(--text-ghost, rgba(0,0,0,0.4))',
          }}
          title="Choose pet"
        >
          <HugeiconsIcon icon={Add01Icon} size={14} />
        </button>
      )}
    </>
  );
}

function PetButton({ isSelected, onClick, title, children }: {
  isSelected: boolean;
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        padding: '6px 4px 5px',
        borderRadius: 10,
        border: 'none',
        background: isSelected ? 'var(--muted-bg, rgba(0,0,0,0.06))' : 'transparent',
        cursor: 'pointer',
        transition: 'background 0.12s',
        outline: 'none',
      }}
      onMouseEnter={e => {
        if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--muted-bg, rgba(0,0,0,0.04))';
      }}
      onMouseLeave={e => {
        if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent';
      }}
    >
      {children}
    </button>
  );
}

function labelStyle(isSelected: boolean): React.CSSProperties {
  return {
    fontSize: 9,
    color: isSelected ? 'var(--text-primary, rgba(0,0,0,0.85))' : 'var(--text-ghost, rgba(0,0,0,0.4))',
    fontWeight: isSelected ? 500 : 400,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 44,
    lineHeight: 1.2,
  };
}
