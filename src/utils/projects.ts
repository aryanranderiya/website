import type { CollectionEntry } from 'astro:content';

export const FOLDER_PRIORITY: Record<string, number> = {
	Featured: 0,
	Client: 1,
	Hackathon: 2,
	Projects: 3,
};

export function sortProjects(entries: CollectionEntry<'projects'>[]) {
	return entries.sort((a, b) => {
		const fa = FOLDER_PRIORITY[a.data.folder] ?? 9;
		const fb = FOLDER_PRIORITY[b.data.folder] ?? 9;
		if (fa !== fb) return fa - fb;
		return (a.data.order ?? 99) - (b.data.order ?? 99);
	});
}

export function mapProject(entry: CollectionEntry<'projects'>) {
	return {
		slug: entry.slug,
		title: entry.data.title,
		description: entry.data.description,
		shortDescription: entry.data.shortDescription,
		tags: entry.data.tags,
		tech: entry.data.tech,
		type: entry.data.type,
		status: entry.data.status,
		featured: entry.data.featured,
		images: entry.data.images,
		folder: entry.data.folder,
		url: entry.data.url,
		github: entry.data.github,
		coverImage: entry.data.coverImage,
		date: entry.data.date?.toISOString(),
	};
}
