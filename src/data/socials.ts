export const SOCIALS = [
	{
		name: 'GitHub',
		url: 'https://github.com/aryanranderiya',
		icon: '/icons/favicons/github-com.png',
	},
	{
		name: 'LinkedIn',
		url: 'https://linkedin.com/in/aryanranderiya',
		icon: '/icons/favicons/linkedin-com.png',
	},
	{
		name: 'Twitter',
		url: 'https://twitter.com/aryanranderiya',
		icon: '/icons/favicons/twitter-com.png',
	},
	{
		name: 'Instagram',
		url: 'https://instagram.com/aryanranderiya',
		icon: '/icons/favicons/instagram-com.png',
	},
	{
		name: 'Behance',
		url: 'https://www.behance.net/aryanranderiya',
		icon: '/icons/favicons/behance-net.png',
	},
	{
		name: 'Stack Overflow',
		url: 'https://stackoverflow.com/users/21615084/aryan',
		icon: '/icons/favicons/stackoverflow-com.png',
	},
	{
		name: 'Monkeytype',
		url: 'https://monkeytype.com/profile/aryanranderiya',
		icon: '/icons/favicons/monkeytype-com.png',
	},
	{
		name: 'Discord',
		url: 'https://discord.com/users/521279231284609032',
		icon: '/icons/favicons/discord-com.png',
	},
] as const;

// biome-ignore lint/style/noNonNullAssertion: Behance is always present in SOCIALS
export const BEHANCE_URL = SOCIALS.find((s) => s.name === 'Behance')!.url;
