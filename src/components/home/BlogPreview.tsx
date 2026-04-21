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
		<section className="pb-6 mb-8">
			<div className="section-header !mb-2.5">Blog</div>

			<BlogList posts={latest} />

			<div className="mt-[14px] flex justify-end">
				<SectionLink href="/blog" label="All writing" />
			</div>
		</section>
	);
}
