"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------
 * Tuning constants
 * ---------------------------------------------------------------------- */

/** Gap between the mark and the lettering, as a fraction of the row height. */
const GAP_RATIO = 0.22;
const TEXT_RGB = "#e4e4e7";
const COVERAGE_FLOOR = 0.08;
const MIN_DOT_RADIUS = 0.45;

// Pointer-interaction tuning.
/** Extra swell at the pointer, fading to zero over RIPPLE_RADIUS. */
const RIPPLE_LIFT = 0.55;
const RIPPLE_RADIUS = 190;
/** Seconds for the ripple center to catch up to the cursor (exp smoothing). */
const CURSOR_FOLLOW_TAU = 0.06;
/** Seconds for a dot's radius to reach its target swell (exp smoothing). */
const SWELL_TAU = 0.09;
/** Radius delta (css px) under which a dot counts as settled. */
const SETTLE_EPSILON = 0.01;

// Click-ripple tuning.
/** Peak swell of the click wave at its origin. */
const CLICK_AMP = 0.55;
/** Wavefront speed across the wordmark, css px per second. */
const CLICK_SPEED = 900;
/** Seconds for one dot to complete its swell bump as the front passes. */
const CLICK_RISE = 0.32;
/** Fraction of the amplitude lost at the far edge of the canvas. */
const CLICK_EDGE_FALLOFF = 0.45;
/** Opacity of the un-blended white layer at the peak of the click wave. */
const CLICK_GLOW_ALPHA = 0.9;
/** Below this the white layer is invisible: skip the fill entirely. */
const GLOW_EPSILON = 0.02;

/* -------------------------------------------------------------------------
 * Internal types
 * ---------------------------------------------------------------------- */

interface WordRaster {
	pixels: Uint8ClampedArray;
	width: number;
	height: number;
}

interface Dot {
	x: number;
	y: number;
	base: number;
	radius: number;
	/** 0..1 share of the click wave at this dot, drives the white layer. */
	glow: number;
}

/** A click-ripple wavefront expanding from a pointerdown point. */
interface ClickWave {
	x: number;
	y: number;
	/** performance.now() at pointerdown. */
	start: number;
}

/** Per-frame inputs for {@link updateDot}: everything the physics needs. */
interface DotUpdateContext {
	now: number;
	cssW: number;
	ease: number;
	cursorX: number;
	cursorY: number;
	pointerInside: boolean;
	waves: ClickWave[];
}

/* -------------------------------------------------------------------------
 * Halftone raster + physics
 * ---------------------------------------------------------------------- */

function smoothstep(a: number, b: number, x: number): number {
	const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
	return t * t * (3 - 2 * t);
}

/**
 * Ease one dot toward its target radius for this frame and update its glow.
 * Returns true when the dot has settled (no further animation needed).
 */
function updateDot(dot: Dot, ctxIn: DotUpdateContext): boolean {
	const { now, cssW, ease, cursorX, cursorY, pointerInside, waves } = ctxIn;
	const dist = Math.hypot(dot.x - cursorX, dot.y - cursorY);
	// Only dots inside the cursor's falloff circle are affected.
	const ripple = RIPPLE_LIFT * smoothstep(RIPPLE_RADIUS, 0, dist);
	let target = pointerInside ? ripple : 0;

	// Sum every active click wave: each dot swells on a sin bump as the
	// wavefront reaches it, so the ripple physically travels the lockup.
	let click = 0;
	for (const wave of waves) {
		const d = Math.hypot(dot.x - wave.x, dot.y - wave.y);
		const phase = ((now - wave.start) / 1000 - d / CLICK_SPEED) / CLICK_RISE;
		if (phase < 0 || phase > 1) continue;
		const edgeFalloff = 1 - CLICK_EDGE_FALLOFF * smoothstep(0, cssW, d);
		click += CLICK_AMP * edgeFalloff * Math.sin(Math.PI * phase);
	}
	target += click;

	const targetRadius = dot.base * (1 + target);
	dot.radius += (targetRadius - dot.radius) * ease;
	// The white layer tracks the click wave only: hovering swells the dots
	// but must not repaint them.
	dot.glow = Math.min(1, click / CLICK_AMP);
	return Math.abs(targetRadius - dot.radius) <= SETTLE_EPSILON;
}

