'use client';

import { useEffect, useRef, useState } from 'react';
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
}

/**
 * Progressive image component using Figma's thumbhash algorithm.
 *
 * Shows a decoded thumbhash placeholder immediately (no network request --
 * just math), then crossfades to the real image when it finishes loading.
 *
 * If no hash is provided it renders a plain <img> with lazy loading.
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
}: ProgressiveImgProps) {
	const [loaded, setLoaded] = useState(false);
	// Once the opacity fade-in finishes we clear the inline transition so
	// Tailwind's group-hover transition classes (scale, filter) take over cleanly.
	const [faded, setFaded] = useState(false);
	const [placeholder, setPlaceholder] = useState<string | null>(null);
	const imgRef = useRef<HTMLImageElement>(null);

	// Decode thumbhash → data URL on mount (pure JS, instant)
	useEffect(() => {
		if (!hash) return;
		try {
			const bytes = Uint8Array.from(atob(hash), (c) => c.charCodeAt(0));
			setPlaceholder(thumbHashToDataURL(bytes));
		} catch {
			// Bad hash - silently fall back to no placeholder
		}
	}, [hash]);

	// Handle images already cached - onLoad won't fire, so skip straight to faded
	useEffect(() => {
		if (imgRef.current?.complete) {
			setLoaded(true);
			setFaded(true);
		}
	}, []);

	// No hash - plain lazy image, no extra DOM
	if (!hash) {
		return (
			<img
				src={src}
				alt={alt}
				loading="lazy"
				decoding="async"
				className={imgClassName}
				// biome-ignore lint/nursery/noInlineStyles: style prop passed from parent for dynamic overrides
				style={imgStyle}
				onClick={onClick}
				onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
				role={onClick ? 'button' : undefined}
				tabIndex={onClick ? 0 : undefined}
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
					className="absolute inset-0 w-full h-full object-cover scale-[1.05] blur-[6px] z-0"
				/>
			)}

			{/* Real image - fades in over the placeholder */}
			<img
				ref={imgRef}
				src={src}
				alt={alt}
				loading="lazy"
				decoding="async"
				className={cn('relative z-[1] w-full h-full object-cover', imgClassName)}
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
