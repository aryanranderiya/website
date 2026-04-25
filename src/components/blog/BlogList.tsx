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
		day: 'numeric',
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
			<div className="dim-list blog-list">
				{posts.map((post, i) => (
					<m.div
						key={post.slug}
						initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
						whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
						viewport={{ once: true, margin: '-40px' }}
						transition={{
							duration: 0.4,
							ease: EASE,
							delay: animateDelay ? Math.min(i, 5) * 0.05 : 0,
						}}
					>
						<a
							href={`/${post.slug}`}
							className="dim-list-row group/item -mx-2 flex items-center gap-[14px] border-[var(--border)] border-b px-2 py-[10px] no-underline"
						>
							<div className="flex min-w-0 flex-1 items-center gap-2">
								<span className="truncate font-medium text-[13px] text-[var(--text-secondary)] tracking-[-0.01em] transition-colors duration-150 group-hover/item:text-[var(--text-primary)]">
									{post.title}
								</span>
								{post.featured && (
									<span className="shrink-0 rounded-full bg-[var(--muted-bg)] px-1.5 py-[2px] font-normal text-[10px] text-[var(--text-ghost)] tracking-[0.02em]">
										Featured
									</span>
								)}
							</div>

							<time className="shrink-0 text-[13px] text-[var(--text-ghost)] tabular-nums leading-[1.5]">
								{formatDate(post.date)}
							</time>

							<span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-ghost)] opacity-0 transition-opacity duration-150 group-hover/item:opacity-100">
								<ChevronRight size={13} />
							</span>
						</a>
					</m.div>
				))}
			</div>
			<style>{`
				.blog-list > div:last-child .dim-list-row { border-bottom: 0; }
			`}</style>
		</LazyMotion>
	);
}
