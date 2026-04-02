'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- icons used in JSX
import {
  HugeiconsIcon,
  Sun01Icon, Moon02Icon, Menu01Icon, Cancel01Icon,
  Home12Icon, Folder03Icon, BrushIcon, QuillWrite01Icon,
  NoteIcon, Briefcase01Icon, Books02Icon, Film01Icon, CarouselHorizontalIcon,
  SparklesIcon,
} from '@icons';
import type { ComponentType } from 'react';
import type { IconProps } from '@theexperiencecompany/gaia-icons';
import { PAGES } from '@/constants/navigation';

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


export default function Sidebar() {
  const [pathname, setPathname] = useState('/');
  const [isDark, setIsDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(() => Math.random() < 0.5 ? '/avatar-original.webp' : '/avatar.webp');
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  useEffect(() => {
    setPathname(window.location.pathname);
    setIsDark(document.documentElement.classList.contains('dark'));

    const handleThemeChange = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Close mobile nav on route change
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

  const toggleTheme = () => {
    const html = document.documentElement;
    const newDark = !html.classList.contains('dark');
    html.classList.toggle('dark', newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    setIsDark(newDark);
  };

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
        ? isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.28)'
        : anyActive
          ? isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)'
          : isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.50)',
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
    color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.25)',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    marginTop: '16px',
    marginBottom: '4px',
  };

  const actionStyle: React.CSSProperties = {
    fontSize: '12px',
    fontVariationSettings: '"wght" 450',
    color: isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.50)',
    background: 'none',
    border: 'none',
    padding: '2px 0',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'color 0.15s ease',
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

        {/* Profile photo */}
        <div className="mb-4">
          <img
            src={avatarSrc}
            alt="Aryan Randeriya"
            width={32}
            height={32}
            className="rounded-full block opacity-90 cursor-pointer"
            onClick={() => setAvatarSrc(s => s === '/avatar-original.webp' ? '/avatar.webp' : '/avatar-original.webp')}
          />
        </div>

        {/* Nav groups */}
        {NAV_GROUPS.map((group, gi) => (
          <div
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
                      (e.currentTarget as HTMLAnchorElement).style.color = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)';
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
          </div>
        ))}

        {/* Bottom actions */}
        <div className="mt-auto pt-6 flex flex-col gap-1">
          {/* Built in Astro */}
          <a
            href="https://astro.build"
            target="_blank"
            rel="noopener noreferrer"
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
            href="https://aryanranderiya.com"
            target="_blank"
            rel="noopener noreferrer"
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
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            style={{
              ...actionStyle,
              color: hoveredAction === 'theme'
                ? isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                : isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.50)',
            }}
            onMouseEnter={() => setHoveredAction('theme')}
            onMouseLeave={() => setHoveredAction(null)}
            aria-label="Toggle theme"
          >
            <HugeiconsIcon icon={isDark ? Sun01Icon : Moon02Icon} size={13} />
            <span style={{
              fontSize: '11px',
              whiteSpace: 'nowrap',
              display: 'inline-block',
              opacity: hoveredAction === 'theme' ? 1 : 0,
              transform: hoveredAction === 'theme'
                ? 'translateY(0) perspective(300px) rotateX(0deg)'
                : 'translateY(5px) perspective(300px) rotateX(-40deg)',
              transformOrigin: '50% 100%',
              transition: 'opacity 0.2s ease, transform 0.25s cubic-bezier(0.19, 1, 0.22, 1)',
            }}>{isDark ? 'Light' : 'Dark'}</span>
          </button>
          {/* GitHub */}
          <a
            href="https://github.com/aryanranderiya"
            target="_blank"
            rel="noopener noreferrer"
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
        </div>
      </nav>

      {/* ── Mobile top bar ── */}
      <div
        className="mobile-nav-bar fixed top-0 left-0 right-0 h-[52px] flex items-center justify-between px-5 backdrop-blur-[12px] border-b z-50"
        style={{
          background: isDark ? 'rgba(17,17,17,0.92)' : 'rgba(253,253,252,0.92)',
          borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        }}
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
            onClick={toggleTheme}
            className="bg-none border-none cursor-pointer p-1 flex items-center"
            style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }}
          >
            <HugeiconsIcon icon={isDark ? Sun01Icon : Moon02Icon} size={13} />
          </button>
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="bg-none border-none cursor-pointer p-1 flex items-center"
            style={{ color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)' }}
            aria-label="Toggle menu"
          >
            <HugeiconsIcon icon={mobileOpen ? Cancel01Icon : Menu01Icon} size={16} />
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.19, 1, 0.22, 1] }}
            className="fixed top-[52px] left-0 right-0 backdrop-blur-[12px] border-b z-[49] px-5 pt-4 pb-5"
            style={{
              background: isDark ? 'rgba(17,17,17,0.97)' : 'rgba(253,253,252,0.97)',
              borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            }}
          >
            {NAV_GROUPS.map((group, gi) => (
              <div key={gi} style={{ marginBottom: group.label ? '0' : '8px' }}>
                {group.label && (
                  <div style={{ ...sectionLabelStyle, marginTop: gi === 0 ? '0' : '16px' }}>
                    {group.label}
                  </div>
                )}
                {group.items.map(item => {
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      style={{
                        ...linkStyle(item.href),
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '7px 0',
                        fontSize: '14px',
                      }}
                      onClick={() => setMobileOpen(false)}
                    >
                      <HugeiconsIcon icon={item.icon} size={16} style={{ flexShrink: 0, opacity: 0.85 }} />
                      {item.label}
                    </a>
                  );
                })}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 960px) {
          .hidden-mobile { display: flex !important; }
          .mobile-nav-bar { display: none !important; }
        }
        @media (max-width: 959px) {
          .hidden-mobile { display: none !important; }
          .mobile-nav-bar { display: flex !important; }
        }
      `}</style>
    </>
  );
}
