// Icons barrel — all icons from @theexperiencecompany/gaia-icons solid-rounded.
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
    createElement('path', { d: 'm9 18 6-6-6-6' }),
  );
}

// Compatibility shim — keeps all existing <HugeiconsIcon icon={XIcon} size={16} /> calls working.
// With gaia-icons, icons are direct React components, so we just render the passed component.
export function HugeiconsIcon({
  icon: Icon,
  ...props
}: IconProps & { icon: ComponentType<IconProps> }) {
  return createElement(Icon, props);
}
