export function slugOf(entry: { id: string }): string {
	return entry.id.replace(/\.mdx?$/, '');
}
