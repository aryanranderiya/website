import type { CollectionEntry } from 'astro:content';

export type ProjectImage = { src: string; caption?: string };

export function normalizeImages(
	images: CollectionEntry<'projects'>['data']['images'] | undefined
): ProjectImage[] {
	return (images ?? []).map((img) => (typeof img === 'string' ? { src: img } : img));
}

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
		// Within a folder (Featured, Freelance, …): newest first by date.
		const da = a.data.date ? new Date(a.data.date).getTime() : 0;
		const db = b.data.date ? new Date(b.data.date).getTime() : 0;
		if (da !== db) return db - da;
		return (a.data.order ?? 99) - (b.data.order ?? 99);
	});
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
		images: normalizeImages(entry.data.images),
		folder: entry.data.folder,
		url: entry.data.url,
		github: entry.data.github,
		coverImage: entry.data.coverImage,
		date: entry.data.date?.toISOString(),
	};
}
