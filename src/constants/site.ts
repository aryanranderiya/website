export const SITE = {
	name: 'Aryan Randeriya',
	username: 'aryanranderiya',
	url: 'https://aryanranderiya.com',
	description:
		'Developer, designer, and builder. Interested in hardware, robotics, and human-computer interaction.',
	tagline: 'Building things that matter.',
	location: 'Ahmedabad, India',
	timezone: 'Asia/Kolkata',
	coords: { lat: 23.0225, lng: 72.5714 },
	email: 'hey@aryanranderiya.com',
	github: 'aryanranderiya',
	twitter: 'aryanranderiya',
	linkedin: 'aryanranderiya',
	instagram: 'aryanranderiya',
	monkeytype: 'aryanranderiya',
	spotify: {
		clientId: import.meta.env.SPOTIFY_CLIENT_ID ?? '',
		clientSecret: import.meta.env.SPOTIFY_CLIENT_SECRET ?? '',
		refreshToken: import.meta.env.SPOTIFY_REFRESH_TOKEN ?? '',
	},
	github_token: import.meta.env.GITHUB_TOKEN ?? '',
} as const;

export const SEO = {
	titleTemplate: '%s | Aryan Randeriya',
	defaultTitle: 'Aryan Randeriya - Developer & Designer',
	charset: 'UTF-8',
	viewport: 'width=device-width, initial-scale=1.0',
	robots: 'index, follow',
	openGraph: {
		type: 'website',
		locale: 'en_US',
	},
	twitter: {
		card: 'summary_large_image',
		site: '@aryanranderiya',
	},
} as const;
