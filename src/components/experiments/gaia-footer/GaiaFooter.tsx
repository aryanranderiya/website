import { useState } from 'react';
import './gaia-footer.css';
import FooterDots from './FooterDots';

const GAIA_ORIGIN = 'https://heygaia.io';

const WALLPAPER_SRC =
	'https://heygaia.io/cdn-cgi/image/width=3840,quality=75,format=auto/images/wallpapers/subtle_glow_deep_blues.webp';
const WALLPAPER_SRCSET = [640, 750, 828, 1080, 1200, 1920, 2048, 3840]
	.map(
		(w) =>
			`https://heygaia.io/cdn-cgi/image/width=${w},quality=75,format=auto/images/wallpapers/subtle_glow_deep_blues.webp ${w}w`
	)
	.join(', ');

const EXPERIENCE_LOGO_SRC =
	'https://heygaia.io/cdn-cgi/image/width=48,quality=75,format=auto/brand/experience_logo_white.svg';
const EXPERIENCE_LOGO_SRCSET =
	'https://heygaia.io/cdn-cgi/image/width=32,quality=75,format=auto/brand/experience_logo_white.svg 1x, https://heygaia.io/cdn-cgi/image/width=48,quality=75,format=auto/brand/experience_logo_white.svg 2x';

interface FooterLink {
	label: string;
	href: string;
	external?: boolean;
}

const PRODUCT_LINKS: FooterLink[] = [
	{ label: 'Download', href: `${GAIA_ORIGIN}/download` },
	{ label: 'Use Cases', href: `${GAIA_ORIGIN}/use-cases` },
	{ label: 'Marketplace', href: `${GAIA_ORIGIN}/marketplace` },
	{ label: 'Bots', href: `${GAIA_ORIGIN}/bots` },
	{ label: 'Pricing', href: `${GAIA_ORIGIN}/pricing` },
	{ label: 'Roadmap', href: `${GAIA_ORIGIN}/roadmap`, external: true },
];

const RESOURCE_LINKS: FooterLink[] = [
	{ label: 'Documentation', href: 'https://docs.heygaia.io', external: true },
	{ label: 'Blog', href: `${GAIA_ORIGIN}/blog` },
	{ label: 'Release Notes', href: 'https://docs.heygaia.io/release-notes', external: true },
	{ label: 'Status', href: `${GAIA_ORIGIN}/status`, external: true },
	{ label: 'Request a Feature', href: `${GAIA_ORIGIN}/request-feature`, external: true },
];

const COMPANY_LINKS: FooterLink[] = [
	{ label: 'About', href: `${GAIA_ORIGIN}/about` },
	{ label: 'Manifesto', href: `${GAIA_ORIGIN}/manifesto` },
	{ label: 'Contact', href: `${GAIA_ORIGIN}/contact` },
	{ label: 'Branding', href: `${GAIA_ORIGIN}/brand` },
];

const LEGAL_LINKS: FooterLink[] = [
	{ label: 'Terms of Use', href: `${GAIA_ORIGIN}/terms` },
	{ label: 'Privacy Policy', href: `${GAIA_ORIGIN}/privacy` },
];

const LINK_COLUMNS: { heading: string; links: FooterLink[] }[] = [
	{ heading: 'Product', links: PRODUCT_LINKS },
	{ heading: 'Resources', links: RESOURCE_LINKS },
	{ heading: 'Company', links: COMPANY_LINKS },
	{ heading: 'Legal', links: LEGAL_LINKS },
];

// heygaia.io dark theme: --primary is 210 40% 98% (near-white), so footer
// links brighten to near-white on hover — NOT brand blue.
const HOVER_ACCENT = 'hover:text-[#f8fafc]';

function FooterLinkColumn({ heading, links }: { heading: string; links: FooterLink[] }) {
	return (
		<div className="flex flex-col items-start">
			<div className="mb-3 font-medium font-serif text-sm text-white uppercase tracking-wider">
				{heading}
			</div>
			{links.map((link) => (
				<a
					key={link.label}
					className={`py-1 text-sm text-zinc-200 transition-colors ${HOVER_ACCENT}`}
					href={link.href}
					{...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
				>
					{link.label}
				</a>
			))}
		</div>
	);
}

function DiscordIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			fill="currentColor"
			viewBox="0 0 16 16"
		>
			<title>Discord Icon</title>
			<path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612" />
		</svg>
	);
}

function TwitterIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			fill="currentColor"
			viewBox="0 0 16 16"
		>
			<title>Twitter Icon</title>
			<path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334q.002-.211-.006-.422A6.7 6.7 0 0 0 16 3.542a6.7 6.7 0 0 1-1.889.518 3.3 3.3 0 0 0 1.447-1.817 6.5 6.5 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.32 9.32 0 0 1-6.767-3.429 3.29 3.29 0 0 0 1.018 4.382A3.3 3.3 0 0 1 .64 6.575v.045a3.29 3.29 0 0 0 2.632 3.218 3.2 3.2 0 0 1-.865.115 3 3 0 0 1-.614-.057 3.28 3.28 0 0 0 3.067 2.277A6.6 6.6 0 0 1 .78 13.58a6 6 0 0 1-.78-.045A9.34 9.34 0 0 0 5.026 15" />
		</svg>
	);
}

