'use client';

import { HugeiconsIcon, Search01Icon } from '@icons';
import { AnimatePresence, LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAfterPreloader } from '@/hooks/useAfterPreloader';
import BlogList from './BlogList';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

interface Post {
	slug: string;
	title: string;
	date: string;
	description: string;
	tags: string[];
	category?: string;
	featured?: boolean;
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
			(p) =>
				p.title.toLowerCase().includes(q) ||
				p.description.toLowerCase().includes(q) ||
				p.tags.some((t) => t.toLowerCase().includes(q))
		);
	}, [posts, query]);

	return (
		<LazyMotion features={loadFeatures}>
			<m.div
				initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
				animate={ready ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
				transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] as const }}
			>
				{/* Header row: title left, search right */}
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-heading-1 m-0">Blog</h1>

					{/* Pill search */}
					<div className="relative shrink-0">
						<span className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
							<HugeiconsIcon icon={Search01Icon} size={12} color="var(--text-ghost)" />
						</span>
						<input
							ref={searchRef}
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							onFocus={() => setFocused(true)}
							onBlur={() => setFocused(false)}
							placeholder="Search..."
							className={`bg-[var(--muted-bg)] rounded-full pl-7 text-[12px] text-[var(--text-primary)] outline-none tracking-[-0.01em] w-[140px] py-[5px] ${!focused && !query ? 'pr-9' : 'pr-3.5'}`}
							aria-label="Search blog posts"
						/>
						{!focused && !query && (
							<kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-ghost)] pointer-events-none font-[inherit] tracking-[0]">
								⌘F
							</kbd>
						)}
					</div>
				</div>

				<AnimatePresence mode="popLayout">
					{filtered.length === 0 ? (
						<m.p
							key="empty"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="text-[14px] text-[var(--text-muted)] mt-8 m-0"
						>
							No posts match that search.
						</m.p>
					) : (
						<m.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
							<BlogList posts={filtered} animateDelay={!query} />
						</m.div>
					)}
				</AnimatePresence>
			</m.div>
		</LazyMotion>
	);
}
