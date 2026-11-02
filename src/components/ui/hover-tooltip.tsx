'use client';

import { type ReactNode, useState } from 'react';
import { createPortal } from 'react-dom';

/** A small label above its child while the pointer is over it; portalled so scroll boxes don't clip it. */
export function HoverTooltip({
	label,
	className,
	children,
}: {
	label: ReactNode;
	className?: string;
	children: ReactNode;
}) {
	const [at, setAt] = useState<{ x: number; y: number } | null>(null);
	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: hover-only label; the child carries its own accessible name
		<span
			className={className}
			onMouseEnter={(e) => {
				const rect = e.currentTarget.getBoundingClientRect();
				setAt({ x: rect.left + rect.width / 2, y: rect.top - 6 });
			}}
			onMouseLeave={() => setAt(null)}
		>
			{children}
			{at &&
				createPortal(
					<span
						className="animate-in fade-in-0 zoom-in-95 pointer-events-none fixed z-[9999] -translate-x-1/2 -translate-y-full rounded-[7px] bg-[var(--foreground)] px-[9px] py-[5px] text-[11px] whitespace-nowrap text-[var(--background)]"
						// biome-ignore lint/style/noInlineStyles: dynamic position from the anchor's box
						style={{ left: at.x, top: at.y }}
					>
						{label}
					</span>,
					document.body
				)}
		</span>
	);
}
