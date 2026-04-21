import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { cn } from '@/lib/utils';

const colorClasses: Record<string, string> = {
	default: 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]',
	accent: 'bg-[rgba(0,187,255,0.1)] text-[#00bbff] border-[rgba(0,187,255,0.3)]',
	success: 'bg-[rgba(34,197,94,0.1)] text-[#16a34a] border-[rgba(34,197,94,0.3)]',
	warning: 'bg-[rgba(251,191,36,0.1)] text-[#d97706] border-[rgba(251,191,36,0.3)]',
	error: 'bg-[rgba(239,68,68,0.1)] text-[#dc2626] border-[rgba(239,68,68,0.3)]',
};

const badgeVariants = cva(
	'inline-flex items-center rounded-full font-medium text-xs transition-colors',
	{
		variants: {
			variant: {
				default: 'border px-2.5 py-0.5',
				solid: 'px-2.5 py-0.5',
				dot: 'gap-1.5 border py-0.5 pr-2.5 pl-2',
			},
		},
		defaultVariants: { variant: 'default' },
	}
);

interface BadgeProps
	extends React.HTMLAttributes<HTMLSpanElement>,
		VariantProps<typeof badgeVariants> {
	color?: 'accent' | 'success' | 'warning' | 'error' | 'default';
	showDot?: boolean;
}

export function Badge({
	className,
	variant = 'default',
	color = 'default',
	showDot = false,
	children,
	...props
}: BadgeProps) {
	return (
		<span className={cn(badgeVariants({ variant }), colorClasses[color], className)} {...props}>
			{(variant === 'dot' || showDot) && (
				<span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current" />
			)}
			{children}
		</span>
	);
}
