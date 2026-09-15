"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";
import { FooterWordmark } from "./footer-wordmark";
import { GrainOverlay } from "./grain-overlay";

export interface FooterGlowProps {
	/** The word rendered as the halftone dot grid. */
	text: string;
	/** Optional image mark composed at the same height, left of the text. */
	logoSrc?: string;
	/** Optional wallpaper image. Falls back to a CSS glow when omitted. */
	backgroundSrc?: string;
	/** Accent color of the fallback CSS glow. */
	glowColor?: string;
	/** Font classes for the wordmark lettering (any family your site uses). */
	fontClassName?: string;
	/** Content rendered over the glow, below the wordmark (e.g. a bottom bar). */
	children?: React.ReactNode;
	className?: string;
}

/**
 * Glowing footer backdrop with an interactive halftone wordmark: a radial
 * glow (or wallpaper image) rising from the bottom edge, film grain to break
 * up banding, and a canvas-drawn dot-grid lockup that swells around the
 * pointer and ripples on click. Drop it at the bottom of your own footer.
 * Designed dark: the glow and blend modes assume a dark page beneath.
 */
export function FooterGlow({
	text,
	logoSrc,
	backgroundSrc,
	glowColor = "#00a3ff",
	fontClassName,
	children,
	className,
}: FooterGlowProps) {
	return (
		<div
			className={cn("relative w-full overflow-hidden bg-black", className)}
			role="presentation"
		>
			{backgroundSrc ? (
				// biome-ignore lint/performance/noImgElement: static wallpaper layer, no layout shift (absolute fill)
				<img
					src={backgroundSrc}
					alt=""
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 z-0 h-full w-full origin-bottom scale-150 select-none object-cover object-bottom"
				/>
			) : (
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 z-0"
					// Two layers: a white-hot core hugging the bottom edge inside
					// a tall ambient wash. The wash must stay strong behind the
					// whole wordmark — its dots are overlay-blended, so they only
					// read bright against a bright backdrop and vanish over black.
					style={{
						background: [
							`radial-gradient(55% 55% at 50% 112%, color-mix(in srgb, ${glowColor} 55%, white) 0%, transparent 70%)`,
							`radial-gradient(95% 150% at 50% 115%, ${glowColor} 0%, color-mix(in srgb, ${glowColor} 85%, transparent) 32%, color-mix(in srgb, ${glowColor} 40%, transparent) 58%, transparent 82%)`,
						].join(", "),
					}}
				/>
			)}

			{/* Fade the top edge into the page above so the backdrop never
			    reads as a hard line against the content above. */}
			<div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-black via-black/50 to-transparent" />

			{/* Film grain breaks up gradient banding in the glow. */}
			<GrainOverlay variant="surface" className="z-20" />

			{/* Content. Deliberately NO z-index on this wrapper: a stacking
			    context here would isolate blending and leave the wordmark's
			    mix-blend-mode with an empty backdrop. */}
			<div className="relative flex flex-col gap-8 px-6 pt-12 pb-8 sm:px-8 lg:px-10">
				{/* Slightly inset so the lockup never touches the edges. */}
				<FooterWordmark
					text={text}
					logoSrc={logoSrc}
					fontClassName={fontClassName}
					className="mx-auto w-[88%] max-w-6xl"
				/>
				{children}
			</div>
		</div>
	);
}
