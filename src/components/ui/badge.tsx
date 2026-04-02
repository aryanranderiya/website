import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const badgeVariants = cva(
  'inline-flex items-center rounded-full text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'px-2.5 py-0.5 border',
        solid: 'px-2.5 py-0.5',
        dot: 'pl-2 pr-2.5 py-0.5 gap-1.5 border',
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
  const colorStyles: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: 'var(--muted)',
      color: 'var(--muted-foreground)',
      borderColor: 'var(--border)',
    },
    accent: {
      backgroundColor: 'rgba(0, 187, 255, 0.1)',
      color: '#00bbff',
      borderColor: 'rgba(0, 187, 255, 0.3)',
    },
    success: {
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      color: '#16a34a',
      borderColor: 'rgba(34, 197, 94, 0.3)',
    },
    warning: {
      backgroundColor: 'rgba(251, 191, 36, 0.1)',
      color: '#d97706',
      borderColor: 'rgba(251, 191, 36, 0.3)',
    },
    error: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      color: '#dc2626',
      borderColor: 'rgba(239, 68, 68, 0.3)',
    },
  };

  return (
    <span
      className={cn(badgeVariants({ variant, className }))}
      style={colorStyles[color]}
      {...props}
    >
      {(variant === 'dot' || showDot) && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: 'currentColor' }}
        />
      )}
      {children}
    </span>
  );
}