function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src;
	});
}

/**
 * Compose the lockup: optional logo mark and the word at the SAME height,
 * side by side, sized so the whole row spans cssW, then return pixel data.
 */
function rasterizeLockup(
	family: string,
	word: string,
	logo: HTMLImageElement | null,
	cssW: number,
): WordRaster | null {
	const off = document.createElement("canvas");
	const ctx = off.getContext("2d", { willReadFrequently: true });
	if (!ctx) return null;

	// Measure at 100px to solve the font size where logo + gap + text == cssW
	// with the logo height locked to the glyph height.
	ctx.font = `700 100px ${family}`;
	const m100 = ctx.measureText(word);
	const h100 = m100.actualBoundingBoxAscent + m100.actualBoundingBoxDescent;
	const w100 = m100.width;
	const logoAspect = logo ? logo.naturalWidth / logo.naturalHeight : 0;
	const prefix = logo ? logoAspect + GAP_RATIO : 0;
	const fontPx = (100 * cssW) / (h100 * prefix + w100);

	ctx.font = `700 ${fontPx}px ${family}`;
	const m = ctx.measureText(word);
	const ascent = m.actualBoundingBoxAscent;
	const rowH = ascent + m.actualBoundingBoxDescent;
	const logoW = rowH * logoAspect;

	off.width = Math.ceil(cssW);
	off.height = Math.ceil(rowH);
	ctx.font = `700 ${fontPx}px ${family}`;
	ctx.textBaseline = "alphabetic";
	if (logo) ctx.drawImage(logo, 0, 0, logoW, rowH);
	ctx.fillStyle = TEXT_RGB;
	ctx.fillText(word, logo ? logoW + rowH * GAP_RATIO : 0, ascent);

	return {
		pixels: ctx.getImageData(0, 0, off.width, off.height).data,
		width: off.width,
		height: off.height,
	};
}

interface CellSample {
	coverage: number;
	r: number;
	g: number;
	b: number;
}

/** 3x3 area sample for one grid cell: alpha coverage plus the alpha-weighted
 * average color, so any logo shading carries through into the dots. */
function sampleCell(
	raster: WordRaster,
	col: number,
	row: number,
	cell: number,
): CellSample {
	let aAcc = 0;
	let rAcc = 0;
	let gAcc = 0;
	let bAcc = 0;
	for (let sy = 0; sy < 3; sy++) {
		for (let sx = 0; sx < 3; sx++) {
			const px = Math.min(
				raster.width - 1,
				Math.floor(col * cell + ((sx + 0.5) * cell) / 3),
			);
			const py = Math.min(
				raster.height - 1,
				Math.floor(row * cell + ((sy + 0.5) * cell) / 3),
			);
			const i = (py * raster.width + px) * 4;
			const a = raster.pixels[i + 3];
			aAcc += a;
			rAcc += raster.pixels[i] * a;
			gAcc += raster.pixels[i + 1] * a;
			bAcc += raster.pixels[i + 2] * a;
		}
	}
	const coverage = aAcc / (9 * 255);
	return {
		coverage,
		r: aAcc > 0 ? Math.round(rAcc / aAcc) : 0,
		g: aAcc > 0 ? Math.round(gAcc / aAcc) : 0,
		b: aAcc > 0 ? Math.round(bAcc / aAcc) : 0,
	};
}

/** Area-true halftone: uniform grid, fully opaque dots. Tone is carried by
 * dot size alone; luminance is contrast-stretched then posterized so flat
 * brand shades read as distinctly different dot sizes. */
