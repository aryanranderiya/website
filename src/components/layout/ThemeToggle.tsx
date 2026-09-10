'use client';

import { ColorsIcon, HugeiconsIcon, Moon02Icon, Sun01Icon } from '@icons';
import { useState, useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark' | 'random';

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

function readStoredTheme(): Theme {
	if (typeof localStorage === 'undefined') return 'light';
	const stored = localStorage.getItem('theme') as Theme | null;
	return stored === 'dark' || stored === 'random' ? stored : 'light';
}

// No-op subscription: "mounted" never changes after hydration; the store
// exists only to give SSR (false → placeholder) and the client (true) matching
// snapshots without a mount-effect state update.
function subscribeToMounted(_onChange: () => void): () => void {
	return () => {};
}

export default function ThemeToggle() {
	// Lazy initializer reads the stored theme exactly once — no post-paint
	// effect update, so the first client render already shows the right icon.
	const [theme, setTheme] = useState<Theme>(readStoredTheme);
	const mounted = useSyncExternalStore(
		subscribeToMounted,
		() => true,
		() => false
	);

	function cycle() {
		const html = document.documentElement;
		if (theme === 'light') {
			html.classList.add('dark');
			clearRandomPalette();
			localStorage.setItem('theme', 'dark');
			setTheme('dark');
		} else if (theme === 'dark') {
			html.classList.remove('dark');
			const hue = Math.floor(Math.random() * 360);
			const sat = Math.floor(Math.random() * 36) + 25;
			applyRandomPalette(hue, sat);
			localStorage.setItem('theme', 'random');
			localStorage.setItem('randomHue', String(hue));
			localStorage.setItem('randomSat', String(sat));
			setTheme('random');
		} else {
			html.classList.remove('dark');
			clearRandomPalette();
			localStorage.setItem('theme', 'light');
			setTheme('light');
		}
	}

	if (!mounted) {
		return (
			<button
				type="button"
				aria-label="Cycle theme"
				className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted-foreground)]"
			>
				<span className="h-4 w-4" />
			</button>
		);
	}

	return (
		<button
			type="button"
			onClick={cycle}
			aria-label="Cycle theme"
			title={theme === 'light' ? 'Dark mode' : theme === 'dark' ? 'Shuffle mode' : 'Light mode'}
			className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-transparent text-[var(--muted-foreground)] transition-opacity duration-200 hover:opacity-70"
		>
			<HugeiconsIcon
				icon={theme === 'light' ? Moon02Icon : theme === 'dark' ? ColorsIcon : Sun01Icon}
				size={16}
			/>
		</button>
	);
}
