'use client';

import {
	Briefcase01Icon,
	BrushIcon,
	Cancel01Icon,
	Clock01Icon,
	ColorsIcon,
	Folder03Icon,
	Home12Icon,
	HugeiconsIcon,
	Moon02Icon,
	NoteIcon,
	QuillWrite01Icon,
	RoboticIcon,
	ShuffleIcon,
	SidebarRightIcon,
	Stamp02Icon,
	Sun01Icon,
} from '@icons';
import type { IconProps } from '@theexperiencecompany/gaia-icons';
import { AnimatePresence, LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import type { ComponentType } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- icons used in JSX
import { useAfterPreloader } from '@/hooks/useAfterPreloader';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

// Module-scoped so variants are referentially stable across re-renders.
// When `pathname` changes on navigation, Sidebar re-renders — if these
// lived inside the component, Framer would receive new variant objects
// and could briefly re-evaluate the animation, causing a flash.
const sidebarContainer = {
	hidden: {},
	show: { transition: { staggerChildren: 0.05, delayChildren: 0 } },
};

const sidebarItem = {
	hidden: { opacity: 0, x: -5, filter: 'blur(3px)' },
	show: {
		opacity: 1,
		x: 0,
		filter: 'blur(0px)',
		transition: { duration: 0.4, ease: [0.19, 1, 0.22, 1] as const },
	},
};

const NAV_GROUPS: {
	label: string | null;
	items: { href: string; label: string; icon: ComponentType<IconProps> }[];
}[] = [
	{
		label: null,
		items: [
			{ href: '/', label: 'Home', icon: Home12Icon },
			{ href: '/projects', label: 'Projects', icon: Folder03Icon },
			{ href: '/graphic-design', label: 'Design', icon: BrushIcon },
			{ href: '/blog', label: 'Blog', icon: QuillWrite01Icon },
			{ href: '/resume', label: 'Resume', icon: NoteIcon },
			{ href: '/freelance', label: 'Freelance', icon: Briefcase01Icon },
			{ href: '/agent-convos', label: 'Agent Convos', icon: RoboticIcon },
			{ href: '/now', label: 'Now', icon: Clock01Icon },
			{ href: '/colophon', label: 'Colophon', icon: Stamp02Icon },
		],
	},
	// {
	//   label: 'Extra',
	//   items: [
	//     { href: '/tools',        label: 'Tools',   icon: SparklesIcon },
	//     { href: '/books',        label: 'Books',   icon: Books02Icon },
	//     { href: '/movies',       label: 'Movies',  icon: Film01Icon },
	//     { href: '/camera-roll',  label: 'Gallery', icon: CarouselHorizontalIcon },
	//   ],
	// },
];

type Theme = 'light' | 'dark' | 'random';
type Typography =
	| 'helvetica'
	| 'inter'
	| 'georgia'
	| 'palatino'
	| 'mono'
	| 'pixel'
	| 'impact'
	| 'comic';

const TYPOGRAPHY_OPTIONS: { id: Typography; label: string; family: string }[] = [
	{ id: 'helvetica', label: 'Helvetica', family: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
	{ id: 'inter', label: 'Inter', family: "'Inter var', Inter, sans-serif" },
	{ id: 'georgia', label: 'Georgia', family: "Georgia, 'Times New Roman', serif" },
	{
		id: 'palatino',
		label: 'Palatino',
		family: "'Palatino Linotype', Palatino, 'Book Antiqua', serif",
	},
	{ id: 'mono', label: 'Mono', family: "ui-monospace, 'Courier New', monospace" },
	{ id: 'pixel', label: 'Pixel', family: "'VT323', monospace" },
	{ id: 'impact', label: 'Impact', family: "Impact, 'Arial Narrow', sans-serif" },
	{ id: 'comic', label: 'Comic', family: "'Comic Sans MS', 'Chalkboard SE', cursive" },
];

const RANDOM_VARS = [
	'--background',
	'--foreground',
	'--card',
	'--card-foreground',
	'--popover',
	'--popover-foreground',
	'--primary',
	'--primary-foreground',
	'--glass-bg',
	'--accent-blue',
];

function applyRandomPalette(hue: number, sat: number) {
	const l = Math.max(88, Math.round(96 - (sat - 25) * 0.23));
	const root = document.documentElement;
	root.style.setProperty('--background', `hsl(${hue}, ${sat}%, ${l}%)`);
	root.style.setProperty('--foreground', `hsl(${hue}, 22%, 11%)`);
	root.style.setProperty(
		'--card',
		`hsl(${hue}, ${Math.round(sat * 0.7)}%, ${Math.min(l + 2, 98)}%)`
	);
	root.style.setProperty('--card-foreground', `hsl(${hue}, 22%, 11%)`);
	root.style.setProperty(
		'--popover',
		`hsl(${hue}, ${Math.round(sat * 0.7)}%, ${Math.min(l + 2, 98)}%)`
	);
	root.style.setProperty('--popover-foreground', `hsl(${hue}, 22%, 11%)`);
	root.style.setProperty('--primary', `hsl(${hue}, 22%, 11%)`);
	root.style.setProperty('--primary-foreground', `hsl(${hue}, ${sat}%, ${l}%)`);
	root.style.setProperty('--glass-bg', `hsla(${hue}, ${sat}%, ${l}%, 0.85)`);
	root.style.setProperty('--accent-blue', `hsl(${hue}, 72%, 52%)`);
}

function clearRandomPalette() {
	for (const v of RANDOM_VARS) {
		document.documentElement.style.removeProperty(v);
	}
}

function applyTypography(font: Typography) {
	const root = document.documentElement;
	if (font === 'helvetica') {
		root.style.removeProperty('font-family');
	} else {
		if (font === 'pixel' && !document.getElementById('pixel-font-link')) {
			const link = document.createElement('link');
			link.id = 'pixel-font-link';
			link.rel = 'stylesheet';
			link.href = 'https://fonts.googleapis.com/css2?family=VT323&display=swap';
			document.head.appendChild(link);
		}
		const option = TYPOGRAPHY_OPTIONS.find((o) => o.id === font);
		if (option) root.style.setProperty('font-family', option.family);
	}
	localStorage.setItem('typography', font);
}

export default function Sidebar({
	pathname: initialPathname = '/',
	section: initialSection = null,
}: {
	pathname?: string;
	section?: string | null;
}) {
	// Pathname/section are tracked in a ref, NOT useState. On client navigation
	// we mutate the active class directly on the DOM (see effect below), so the
	// React tree does NOT re-render — that re-render was the source of the
	// "cursor flashes default → pointer" bug: even with the sidebar opted out
	// of the view transition, a React render mid-swap caused Framer Motion to
	// briefly re-evaluate variants on the <m.div> wrappers, which dropped the
	// :hover state on the <a> for a frame. Refs are stable, no render fires.
	const routeRef = useRef({ path: initialPathname, section: initialSection });

	const [theme, setTheme] = useState<Theme>('light');
	const [typography, setTypography] = useState<Typography>('helvetica');
	const [shuffleOpen, setShuffleOpen] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [avatarSrc, setAvatarSrc] = useState('/avatar.webp');
	const [hoveredAction, setHoveredAction] = useState<string | null>(null);

	const isDark = theme === 'dark';

	useEffect(() => {
		const stored = localStorage.getItem('theme') as Theme | null;
		if (stored === 'dark') setTheme('dark');
		else if (stored === 'random') setTheme('random');
		else setTheme('light');

		const storedFont = localStorage.getItem('typography') as Typography | null;
		if (storedFont) setTypography(storedFont);

		const handleThemeChange = () => {
			const t = localStorage.getItem('theme') as Theme | null;
			if (t === 'random') setTheme('random');
			else setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
		};
		const observer = new MutationObserver(handleThemeChange);
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

		// Bypass React on navigation — mutate the active class directly.
		// Selector targets only nav items (data-nav), not the bottom action buttons
		// which also use .nav-link styling but should never get --active.
		const handleNavigation = () => {
			const path = window.location.pathname;
			const section = document.documentElement.dataset.section ?? null;
			routeRef.current = { path, section };

			const matches = (href: string) => {
				if (href === '/') return path === '/';
				if (section && href === `/${section}`) return true;
				return path.startsWith(href);
			};

			document.querySelectorAll<HTMLAnchorElement>('a[data-nav]').forEach((a) => {
				const href = a.getAttribute('href') ?? '';
				a.classList.toggle('nav-link--active', matches(href));
			});

			setMobileOpen(false);
		};
		document.addEventListener('astro:page-load', handleNavigation);

		return () => {
			observer.disconnect();
			document.removeEventListener('astro:page-load', handleNavigation);
		};
	}, []);

	function handleThemeButtonClick() {
		const html = document.documentElement;
		if (theme === 'light') {
			html.classList.add('dark');
			clearRandomPalette();
			localStorage.setItem('theme', 'dark');
			setTheme('dark');
			setShuffleOpen(false);
		} else if (theme === 'dark') {
			html.classList.remove('dark');
			const hue = Math.floor(Math.random() * 360);
			const sat = Math.floor(Math.random() * 36) + 25;
			applyRandomPalette(hue, sat);
			localStorage.setItem('theme', 'random');
			localStorage.setItem('randomHue', String(hue));
			localStorage.setItem('randomSat', String(sat));
			setTheme('random');
			setShuffleOpen(true);
		} else {
			html.classList.remove('dark');
			clearRandomPalette();
			localStorage.setItem('theme', 'light');
			setTheme('light');
			setShuffleOpen(false);
		}
	}

	function handleShuffleColors() {
		const hue = Math.floor(Math.random() * 360);
		const sat = Math.floor(Math.random() * 36) + 25;
		applyRandomPalette(hue, sat);
		localStorage.setItem('randomHue', String(hue));
		localStorage.setItem('randomSat', String(sat));
	}

	function handleShuffleFont() {
		const others = TYPOGRAPHY_OPTIONS.filter((o) => o.id !== typography);
		const pick = others[Math.floor(Math.random() * others.length)];
		applyTypography(pick.id);
		setTypography(pick.id);
	}

	// Reads from the ref so re-renders triggered by theme / mobileOpen / shuffle
	// AFTER a client navigation still compute the correct active item.
	const isActive = useCallback((href: string) => {
		const { path, section } = routeRef.current;
		if (href === '/') return path === '/';
		if (section && href === `/${section}`) return true;
		return path.startsWith(href);
	}, []);

	const themeLabel = theme === 'light' ? 'Dark' : theme === 'dark' ? 'Shuffle' : 'Light';
	const themeIcon = theme === 'light' ? Moon02Icon : theme === 'dark' ? ColorsIcon : Sun01Icon;
	const ready = useAfterPreloader();

	const currentTypography = TYPOGRAPHY_OPTIONS.find((o) => o.id === typography);

	return (
		<LazyMotion features={loadFeatures}>
			{/* ── Desktop sidebar ── */}
			<nav className="fixed top-[60px] bottom-[128px] left-[calc(50%-472px)] z-40 hidden w-[100px] flex-col gap-0.5 overflow-visible bg-transparent min-[960px]:flex">
				<m.div
					variants={sidebarContainer}
					initial="hidden"
					animate={ready ? 'show' : 'hidden'}
					className="flex h-full flex-col gap-0.5"
				>
					{/* Profile photo */}
					<m.div variants={sidebarItem} className="mb-4">
						<button
							type="button"
							className="cursor-pointer border-0 bg-transparent p-0"
							onClick={() =>
								setAvatarSrc((s) =>
									s === '/avatar-original.webp' ? '/avatar.webp' : '/avatar-original.webp'
								)
							}
							aria-label="Toggle avatar"
						>
							<img
								src={avatarSrc}
								alt="Aryan Randeriya"
								width={32}
								height={32}
								className="block h-8 w-8 shrink-0 rounded-full opacity-90"
							/>
						</button>
					</m.div>

					{/* Nav groups */}
					{NAV_GROUPS.map((group, gi) => (
						<m.div
							variants={sidebarItem}
							// biome-ignore lint/suspicious/noArrayIndexKey: static array, order never changes
							key={gi}
							className={gi > 0 ? 'mt-4' : ''}
						>
							{group.label && (
								<div
									className="mt-4 mb-1 text-[10px] text-[var(--text-ghost)] uppercase tracking-[0.07em]"
									// biome-ignore lint/nursery/noInlineStyles: fontVariationSettings has no Tailwind equivalent
									style={{ fontVariationSettings: '"wght" 500' }}
								>
									{group.label}
								</div>
							)}
							<div className="-mx-2 flex flex-col">
								{group.items.map((item) => (
									<a
										key={item.href}
										href={item.href}
										data-nav
										className={`nav-link flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-[3px] text-[12px] tracking-[-0.01em] no-underline outline-none ${isActive(item.href) ? 'nav-link--active' : ''}`}
									>
										<HugeiconsIcon
											icon={item.icon}
											size={14}
											color="currentColor"
											className="shrink-0"
										/>
										{item.label}
									</a>
								))}
							</div>
						</m.div>
					))}

					{/* Bottom actions */}
					<m.div variants={sidebarItem} className="mt-auto flex flex-col gap-1 pt-6">
						{/* Command palette trigger — the kbd itself is the "icon" */}
						<button
							type="button"
							onClick={() => window.dispatchEvent(new CustomEvent('open-cmdk'))}
							aria-label="Open command palette (⌘K / Ctrl+K)"
							onMouseEnter={() => setHoveredAction('cmdk')}
							onMouseLeave={() => setHoveredAction(null)}
							className="nav-link -mx-2 flex w-[calc(100%+16px)] cursor-pointer items-center gap-1.5 rounded-md border-0 bg-transparent px-2 py-[3px] text-left text-[12px]"
						>
							<kbd className="inline-flex h-[15px] min-w-[15px] shrink-0 items-center justify-center rounded-[4px] bg-[var(--muted-bg)] px-[4px] font-[inherit] text-[10px] text-[var(--text-muted)] leading-none tracking-[0]">
								⌘K
							</kbd>
							<span
								className="inline-block whitespace-nowrap text-[11px]"
								// biome-ignore lint/nursery/noInlineStyles: dynamic opacity/transform based on hover state
								style={{
									opacity: hoveredAction === 'cmdk' ? 1 : 0,
									transform:
										hoveredAction === 'cmdk'
											? 'translateY(0) perspective(300px) rotateX(0deg)'
											: 'translateY(5px) perspective(300px) rotateX(-40deg)',
									transformOrigin: '50% 100%',
									transition: 'opacity 0.2s ease, transform 0.25s cubic-bezier(0.19, 1, 0.22, 1)',
								}}
							>
								Command palette
							</span>
						</button>

						{/* Built in Astro */}
						<a
							href="https://astro.build"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Built in Astro"
							className="nav-link -mx-2 flex items-center gap-1.5 rounded-md px-2 py-[3px] text-[12px] no-underline"
							onMouseEnter={() => setHoveredAction('astro')}
							onMouseLeave={() => setHoveredAction(null)}
						>
							<img
								src={
									isDark
										? 'https://astro.build/assets/press/astro-icon-light-gradient.png'
										: 'https://astro.build/assets/press/astro-icon-dark.svg'
								}
								width={13}
								height={13}
								alt="Astro"
								className="h-[13px] w-[13px] shrink-0 rounded-[3px]"
							/>
							<span
								className="inline-block whitespace-nowrap text-[11px]"
								// biome-ignore lint/nursery/noInlineStyles: dynamic opacity/transform based on hover state
								style={{
									opacity: hoveredAction === 'astro' ? 1 : 0,
									transform:
										hoveredAction === 'astro'
											? 'translateY(0) perspective(300px) rotateX(0deg)'
											: 'translateY(5px) perspective(300px) rotateX(-40deg)',
									transformOrigin: '50% 100%',
									transition: 'opacity 0.2s ease, transform 0.25s cubic-bezier(0.19, 1, 0.22, 1)',
								}}
							>
								Built in Astro
							</span>
						</a>

						{/* Old portfolio */}
						<a
							href="https://aryanranderiya.com"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Old portfolio (aryanranderiya.com)"
							className="nav-link -mx-2 flex items-center gap-1.5 rounded-md px-2 py-[3px] text-[12px] no-underline"
							onMouseEnter={() => setHoveredAction('old-portfolio')}
							onMouseLeave={() => setHoveredAction(null)}
						>
							<img
								src="/old-portfolio-logo.webp"
								width={13}
								height={13}
								alt="Old portfolio"
								className="h-[13px] w-[13px] shrink-0 rounded-[2px]"
							/>
							<span
								className="inline-block whitespace-nowrap text-[11px]"
								// biome-ignore lint/nursery/noInlineStyles: dynamic opacity/transform/textDecoration based on hover state
								style={{
									opacity: hoveredAction === 'old-portfolio' ? 1 : 0,
									transform:
										hoveredAction === 'old-portfolio'
											? 'translateY(0) perspective(300px) rotateX(0deg)'
											: 'translateY(5px) perspective(300px) rotateX(-40deg)',
									transformOrigin: '50% 100%',
									textDecoration: hoveredAction === 'old-portfolio' ? 'underline' : 'none',
									textDecorationStyle: 'dotted',
									textUnderlineOffset: '3px',
									transition: 'opacity 0.2s ease, transform 0.25s cubic-bezier(0.19, 1, 0.22, 1)',
								}}
							>
								Old portfolio
							</span>
						</a>

						{/* Theme toggle + shuffle popover */}
						<Popover open={shuffleOpen} onOpenChange={setShuffleOpen}>
							<PopoverAnchor asChild>
								<button
									type="button"
									onClick={handleThemeButtonClick}
									className="nav-link nav-link--dim -mx-2 flex cursor-pointer items-center gap-1.5 rounded-md border-0 bg-transparent px-2 py-[3px] text-[12px]"
									onMouseEnter={() => setHoveredAction('theme')}
									onMouseLeave={() => setHoveredAction(null)}
									aria-label="Cycle theme"
								>
									<HugeiconsIcon icon={themeIcon} size={13} />
									<span
										className="inline-block whitespace-nowrap text-[11px]"
										// biome-ignore lint/nursery/noInlineStyles: dynamic opacity/transform based on hover state
										style={{
											opacity: hoveredAction === 'theme' || shuffleOpen ? 1 : 0,
											transform:
												hoveredAction === 'theme' || shuffleOpen
													? 'translateY(0) perspective(300px) rotateX(0deg)'
													: 'translateY(5px) perspective(300px) rotateX(-40deg)',
											transformOrigin: '50% 100%',
											transition:
												'opacity 0.2s ease, transform 0.25s cubic-bezier(0.19, 1, 0.22, 1)',
										}}
									>
										{themeLabel}
									</span>
								</button>
							</PopoverAnchor>
							<PopoverContent
								side="right"
								align="end"
								sideOffset={14}
								onOpenAutoFocus={(e) => e.preventDefault()}
								className="hidden w-[164px] rounded-xl p-3 min-[960px]:block"
							>
								<div className="mb-2.5 flex items-center justify-between">
									<span
										className="text-[10px] text-[var(--foreground)] tracking-[-0.01em]"
										// biome-ignore lint/nursery/noInlineStyles: fontVariationSettings/fontFamily have no Tailwind equivalent
										style={{
											fontVariationSettings: '"wght" 560',
											fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
										}}
									>
										Customize
									</span>
									<button
										type="button"
										onClick={() => setShuffleOpen(false)}
										className="flex cursor-pointer border-0 bg-transparent p-0 text-[var(--muted-foreground)] leading-none transition-colors duration-150 hover:text-[var(--foreground)]"
										aria-label="Close"
									>
										<HugeiconsIcon icon={Cancel01Icon} size={12} color="currentColor" />
									</button>
								</div>

								<p
									className="mt-0 mb-1.5 text-[9px] text-[var(--muted-foreground)] uppercase tracking-[0.08em]"
									// biome-ignore lint/nursery/noInlineStyles: fontVariationSettings/fontFamily have no Tailwind equivalent
									style={{
										fontVariationSettings: '"wght" 600',
										fontFamily: "'Inter var', Inter, sans-serif",
									}}
								>
									Colors
								</p>
								<button
									type="button"
									onClick={handleShuffleColors}
									aria-label="Shuffle color palette"
									className="flex w-full cursor-pointer items-center gap-1.5 rounded-md border-0 bg-[var(--muted-bg)] px-2 py-1.5 text-[11px] text-[var(--foreground)] transition-opacity duration-150 hover:opacity-65"
									// biome-ignore lint/nursery/noInlineStyles: fontVariationSettings/fontFamily have no Tailwind equivalent
									style={{
										fontVariationSettings: '"wght" 480',
										fontFamily: "'Inter var', Inter, sans-serif",
									}}
								>
									<HugeiconsIcon icon={ShuffleIcon} size={12} color="currentColor" />
									Shuffle palette
								</button>

								<p
									className="mt-3 mb-1.5 text-[9px] text-[var(--muted-foreground)] uppercase tracking-[0.08em]"
									// biome-ignore lint/nursery/noInlineStyles: fontVariationSettings/fontFamily have no Tailwind equivalent
									style={{
										fontVariationSettings: '"wght" 600',
										fontFamily: "'Inter var', Inter, sans-serif",
									}}
								>
									Typography
								</p>
								<button
									type="button"
									onClick={handleShuffleFont}
									aria-label="Shuffle typography"
									className="flex w-full cursor-pointer items-center gap-1.5 rounded-md border-0 bg-[var(--muted-bg)] px-2 py-1.5 text-[11px] text-[var(--foreground)] transition-opacity duration-150 hover:opacity-65"
									// biome-ignore lint/nursery/noInlineStyles: fontVariationSettings/fontFamily have no Tailwind equivalent
									style={{
										fontVariationSettings: '"wght" 480',
										fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
									}}
								>
									<HugeiconsIcon icon={ShuffleIcon} size={12} color="currentColor" />
									Shuffle font
								</button>

								{/* Current font preview */}
								<div
									className="mt-1.5 text-[var(--muted-foreground)]"
									// biome-ignore lint/nursery/noInlineStyles: dynamic fontFamily/fontSize/letterSpacing based on typography selection
									style={{
										fontFamily: currentTypography?.family,
										fontSize: typography === 'pixel' ? '13px' : '10px',
										letterSpacing: typography === 'mono' ? '-0.02em' : '0',
									}}
								>
									{currentTypography?.label}
								</div>
							</PopoverContent>
						</Popover>

						{/* GitHub */}
						<a
							href="https://github.com/aryanranderiya/website"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="View source on GitHub"
							className="flex items-center gap-1.5 py-[2px] text-[12px] text-[var(--text-ghost)] no-underline transition-colors duration-150 hover:text-[var(--text-secondary)]"
							// biome-ignore lint/nursery/noInlineStyles: fontVariationSettings has no Tailwind equivalent
							style={{ fontVariationSettings: '"wght" 450' }}
							onMouseEnter={() => setHoveredAction('github')}
							onMouseLeave={() => setHoveredAction(null)}
						>
							<svg
								width="13"
								height="13"
								viewBox="0 0 16 16"
								fill="currentColor"
								xmlns="http://www.w3.org/2000/svg"
							>
								<title>GitHub</title>
								<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
							</svg>
							<span
								className="inline-block whitespace-nowrap text-[11px]"
								// biome-ignore lint/nursery/noInlineStyles: dynamic opacity/transform/textDecoration based on hover state
								style={{
									opacity: hoveredAction === 'github' ? 1 : 0,
									transform:
										hoveredAction === 'github'
											? 'translateY(0) perspective(300px) rotateX(0deg)'
											: 'translateY(5px) perspective(300px) rotateX(-40deg)',
									transformOrigin: '50% 100%',
									textDecoration: hoveredAction === 'github' ? 'underline' : 'none',
									textDecorationStyle: 'dotted',
									textUnderlineOffset: '3px',
									transition: 'opacity 0.2s ease, transform 0.25s cubic-bezier(0.19, 1, 0.22, 1)',
								}}
							>
								GitHub
							</span>
						</a>
					</m.div>
				</m.div>
			</nav>

			{/* ── Mobile top bar ── */}
			<div className="fixed top-0 right-0 left-0 z-50 flex h-[52px] items-center justify-between bg-[var(--glass-bg)] px-5 backdrop-blur-[12px] min-[960px]:hidden">
				<a
					href="/"
					className="text-[13px] text-[var(--text-primary)] tracking-[-0.02em] no-underline"
					// biome-ignore lint/nursery/noInlineStyles: fontVariationSettings has no Tailwind equivalent
					style={{ fontVariationSettings: '"wght" 600' }}
				>
					Aryan Randeriya
				</a>
				<div className="flex items-center gap-3">
					<Popover open={shuffleOpen} onOpenChange={setShuffleOpen}>
						<PopoverAnchor asChild>
							<button
								type="button"
								onClick={handleThemeButtonClick}
								className="flex cursor-pointer items-center border-0 bg-transparent p-1 text-[var(--muted-foreground)]"
								aria-label="Cycle theme"
							>
								<HugeiconsIcon icon={themeIcon} size={13} />
							</button>
						</PopoverAnchor>
						<PopoverContent
							side="bottom"
							align="end"
							sideOffset={8}
							onOpenAutoFocus={(e) => e.preventDefault()}
							className="w-[calc(100vw-32px)] rounded-xl p-3.5 min-[960px]:hidden"
						>
							<div className="mb-2.5 flex items-center justify-between">
								<span
									className="text-[11px] text-[var(--foreground)] tracking-[-0.01em]"
									// biome-ignore lint/nursery/noInlineStyles: fontVariationSettings/fontFamily have no Tailwind equivalent
									style={{
										fontVariationSettings: '"wght" 560',
										fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
									}}
								>
									Customize
								</span>
								<button
									type="button"
									onClick={() => setShuffleOpen(false)}
									className="flex cursor-pointer border-0 bg-transparent p-0 text-[var(--muted-foreground)] leading-none"
									aria-label="Close"
								>
									<HugeiconsIcon icon={Cancel01Icon} size={13} color="currentColor" />
								</button>
							</div>

							<p
								className="mt-0 mb-1.5 text-[9px] text-[var(--muted-foreground)] uppercase tracking-[0.08em]"
								// biome-ignore lint/nursery/noInlineStyles: fontVariationSettings/fontFamily have no Tailwind equivalent
								style={{
									fontVariationSettings: '"wght" 600',
									fontFamily: "'Inter var', Inter, sans-serif",
								}}
							>
								Colors
							</p>
							<button
								type="button"
								onClick={handleShuffleColors}
								aria-label="Shuffle color palette"
								className="flex w-full cursor-pointer items-center gap-1.5 rounded-md border-0 bg-[var(--muted-bg)] px-2.5 py-2 text-[var(--foreground)] text-xs"
								// biome-ignore lint/nursery/noInlineStyles: fontVariationSettings/fontFamily have no Tailwind equivalent
								style={{
									fontVariationSettings: '"wght" 480',
									fontFamily: "'Inter var', Inter, sans-serif",
								}}
							>
								<HugeiconsIcon icon={ShuffleIcon} size={13} color="currentColor" />
								Shuffle palette
							</button>

							<p
								className="mt-3 mb-1.5 text-[9px] text-[var(--muted-foreground)] uppercase tracking-[0.08em]"
								// biome-ignore lint/nursery/noInlineStyles: fontVariationSettings/fontFamily have no Tailwind equivalent
								style={{
									fontVariationSettings: '"wght" 600',
									fontFamily: "'Inter var', Inter, sans-serif",
								}}
							>
								Typography
							</p>
							<button
								type="button"
								onClick={handleShuffleFont}
								aria-label="Shuffle typography"
								className="flex w-full cursor-pointer items-center gap-1.5 rounded-md border-0 bg-[var(--muted-bg)] px-2.5 py-2 text-[var(--foreground)] text-xs"
								// biome-ignore lint/nursery/noInlineStyles: fontVariationSettings/fontFamily have no Tailwind equivalent
								style={{
									fontVariationSettings: '"wght" 480',
									fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
								}}
							>
								<HugeiconsIcon icon={ShuffleIcon} size={13} color="currentColor" />
								Shuffle font
							</button>

							<div
								className="mt-1.5 text-[var(--muted-foreground)]"
								// biome-ignore lint/nursery/noInlineStyles: dynamic fontFamily/fontSize/letterSpacing based on typography selection
								style={{
									fontFamily: currentTypography?.family,
									fontSize: typography === 'pixel' ? '14px' : '11px',
									letterSpacing: typography === 'mono' ? '-0.02em' : '0',
								}}
							>
								{currentTypography?.label}
							</div>
						</PopoverContent>
					</Popover>
					<button
						type="button"
						onClick={() => setMobileOpen((v) => !v)}
						className="flex cursor-pointer items-center border-0 bg-transparent p-1 text-[var(--text-ghost)]"
						aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
					>
						<HugeiconsIcon icon={mobileOpen ? Cancel01Icon : SidebarRightIcon} size={16} />
					</button>
				</div>
			</div>

			{/* ── Mobile fullscreen menu ── */}
			<AnimatePresence>
				{mobileOpen && (
					<m.div
						initial={{ opacity: 0, x: 16 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: 16 }}
						transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
						className="fixed inset-0 z-[48] bg-[var(--background)]"
					>
						<div className="flex h-[52px] items-center justify-between px-5">
							<a
								href="/"
								className="text-[13px] text-[var(--text-primary)] tracking-[-0.02em] no-underline"
								// biome-ignore lint/nursery/noInlineStyles: fontVariationSettings has no Tailwind equivalent
								style={{ fontVariationSettings: '"wght" 600' }}
							>
								Aryan Randeriya
							</a>
							<button
								type="button"
								onClick={() => setMobileOpen(false)}
								className="flex cursor-pointer items-center border-0 bg-transparent p-1 text-[var(--muted-foreground)]"
								aria-label="Close menu"
							>
								<HugeiconsIcon icon={Cancel01Icon} size={16} />
							</button>
						</div>

						<div className="px-6 pt-6">
							{NAV_GROUPS.map((group, gi) => (
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: static array, order never changes
									key={gi}
									className={group.label ? '' : 'mb-2'}
								>
									{group.label && (
										<div
											className={`mb-1 text-[10px] text-[var(--text-ghost)] uppercase tracking-[0.07em] ${gi === 0 ? '' : 'mt-5'}`}
											// biome-ignore lint/nursery/noInlineStyles: fontVariationSettings has no Tailwind equivalent
											style={{ fontVariationSettings: '"wght" 500' }}
										>
											{group.label}
										</div>
									)}
									{group.items.map((item) => (
										<a
											key={item.href}
											href={item.href}
											data-nav
											className={`nav-link flex items-center gap-2.5 whitespace-nowrap py-[9px] text-[15px] tracking-[-0.01em] no-underline ${isActive(item.href) ? 'nav-link--active' : ''}`}
											onClick={() => setMobileOpen(false)}
										>
											<HugeiconsIcon
												icon={item.icon}
												size={16}
												className="shrink-0 opacity-[0.85]"
											/>
											{item.label}
										</a>
									))}
								</div>
							))}
						</div>
					</m.div>
				)}
			</AnimatePresence>
		</LazyMotion>
	);
}
