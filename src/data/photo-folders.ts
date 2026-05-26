// ── Photography folders (config-driven) ──
// Everything on the /camera-roll page is driven from this file: the folders,
// the stickers stuck on each folder, and the photos inside. Add a folder by
// pushing a new object; add a photo by dropping it into a folder's `photos`.
//
// Stickers are rule-compliant (NO emojis): each sticker is EITHER a gaia-icon
// (`icon`) tinted with `color` on a `bg` badge, OR an `image` URL for a
// die-cut PNG/SVG. `rotate` tilts the sticker for the hand-stuck look.

export interface Sticker {
	/** A bare emoji character — the white die-cut outline is applied automatically. */
	emoji: string;
	/** Tilt in degrees for the hand-stuck look. */
	rotate?: number;
}

export interface FolderPhoto {
	url: string;
	alt: string;
	date?: string;
}

export interface PhotoFolder {
	id: string;
	name: string;
	stickers: Sticker[];
	photos: FolderPhoto[];
}

export const photoFolders: PhotoFolder[] = [
	{
		id: 'ahmedabad',
		name: 'Ahmedabad',
		stickers: [
			{ emoji: '🕌', rotate: -10 },
			{ emoji: '☀️', rotate: 9 },
		],
		photos: [
			{
				url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80',
				alt: 'Sunset over the city',
				date: '2024',
			},
			{
				url: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=900&q=80',
				alt: 'City streets at night',
				date: '2024',
			},
			{
				url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=900&q=80',
				alt: 'Monsoon clouds',
				date: '2024',
			},
			{
				url: 'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?w=900&q=80',
				alt: 'Mountain landscape at dawn',
				date: '2024',
			},
			{
				url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=900&q=80',
				alt: 'Green hills and clouds',
				date: '2024',
			},
		],
	},
	{
		id: 'gujarat',
		name: 'Gujarat',
		stickers: [
			{ emoji: '🦁', rotate: -8 },
			{ emoji: '🏜️', rotate: 10 },
		],
		photos: [
			{
				url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900&q=80',
				alt: 'Starry night sky',
				date: '2023',
			},
			{
				url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=900&q=80',
				alt: 'Lake in the mountains',
				date: '2023',
			},
			{
				url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=900&q=80',
				alt: 'Forest path in morning light',
				date: '2024',
			},
		],
	},
	{
		id: 'rajasthan',
		name: 'Rajasthan',
		stickers: [
			{ emoji: '🐪', rotate: -9 },
			{ emoji: '🏰', rotate: 8 },
		],
		photos: [
			{
				url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=900&q=80',
				alt: 'Desert road at dusk',
				date: '2023',
			},
		],
	},
	{
		id: 'home',
		name: 'Home',
		stickers: [
			{ emoji: '☕', rotate: -10 },
			{ emoji: '📷', rotate: 9 },
		],
		photos: [
			{
				url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=900&q=80',
				alt: 'Coffee and laptop',
				date: '2024',
			},
			{
				url: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=900&q=80',
				alt: 'Workspace',
				date: '2024',
			},
			{
				url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80',
				alt: 'Portrait',
				date: '2024',
			},
			{
				url: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=900&q=80',
				alt: 'Warm evening light',
				date: '2024',
			},
		],
	},
	// Add a folder with its own stickers ({ image, rotate }) and photos. Drop new
	// sticker SVGs into /public/images/stickers (Twemoji set used by default).
];
