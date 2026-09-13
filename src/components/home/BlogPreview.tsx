'use client';

import BlogList, { type BlogPost } from '@/components/blog/BlogList';
import SectionLink from '@/components/ui/SectionLink';

// Posts arrive already reduced to { slug, title, date } by the page that renders
// this island — serializing whole content-collection entries would bake every
// post body into the HTML as island props.
export default function BlogPreview({ posts }: { posts: BlogPost[] }) {
	const latest = posts.slice(0, 4);
	return (
		<section className="mt-10 mb-8 pb-6">
			<BlogList posts={latest} />

			<div className="mt-[14px] flex justify-end">
				<SectionLink href="/blog" label="All writings" />
			</div>
		</section>
	);
}