function buildDots(
	raster: WordRaster,
	cssW: number,
	cssH: number,
	cell: number,
): Dot[] {
	// High fill ratio: with the fine grid the letters need dense ink to read
	// bright through the overlay blend; the sub-cell gap still keeps the dot
	// texture visible (this matches the landing page render).
	const maxR = cell * 0.42;
	const cols = Math.floor(cssW / cell);
	const rows = Math.floor(raster.height / cell);
	const dots: Dot[] = [];

	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			const { coverage, r, g, b } = sampleCell(raster, col, row, cell);
			if (coverage <= COVERAGE_FLOOR) continue;

			const x = (col + 0.5) * cell;
			const y = (row + 0.5) * cell;
			const t = Math.min(1, y / cssH);

			const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
			const stretched = Math.min(1, Math.max(0, (lum - 0.1) / 0.55));
			const toneMul = stretched < 0.38 ? 0.28 : stretched < 0.72 ? 0.62 : 1.0;
			const base =
				maxR *
				Math.sqrt(coverage) *
				toneMul *
				(1 - 0.7 * smoothstep(0.2, 1.05, t));
			if (base < MIN_DOT_RADIUS) continue;

			dots.push({ x, y, base, radius: base, glow: 0 });
		}
	}
	return dots;
}

/** Draw every dot as one batched path. */
function drawDots(ctx: CanvasRenderingContext2D, dots: Dot[]): void {
	ctx.fillStyle = "rgba(255,255,255,0.9)";
	ctx.beginPath();
	for (const dot of dots) {
		ctx.moveTo(dot.x + dot.radius, dot.y);
		ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
	}
	ctx.fill();
}

/** White layer that rides the click wave, on its own un-blended canvas, so
 * the wave reads as plain white as it travels. Dots are bucketed by opacity
 * so the layer draws in a handful of batched paths. */
function drawGlow(ctx: CanvasRenderingContext2D, dots: Dot[]): void {
	const buckets = new Map<number, Dot[]>();
	for (const dot of dots) {
		if (dot.glow < GLOW_EPSILON) continue;
		const step = Math.round(dot.glow * 10);
		const bucket = buckets.get(step);
		if (bucket) bucket.push(dot);
		else buckets.set(step, [dot]);
	}

	for (const [step, bucketDots] of buckets) {
		ctx.fillStyle = `rgba(255,255,255,${(step / 10) * CLICK_GLOW_ALPHA})`;
		ctx.beginPath();
		for (const dot of bucketDots) {
			ctx.moveTo(dot.x + dot.radius, dot.y);
			ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
		}
		ctx.fill();
	}
}

/**
 * Pointer interaction: dots near the cursor swell and trail it, and a
 * pointerdown sends a wavefront rippling across the lockup. The rAF loop
 * runs while the pointer is inside, a wave is alive, or any dot is easing
 * back to rest. Returns a cleanup that detaches listeners and cancels it.
 */
