'use client';

import { ChevronRight, HugeiconsIcon, Search01Icon } from '@icons';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
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
			(p) =>
				p.title.toLowerCase().includes(q) ||
				p.description.toLowerCase().includes(q) ||
				p.tags.some((t) => t.toLowerCase().includes(q))
		);
	}, [posts, query]);

	return (
		<motion.div
			initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
			animate={ready ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
			transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] as const }}
		>
			{/* Header row: title left, search right */}
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-[1.5rem] font-semibold tracking-[-0.02em] text-[var(--text-primary)] leading-[1.2] m-0">
						Blog
					</h1>
				</div>

				{/* Pill search */}
				<div className="relative shrink-0">
					<span className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center text-[var(--text-ghost)] pointer-events-none">
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
					<motion.p
						key="empty"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="text-[14px] text-[var(--text-muted)] mt-8 m-0"
					>
						No posts match that search.
					</motion.p>
				) : (
					<div className="flex flex-col">
						{filtered.map((post, i) => (
							<motion.a
								key={post.slug}
								href={`/${post.slug}`}
								layout
								initial={{ opacity: 0, y: 6 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0 }}
								transition={{
									duration: 0.3,
									delay: query ? 0 : Math.min(i, 5) * 0.05,
									ease: [0.19, 1, 0.22, 1],
								}}
								className={`flex items-center gap-4 py-[10px] px-2 -mx-2 rounded-[var(--radius-sm)] no-underline cursor-pointer transition-[background] duration-150 hover:bg-[var(--muted-bg)] ${i < filtered.length - 1 ? 'border-b border-[var(--border)]' : ''}`}
							>
								<time className="w-[72px] shrink-0 text-[11px] text-[var(--text-ghost)] leading-none">
									{formatDateShort(post.date)}
								</time>

								<div className="flex-1 min-w-0 flex items-center gap-2">
									<span className="text-[14px] font-medium text-[var(--text-secondary)] tracking-[-0.01em] truncate">
										{post.title}
									</span>
									{post.featured && (
										<span className="text-[10px] font-medium px-1.5 py-[2px] rounded-full bg-[var(--border)] text-[var(--text-muted)] shrink-0 tracking-[0.02em]">
											Featured
										</span>
									)}
								</div>

								{post.category && (
									<span className="text-[11px] font-medium text-[var(--text-ghost)] shrink-0 tracking-[0.02em] capitalize">
										{post.category}
									</span>
								)}

								<span className="shrink-0 flex items-center text-[var(--text-ghost)]">
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
