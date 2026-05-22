'use client';

import BlogList from '@/components/blog/BlogList';
import SectionLink from '@/components/ui/SectionLink';

interface Post {
	slug: string;
	data: {
		title: string;
		date: string | Date;
	};
}

export default function BlogPreview({ posts }: { posts: Post[] }) {
	const latest = posts.slice(0, 3).map((p) => ({
		slug: p.slug,
		title: p.data.title,
		date: typeof p.data.date === 'string' ? p.data.date : p.data.date.toISOString(),
	}));

	return (
		<section className="mt-2 mb-8 pb-6">
			<h2 className="mb-1 font-medium text-[14px] text-[var(--text-secondary)] tracking-[-0.02em]">
				Blog
			</h2>

			<BlogList posts={latest} />

			<div className="mt-[14px] flex justify-end">
				<SectionLink href="/blog" label="All writings" />
			</div>
		</section>
	);
}
