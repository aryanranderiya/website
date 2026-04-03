'use client';

import { ChevronRight } from '@icons';
import { motion } from 'motion/react';

interface Post {
  slug: string;
  title: string;
  date: string;
  featured?: boolean;
}

interface BlogListProps {
  posts: Post[];
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function BlogList({ posts }: BlogListProps) {
  if (posts.length === 0) {
    return <p className="text-sm text-[var(--text-muted)] mt-8">No posts yet. Check back soon.</p>;
  }

  return (
    <div className="flex flex-col">
      {posts.map((post, i) => (
        <motion.a
          key={post.slug}
          href={`/blog/${post.slug}`}
          className="group flex items-center gap-4 py-2.5 px-2 -mx-2 border-b border-[var(--border)] no-underline rounded-[var(--radius-sm)] transition-colors duration-150 hover:bg-[var(--muted-bg)] cursor-pointer"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: Math.min(i, 5) * 0.05, ease: [0.19, 1, 0.22, 1] }}
        >
          <time className="w-20 shrink-0 text-[11px] text-[var(--text-ghost)] leading-none">
            {formatDateShort(post.date)}
          </time>

          <div className="flex-1 min-w-0 flex items-center gap-2">
            <span className="text-sm font-medium text-[var(--text-secondary)] tracking-[-0.01em] transition-colors duration-150 truncate group-hover:text-[var(--text-primary)]">
              {post.title}
            </span>
            {post.featured && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--border)] text-[var(--text-muted)] shrink-0 tracking-[0.02em]">
                Featured
              </span>
            )}
          </div>

          <span className="shrink-0 text-[var(--text-ghost)] flex items-center transition-colors duration-150 group-hover:text-[var(--text-secondary)]">
            <ChevronRight size={12} />
          </span>
        </motion.a>
      ))}
    </div>
  );
}
