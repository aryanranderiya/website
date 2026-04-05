'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- icons used in JSX
import {
  HugeiconsIcon,
  Sun01Icon, Moon02Icon, Cancel01Icon, SidebarRightIcon,
  Home12Icon, Folder03Icon, BrushIcon, QuillWrite01Icon,
  NoteIcon, Briefcase01Icon, Books02Icon, Film01Icon, CarouselHorizontalIcon,
  SparklesIcon, ColorsIcon, Clock01Icon, ShuffleIcon,
} from '@icons';
import type { ComponentType } from 'react';
import type { IconProps } from '@theexperiencecompany/gaia-icons';
import { PAGES } from '@/constants/navigation';
import { useAfterPreloader } from '@/hooks/useAfterPreloader';

const NAV_GROUPS: { label: string | null; items: { href: string; label: string; icon: ComponentType<IconProps> }[] }[] = [
  {
    label: null,
    items: [
      { href: '/',              label: 'Home',      icon: Home12Icon },
      { href: '/projects',      label: 'Projects',  icon: Folder03Icon },
      { href: '/graphic-design',label: 'Design',    icon: BrushIcon },
      { href: '/blog',          label: 'Blog',      icon: QuillWrite01Icon },
      { href: '/resume',        label: 'Resume',    icon: NoteIcon },
      { href: '/freelance',     label: 'Freelance', icon: Briefcase01Icon },
      { href: '/now',           label: 'Now',       icon: Clock01Icon },
    ],
  },
  {
    label: 'Extra',
    items: [
      { href: '/tools',        label: 'Tools',   icon: SparklesIcon },
      { href: '/books',        label: 'Books',   icon: Books02Icon },
      { href: '/movies',       label: 'Movies',  icon: Film01Icon },
      { href: '/camera-roll',  label: 'Gallery', icon: CarouselHorizontalIcon },
    ],
  },
];

type Theme = 'light' | 'dark' | 'random';
type Typography = 'helvetica' | 'inter' | 'georgia' | 'palatino' | 'mono' | 'pixel' | 'impact' | 'comic';