function attachPointerInteraction(
	canvas: HTMLCanvasElement,
	ctx: CanvasRenderingContext2D,
	glowCtx: CanvasRenderingContext2D,
	dots: Dot[],
	cssW: number,
	cssH: number,
): () => void {
	let pointerInside = false;
	let pointerX = 0;
	let pointerY = 0;
	// Smoothed ripple center trailing the raw pointer position.
	let cursorX = 0;
	let cursorY = 0;
	let cursorAdopted = false;
	let lastFrameAt = 0;
	const waves: ClickWave[] = [];
	let raf = 0;

	const toCanvasPoint = (e: PointerEvent): { x: number; y: number } => {
		const rect = canvas.getBoundingClientRect();
		return { x: e.clientX - rect.left, y: e.clientY - rect.top };
	};

	const frame = (now: number): void => {
		const dt = lastFrameAt
			? Math.min((now - lastFrameAt) / 1000, 0.05)
			: 1 / 60;
		lastFrameAt = now;

		// Prune click waves whose front has crossed the whole canvas.
		const waveLifetime = (cssW / CLICK_SPEED + CLICK_RISE + 0.25) * 1000;
		for (let i = waves.length - 1; i >= 0; i--) {
			if (now - waves[i].start > waveLifetime) waves.splice(i, 1);
		}

		if (!cursorAdopted) {
			cursorX = pointerX;
			cursorY = pointerY;
			cursorAdopted = true;
		}
		const follow = 1 - Math.exp(-dt / CURSOR_FOLLOW_TAU);
		cursorX += (pointerX - cursorX) * follow;
		cursorY += (pointerY - cursorY) * follow;

		const ease = 1 - Math.exp(-dt / SWELL_TAU);
		let settled = true;
		for (const dot of dots) {
			if (
				!updateDot(dot, {
					now,
					cssW,
					ease,
					cursorX,
					cursorY,
					pointerInside,
					waves,
				})
			) {
				settled = false;
			}
		}

		ctx.clearRect(0, 0, cssW, cssH);
		drawDots(ctx, dots);
		glowCtx.clearRect(0, 0, cssW, cssH);
		drawGlow(glowCtx, dots);

		const active = waves.length > 0 || pointerInside || !settled;
		raf = active ? requestAnimationFrame(frame) : 0;
		if (!raf) lastFrameAt = 0;
	};

	const start = (): void => {
		if (raf) return;
		raf = requestAnimationFrame(frame);
	};

	const onEnter = (e: PointerEvent): void => {
		const p = toCanvasPoint(e);
		pointerInside = true;
		pointerX = p.x;
		pointerY = p.y;
		start();
	};

	const onMove = (e: PointerEvent): void => {
		const p = toCanvasPoint(e);
		pointerX = p.x;
		pointerY = p.y;
		// A pointermove on the canvas implies the pointer is over it: adopt
		// it unconditionally so a rebuild under a stationary pointer doesn't
		// leave the swell dead until a leave/re-enter cycle.
		pointerInside = true;
		start();
	};

	const onDown = (e: PointerEvent): void => {
		const p = toCanvasPoint(e);
		waves.push({ x: p.x, y: p.y, start: performance.now() });
		start();
	};

	const onLeave = (): void => {
		pointerInside = false;
		// Draw one final frame at rest.
		start();
	};

	canvas.addEventListener("pointerenter", onEnter);
	canvas.addEventListener("pointermove", onMove);
	canvas.addEventListener("pointerdown", onDown);
	canvas.addEventListener("pointerleave", onLeave);
	canvas.addEventListener("pointercancel", onLeave);

	// If the pointer is already over the canvas when the interaction
	// attaches, adopt it; the first pointermove corrects the ripple center.
	if (canvas.matches(":hover")) {
		pointerInside = true;
		pointerX = cssW / 2;
		pointerY = cssH / 2;
		start();
	}

	return () => {
		canvas.removeEventListener("pointerenter", onEnter);
		canvas.removeEventListener("pointermove", onMove);
		canvas.removeEventListener("pointerdown", onDown);
		canvas.removeEventListener("pointerleave", onLeave);
		canvas.removeEventListener("pointercancel", onLeave);
		if (raf) cancelAnimationFrame(raf);
	};
}

