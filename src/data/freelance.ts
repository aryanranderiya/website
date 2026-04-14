export interface FreelanceProject {
	name: string;
	slug: string;
	type: string;
	tech: string[];
	url?: string;
	description: string;
	images: string[];
	testimonial?: {
		quote: string;
		author: string;
		role: string;
	};
}

export const pastWork: FreelanceProject[] = [
	{
		name: 'BlinkAnalytics',
		slug: 'blinkanalytics',
		type: 'Analytics Dashboard',
		tech: ['React', 'TypeScript', 'TailwindCSS'],
		url: 'https://blinkanalytics.in',
		description:
			'Official website and analytics dashboard for Blink Analytics, a generative AI and data analytics company. Real-time client reporting with custom charts, metrics, and data export.',
		images: [
			'/ProjectMedia/BlinkAnalytics/1.png',
			'/ProjectMedia/BlinkAnalytics/2.webp',
			'/ProjectMedia/BlinkAnalytics/3.webp',
			'/ProjectMedia/BlinkAnalytics/4.webp',
			'/ProjectMedia/BlinkAnalytics/5.webp',
			'/ProjectMedia/BlinkAnalytics/6.webp',
			'/ProjectMedia/BlinkAnalytics/7.webp',
			'/ProjectMedia/BlinkAnalytics/8.webp',
			'/ProjectMedia/BlinkAnalytics/9.webp',
		],
	},
	{
		name: 'MWI',
		slug: 'mwi',
		type: 'Brand & Web',
		tech: ['Next.js', 'TypeScript', 'TailwindCSS'],
		url: 'https://mwi.gg',
		description:
			'Brand identity and web platform for Move With Intention (MWI), a fitness and wellness company. Modern, clean aesthetic with performant Next.js architecture.',
		images: Array.from({ length: 14 }, (_, i) => `/ProjectMedia/MWI/${i + 1}.webp`),
	},
	{
		name: 'Encode PDEU',
		slug: 'encode-pdeu',
		type: 'CS Club Platform',
		tech: ['React', 'Node.js', 'MongoDB'],
		url: 'https://encodepdeu.vercel.app',
		description:
			'The official website of Encode - the Computer Science Club at PDEU. Led the web dev core committee and built the site with event management, member profiles, and resource sharing.',
		images: [
			'/ProjectMedia/Encode_Official%20Website/1.webp',
			'/ProjectMedia/Encode_Official%20Website/2.webp',
			'/ProjectMedia/Encode_Official%20Website/3.webp',
			'/ProjectMedia/Encode_Official%20Website/4.webp',
			'/ProjectMedia/Encode_Official%20Website/5.webp',
			'/ProjectMedia/Encode_Official%20Website/6.webp',
			'/ProjectMedia/Encode_Official%20Website/7.webp',
			'/ProjectMedia/Encode_Official%20Website/8.webp',
		],
	},
	{
		name: 'Rezrek',
		slug: 'rezrek',
		type: 'Content E-Commerce',
		tech: ['React', 'Node.js', 'MongoDB', 'Redis'],
		url: 'https://rezrek.com',
		description:
			'Content e-commerce platform enabling creators to sell digital products with integrated payments and delivery.',
		images: [
			'/ProjectMedia/Rezrek/rezrek%20main.webp',
			'/ProjectMedia/Rezrek/0.webp',
			'/ProjectMedia/Rezrek/1.webp',
			'/ProjectMedia/Rezrek/2.webp',
			'/ProjectMedia/Rezrek/3.webp',
			'/ProjectMedia/Rezrek/4.webp',
			'/ProjectMedia/Rezrek/5.webp',
			'/ProjectMedia/Rezrek/6.webp',
			'/ProjectMedia/Rezrek/7.webp',
			'/ProjectMedia/Rezrek/8.webp',
			'/ProjectMedia/Rezrek/9.webp',
			'/ProjectMedia/Rezrek/10.webp',
			'/ProjectMedia/Rezrek/11.webp',
		],
		testimonial: {
			quote:
				'Aryan delivered exactly what we needed, fast and clean. The platform has been running smoothly since day one.',
			author: 'Rezrek Founders',
			role: 'Co-Founders, Rezrek',
		},
	},
	{
		name: 'LyfeLane',
		slug: 'lyfelane',
		type: 'Platform MVP',
		tech: ['React', 'Node.js', 'MongoDB', 'Express'],
		url: 'https://lyfelane.com',
		description:
			'Create personalized greeting cards, send them via email, and receive responses. Uses AI for card templates with an easy, Canva-like design interface.',
		images: [
			'/ProjectMedia/LyfeLane/2024-11-22_22-18.png',
			'/ProjectMedia/LyfeLane/2024-11-22_22-19.png',
			'/ProjectMedia/LyfeLane/2024-11-22_22-19_1.png',
			'/ProjectMedia/LyfeLane/2024-11-22_22-20.png',
			'/ProjectMedia/LyfeLane/2024-11-22_22-22.png',
			'/ProjectMedia/LyfeLane/2024-11-22_22-23.png',
			'/ProjectMedia/LyfeLane/2024-11-22_22-24.png',
			'/ProjectMedia/LyfeLane/2024-11-22_22-24_1.png',
			'/ProjectMedia/LyfeLane/2024-11-22_22-24_2.png',
			'/ProjectMedia/LyfeLane/2024-11-22_22-24_3.png',
		],
	},
];
