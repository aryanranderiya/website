'use client';

import { motion } from 'framer-motion';

interface Post {
  slug: string;
  data: {
    title: string;
    date: string | Date;
    description?: string;
  };
}

interface BlogPreviewProps {
  posts: Post[];
}

const EASE = [0.19, 1, 0.22, 1] as const;

function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BlogPreview({ posts }: BlogPreviewProps) {
  const latest = posts.slice(0, 3);

  return (
    <section style={{ paddingBottom: 48 }}>
      <div className="section-header">Writing</div>

      <div>
        {latest.map((post, i) => (
          <motion.a
            key={post.slug}
            href={`/blog/${post.slug}`}
            initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, ease: EASE, delay: i * 0.05 }}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 14,
              padding: '10px 0',
              borderBottom: i < latest.length - 1 ? '1px solid var(--border)' : 'none',
              textDecoration: 'none',
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-ghost)',
                flexShrink: 0,
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1.5,
              }}
            >
              {formatDate(post.data.date)}
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                transition: 'color 150ms ease',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLSpanElement).style.color = 'var(--text-primary)')}
              onMouseLeave={e => ((e.currentTarget as HTMLSpanElement).style.color = 'var(--text-secondary)')}
            >
              {post.data.title}
            </span>
          </motion.a>
        ))}
      </div>

      <div style={{ marginTop: 14 }}>
        <a
          href="/blog"
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: 'var(--muted-bg)',
            borderRadius: 999,
            padding: '6px 14px',
            transition: 'filter 150ms ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.filter = 'brightness(0.96)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.filter = 'brightness(1)'; }}
        >
          All writing →
        </a>
      </div>
    </section>
  );
}
