'use client';

import { ChevronRight } from '@icons';
import { LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { useState } from 'react';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

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
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

	return (
		<LazyMotion features={loadFeatures}>
			<section className="pb-6 mb-8">
				<div className="section-header !mb-2.5">Blog</div>

				<div>
					{latest.map((post, i) => (
						<m.a
							key={post.slug}
							href={`/${post.slug}`}
							initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
							whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
							viewport={{ once: true, margin: '-40px' }}
							transition={{ duration: 0.4, ease: EASE, delay: i * 0.05 }}
							onMouseEnter={() => setHoveredIndex(i)}
							onMouseLeave={() => setHoveredIndex(null)}
							className={[
								'flex items-center gap-[14px] py-[10px] no-underline',
								i < latest.length - 1 ? 'border-b border-border' : '',
							].join(' ')}
						>
							<span className="text-[11px] text-[var(--text-ghost)] shrink-0 tabular-nums leading-[1.5]">
								{formatDate(post.data.date)}
							</span>
							<span
								className={`text-[13px] font-medium leading-[1.5] flex-1 transition-colors duration-150 ${hoveredIndex === i ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
							>
								{post.data.title}
							</span>
							<span
								className={`w-[22px] h-[22px] rounded-full border border-border flex items-center justify-center text-[var(--text-ghost)] shrink-0 transition-opacity duration-150 ${hoveredIndex === i ? 'opacity-100' : 'opacity-0'}`}
							>
								<ChevronRight size={13} />
							</span>
						</m.a>
					))}
				</div>

				<div className="mt-[14px] flex justify-end">
					<a
						href="/blog"
						className="text-[12px] font-medium text-[var(--text-secondary)] no-underline inline-flex items-center gap-1 bg-[var(--muted-bg)] rounded-full px-[14px] py-[6px] transition-[filter] duration-150 hover:brightness-[0.96]"
					>
						All writing <ChevronRight size={13} />
					</a>
				</div>
			</section>
		</LazyMotion>
	);
}
