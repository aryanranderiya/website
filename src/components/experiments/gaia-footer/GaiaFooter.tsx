import { useState } from 'react';
import './gaia-footer.css';
import FooterDots from './FooterDots';

const WALLPAPER_SRC =
	'https://heygaia.io/cdn-cgi/image/width=3840,quality=75,format=auto/images/wallpapers/subtle_glow_deep_blues.webp';
const WALLPAPER_SRCSET = [640, 750, 828, 1080, 1200, 1920, 2048, 3840]
	.map(
		(w) =>
			`https://heygaia.io/cdn-cgi/image/width=${w},quality=75,format=auto/images/wallpapers/subtle_glow_deep_blues.webp ${w}w`
	)
	.join(', ');

export default function GaiaFooter() {
	const [wallpaperLoaded, setWallpaperLoaded] = useState(false);
	const [wallpaperFailed, setWallpaperFailed] = useState(false);

	return (
		<footer className="gaia-footer relative z-20 w-full overflow-hidden bg-[#030712]">
			{!wallpaperLoaded && !wallpaperFailed && (
				<div
					aria-hidden="true"
					className="absolute inset-0 animate-pulse bg-white/[0.06] motion-reduce:animate-none"
				/>
			)}
			{!wallpaperFailed && (
				<img
					alt=""
					loading="lazy"
					decoding="async"
					sizes="100vw"
					srcSet={WALLPAPER_SRCSET}
					src={WALLPAPER_SRC}
					onLoad={() => setWallpaperLoaded(true)}
					onError={() => setWallpaperFailed(true)}
					className={`gaia-footer-crossfade pointer-events-none absolute inset-0 z-0 h-full w-full origin-bottom scale-150 select-none object-cover object-bottom motion-reduce:scale-100 motion-reduce:transition-none ${
						wallpaperLoaded ? 'opacity-100' : 'opacity-0'
					} transition-opacity duration-700`}
				/>
			)}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-x-0 top-0 z-0 h-48 select-none bg-linear-to-b from-[#030712] via-[#030712]/50 to-transparent"
			/>
			<div
				aria-hidden="true"
				className="gaia-footer-noise pointer-events-none absolute inset-0 z-20 opacity-[0.06] mix-blend-overlay"
			/>
			<div className="relative flex flex-col px-6 pt-24 pb-10 sm:px-8 lg:px-10">
				<div className="mx-auto w-full max-w-7xl">
					<FooterDots />
				</div>
			</div>
		</footer>
	);
}