function usePrefersReducedMotion(): boolean {
	const [reduced, setReduced] = React.useState(false);
	React.useEffect(() => {
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		setReduced(mq.matches);
		const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, []);
	return reduced;
}

/* -------------------------------------------------------------------------
 * FooterWordmark
 * ---------------------------------------------------------------------- */

export interface FooterWordmarkProps {
	/** The word to render as a halftone dot grid. */
	text: string;
	/** Optional image mark composed at the same height, left of the text. */
	logoSrc?: string;
	/** Reserved aspect ratio that prevents layout shift before first draw. */
	aspectRatio?: string;
	/** Applied to the font probe: controls the family used for the raster. */
	fontClassName?: string;
	className?: string;
}

/**
 * Halftone wordmark: optional logo mark and display lettering composed at
 * equal height, rasterized offscreen and redrawn as a color-sampled dot grid
 * that fades toward the bottom. Dots swell around the pointer and a click
 * ripples across the lockup (static under reduced motion). Decorative and
 * DPR-crisp; designed to blend over a dark, glowing backdrop.
 */
export function FooterWordmark({
	text,
	logoSrc,
	aspectRatio = "23 / 4",
	fontClassName = "font-serif font-bold",
	className,
}: FooterWordmarkProps) {
	const canvasRef = React.useRef<HTMLCanvasElement>(null);
	const glowRef = React.useRef<HTMLCanvasElement>(null);
	const probeRef = React.useRef<HTMLSpanElement>(null);
	const shouldReduceMotion = usePrefersReducedMotion();

	React.useEffect(() => {
		const canvas = canvasRef.current;
		const glowCanvas = glowRef.current;
		const probe = probeRef.current;
		if (!canvas || !glowCanvas || !probe) return;

		let cancelled = false;
		let detachInteraction: (() => void) | null = null;

		const build = async () => {
			detachInteraction?.();
			detachInteraction = null;

			// Hashed/next-font families resolve from a probe element.
			const family = getComputedStyle(probe).fontFamily;
			const [logo] = await Promise.all([
				logoSrc ? loadImage(logoSrc).catch(() => null) : null,
				document.fonts.load(`700 100px ${family}`).catch(() => undefined),
			]);
			if (cancelled) return;

			const cssW = canvas.clientWidth;
			if (!cssW) return;
			const raster = rasterizeLockup(family, text, logo, cssW);
			if (!raster) return;

			const cssH = raster.height;
			// Scale the grid with width so narrow renders keep the same fine
			// halftone texture as the full-width landing page instead of a
			// coarse blocky grid (aim for 20+ dot rows per letter).
			const cell = Math.max(4, Math.min(9, cssW / 150));
			const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
			canvas.width = Math.round(cssW * dpr);
			canvas.height = Math.round(cssH * dpr);
			canvas.style.height = `${cssH}px`;
			glowCanvas.width = canvas.width;
			glowCanvas.height = canvas.height;
			const ctx = canvas.getContext("2d");
			const glowCtx = glowCanvas.getContext("2d");
			if (!ctx || !glowCtx) return;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			glowCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

			const dots = buildDots(raster, cssW, cssH, cell);
			drawDots(ctx, dots);
			glowCtx.clearRect(0, 0, cssW, cssH);
			if (shouldReduceMotion) return;

			detachInteraction = attachPointerInteraction(
				canvas,
				ctx,
				glowCtx,
				dots,
				cssW,
				cssH,
			);
		};

		build();

		let timer: ReturnType<typeof setTimeout>;
		const onResize = () => {
			clearTimeout(timer);
			timer = setTimeout(build, 180);
		};
		window.addEventListener("resize", onResize);
		return () => {
			cancelled = true;
			detachInteraction?.();
			clearTimeout(timer);
			window.removeEventListener("resize", onResize);
		};
	}, [text, logoSrc, shouldReduceMotion]);

	return (
		<div className={className}>
			{/* Invisible probe that resolves the font family for the canvas. */}
			<span
				ref={probeRef}
				aria-hidden="true"
				className={cn("absolute h-0 w-0 overflow-hidden", fontClassName)}
			/>
			{/* Two stacked layers, because a canvas can only carry one blend
			    mode: the base halftone blends with the backdrop, and the click
			    ripple fades in an un-blended white copy of the same dots on
			    top. `relative` with NO z-index keeps both blending against the
			    footer background: a stacking context would isolate them. */}
			<div className="relative" role="presentation">
				<canvas
					ref={canvasRef}
					className="block w-full mix-blend-overlay"
					style={{ aspectRatio }}
				/>
				<canvas
					ref={glowRef}
					className="pointer-events-none absolute inset-0 block h-full w-full"
				/>
			</div>
		</div>
	);
}
