import { ArrowRight01Icon, CircleArrowRight02Icon, HugeiconsIcon } from '@icons';

interface SectionLinkProps {
	href: string;
	label: string;
	/** 'pill' = muted-bg rounded pill (default), 'ghost' = plain text link */
	variant?: 'pill' | 'ghost';
}

export default function SectionLink({ href, label, variant = 'pill' }: SectionLinkProps) {
	if (variant === 'ghost') {
		return (
			<a
				href={href}
				className="text-[11px] text-[var(--text-ghost)] no-underline inline-flex items-center gap-[3px] tracking-[-0.01em] transition-colors duration-150 hover:text-[var(--text-muted)]"
			>
				{label} <CircleArrowRight02Icon size={11} />
			</a>
		);
	}

	return (
		<a
			href={href}
			className="text-[12px] font-medium text-[var(--text-secondary)] no-underline inline-flex items-center gap-1 bg-[var(--muted-bg)] rounded-full px-[14px] py-[6px] pr-[10px] transition-[filter] duration-150 hover:brightness-[0.96]"
		>
			{label} <HugeiconsIcon icon={CircleArrowRight02Icon} size={13} />
		</a>
	);
}
