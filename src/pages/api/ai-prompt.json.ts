import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { SITE } from '@/constants/site';
import { certifications, education, experience } from '@/data/experience';
import { pastWork } from '@/data/freelance';
import { buildAIPrompt } from '@/lib/build-ai-prompt';

export const GET: APIRoute = async () => {
	const [projects, blogPosts] = await Promise.all([
		getCollection('projects'),
		getCollection('blog'),
	]);

	const prompt = buildAIPrompt({
		projects,
		blogPosts,
		experience,
		education,
		certifications,
		pastWork,
		site: SITE,
	});

	return new Response(JSON.stringify({ prompt }), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'public, max-age=86400',
		},
	});
};
