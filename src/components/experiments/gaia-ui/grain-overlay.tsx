import { cn } from "@/lib/utils";

/**
 * Fractal-noise tile rendered by the browser's own SVG filter, inlined as a
 * data URI so it costs no request and no decode. `stitchTiles` keeps the tile
 * seamless when it repeats, so the grain never shows a grid on large
 * surfaces. A single octave at a high base frequency reads as film grain;
 * `feColorMatrix` desaturates it so the speckle doesn't tint the backdrop.
 */
const GRAIN_TILE =
	"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\")";

/**
 * How the grain is composited:
 *
 * - `photo`: detailed, mostly dark artwork. Overlay blending degrades to
 *   multiply against dark pixels, so composite normally at low opacity.
 * - `surface`: smooth gradients and flat color. Overlay ties the speckle to
 *   the underlying hue, and a much lower opacity is enough.
 */
const VARIANT_CLASSES = {
	photo: "opacity-[0.24]",
	surface: "opacity-[0.06] mix-blend-overlay",
} as const;

export interface GrainOverlayProps {
	/** Compositing mode: `photo` for imagery, `surface` for gradients. */
	variant?: keyof typeof VARIANT_CLASSES;
	/** Match the parent's radius so the grain is clipped to the same shape. */
	className?: string;
}

/**
 * Film-grain layer for images and large gradient surfaces: breaks up
 * banding and gives flat artwork a tactile, printed feel. Absolutely
 * positioned, so the parent must be positioned and should clip
 * (`overflow-hidden` or a matching radius on this element).
 */
export function GrainOverlay({
	variant = "photo",
	className,
}: GrainOverlayProps) {
	return (
		<div
			aria-hidden="true"
			className={cn(
				"pointer-events-none absolute inset-0",
				VARIANT_CLASSES[variant],
				className,
			)}
			style={{ backgroundImage: GRAIN_TILE }}
		/>
	);
}
