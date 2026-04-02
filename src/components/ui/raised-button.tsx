'use client';

import { cn } from '@/lib/utils';
import { parseColor, getLuminance, getContrastColor } from '@/lib/utils/colors';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium',
    'transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50 relative cursor-pointer',
    'border shadow-md subpixel-antialiased',
    'before:absolute before:inset-0 before:rounded-lg before:border-t before:border-white/30',
    'before:bg-gradient-to-b before:from-white/15 before:to-transparent before:pointer-events-none',
    'active:scale-[0.96] hover:scale-[0.98] transition-transform duration-150',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-zinc-900 text-white border-zinc-700',
          'dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-300',
        ],
        accent: [
          'text-white border-[rgba(0,187,255,0.5)]',
        ],
        ghost: [
          'bg-transparent shadow-none border-transparent',
          'hover:bg-zinc-100 dark:hover:bg-zinc-800',
        ],
        outline: [
          'bg-transparent shadow-sm',
          'border-zinc-200 dark:border-zinc-700',
          'hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
        ],
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-lg px-6',
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
  ({ className, variant, size, color, style = {}, children, ...props }, ref) => {
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
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        style={{ ...style, ...dynamicStyles }}
        {...props}
      >
        {children}
      </button>
    );
  }
);
RaisedButton.displayName = 'RaisedButton';

export { RaisedButton, buttonVariants };
