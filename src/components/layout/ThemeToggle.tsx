'use client';

import { useEffect, useState } from 'react';
import { HugeiconsIcon, Sun01Icon, Moon02Icon } from '@icons';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const html = document.documentElement;
    const next = !html.classList.contains('dark');
    html.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    setIsDark(next);
  }

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className="w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ color: 'var(--muted-foreground)' }}
      >
        <span className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:opacity-70"
      style={{
        color: 'var(--muted-foreground)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <HugeiconsIcon icon={isDark ? Sun01Icon : Moon02Icon} size={16} />
    </button>
  );
}
