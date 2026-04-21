'use client';

import {
	ArrowLeft01Icon,
	ArrowRight01Icon,
	CircleArrowRight02Icon,
	Download01Icon,
	Folder03Icon,
	HugeiconsIcon,
	Mail01Icon,
	QuillWrite01Icon,
} from '@icons';
import { RaisedButton } from './raised-button';

const ICONS = {
	download: Download01Icon,
	'arrow-left': ArrowLeft01Icon,
	'arrow-right': ArrowRight01Icon,
	mail: Mail01Icon,
	folder: Folder03Icon,
	'quill-write': QuillWrite01Icon,
} as const;

type IconName = keyof typeof ICONS;

interface ButtonLinkProps {
	href: string;
	label: string;
	icon?: IconName;
	iconSize?: number;
	trailingArrow?: boolean;
	download?: boolean;
	target?: string;
	rel?: string;
	variant?: 'default' | 'accent' | 'ghost' | 'outline' | 'secondary';
	size?: 'default' | 'sm' | 'lg';
	className?: string;
}

export default function ButtonLink({
	href,
	label,
	icon,
	iconSize = 14,
	trailingArrow = false,
	download,
	target,
	rel,
	variant = 'default',
	size = 'default',
	className,
}: ButtonLinkProps) {
	const IconComp = icon ? ICONS[icon] : null;
	return (
		<RaisedButton
			asChild
			variant={variant}
			size={size}
			className={['gap-1.5', className ?? ''].join(' ').trim()}
		>
			<a href={href} download={download} target={target} rel={rel}>
				{IconComp && <HugeiconsIcon icon={IconComp} size={iconSize} />}
				{label}
				{trailingArrow && <HugeiconsIcon icon={CircleArrowRight02Icon} size={iconSize + 3} />}
			</a>
		</RaisedButton>
	);
}
