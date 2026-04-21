'use client';

import { ChevronRight } from '@icons';
import { LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

export interface BlogPost {
	slug: string;
	title: string;
	date: string;
	featured?: boolean;
}

const EASE = [0.19, 1, 0.22, 1] as const;

function formatDate(dateStr: string): string {
	return new Date(dateStr).toLocaleDateString('en-US', {
		month: 'short',
		year: 'numeric',
	});
}

export default function BlogList({
	posts,
	animateDelay = true,
}: {
	posts: BlogPost[];
	animateDelay?: boolean;
}) {
	if (posts.length === 0) {
		return <p className="mt-8 text-[var(--text-muted)] text-sm">No posts yet. Check back soon.</p>;
	}

	return (
		<LazyMotion features={loadFeatures}>
			<div>
				{posts.map((post, i) => (
					<m.a
						key={post.slug}
						href={`/${post.slug}`}
						initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
						whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
						viewport={{ once: true, margin: '-40px' }}
						transition={{
							duration: 0.4,
							ease: EASE,
							delay: animateDelay ? Math.min(i, 5) * 0.05 : 0,
						}}
						className={[
							'group flex items-center gap-[14px] py-[10px] no-underline',
							'-mx-2 rounded-[var(--radius-sm)] px-2',
							'transition-[background] duration-150 hover:bg-[var(--muted-bg)]',
							i < posts.length - 1 ? 'border-[var(--border)] border-b' : '',
						].join(' ')}
					>
						<time className="w-[72px] shrink-0 text-[11px] text-[var(--text-ghost)] tabular-nums leading-[1.5]">
							{formatDate(post.date)}
						</time>

						<div className="flex min-w-0 flex-1 items-center gap-2">
							<span className="truncate font-medium text-[13px] text-[var(--text-secondary)] tracking-[-0.01em] transition-colors duration-150 group-hover:text-[var(--text-primary)]">
								{post.title}
							</span>
							{post.featured && (
								<span className="shrink-0 rounded-full bg-[var(--border)] px-1.5 py-[2px] font-medium text-[10px] text-[var(--text-muted)] tracking-[0.02em]">
									Featured
								</span>
							)}
						</div>

						<span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-ghost)] opacity-0 transition-opacity duration-150 group-hover:opacity-100">
							<ChevronRight size={13} />
						</span>
					</m.a>
				))}
			</div>
		</LazyMotion>
	);
}
