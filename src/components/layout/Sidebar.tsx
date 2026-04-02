'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- icons used in JSX
import { HugeiconsIcon, Sun01Icon, Moon02Icon, GithubIcon, Menu01Icon, Cancel01Icon } from '@icons';
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
    label: 'Extra',
    items: [
      { href: '/books',       label: 'Books' },
      { href: '/movies',      label: 'Movies' },
      { href: '/camera-roll', label: 'Photos' },
    ],
  },
];


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
            src="/avatar.webp"
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
            style={gi > 0 ? { marginTop: 16 } : undefined}
          >
            {group.label && (
              <div style={sectionLabelStyle}>{group.label}</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {group.items.map((item, ii) => {
                return (
                <motion.a
                  key={item.href}
                  href={item.href}
                  style={linkStyle(item.href)}
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
                      (e.currentTarget as HTMLAnchorElement).style.color = isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.50)';
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
          {/* Made in Astro */}
          <a
            href="https://astro.build"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              ...actionStyle,
              marginBottom: 8,
              gap: 5,
            }}
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
            <img
              src="https://www.google.com/s2/favicons?domain=astro.build&sz=32"
              width={13}
              height={13}
              alt="Astro"
              style={{ borderRadius: 3, display: 'block' }}
            />
            <span style={{ fontSize: '11px' }}>Astro</span>
          </a>
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
            <HugeiconsIcon icon={isDark ? Sun01Icon : Moon02Icon} size={13} />
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
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
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
            <HugeiconsIcon icon={isDark ? Sun01Icon : Moon02Icon} size={13} />
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
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      style={{
                        ...linkStyle(item.href),
                        display: 'block',
                        padding: '7px 0',
                        fontSize: '14px',
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