function GitHubIcon() {
	return (
		<svg height="20" viewBox="0 0 438.549 438.549" width="20">
			<title>Github Icon</title>
			<path
				d="M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 01-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z"
				fill="currentColor"
			/>
		</svg>
	);
}

function WhatsAppIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			fill="currentColor"
			viewBox="0 0 16 16"
		>
			<title>Whatsapp Icon</title>
			<path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
		</svg>
	);
}

function YouTubeIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="25"
			height="25"
			fill="currentColor"
			viewBox="0 0 16 16"
		>
			<title>Youtube Icon</title>
			<path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z" />
		</svg>
	);
}

function LinkedInIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			fill="currentColor"
			viewBox="0 0 16 16"
		>
			<title>Linkedin Icon</title>
			<path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z" />
		</svg>
	);
}

const SOCIAL_LINKS = [
	{
		label: 'Discord',
		title: 'Join Discord Community',
		href: 'https://discord.heygaia.io',
		Icon: DiscordIcon,
	},
	{
		label: 'Twitter',
		title: 'Follow us for updates',
		href: 'https://x.com/trygaia',
		Icon: TwitterIcon,
	},
	{
		label: 'GitHub',
		title: 'Check out our open source projects',
		href: 'https://github.com/theexperiencecompany',
		Icon: GitHubIcon,
	},
	{
		label: 'WhatsApp',
		title: 'Join WhatsApp Community',
		href: 'https://whatsapp.heygaia.io',
		Icon: WhatsAppIcon,
	},
	{
		label: 'YouTube',
		title: 'Subscribe to our YouTube Channel',
		href: 'https://youtube.com/@theexperiencecompany',
		Icon: YouTubeIcon,
	},
	{
		label: 'LinkedIn',
		title: 'Follow our LinkedIn Company Page',
		href: 'https://www.linkedin.com/company/heygaia',
		Icon: LinkedInIcon,
	},
];

export default function GaiaFooter() {
	const [wallpaperLoaded, setWallpaperLoaded] = useState(false);
	const [wallpaperFailed, setWallpaperFailed] = useState(false);
	const [logoLoaded, setLogoLoaded] = useState(false);
	const [logoFailed, setLogoFailed] = useState(false);

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
			<div className="relative flex flex-col gap-8 px-6 pt-24 pb-1 sm:gap-10 sm:px-8 lg:px-10">
				<div className="mx-auto flex w-full max-w-7xl flex-wrap justify-between gap-10">
					{LINK_COLUMNS.map((col) => (
						<FooterLinkColumn key={col.heading} heading={col.heading} links={col.links} />
					))}
				</div>
				<div className="mx-auto w-full max-w-7xl">
					<FooterDots />
				</div>
				<div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center justify-items-center gap-6 sm:grid-cols-3">
					<iframe
						src="https://status.heygaia.io/badge?theme=dark"
						title="GAIA API Status"
						className="gaia-footer-status ph-no-capture sm:justify-self-start"
						scrolling="no"
						height="30"
						width="186"
						sandbox="allow-popups"
					/>
					<a
						target="_blank"
						rel="noopener noreferrer"
						className={`flex items-center gap-2 text-sm text-zinc-200 transition-colors ${HOVER_ACCENT}`}
						href="https://twitter.com/madebyexp"
					>
						<span className="relative inline-block h-5 w-5 overflow-hidden">
							{!logoLoaded && !logoFailed && (
								<span
									aria-hidden="true"
									className="absolute inset-0 animate-pulse rounded-full bg-white/10 motion-reduce:animate-none"
								/>
							)}
							{!logoFailed ? (
								<img
									alt=""
									loading="lazy"
									width="20"
									height="20"
									decoding="async"
									srcSet={EXPERIENCE_LOGO_SRCSET}
									src={EXPERIENCE_LOGO_SRC}
									onLoad={() => setLogoLoaded(true)}
									onError={() => setLogoFailed(true)}
									className={`gaia-footer-crossfade h-5 w-5 motion-reduce:transition-none ${
										logoLoaded ? 'opacity-100' : 'opacity-0'
									} transition-opacity duration-500`}
								/>
							) : (
								<span aria-hidden="true" className="block h-5 w-5 rounded-full bg-white/10" />
							)}
						</span>
						The Experience Company Inc.
					</a>
					<div className="flex items-center gap-4 sm:justify-self-end">
						{SOCIAL_LINKS.map(({ label, title, href, Icon }) => (
							<a
								key={label}
								target="_blank"
								rel="noopener noreferrer"
								title={title}
								aria-label={label}
								className={`text-zinc-200 transition-colors ${HOVER_ACCENT}`}
								href={href}
							>
								<Icon />
							</a>
						))}
					</div>
				</div>
			</div>
		</footer>
	);
}
