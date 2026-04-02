import { cn } from '@/lib/utils';
import * as React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glass?: boolean;
}

export function Card({ className, hover = false, glass = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border overflow-hidden',
        hover && 'transition-all duration-200 hover:shadow-lg cursor-pointer',
        glass && 'glass',
        className
      )}
      style={{
        background: glass ? undefined : 'var(--card)',
        borderColor: 'var(--border)',
        color: 'var(--card-foreground)',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-5 pb-0', className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('p-5 pt-0 flex items-center gap-3', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-base font-semibold leading-tight', className)}
      style={{ letterSpacing: '-0.01em' }}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm mt-1', className)}
      style={{ color: 'var(--muted-foreground)' }}
      {...props}
    >
      {children}
    </p>
  );
}
