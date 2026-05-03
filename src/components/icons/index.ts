// Icons barrel - all icons from @theexperiencecompany/gaia-icons solid-rounded.
// Import icons and HugeiconsIcon from here everywhere in the portfolio.
//
// Usage:
//   import { HugeiconsIcon, Download01Icon } from '@icons';
//   <HugeiconsIcon icon={Download01Icon} size={16} />

import type { IconProps } from '@theexperiencecompany/gaia-icons';
import type { ComponentType } from 'react';
import { createElement } from 'react';

export * from '@theexperiencecompany/gaia-icons/solid-rounded';

export function ChevronRight({ size = 24, className }: { size?: number; className?: string }) {
	return createElement(
		'svg',
		{
			xmlns: 'http://www.w3.org/2000/svg',
			width: size,
			height: size,
			viewBox: '0 0 24 24',
			fill: 'none',
			stroke: 'currentColor',
			strokeWidth: 2,
			strokeLinecap: 'round',
			strokeLinejoin: 'round',
			className,
		},
		createElement('path', { d: 'm9 18 6-6-6-6' })
	);
}

// Lucide `dices` icon (lucide.dev/icons/dices). Vendored inline so we don't
// pull in the lucide-react package just for this one icon.
export function DicesIcon({ size = 24, className }: { size?: number; className?: string }) {
	return createElement(
		'svg',
		{
			xmlns: 'http://www.w3.org/2000/svg',
			width: size,
			height: size,
			viewBox: '0 0 24 24',
			fill: 'none',
			stroke: 'currentColor',
			strokeWidth: 2,
			strokeLinecap: 'round',
			strokeLinejoin: 'round',
			className,
		},
		createElement('rect', { key: 'r', width: 12, height: 12, x: 2, y: 10, rx: 2, ry: 2 }),
		createElement('path', {
			key: 'p1',
			d: 'm17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6',
		}),
		createElement('path', { key: 'p2', d: 'M6 18h.01' }),
		createElement('path', { key: 'p3', d: 'M10 14h.01' }),
		createElement('path', { key: 'p4', d: 'M15 6h.01' }),
		createElement('path', { key: 'p5', d: 'M18 9h.01' })
	);
}

// Compatibility shim - keeps all existing <HugeiconsIcon icon={XIcon} size={16} /> calls working.
// With gaia-icons, icons are direct React components, so we just render the passed component.
export function HugeiconsIcon({
	icon: Icon,
	...props
}: IconProps & { icon: ComponentType<IconProps> }) {
	return createElement(Icon, props);
}
