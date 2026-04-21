import type * as React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
	hover?: boolean;
	glass?: boolean;
}

export function Card({ className, hover = false, glass = false, children, ...props }: CardProps) {
	return (
		<div
			className={cn(
				'overflow-hidden rounded-xl',
				!glass && 'bg-[var(--card)]',
				'text-[var(--card-foreground)]',
				hover && 'cursor-pointer transition-all duration-200 hover:shadow-lg',
				glass && 'glass',
				className
			)}
			{...props}
		>
			{children}
		</div>
	);
}

export function CardHeader({
	className,
	children,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div className={cn('p-5 pb-0', className)} {...props}>
			{children}
		</div>
	);
}

export function CardContent({
	className,
	children,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div className={cn('p-5', className)} {...props}>
			{children}
		</div>
	);
}

export function CardFooter({
	className,
	children,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div className={cn('flex items-center gap-3 p-5 pt-0', className)} {...props}>
			{children}
		</div>
	);
}

export function CardTitle({
	className,
	children,
	...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
	return (
		<h3
			className={cn('font-semibold text-base leading-tight tracking-[-0.01em]', className)}
			{...props}
		>
			{children}
		</h3>
	);
}

export function CardDescription({
	className,
	children,
	...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
	return (
		<p className={cn('mt-1 text-[var(--muted-foreground)] text-sm', className)} {...props}>
			{children}
		</p>
	);
}
