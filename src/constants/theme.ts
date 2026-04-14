// Design tokens -- mirrors global.css, single source of truth for TS components

export const COLORS = {
	background: '#fdfdfc',
	foreground: '#111111',
	textPrimary: 'rgba(0, 0, 0, 0.85)',
	textSecondary: 'rgba(0, 0, 0, 0.55)',
	textMuted: 'rgba(0, 0, 0, 0.35)',
	textGhost: 'rgba(0, 0, 0, 0.22)',
	border: 'rgba(0, 0, 0, 0.08)',
	borderStrong: 'rgba(0, 0, 0, 0.14)',
	mutedBg: 'rgba(0, 0, 0, 0.04)',
} as const;

export const COLORS_DARK = {
	background: '#111111',
	foreground: '#fdfdfc',
	textPrimary: 'rgba(255, 255, 255, 0.88)',
	textSecondary: 'rgba(255, 255, 255, 0.55)',
	textMuted: 'rgba(255, 255, 255, 0.35)',
	textGhost: 'rgba(255, 255, 255, 0.22)',
	border: 'rgba(255, 255, 255, 0.08)',
	borderStrong: 'rgba(255, 255, 255, 0.14)',
	mutedBg: 'rgba(255, 255, 255, 0.05)',
} as const;

export const FONT = {
	family:
		'"Inter var", "Inter", -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
	mono: '"SF Mono", "Fira Code", ui-monospace, monospace',
} as const;

export const FONT_SIZE = {
	'2xs': '0.625rem', // 10px
	xs: '0.75rem', // 12px
	sm: '0.8125rem', // 13px -- body
	base: '0.875rem', // 14px
	lg: '1rem', // 16px
	xl: '1.125rem', // 18px
	'2xl': '1.375rem', // 22px
	'3xl': '1.75rem', // 28px
	'4xl': '2.25rem', // 36px
} as const;

export const TRACKING = {
	tighter: '-0.04em',
	tight: '-0.025em',
	snug: '-0.015em',
	body: '-0.01em',
	label: '0.06em',
} as const;

export const RADIUS = {
	sm: '4px',
	md: '6px',
	lg: '10px',
	xl: '14px',
	'2xl': '20px',
	full: '9999px',
} as const;

export const ANIMATION = {
	fast: '150ms ease',
	base: '250ms ease',
	slow: '400ms ease',
	easeExpo: 'cubic-bezier(0.19, 1, 0.22, 1)',
	easeSpring: 'cubic-bezier(0.175, 0.885, 0.32, 1.1)',
} as const;

export const LAYOUT = {
	contentWidth: '640px',
	proseWidth: '620px',
	sidebarWidth: '120px',
	pageInset: '24px',
} as const;

export const BREAKPOINTS = {
	sm: '640px',
	md: '768px',
	lg: '1024px',
	sidebar: '900px', // sidebar visible above this
	xl: '1280px',
	'2xl': '1536px',
} as const;