const TYPOGRAPHY_OPTIONS: { id: Typography; label: string; family: string }[] = [
  { id: 'helvetica', label: 'Helvetica',  family: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
  { id: 'inter',     label: 'Inter',      family: "'Inter var', Inter, sans-serif" },
  { id: 'georgia',   label: 'Georgia',    family: "Georgia, 'Times New Roman', serif" },
  { id: 'palatino',  label: 'Palatino',   family: "'Palatino Linotype', Palatino, 'Book Antiqua', serif" },
  { id: 'mono',      label: 'Mono',       family: "ui-monospace, 'Courier New', monospace" },
  { id: 'pixel',     label: 'Pixel',      family: "'VT323', monospace" },
  { id: 'impact',    label: 'Impact',     family: "Impact, 'Arial Narrow', sans-serif" },
  { id: 'comic',     label: 'Comic',      family: "'Comic Sans MS', 'Chalkboard SE', cursive" },
];

const RANDOM_VARS = [
  '--background', '--foreground', '--card', '--card-foreground',
  '--popover', '--popover-foreground', '--primary', '--primary-foreground',
  '--glass-bg', '--accent-blue',
];

function applyRandomPalette(hue: number, sat: number) {
  const l = Math.max(88, Math.round(96 - (sat - 25) * 0.23));
  const root = document.documentElement;
  root.style.setProperty('--background',          `hsl(${hue}, ${sat}%, ${l}%)`);
  root.style.setProperty('--foreground',          `hsl(${hue}, 22%, 11%)`);
  root.style.setProperty('--card',                `hsl(${hue}, ${Math.round(sat * 0.7)}%, ${Math.min(l + 2, 98)}%)`);
  root.style.setProperty('--card-foreground',     `hsl(${hue}, 22%, 11%)`);
  root.style.setProperty('--popover',             `hsl(${hue}, ${Math.round(sat * 0.7)}%, ${Math.min(l + 2, 98)}%)`);
  root.style.setProperty('--popover-foreground',  `hsl(${hue}, 22%, 11%)`);
  root.style.setProperty('--primary',             `hsl(${hue}, 22%, 11%)`);
  root.style.setProperty('--primary-foreground',  `hsl(${hue}, ${sat}%, ${l}%)`);
  root.style.setProperty('--glass-bg',            `hsla(${hue}, ${sat}%, ${l}%, 0.85)`);
  root.style.setProperty('--accent-blue',         `hsl(${hue}, 72%, 52%)`);
}

function clearRandomPalette() {
  RANDOM_VARS.forEach(v => document.documentElement.style.removeProperty(v));
}

function applyTypography(font: Typography) {
  const root = document.documentElement;
  if (font === 'helvetica') {
    // Helvetica is the CSS default — remove any override
    root.style.removeProperty('font-family');
  } else {
    if (font === 'pixel' && !document.getElementById('pixel-font-link')) {
      const link = document.createElement('link');
      link.id = 'pixel-font-link';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=VT323&display=swap';
      document.head.appendChild(link);
    }
    const option = TYPOGRAPHY_OPTIONS.find(o => o.id === font);
    if (option) root.style.setProperty('font-family', option.family);
  }
  localStorage.setItem('typography', font);
}

export default function Sidebar() {
  const [pathname, setPathname] = useState('/');
  const [theme, setTheme] = useState<Theme>('light');
  const [typography, setTypography] = useState<Typography>('helvetica');
  const [shuffleOpen, setShuffleOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(() => Math.random() < 0.5 ? '/avatar-original.webp' : '/avatar.webp');
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const popoverRef = useRef<HTMLDivElement>(null);
  const shuffleBtnRef = useRef<HTMLButtonElement>(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    setPathname(window.location.pathname);
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored === 'dark') setTheme('dark');
    else if (stored === 'random') setTheme('random');
    else setTheme('light');

    const storedFont = localStorage.getItem('typography') as Typography | null;
    if (storedFont) setTypography(storedFont);

    const handleThemeChange = () => {
      const t = localStorage.getItem('theme') as Theme | null;
      if (t === 'random') setTheme('random');
      else setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    };
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const handleNavigation = () => {
      setPathname(window.location.pathname);
      setMobileOpen(false);
    };
    document.addEventListener('astro:page-load', handleNavigation);

    return () => {
      observer.disconnect();
      document.removeEventListener('astro:page-load', handleNavigation);
    };
  }, []);

  // Close popover on outside click or Escape
  useEffect(() => {
    if (!shuffleOpen) return;
    function onMouseDown(e: MouseEvent) {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        shuffleBtnRef.current && !shuffleBtnRef.current.contains(e.target as Node)
      ) {
        setShuffleOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setShuffleOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [shuffleOpen]);

  function handleThemeButtonClick() {
    const html = document.documentElement;
    if (theme === 'light') {
      html.classList.add('dark');
      clearRandomPalette();
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
      setShuffleOpen(false);
    } else if (theme === 'dark') {
      // Advance to random and open the customization popover
      html.classList.remove('dark');
      const hue = Math.floor(Math.random() * 360);
      const sat = Math.floor(Math.random() * 36) + 25;
      applyRandomPalette(hue, sat);
      localStorage.setItem('theme', 'random');
      localStorage.setItem('randomHue', String(hue));
      localStorage.setItem('randomSat', String(sat));
      setTheme('random');
      setShuffleOpen(true);
    } else {
      // random -> light
      html.classList.remove('dark');
      clearRandomPalette();
      localStorage.setItem('theme', 'light');
      setTheme('light');
      setShuffleOpen(false);
    }
  }

  function handleShuffleColors() {
    // Re-shuffle colors while staying in random state
    const hue = Math.floor(Math.random() * 360);
    const sat = Math.floor(Math.random() * 36) + 25;
    applyRandomPalette(hue, sat);
    localStorage.setItem('randomHue', String(hue));
    localStorage.setItem('randomSat', String(sat));
  }

  function handleShuffleFont() {
    const others = TYPOGRAPHY_OPTIONS.filter(o => o.id !== typography);
    const pick = others[Math.floor(Math.random() * others.length)];
    applyTypography(pick.id);
    setTypography(pick.id);
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const anyActive = NAV_GROUPS.flatMap(g => g.items).some(item => isActive(item.href));

  const linkStyle = (href: string, secondary?: boolean): React.CSSProperties => ({
    fontSize: secondary ? '11px' : '12px',
    fontVariationSettings: isActive(href) ? '"wght" 580' : '"wght" 450',
    color: isActive(href)
      ? isDark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.85)'
      : secondary
        ? isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)'
        : anyActive
          ? isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)'
          : isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)',
    textDecoration: 'none',
    display: 'block',
    padding: '2px 0',
    transition: 'color 0.15s ease, font-variation-settings 0.25s ease',
    whiteSpace: 'nowrap' as const,
    letterSpacing: '-0.01em',
  });

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: '10px',
    fontVariationSettings: '"wght" 500',
    color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    marginTop: '16px',
    marginBottom: '4px',
  };

  const actionStyle: React.CSSProperties = {
    fontSize: '12px',
    fontVariationSettings: '"wght" 450',
    color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)',
    background: 'none',
    border: 'none',
    padding: '2px 0',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'color 0.15s ease',
  };

  const themeLabel = theme === 'light' ? 'Dark' : theme === 'dark' ? 'Shuffle' : 'Light';
  const themeIcon = theme === 'light' ? Moon02Icon : theme === 'dark' ? ColorsIcon : Sun01Icon;
  const ready = useAfterPreloader();

  const sidebarContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05, delayChildren: 0 } },
  };
  const sidebarItem = {
    hidden: { opacity: 0, x: -5, filter: 'blur(3px)' },
    show: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.4, ease: [0.19, 1, 0.22, 1] as const } },
  };

  const popoverLabel: React.CSSProperties = {
    fontSize: '9px',
    fontVariationSettings: '"wght" 600',
    color: 'var(--muted-foreground)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    margin: '0 0 6px 0',
    fontFamily: "'Inter var', Inter, sans-serif",
  };

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <nav
        className="hidden-mobile fixed flex-col gap-0.5 bg-transparent border-none overflow-visible z-40"
        style={{
          top: '60px',
          bottom: '128px',
          left: 'calc(50% - 320px - 120px - 32px)',
          width: '100px',
        }}
      >

        <motion.div
          variants={sidebarContainer}
          initial="hidden"
          animate={ready ? "show" : "hidden"}
          style={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}
        >

        {/* Profile photo */}
        <motion.div variants={sidebarItem} className="mb-4">
          <img
            src={avatarSrc}
            alt="Aryan Randeriya"
            width={32}
            height={32}
            className="rounded-full block opacity-90 cursor-pointer"
            onClick={() => setAvatarSrc(s => s === '/avatar-original.webp' ? '/avatar.webp' : '/avatar-original.webp')}
          />
        </motion.div>

        {/* Nav groups */}
        {NAV_GROUPS.map((group, gi) => (
          <motion.div
            variants={sidebarItem}
            key={gi}
            style={gi > 0 ? { marginTop: 16 } : undefined}
          >
            {group.label && (
              <div style={sectionLabelStyle}>{group.label}</div>
            )}
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                return (
                <a
                  key={item.href}
                  href={item.href}
                  style={{ ...linkStyle(item.href), display: 'flex', alignItems: 'center', gap: '6px' }}
                  onMouseEnter={e => {
                    if (!isActive(item.href)) {
                      (e.currentTarget as HTMLAnchorElement).style.color = isDark
                        ? 'rgba(255,255,255,0.60)'
                        : 'rgba(0,0,0,0.58)';
                      (e.currentTarget as HTMLAnchorElement).style.fontVariationSettings = '"wght" 520';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive(item.href)) {
                      (e.currentTarget as HTMLAnchorElement).style.color = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';
                      (e.currentTarget as HTMLAnchorElement).style.fontVariationSettings = '"wght" 450';
                    }
                  }}
                >
                  <HugeiconsIcon icon={item.icon} size={14} color="currentColor" style={{ flexShrink: 0 }} />
                  {item.label}
                </a>
                );
              })}
            </div>
          </motion.div>
        ))}

        {/* Bottom actions */}
        <motion.div variants={sidebarItem} className="mt-auto pt-6 flex flex-col gap-1">
          {/* Built in Astro */}
          <a
            href="https://astro.build"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Built in Astro"
            style={{
              ...actionStyle,
              color: hoveredAction === 'astro'
                ? isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                : isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.50)',
            }}
            onMouseEnter={() => setHoveredAction('astro')}
            onMouseLeave={() => setHoveredAction(null)}
          >
            <img
              src={isDark ? "https://astro.build/assets/press/astro-icon-light-gradient.png" : "https://astro.build/assets/press/astro-icon-dark.svg"}
              width={13}
              height={13}
              alt="Astro"
              className="rounded-[3px]"
            />
            <span style={{
              fontSize: '11px',
              whiteSpace: 'nowrap',
              display: 'inline-block',
              opacity: hoveredAction === 'astro' ? 1 : 0,
              transform: hoveredAction === 'astro'
                ? 'translateY(0) perspective(300px) rotateX(0deg)'
                : 'translateY(5px) perspective(300px) rotateX(-40deg)',
              transformOrigin: '50% 100%',
              transition: 'opacity 0.2s ease, transform 0.25s cubic-bezier(0.19, 1, 0.22, 1)',
            }}>Built in Astro</span>
          </a>
          {/* Old portfolio */}
          <a
            href="https://old.aryanranderiya.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Old portfolio (old.aryanranderiya.com)"
            style={{
              ...actionStyle,
              color: hoveredAction === 'old-portfolio'
                ? isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                : isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.50)',
            }}
            onMouseEnter={() => setHoveredAction('old-portfolio')}
            onMouseLeave={() => setHoveredAction(null)}
          >
            <img
              src="/old-portfolio-logo.webp"
              width={13}
              height={13}
              alt="Old portfolio"
              className="rounded-[2px]"
            />
            <span style={{
              fontSize: '11px',
              whiteSpace: 'nowrap',
              display: 'inline-block',
              opacity: hoveredAction === 'old-portfolio' ? 1 : 0,
              transform: hoveredAction === 'old-portfolio'
                ? 'translateY(0) perspective(300px) rotateX(0deg)'
                : 'translateY(5px) perspective(300px) rotateX(-40deg)',
              transformOrigin: '50% 100%',
              textDecoration: hoveredAction === 'old-portfolio' ? 'underline' : 'none',
              textDecorationStyle: 'dotted',
              textUnderlineOffset: '3px',
              transition: 'opacity 0.2s ease, transform 0.25s cubic-bezier(0.19, 1, 0.22, 1)',
            }}>Old portfolio</span>
          </a>

          {/* Theme toggle + shuffle popover */}
          <div style={{ position: 'relative' }}>
            <button
              ref={shuffleBtnRef}
              onClick={handleThemeButtonClick}
              style={{
                ...actionStyle,
                color: hoveredAction === 'theme' || shuffleOpen
                  ? isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                  : isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.50)',
              }}
              onMouseEnter={() => setHoveredAction('theme')}
              onMouseLeave={() => setHoveredAction(null)}
              aria-label="Cycle theme"
            >
              <HugeiconsIcon icon={themeIcon} size={13} />
              <span style={{
                fontSize: '11px',
                whiteSpace: 'nowrap',
                display: 'inline-block',
                opacity: hoveredAction === 'theme' || shuffleOpen ? 1 : 0,
                transform: hoveredAction === 'theme' || shuffleOpen
                  ? 'translateY(0) perspective(300px) rotateX(0deg)'
                  : 'translateY(5px) perspective(300px) rotateX(-40deg)',
                transformOrigin: '50% 100%',
                transition: 'opacity 0.2s ease, transform 0.25s cubic-bezier(0.19, 1, 0.22, 1)',
              }}>{themeLabel}</span>
            </button>

            <AnimatePresence>
              {shuffleOpen && (
                <motion.div
                  ref={popoverRef}
                  initial={{ opacity: 0, x: -6, scale: 0.97 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -6, scale: 0.97 }}
                  transition={{ duration: 0.16, ease: [0.19, 1, 0.22, 1] }}
                  style={{
                    position: 'absolute',
                    left: 'calc(100% + 14px)',
                    bottom: '-4px',
                    width: '164px',
                    background: 'var(--popover)',
                    borderRadius: '12px',
                    padding: '12px',
                    zIndex: 200,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '10px', fontVariationSettings: '"wght" 560', color: 'var(--foreground)', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", letterSpacing: '-0.01em' }}>Customize</span>
                    <button
                      onClick={() => setShuffleOpen(false)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', color: 'var(--muted-foreground)', lineHeight: 1 }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--foreground)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted-foreground)')}
                      aria-label="Close"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} size={12} color="currentColor" />
                    </button>
                  </div>
                  <p style={popoverLabel}>Colors</p>
                  <button
                    onClick={handleShuffleColors}
                    aria-label="Shuffle color palette"
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'var(--muted-bg)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 8px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontVariationSettings: '"wght" 480',
                      color: 'var(--foreground)',
                      fontFamily: "'Inter var', Inter, sans-serif",
                      transition: 'opacity 0.15s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.65')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    <HugeiconsIcon icon={ShuffleIcon} size={12} color="currentColor" />
                    Shuffle palette
                  </button>

                  <p style={{ ...popoverLabel, marginTop: '12px' }}>Typography</p>
                  <button
                    onClick={handleShuffleFont}
                    aria-label="Shuffle typography"
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'var(--muted-bg)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 8px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontVariationSettings: '"wght" 480',
                      color: 'var(--foreground)',
                      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                      transition: 'opacity 0.15s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.65')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    <HugeiconsIcon icon={ShuffleIcon} size={12} color="currentColor" />
                    Shuffle font
                  </button>
                  {/* Current font preview */}
                  <div style={{
                    fontFamily: TYPOGRAPHY_OPTIONS.find(o => o.id === typography)?.family,
                    fontSize: typography === 'pixel' ? '13px' : '10px',
                    color: 'var(--muted-foreground)',
                    marginTop: '6px',
                    letterSpacing: typography === 'mono' ? '-0.02em' : '0',
                  }}>
                    {TYPOGRAPHY_OPTIONS.find(o => o.id === typography)?.label}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* GitHub */}
          <a
            href="https://github.com/aryanranderiya/website"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source on GitHub"
            style={{
              ...actionStyle,
              color: hoveredAction === 'github'
                ? isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                : isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.50)',
            } as React.CSSProperties}
            onMouseEnter={() => setHoveredAction('github')}
            onMouseLeave={() => setHoveredAction(null)}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            <span style={{
              fontSize: '11px',
              whiteSpace: 'nowrap',
              display: 'inline-block',
              opacity: hoveredAction === 'github' ? 1 : 0,
              transform: hoveredAction === 'github'
                ? 'translateY(0) perspective(300px) rotateX(0deg)'
                : 'translateY(5px) perspective(300px) rotateX(-40deg)',
              transformOrigin: '50% 100%',
              textDecoration: hoveredAction === 'github' ? 'underline' : 'none',
              textDecorationStyle: 'dotted',
              textUnderlineOffset: '3px',
              transition: 'opacity 0.2s ease, transform 0.25s cubic-bezier(0.19, 1, 0.22, 1)',
            }}>GitHub</span>
          </a>
        </motion.div>

        </motion.div>
      </nav>

      {/* ── Mobile top bar ── */}
      <div
        className="mobile-nav-bar fixed top-0 left-0 right-0 h-[52px] flex items-center justify-between px-5 backdrop-blur-[12px] z-50"
        style={{ background: 'var(--glass-bg)' }}
      >
        <a href="/" style={{
          fontSize: '13px',
          fontVariationSettings: '"wght" 600',
          color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)',
          letterSpacing: '-0.02em',
          textDecoration: 'none',
        }}>
          Aryan Randeriya
        </a>
        <div className="flex items-center gap-3">
          <button
            onClick={handleThemeButtonClick}
            className="bg-none border-none cursor-pointer p-1 flex items-center"
            style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }}
            aria-label="Cycle theme"
          >
            <HugeiconsIcon icon={themeIcon} size={13} />
          </button>
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="bg-none border-none cursor-pointer p-1 flex items-center"
            style={{ color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)' }}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <HugeiconsIcon icon={mobileOpen ? Cancel01Icon : SidebarRightIcon} size={16} />
          </button>
        </div>
      </div>

      {/* ── Mobile shuffle popover ── */}
      <AnimatePresence>
        {shuffleOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.19, 1, 0.22, 1] }}
            className="mobile-only-block"
            style={{
              position: 'fixed',
              top: '60px',
              left: '16px',
              right: '16px',
              background: 'var(--popover)',
              borderRadius: '12px',
              padding: '14px',
              zIndex: 60,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', fontVariationSettings: '"wght" 560', color: 'var(--foreground)', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", letterSpacing: '-0.01em' }}>Customize</span>
              <button
                onClick={() => setShuffleOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', color: 'var(--muted-foreground)', lineHeight: 1 }}
                aria-label="Close"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={13} color="currentColor" />
              </button>
            </div>
            <p style={popoverLabel}>Colors</p>
            <button
              onClick={handleShuffleColors}
              aria-label="Shuffle color palette"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--muted-bg)',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 10px',
                cursor: 'pointer',
                fontSize: '12px',
                fontVariationSettings: '"wght" 480',
                color: 'var(--foreground)',
                fontFamily: "'Inter var', Inter, sans-serif",
              }}
            >
              <HugeiconsIcon icon={ShuffleIcon} size={13} color="currentColor" />
              Shuffle palette
            </button>
            <p style={{ ...popoverLabel, marginTop: '12px' }}>Typography</p>
            <button
              onClick={handleShuffleFont}
              aria-label="Shuffle typography"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--muted-bg)',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 10px',
                cursor: 'pointer',
                fontSize: '12px',
                fontVariationSettings: '"wght" 480',
                color: 'var(--foreground)',
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              }}
            >
              <HugeiconsIcon icon={ShuffleIcon} size={13} color="currentColor" />
              Shuffle font
            </button>
            <div style={{
              fontFamily: TYPOGRAPHY_OPTIONS.find(o => o.id === typography)?.family,
              fontSize: typography === 'pixel' ? '14px' : '11px',
              color: 'var(--muted-foreground)',
              marginTop: '6px',
              letterSpacing: typography === 'mono' ? '-0.02em' : '0',
            }}>
              {TYPOGRAPHY_OPTIONS.find(o => o.id === typography)?.label}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile fullscreen menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
            className="fixed inset-0 z-[48]"
            style={{ background: 'var(--background)' }}
          >
            {/* Close button top-right */}
            <div className="flex items-center justify-between px-5 h-[52px]">
              <a href="/" style={{
                fontSize: '13px',
                fontVariationSettings: '"wght" 600',
                color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)',
                letterSpacing: '-0.02em',
                textDecoration: 'none',
              }}>
                Aryan Randeriya
              </a>
              <button
                onClick={() => setMobileOpen(false)}
                className="bg-none border-none cursor-pointer p-1 flex items-center"
                style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }}
                aria-label="Close menu"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} />
              </button>
            </div>

            {/* Nav links */}
            <div className="px-6 pt-6">
              {NAV_GROUPS.map((group, gi) => (
                <div key={gi} style={{ marginBottom: group.label ? '0' : '8px' }}>
                  {group.label && (
                    <div style={{ ...sectionLabelStyle, marginTop: gi === 0 ? '0' : '20px' }}>
                      {group.label}
                    </div>
                  )}
                  {group.items.map(item => (
                    <a
                      key={item.href}
                      href={item.href}
                      style={{
                        ...linkStyle(item.href),
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '9px 0',
                        fontSize: '15px',
                      }}
                      onClick={() => setMobileOpen(false)}
                    >
                      <HugeiconsIcon icon={item.icon} size={16} style={{ flexShrink: 0, opacity: 0.85 }} />
                      {item.label}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 960px) {
          .hidden-mobile { display: flex !important; }
          .mobile-nav-bar { display: none !important; }
          .mobile-only-block { display: none !important; }
        }
        @media (max-width: 959px) {
          .hidden-mobile { display: none !important; }
          .mobile-nav-bar { display: flex !important; }
        }
      `}</style>
    </>
  );
}
