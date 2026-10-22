'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TwitterPreview } from './SocialsGrid';

const HREF = 'https://twitter.com/aryanranderiya';

/** Classic Twitter bird in brand blue — crisp at any size, no asset needed. */
function TwitterBirdLogo() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="#1D9BF0"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			className="mb-px ml-1 inline h-[1.1em] w-[1.1em] align-middle"
		>
			<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.975 13.975 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
		</svg>
	);
}

/**
 * Inline "twitter" hero link that shows the same profile hover card as the
 * SocialsGrid chip at the bottom of the homepage.
 */
export default function HeroTwitterLink() {
	const [hovered, setHovered] = useState(false);
	const [rect, setRect] = useState<DOMRect | null>(null);
	const anchorRef = useRef<HTMLAnchorElement>(null);
	const leaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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

	const above = rect ? rect.top > window.innerHeight * 0.55 : false;

	return (
		<>
			<a
				ref={anchorRef}
				href={HREF}
				target="_blank"
				rel="noopener noreferrer"
				onMouseEnter={show}
				onMouseLeave={hideFromAnchor}
				onFocus={show}
				onBlur={hideFromAnchor}
				className="group inline"
			>
				<TwitterBirdLogo />{' '}
				<span className="font-medium! underline decoration-dotted underline-offset-4 transition group-hover:text-foreground decoration-muted-foreground/30">
					twitter
				</span>
			</a>
			{rect &&
				typeof document !== 'undefined' &&
				createPortal(
					// biome-ignore lint/a11y/noStaticElementInteractions: hover-only tooltip wrapper; the inner anchor handles activation
					<div
						className="fixed z-[300]"
						onMouseEnter={show}
						onMouseLeave={hideFromCard}
						// biome-ignore lint/nursery/noInlineStyles: dynamic position from anchor rect
						style={{
							top: above ? rect.top : rect.bottom,
							left: rect.left + rect.width / 2,
							transform: `translateX(-50%) translateY(${above ? 'calc(-100% - 8px)' : '8px'}) scale(${hovered ? 1 : 0.97})`,
							opacity: hovered ? 1 : 0,
							pointerEvents: hovered ? 'auto' : 'none',
							transition:
								'opacity 0.15s ease-out, transform 0.2s cubic-bezier(0.19,1,0.22,1)',
							transformOrigin: above ? 'bottom center' : 'top center',
						}}
					>
						<TwitterPreview />
					</div>,
					document.body
				)}
		</>
	);
}
