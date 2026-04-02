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

// Compatibility shim — keeps all existing <HugeiconsIcon icon={XIcon} size={16} /> calls working.
// With gaia-icons, icons are direct React components, so we just render the passed component.
export function HugeiconsIcon({
  icon: Icon,
  ...props
}: IconProps & { icon: ComponentType<IconProps> }) {
  return createElement(Icon, props);
}
