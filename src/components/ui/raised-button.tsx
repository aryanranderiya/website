'use client';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { getContrastColor, getLuminance, parseColor } from '@/lib/utils/colors';

const buttonVariants = cva(
	[
		'inline-flex items-center justify-center overflow-hidden whitespace-nowrap rounded-full font-medium text-sm',
		'transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
		'relative cursor-pointer disabled:pointer-events-none disabled:opacity-50',
		'border subpixel-antialiased',
		'transition-transform duration-150 hover:scale-[0.98] active:scale-[0.96]',
	],
	{
		variants: {
			variant: {
				default: ['!text-white border-[#111113] bg-gradient-to-b from-[#444] to-black'],
				accent: [
					'border-[rgba(0,187,255,0.5)] text-white',
					'before:absolute before:inset-0 before:rounded-full before:border-white/30 before:border-t',
					'before:pointer-events-none before:bg-gradient-to-b before:from-white/15 before:to-transparent',
					'shadow-md',
				],
				ghost: [
					'border-transparent bg-transparent shadow-none',
					'hover:bg-zinc-100 dark:hover:bg-zinc-800',
				],
				outline: [
					'bg-transparent shadow-sm',
					'border-zinc-200 dark:border-zinc-700',
					'hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
				],
				secondary: [
					'!text-[rgba(0,0,0,0.7)] border-[rgba(0,0,0,0.09)] bg-white',
					'shadow-[0_1px_2px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)]',
					'hover:bg-[#f7f7f7]',
				],
			},
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-8 px-3 text-xs',
				lg: 'h-11 px-6',
				icon: 'h-10 w-10',
				'icon-sm': 'h-8 w-8',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	}
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	color?: string;
}

const RaisedButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, color, asChild = false, style = {}, children, ...props }, ref) => {
		const Comp = (asChild ? Slot : 'button') as React.ElementType;
		const dynamicStyles = React.useMemo<React.CSSProperties>(() => {
			if (!color) {
				if (variant === 'accent') {
					return {
						backgroundColor: '#00bbff',
						color: '#000000',
						borderColor: 'rgba(0, 187, 255, 0.4)',
						boxShadow: '0 2px 8px rgba(0, 187, 255, 0.3)',
					};
				}
				return {};
			}
			try {
				const rgb = parseColor(color);
				if (!rgb) return {};
				const luminance = getLuminance(rgb);
				const textColor = getContrastColor(luminance);
				return {
					backgroundColor: color,
					color: textColor,
					borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`,
					boxShadow: `0 2px 8px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`,
				};
			} catch {
				return {};
			}
		}, [color, variant]);

		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref as React.Ref<HTMLButtonElement>}
				style={{ ...style, ...dynamicStyles }}
				{...props}
			>
				{children}
			</Comp>
		);
	}
);
RaisedButton.displayName = 'RaisedButton';

export { buttonVariants, RaisedButton };
