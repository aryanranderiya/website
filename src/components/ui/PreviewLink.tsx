'use client';

import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface LinkPreview {
	/** Hero image shown at the top of the popover. */
	image?: string;
	/** Site/brand name shown next to the favicon row. */
	name?: string;
	/** Favicon shown next to the name. Falls back to `logo` if omitted. */
	favicon?: string;
	/** Page title (line under the name). */
	title?: string;
	/** Short description shown under the title. */
	description?: string;
}

interface PreviewLinkProps {
	href: string;
	name: string;
	/** Inline logo shown next to the text in the source line (favicon-style). */
	logo?: string;
	/** Hover popover content. Omit to render a plain underlined link. */
	preview?: LinkPreview;
	/** Underline-style text. Defaults to dotted underline. */
	hoverTextClass?: string;
	/** Extra classes on the inline logo image (e.g., `logo-invert`). */
	logoClassName?: string;
	/** Whether the inline logo should be rounded. */
	rounded?: boolean;
	/** Open in a new tab (default true for http(s), false for mailto/etc). */
	external?: boolean;
	/** When provided, renders children directly inside the anchor instead of the default logo+name. */
	children?: ReactNode;
	/** Override the anchor className (replaces the default `group inline`). */
	anchorClassName?: string;
}

function PreviewCard({
	rect,
	visible,
	preview,
	href,
	isExternal,
	onMouseEnter,
	onMouseLeave,
}: {
	rect: DOMRect;
	visible: boolean;
	preview: LinkPreview;
	href: string;
	isExternal: boolean;
	onMouseEnter: () => void;
	onMouseLeave: () => void;
}) {
	const above = rect.top > window.innerHeight * 0.5;
	const anchorY = above ? rect.top : rect.bottom;
	const anchorX = rect.left + rect.width / 2;
	const displayHost = href
		.replace(/^https?:\/\//, '')
		.replace(/^mailto:/, '')
		.split('/')[0];

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: hover-only tooltip wrapper; the inner <a> handles activation
		<div
			className="fixed z-[300]"
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			// biome-ignore lint/nursery/noInlineStyles: dynamic position from anchor rect
			style={{
				top: anchorY,
				left: anchorX,
				transform: `translateX(-50%) translateY(${above ? 'calc(-100% - 8px)' : '8px'})`,
				opacity: visible ? 1 : 0,
				pointerEvents: visible ? 'auto' : 'none',
				transition: 'opacity 0.15s ease, transform 0.18s cubic-bezier(0.19,1,0.22,1)',
			}}
		>
			<a
				href={href}
				target={isExternal ? '_blank' : undefined}
				rel={isExternal ? 'noopener noreferrer' : undefined}
				aria-label={preview.title ?? preview.name ?? displayHost}
				className="group block w-[280px] rounded-xl bg-[var(--popover)] shadow-[var(--shadow-lg)] overflow-hidden p-2.5 no-underline text-inherit cursor-pointer"
			>
				{preview.image && (
					<div className="rounded-lg overflow-hidden mb-2 aspect-[16/9] bg-[var(--muted-bg)]">
						<img
							src={preview.image}
							alt={preview.title ?? preview.name ?? ''}
							className="w-full h-full object-cover block"
							loading="lazy"
						/>
					</div>
				)}

				{(preview.name || preview.favicon) && (
					<div className="flex items-center gap-1.5 mb-1">
						{preview.favicon && (
							<img
								src={preview.favicon}
								alt=""
								className="w-3.5 h-3.5 rounded-[3px] object-contain shrink-0"
							/>
						)}
						{preview.name && (
							<span className="text-[11px] font-medium text-[var(--text-secondary)] tracking-[-0.01em] truncate transition-colors duration-150 group-hover:text-[var(--text-primary)]">
								{preview.name}
							</span>
						)}
					</div>
				)}

				{preview.title && (
					<div className="text-[12px] font-semibold text-[var(--text-primary)] tracking-[-0.01em] leading-[1.35] mb-0.5 transition-colors duration-150 group-hover:text-[var(--accent-blue)]">
						{preview.title}
					</div>
				)}

				{preview.description && (
					<p className="text-[11px] text-[var(--text-muted)] leading-[1.5] m-0 line-clamp-3">
						{preview.description}
					</p>
				)}

				<div className="text-[10px] text-[var(--text-ghost)] mt-2 truncate tracking-[0.01em] transition-colors duration-150 group-hover:text-[var(--text-muted)]">
					{displayHost}
				</div>
			</a>
		</div>
	);
}

export default function PreviewLink({
	href,
	name,
	logo,
	preview,
	hoverTextClass,
	logoClassName,
	rounded = true,
	external,
	children,
	anchorClassName,
}: PreviewLinkProps) {
	const isExternal = external ?? !href.startsWith('mailto:');
	const anchorRef = useRef<HTMLAnchorElement>(null);
	const leaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const [hovered, setHovered] = useState(false);
	const [rect, setRect] = useState<DOMRect | null>(null);

	useEffect(() => () => clearTimeout(leaveTimer.current), []);

	const show = useCallback(() => {
		clearTimeout(leaveTimer.current);
		if (anchorRef.current) setRect(anchorRef.current.getBoundingClientRect());
		setHovered(true);
	}, []);

	const hideFromAnchor = useCallback(() => {
		leaveTimer.current = setTimeout(() => setHovered(false), 120);
	}, []);

	const hideFromCard = useCallback(() => {
		clearTimeout(leaveTimer.current);
		setHovered(false);
	}, []);

	return (
		<>
			<a
				ref={anchorRef}
				href={href}
				target={isExternal ? '_blank' : undefined}
				rel={isExternal ? 'noopener noreferrer' : undefined}
				onMouseEnter={show}
				onMouseLeave={hideFromAnchor}
				onFocus={show}
				onBlur={hideFromAnchor}
				className={anchorClassName ?? 'group inline'}
			>
				{children ?? (
					<>
						{logo && (
							<img
								src={logo}
								alt={name}
								className={`inline align-middle w-auto h-[1.1em] mb-px ml-1${rounded ? ' rounded-full' : ''}${logoClassName ? ` ${logoClassName}` : ''}`}
							/>
						)}
						{logo && ' '}
						<span
							className={`font-medium underline underline-offset-4 decoration-dotted transition group-hover:text-foreground ${hoverTextClass ?? ''}`}
						>
							{name}
						</span>
					</>
				)}
			</a>
			{preview &&
				rect &&
				typeof document !== 'undefined' &&
				createPortal(
					<PreviewCard
						rect={rect}
						visible={hovered}
						preview={preview}
						href={href}
						isExternal={isExternal}
						onMouseEnter={show}
						onMouseLeave={hideFromCard}
					/>,
					document.body
				)}
		</>
	);
}
