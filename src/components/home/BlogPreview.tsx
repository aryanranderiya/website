'use client';

import BlogList from '@/components/blog/BlogList';
import SectionLink from '@/components/ui/SectionLink';

interface Post {
	slug: string;
	title: string;
	date: string;
}

// Posts arrive already reduced to { slug, title, date } by the page that renders
// this island — serializing whole content-collection entries would bake every
// post body into the HTML as island props.
export default function BlogPreview({ posts }: { posts: Post[] }) {
	const latest = posts.slice(0, 3);

	return (
		<section className="mt-10 mb-8 pb-6">
			<h2 className="mb-1 font-semibold text-[13px] text-[var(--text-secondary)] tracking-[-0.02em]">
				Blog
			</h2>

			<BlogList posts={latest} />

			<div className="mt-[14px] flex justify-end">
				<SectionLink href="/blog" label="All writings" />
			</div>
		</section>
	);
}
