'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HugeiconsIcon, Search01Icon, ChevronRight } from '@icons';
import { useAfterPreloader } from '@/hooks/useAfterPreloader';

interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  category?: string;
  featured?: boolean;
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function BlogSearch({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const ready = useAfterPreloader();

  const filtered = useMemo(() => {
    if (!query.trim()) return posts;
    const q = query.toLowerCase();
    return posts.filter(
      p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [posts, query]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
      animate={ready ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] as const }}
    >
      {/* Header row: title left, search right */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1.2 }}>
            Blog
          </h1>
        </div>

        {/* Pill search — matches ProjectsGrid style */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <span style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            display: 'flex', alignItems: 'center', color: 'var(--text-ghost)', pointerEvents: 'none',
          }}>
            <HugeiconsIcon icon={Search01Icon} size={12} color="var(--text-ghost)" />
          </span>
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search..."
            style={{
              background: 'var(--muted-bg)',
              border: 'none',
              borderRadius: '9999px',
              padding: `5px ${!focused && !query ? '36px' : '14px'} 5px 28px`,
              fontSize: '12px',
              color: 'var(--text-primary)',
              outline: 'none',
              letterSpacing: '-0.01em',
              width: '140px',
            }}
            aria-label="Search blog posts"
          />
          {!focused && !query && (
            <kbd style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              fontSize: '10px', color: 'var(--text-ghost)', pointerEvents: 'none',
              fontFamily: 'inherit', letterSpacing: '0',
            }}>
              ⌘F
            </kbd>
          )}
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: 32 }}
          >
            No posts match that search.
          </motion.p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map((post, i) => (
              <motion.a
                key={post.slug}
                href={`/blog/${post.slug}`}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.3,
                  delay: query ? 0 : Math.min(i, 5) * 0.05,
                  ease: [0.19, 1, 0.22, 1],
                }}
                className="group"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '10px 8px',
                  margin: '0 -8px',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                  transition: 'background 150ms ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted-bg)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <time style={{ width: 72, flexShrink: 0, fontSize: 11, color: 'var(--text-ghost)', lineHeight: 1 }}>
                  {formatDateShort(post.date)}
                </time>

                <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    letterSpacing: '-0.01em',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {post.title}
                  </span>
                  {post.featured && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 500,
                      padding: '2px 6px',
                      borderRadius: '9999px',
                      background: 'var(--border)',
                      color: 'var(--text-muted)',
                      flexShrink: 0,
                      letterSpacing: '0.02em',
                    }}>
                      Featured
                    </span>
                  )}
                </div>

                {post.category && (
                  <span style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: 'var(--text-ghost)',
                    flexShrink: 0,
                    letterSpacing: '0.02em',
                    textTransform: 'capitalize',
                  }}>
                    {post.category}
                  </span>
                )}

                <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', color: 'var(--text-ghost)' }}>
                  <ChevronRight size={12} />
                </span>
              </motion.a>
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
