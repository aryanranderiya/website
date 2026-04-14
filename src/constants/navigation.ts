export interface NavPage {
	href: string;
	label: string;
	description: string;
	icon?: string; // hugeicons icon name
	children?: NavPage[];
	external?: boolean;
}

export const PAGES: NavPage[] = [
	{
		href: '/',
		label: 'Home',
		description: 'Start here',
		icon: 'Home01Icon',
	},
	{
		href: '/projects',
		label: 'Projects',
		description: 'Things I have built',
		icon: 'CodeIcon',
	},
	{
		href: '/freelance',
		label: 'Freelance',
		description: 'Client work and services',
		icon: 'BriefcaseIcon',
	},
	{
		href: '/graphic-design',
		label: 'Graphic Design',
		description: 'Visual design work',
		icon: 'PenTool02Icon',
	},
	{
		href: '/tools',
		label: 'Tools',
		description: 'Apps and tools I use and recommend',
		icon: 'SparklesIcon',
	},
	{
		href: '/books',
		label: 'Bookshelf',
		description: 'Books I have read and want to read',
		icon: 'Book01Icon',
	},
	{
		href: '/movies',
		label: 'Movies',
		description: 'My personal Letterboxd',
		icon: 'Film01Icon',
	},
	{
		href: '/camera-roll',
		label: 'Gallery',
		description: 'Photos I have taken',
		icon: 'Image01Icon',
	},
	{
		href: '/blog',
		label: 'Blog',
		description: 'Writing about engineering and design',
		icon: 'QuillWrite02Icon',
	},
	{
		href: '/agent-convos',
		label: 'Agent Logs',
		description: 'Curated AI coding sessions — infrastructure, multi-agent, browser automation',
		icon: 'AiChat02Icon',
	},
	{
		href: '/resume',
		label: 'Resume',
		description: 'My work experience and skills',
		icon: 'NoteIcon',
	},
];

export const SOCIAL_LINKS = [
	{
		label: 'GitHub',
		href: 'https://github.com/aryanranderiya',
		external: true,
		icon: 'GithubIcon',
		description: 'My open source projects and contributions',
	},
	{
		label: 'Twitter',
		href: 'https://twitter.com/aryanranderiya',
		external: true,
		icon: 'NewTwitterIcon',
		description: 'Thoughts and updates',
	},
	{
		label: 'LinkedIn',
		href: 'https://linkedin.com/in/aryanranderiya',
		external: true,
		icon: 'LinkedinIcon',
		description: 'Professional profile and network',
	},
];

// Flat list of all pages for CommandK and other lookups
export const ALL_PAGES_FLAT = PAGES.flatMap((page) => [page, ...(page.children ?? [])]);
