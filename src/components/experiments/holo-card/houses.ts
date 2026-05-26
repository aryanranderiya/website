// Inlined from GAIA's `@/features/onboarding/constants/houses`. Maps a house
// name to the wallpaper used as the holo card's background image.
export const HOUSES: Record<string, { image: string }> = {
	frostpeak: { image: '/images/wallpapers/holo/frostpeak.jpg' },
	greenvale: { image: '/images/wallpapers/holo/greenvale.jpg' },
	mistgrove: { image: '/images/wallpapers/holo/mistgrove.png' },
	bluehaven: { image: '/images/wallpapers/holo/bluehaven.jpg' },
};

export function getHouseImage(house?: string): string {
	if (!house) return HOUSES.bluehaven.image;
	const key = house.toLowerCase();
	return (HOUSES[key] ?? HOUSES.bluehaven).image;
}
