// Inlined from GAIA's `@/features/onboarding/constants/houses`. Maps a house
// name to the wallpaper used as the holo card's background image.
export const HOUSES: Record<string, { image: string }> = {
	frostpeak: { image: '/images/site/wallpapers/holo/frostpeak.jpg' },
	greenvale: { image: '/images/site/wallpapers/holo/greenvale.jpg' },
	mistgrove: { image: '/images/site/wallpapers/holo/mistgrove.png' },
	bluehaven: { image: '/images/site/wallpapers/holo/bluehaven.jpg' },
};

export function getHouseImage(house?: string): string {
	if (!house) return HOUSES.bluehaven.image;
	const key = house.toLowerCase();
	return (HOUSES[key] ?? HOUSES.bluehaven).image;
}
