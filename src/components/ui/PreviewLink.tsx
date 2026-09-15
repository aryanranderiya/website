'use client';

import { CheckmarkCircle02Icon, Copy01Icon, HugeiconsIcon, Mail01Icon } from '@icons';
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

function getDisplayHost(href: string): string {
	return href
		.replace(/^https?:\/\//, '')
		.replace(/^mailto:/, '')
		.split('/')[0];
}

function isMailtoHref(href: string): boolean {
	return href.startsWith('mailto:');
}

function getAnchorPosition(rect: DOMRect): { above: boolean; anchorY: number; anchorX: number } {
	const above = rect.top > window.innerHeight * 0.5;
	return {
		above,
		anchorY: above ? rect.top : rect.bottom,
		anchorX: rect.left + rect.width / 2,
	};
}

function PreviewCardMeta({ preview, isMailto }: { preview: LinkPreview; isMailto: boolean }) {
	const [faviconFailed, setFaviconFailed] = useState(false);
	const showFavicon = !!preview.favicon && !faviconFailed;
	if (!preview.name && !showFavicon && !isMailto) return null;
	return (
		<div className="mb-1 flex items-center gap-1.5">
			{isMailto ? (
				<span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center text-[var(--text-muted)]">
					<HugeiconsIcon icon={Mail01Icon} size={13} />
				</span>
			) : (
				showFavicon && (
					<img
						src={preview.favicon}
						alt=""
						className="h-3.5 w-3.5 shrink-0 rounded-[3px] object-contain"
						onError={() => setFaviconFailed(true)}
					/>
				)
			)}
			{preview.name && (
				<span className="truncate font-medium text-[11px] text-[var(--text-secondary)] tracking-[-0.01em] transition-colors duration-150 group-hover:text-[var(--text-primary)]">
					{preview.name}
				</span>
			)}
		</div>
	);
}

function PreviewCardHost({
	displayHost,
	previewTitle,
	isMailto,
}: {
	displayHost: string;
	previewTitle?: string;
	isMailto: boolean;
}) {
	if (isMailto || displayHost === previewTitle) return null;
	return (
		<div className="mt-2 truncate text-[10px] text-[var(--text-ghost)] tracking-[0.01em] transition-colors duration-150 group-hover:text-[var(--text-muted)]">
			{displayHost}
		</div>
	);
}

function PreviewCardImage({ preview }: { preview: LinkPreview }) {
	const [loaded, setLoaded] = useState(false);
	const [failed, setFailed] = useState(false);
	if (!preview.image || failed) return null;
	return (
		<div className="relative mb-2 aspect-[16/9] overflow-hidden rounded-lg bg-[var(--muted-bg)]">
			{!loaded && (
				<div
					aria-hidden="true"
					className="absolute inset-0 animate-[shimmer_1.4s_ease-in-out_infinite] bg-[length:220%_100%] bg-[linear-gradient(110deg,var(--shimmer-base)_8%,var(--shimmer-sweep)_18%,var(--shimmer-base)_33%)]"
				/>
			)}
			<img
				src={preview.image}
				alt={preview.title ?? preview.name ?? ''}
				className={`relative block h-full w-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
				loading="lazy"
				onLoad={() => setLoaded(true)}
				onError={() => setFailed(true)}
			/>
		</div>
	);
}

export function PreviewCard({
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
	const { above, anchorY, anchorX } = getAnchorPosition(rect);
	const isMailto = isMailtoHref(href);
	const displayHost = getDisplayHost(href);

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
				transform: `translateX(-50%) translateY(${above ? 'calc(-100% - 8px)' : '8px'}) scale(${visible ? 1 : 0.97})`,
				opacity: visible ? 1 : 0,
				pointerEvents: visible ? 'auto' : 'none',
				transition: 'opacity 0.15s ease-out, transform 0.2s cubic-bezier(0.19,1,0.22,1)',
				transformOrigin: above ? 'bottom center' : 'top center',
			}}
		>
			<a
				href={href}
				target={isExternal ? '_blank' : undefined}
				rel={isExternal ? 'noopener noreferrer' : undefined}
				aria-label={preview.title ?? preview.name ?? displayHost}
				className="group block w-[280px] cursor-pointer overflow-hidden rounded-xl border border-[var(--border)] bg-popover p-2.5 text-inherit no-underline shadow-[0_8px_32px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.05)]"
			>
				<PreviewCardImage preview={preview} />
				<PreviewCardMeta preview={preview} isMailto={isMailto} />

				{preview.title && (
					<div className="mb-0.5 line-clamp-2 overflow-hidden font-semibold text-[12px] text-[var(--text-primary)] leading-[1.35] tracking-[-0.01em]">
						{preview.title}
					</div>
				)}

				{preview.description && (
					<p className="m-0 line-clamp-3 text-[11px] text-[var(--text-muted)] leading-[1.5]">
						{preview.description}
					</p>
				)}

				<PreviewCardHost
					displayHost={displayHost}
					previewTitle={preview.title}
					isMailto={isMailto}
				/>
			</a>
		</div>
	);
}

function MailtoStatusIcon({ copied, hovered }: { copied: boolean; hovered: boolean }) {
	return (
		<span
			className="relative ml-1 inline-block align-middle leading-none"
			// biome-ignore lint/nursery/noInlineStyles: dynamic opacity driven by hovered/copied state
			style={{
				width: 14,
				height: 14,
				opacity: copied ? 1 : hovered ? 0.7 : 0.3,
				transition: 'opacity 0.2s ease',
			}}
		>
			<span
				className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)]"
				// biome-ignore lint/nursery/noInlineStyles: blur/scale cross-fade on copy→tick transition
				style={{
					opacity: copied ? 0 : 1,
					filter: copied ? 'blur(4px)' : 'blur(0px)',
					transform: copied ? 'scale(0.65)' : 'scale(1)',
					transition:
						'opacity 0.22s ease, filter 0.22s ease, transform 0.28s cubic-bezier(0.19,1,0.22,1)',
				}}
			>
				<HugeiconsIcon icon={Copy01Icon} size={14} />
			</span>
			<span
				className="absolute inset-0 flex items-center justify-center text-[#00bbff]"
				// biome-ignore lint/nursery/noInlineStyles: blur/scale cross-fade on copy→tick transition
				style={{
					opacity: copied ? 1 : 0,
					filter: copied ? 'blur(0px)' : 'blur(4px)',
					transform: copied ? 'scale(1)' : 'scale(0.65)',
					transition:
						'opacity 0.22s ease, filter 0.22s ease, transform 0.28s cubic-bezier(0.19,1,0.22,1)',
				}}
			>
				<HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
			</span>
		</span>
	);
}

function DefaultLinkContent({
	logo,
	name,
	rounded,
	logoClassName,
	hoverTextClass,
	isMailto,
	copied,
	hovered,
}: {
	logo?: string;
	name: string;
	rounded: boolean;
	logoClassName?: string;
	hoverTextClass?: string;
	isMailto: boolean;
	copied: boolean;
	hovered: boolean;
}) {
	return (
		<>
			{logo && (
				<img
					src={logo}
					alt={name}
					className={`mb-px ml-1 inline h-[1.1em] w-auto align-middle ${rounded ? 'rounded-full' : ''}${logoClassName ? ` ${logoClassName}` : ''}`}
				/>
			)}
			{logo && ' '}
			<span
				className={`font-medium! underline decoration-dotted underline-offset-4 transition group-hover:text-foreground ${hoverTextClass ?? ''} decoration-muted-foreground/30`}
			>
				{name}
			</span>
			{isMailto && <MailtoStatusIcon copied={copied} hovered={hovered} />}
		</>
	);
}

function usePreviewHover() {
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

	return { anchorRef, hovered, rect, show, hideFromAnchor, hideFromCard };
}

function useMailtoCopy(href: string, isMailto: boolean) {
	const [copied, setCopied] = useState(false);

	const handleClick = useCallback(
		(e: React.MouseEvent) => {
			if (!isMailto) return;
			e.preventDefault();
			navigator.clipboard.writeText(href.replace('mailto:', ''));
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		},
		[href, isMailto]
	);

	return { copied, handleClick };
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
	const isExternal = external ?? !isMailtoHref(href);
	const isMailto = isMailtoHref(href);
	const { anchorRef, hovered, rect, show, hideFromAnchor, hideFromCard } = usePreviewHover();
	const { copied, handleClick } = useMailtoCopy(href, isMailto);

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
				onClick={isMailto ? handleClick : undefined}
				className={anchorClassName ?? 'group inline'}
			>
				{children ?? (
					<DefaultLinkContent
						logo={logo}
						name={name}
						rounded={rounded}
						logoClassName={logoClassName}
						hoverTextClass={hoverTextClass}
						isMailto={isMailto}
						copied={copied}
						hovered={hovered}
					/>
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
