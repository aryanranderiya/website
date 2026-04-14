export function calculateReadingTime(body: string): number {
	const wordCount = body.trim().split(/\s+/).length;
	return Math.max(1, Math.ceil(wordCount / 200));
}
