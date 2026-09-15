'use client';

import { useMemo, useState } from 'react';
import { thumbHashToDataURL } from 'thumbhash';
import { cn } from '@/lib/utils';

interface ProgressiveImgProps {
	src: string;
	alt: string;
	hash?: string; // base64-encoded thumbhash - optional, falls back to plain img
	className?: string;
	imgClassName?: string;
	onClick?: () => void;
	style?: React.CSSProperties;
	imgStyle?: React.CSSProperties;
	/** Above-the-fold image: eager load with high fetch priority. Defaults to lazy. */
	eager?: boolean;
}

/** Plain image path (no thumbhash): own component so the main branch stays lean. */
function PlainImg({
	src,
	alt,
	className,
	imgStyle,
	onClick,
	eager = false,
}: {
	src: string;
	alt: string;
	className?: string;
	imgStyle?: React.CSSProperties;
	onClick?: () => void;
	eager?: boolean;
}) {
	return (
		<img
			src={src}
			alt={alt}
			loading={eager ? 'eager' : 'lazy'}
			fetchPriority={eager ? 'high' : 'auto'}
			decoding="async"
			className={className}
			// biome-ignore lint/nursery/noInlineStyles: style prop passed from parent for dynamic overrides
			style={imgStyle}
			onClick={onClick}
			onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
			role={onClick ? 'button' : undefined}
			tabIndex={onClick ? 0 : undefined}
		/>
	);
}

/**
 * Progressive image component using Figma's thumbhash algorithm.
 *
 * Shows a decoded thumbhash placeholder immediately (no network request --
 * just math), then crossfades to the real image when it finishes loading.
 *
 * If no hash is provided it renders a plain <img> (lazy unless `eager`).
 */
export default function ProgressiveImg({
	src,
	alt,
	hash,
	className,
	imgClassName,
	onClick,
	style,
	imgStyle,
	eager = false,
}: ProgressiveImgProps) {
	const [loaded, setLoaded] = useState(false);
	// Once the opacity fade-in finishes we clear the inline transition so
	// Tailwind's group-hover transition classes (scale, filter) take over cleanly.
	const [faded, setFaded] = useState(false);

	// Decode thumbhash → data URL synchronously during render (pure math,
	// instant — no request). useMemo (not useEffect) so the placeholder is
	// present on the very first paint, including SSR HTML — no blank frame.
	const placeholder = useMemo<string | null>(() => {
		if (!hash) return null;
		try {
			const bytes = Uint8Array.from(atob(hash), (c) => c.charCodeAt(0));
			return thumbHashToDataURL(bytes);
		} catch {
			// Bad hash - silently fall back to no placeholder
			return null;
		}
	}, [hash]);

	// No hash - plain image, no extra DOM
	if (!hash) {
		return (
			<PlainImg
				src={src}
				alt={alt}
				className={imgClassName}
				imgStyle={imgStyle}
				onClick={onClick}
				eager={eager}
			/>
		);
	}

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: onClick is passed from parent for gallery interaction
		<div
			className={cn('relative overflow-hidden', className)}
			onClick={onClick}
			onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
			role={onClick ? 'button' : undefined}
			tabIndex={onClick ? 0 : undefined}
			// biome-ignore lint/nursery/noInlineStyles: style prop passed from parent for dynamic overrides
			style={style}
		>
			{/* Thumbhash placeholder - visible until real image loads */}
			{placeholder && !loaded && (
				<img
					src={placeholder}
					alt=""
					aria-hidden
					className="absolute inset-0 z-0 h-full w-full scale-[1.05] object-cover blur-[6px]"
				/>
			)}

			{/* Real image - fades in over the placeholder */}
			<img
				ref={(el) => {
					// A cached image fires `load` before React attaches onLoad —
					// catch it here so it doesn't stay stuck at opacity 0.
					if (el?.complete && el.naturalWidth > 0) {
						setLoaded(true);
						setFaded(true);
					}
				}}
				src={src}
				alt={alt}
				loading={eager ? 'eager' : 'lazy'}
				fetchPriority={eager ? 'high' : 'auto'}
				decoding="async"
				className={cn('relative z-[1] h-full w-full object-cover', imgClassName)}
				onLoad={() => setLoaded(true)}
				onTransitionEnd={() => setFaded(true)}
				// biome-ignore lint/nursery/noInlineStyles: dynamic opacity/transition based on load state plus imgStyle spread
				style={{
					opacity: loaded ? 1 : 0,
					// Only set transition during the fade-in. Once faded, remove it so
					// Tailwind hover transitions (scale, filter, etc.) work normally.
					transition: faded ? undefined : loaded ? 'opacity 0.4s ease' : 'none',
					...imgStyle,
				}}
			/>
		</div>
	);
}
