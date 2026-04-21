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
				className="group block w-[280px] cursor-pointer overflow-hidden rounded-xl border-2 border-muted bg-popover p-2.5 text-inherit no-underline shadow-(--shadow-xl)"
			>
				{preview.image && (
					<div className="mb-2 aspect-[16/9] overflow-hidden rounded-lg bg-[var(--muted-bg)]">
						<img
							src={preview.image}
							alt={preview.title ?? preview.name ?? ''}
							className="block h-full w-full object-cover"
							loading="lazy"
						/>
					</div>
				)}

				{(preview.name || preview.favicon) && (
					<div className="mb-1 flex items-center gap-1.5">
						{preview.favicon && (
							<img
								src={preview.favicon}
								alt=""
								className="h-3.5 w-3.5 shrink-0 rounded-[3px] object-contain"
							/>
						)}
						{preview.name && (
							<span className="truncate font-medium text-[11px] text-[var(--text-secondary)] tracking-[-0.01em] transition-colors duration-150 group-hover:text-[var(--text-primary)]">
								{preview.name}
							</span>
						)}
					</div>
				)}

				{preview.title && (
					<div className="mb-0.5 font-semibold text-[12px] text-[var(--text-primary)] leading-[1.35] tracking-[-0.01em] transition-colors duration-150 group-hover:text-[var(--accent-blue)]">
						{preview.title}
					</div>
				)}

				{preview.description && (
					<p className="m-0 line-clamp-3 text-[11px] text-[var(--text-muted)] leading-[1.5]">
						{preview.description}
					</p>
				)}

				<div className="mt-2 truncate text-[10px] text-[var(--text-ghost)] tracking-[0.01em] transition-colors duration-150 group-hover:text-[var(--text-muted)]">
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
								className={`mb-px inline h-[1.1em] w-auto align-middle ml-1${rounded ? ' rounded-full' : ''}${logoClassName ? ` ${logoClassName}` : ''}`}
							/>
						)}
						{logo && ' '}
						<span
							className={`font-medium underline decoration-dotted underline-offset-4 transition group-hover:text-foreground ${hoverTextClass ?? ''} decoration-muted-foreground/30`}
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
