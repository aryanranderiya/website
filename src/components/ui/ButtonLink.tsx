'use client';

import {
  HugeiconsIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Download01Icon,
  Mail01Icon,
} from '@icons';
import { RaisedButton } from './raised-button';

const ICONS = {
  download: Download01Icon,
  'arrow-left': ArrowLeft01Icon,
  'arrow-right': ArrowRight01Icon,
  mail: Mail01Icon,
} as const;

type IconName = keyof typeof ICONS;

interface ButtonLinkProps {
  href: string;
  label: string;
  icon?: IconName;
  iconSize?: number;
  download?: boolean;
  target?: string;
  rel?: string;
  variant?: 'default' | 'accent' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export default function ButtonLink({
  href,
  label,
  icon,
  iconSize = 14,
  download,
  target,
  rel,
  variant = 'default',
  size = 'default',
  className,
}: ButtonLinkProps) {
  const IconComp = icon ? ICONS[icon] : null;
  return (
    <RaisedButton asChild variant={variant} size={size} className={[icon ? 'gap-1.5' : '', className ?? ''].join(' ').trim()}>
      <a href={href} download={download} target={target} rel={rel}>
        {IconComp && <HugeiconsIcon icon={IconComp} size={iconSize} />}
        {label}
      </a>
    </RaisedButton>
  );
}
