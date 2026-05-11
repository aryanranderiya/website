import type { CollectionEntry } from 'astro:content';

export function sortProjects(entries: CollectionEntry<'projects'>[]) {
	return entries.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function mapProject(entry: CollectionEntry<'projects'>) {
	return {
		slug: entry.slug,
		title: entry.data.title,
		description: entry.data.description,
		shortDescription: entry.data.shortDescription,
		tech: entry.data.tech,
		type: entry.data.type,
		featured: entry.data.featured,
		images: entry.data.images,
		url: entry.data.url,
		github: entry.data.github,
		coverImage: entry.data.coverImage,
		date: entry.data.date?.toISOString(),
	};
}
