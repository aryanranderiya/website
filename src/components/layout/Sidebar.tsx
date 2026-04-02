'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PAGES } from '@/constants/navigation';

const NAV_GROUPS = [
  {
    label: null,
    items: [
      { href: '/',         label: 'Home' },
      { href: '/projects', label: 'Projects' },
      { href: '/graphic-design', label: 'Design' },
      { href: '/blog',     label: 'Writing' },
      { href: '/resume',   label: 'Resume' },
      { href: '/freelance', label: 'Freelance' },
    ],
  },
  {
    label: 'More',
    items: [
      { href: '/books',       label: 'Books' },
      { href: '/movies',      label: 'Movies' },
      { href: '/camera-roll', label: 'Photos' },
    ],
  },
];

function SunIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

// Mobile hamburger icon
function MenuIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

export default function Sidebar() {
  const [pathname, setPathname] = useState('/');
  const [isDark, setIsDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const linkStyle = (href: string, secondary?: boolean): React.CSSProperties => ({
    fontSize: secondary ? '11px' : '12px',
    fontVariationSettings: isActive(href) ? '"wght" 580' : '"wght" 450',
    color: isActive(href)
      ? isDark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.85)'
      : secondary
        ? isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.38)'
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
    color: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.38)',
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
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
        style={{
          position: 'fixed',
          top: '60px',
          bottom: '24px',
          left: 'calc(50% - 320px - 120px - 32px)',
          width: '100px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          background: 'transparent',
          border: 'none',
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'none',
          zIndex: 40,
        }}
        className="hidden-mobile"
      >
        {/* Profile photo */}
        <div style={{ marginBottom: 16 }}>
          <img
            src="https://github.com/aryanranderiya.png"
            alt="Aryan Randeriya"
            width={32}
            height={32}
            style={{
              borderRadius: '50%',
              display: 'block',
              opacity: 0.9,
            }}
          />
        </div>

        {/* Nav groups */}
        {NAV_GROUPS.map((group, gi) => (
          <motion.div
            key={gi}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: gi * 0.05, ease: [0.19, 1, 0.22, 1] }}
          >
            {group.label && (
              <div style={sectionLabelStyle}>{group.label}</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {group.items.map((item, ii) => {
                const isSecondary = gi === 1;
                return (
                <motion.a
                  key={item.href}
                  href={item.href}
                  style={linkStyle(item.href, isSecondary)}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: (gi * 0.05) + (ii * 0.03), ease: [0.19, 1, 0.22, 1] }}
                  onMouseEnter={e => {
                    if (!isActive(item.href)) {
                      (e.currentTarget as HTMLAnchorElement).style.color = isDark
                        ? 'rgba(255,255,255,0.65)'
                        : 'rgba(0,0,0,0.65)';
                      (e.currentTarget as HTMLAnchorElement).style.fontVariationSettings = '"wght" 520';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive(item.href)) {
                      (e.currentTarget as HTMLAnchorElement).style.color = isSecondary
                        ? isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.38)'
                        : isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.50)';
                      (e.currentTarget as HTMLAnchorElement).style.fontVariationSettings = '"wght" 450';
                    }
                  }}
                >
                  {item.label}
                </motion.a>
                );
              })}
            </div>
          </motion.div>
        ))}

        {/* Bottom actions */}
        <div style={{ marginTop: 'auto', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button
            onClick={toggleTheme}
            style={actionStyle}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = isDark
                ? 'rgba(255,255,255,0.6)'
                : 'rgba(0,0,0,0.6)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = isDark
                ? 'rgba(255,255,255,0.50)'
                : 'rgba(0,0,0,0.50)';
            }}
            aria-label="Toggle theme"
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
          <a
            href="https://github.com/aryanranderiya"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            style={actionStyle as React.CSSProperties}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.color = isDark
                ? 'rgba(255,255,255,0.6)'
                : 'rgba(0,0,0,0.6)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.color = isDark
                ? 'rgba(255,255,255,0.50)'
                : 'rgba(0,0,0,0.50)';
            }}
          >
            <GitHubIcon />
          </a>
        </div>
      </motion.nav>

      {/* ── Mobile top bar ── */}
      <div
        className="mobile-nav-bar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '52px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          background: isDark ? 'rgba(17,17,17,0.92)' : 'rgba(253,253,252,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          zIndex: 50,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={toggleTheme}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            onClick={() => setMobileOpen(v => !v)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
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
            style={{
              position: 'fixed',
              top: '52px',
              left: 0,
              right: 0,
              background: isDark ? 'rgba(17,17,17,0.97)' : 'rgba(253,253,252,0.97)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              zIndex: 49,
              padding: '16px 20px 20px',
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
                  const isSecondary = gi === 1;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      style={{
                        ...linkStyle(item.href, isSecondary),
                        display: 'block',
                        padding: '7px 0',
                        fontSize: isSecondary ? '12px' : '14px',
                      }}
                      onClick={() => setMobileOpen(false)}
                    >
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
