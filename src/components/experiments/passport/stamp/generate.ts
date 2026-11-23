import type { Country, InkKey, MotifKey } from '../types';
import { hash, mulberry32 } from './random';

export type StampShape = 'rect' | 'chamfer' | 'oval' | 'round';
export type StampLayout = 'split' | 'band' | 'corner' | 'stack' | 'arc';
export type TextFont = 'display' | 'serif' | 'mono' | 'typewriter' | 'sans';
export type StatusStyle = 'plain' | 'solid' | 'outline';
export type DateStyle = 'cells' | 'band' | 'line' | 'stack';
export type OrnamentKind = 'rosette' | 'wave' | 'starburst' | 'hatch' | 'bars' | 'crest';

export interface TextBlock {
	x: number;
	y: number;
	size: number;
	maxWidth: number;
	anchor: 'start' | 'middle' | 'end';
	font: TextFont;
}

export interface Box {
	x: number;
	y: number;
	w: number;
	h: number;
}

export interface Ornament {
	kind: OrnamentKind;
	path?: string;
	x: number;
	y: number;
	r: number;
	opacity: number;
	strokeWidth: number;
	motif?: MotifKey;
}

export interface ArcBlock {
	path: string;
	width: number;
	size: number;
	font: TextFont;
}

export interface StampDesign {
	code: string;
	width: number;
	height: number;
	aspect: number;
	baseWidth: number;
	shape: StampShape;
	layout: StampLayout;
	ink: InkKey;
	outline: string;
	innerOutline: string;
	borderWidth: number;
	innerBorderWidth: number;
	innerOpacity: number;
	country: TextBlock;
	status: TextBlock;
	statusStyle: StatusStyle;
	statusBox?: Box;
	date: TextBlock;
	dateStyle: DateStyle;
	dateBox?: Box;
	dateSub?: TextBlock;
	port: TextBlock;
	serial: TextBlock;
	micro?: TextBlock;
	microText?: string;
	arcTop?: ArcBlock;
	arcBottom?: ArcBlock;
	crest: Ornament;
	ornament?: Ornament;
	cornerTicks?: string[];
	signature: string;
}

const INK_KEYS: InkKey[] = [
	'ultramarine',
	'ultramarine',
	'ink',
	'ink',
	'oxblood',
	'violet',
	'umber',
];

const DISPLAY_FONTS: TextFont[] = ['display', 'display', 'display', 'serif'];
const DATE_FONTS: TextFont[] = ['mono', 'mono', 'mono', 'typewriter', 'display'];
const PORT_FONTS: TextFont[] = ['mono', 'mono', 'sans'];
const SERIAL_FONTS: TextFont[] = ['mono', 'mono', 'sans'];

interface ShapeConfig {
	radius: number;
	cut: number;
}

function chance(rnd: () => number, probability: number): boolean {
	return rnd() < probability;
}

function pick<T>(rnd: () => number, items: readonly T[]): T {
	return items[Math.floor(rnd() * items.length)];
}

function round(value: number, digits = 2): number {
	const factor = 10 ** digits;
	return Math.round(value * factor) / factor;
}

function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

function block(
	x: number,
	y: number,
	size: number,
	maxWidth: number,
	anchor: TextBlock['anchor'],
	font: TextFont
): TextBlock {
	return {
		x: round(x),
		y: round(y),
		size: round(size),
		maxWidth: round(Math.max(8, maxWidth)),
		anchor,
		font,
	};
}

function roundedRectPath(w: number, h: number, inset: number, radius: number): string {
	const x = inset;
	const y = inset;
	const ww = w - inset * 2;
	const hh = h - inset * 2;
	const r = Math.min(radius, ww / 2, hh / 2);
	return `M ${x + r} ${y} H ${x + ww - r} A ${r} ${r} 0 0 1 ${x + ww} ${y + r} V ${y + hh - r} A ${r} ${r} 0 0 1 ${x + ww - r} ${y + hh} H ${x + r} A ${r} ${r} 0 0 1 ${x} ${y + hh - r} V ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`;
}

function chamferPath(w: number, h: number, inset: number, cut: number): string {
	const x = inset;
	const y = inset;
	const ww = w - inset * 2;
	const hh = h - inset * 2;
	const c = Math.min(cut, ww / 4, hh / 4);
	return `M ${x + c} ${y} H ${x + ww - c} L ${x + ww} ${y + c} V ${y + hh - c} L ${x + ww - c} ${y + hh} H ${x + c} L ${x} ${y + hh - c} V ${y + c} Z`;
}

function ellipsePath(cx: number, cy: number, rx: number, ry: number): string {
	return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
}

function outlinePath(
	shape: StampShape,
	w: number,
	h: number,
	inset: number,
	config: ShapeConfig
): string {
	if (shape === 'round') {
		const r = Math.min(w, h) / 2 - inset;
		return ellipsePath(w / 2, h / 2, r, r);
	}
	if (shape === 'oval') {
		return ellipsePath(w / 2, h / 2, w / 2 - inset, h / 2 - inset);
	}
	if (shape === 'chamfer') return chamferPath(w, h, inset, config.cut);
	return roundedRectPath(w, h, inset, config.radius);
}

function rosettePath(cx: number, cy: number, radius: number, seed: number): string {
	const rnd = mulberry32(seed);
	const rings = 9 + Math.floor(rnd() * 5);
	const petals = 19 + Math.floor(rnd() * 12);
	const phase = rnd() * Math.PI * 2;
	let d = '';
	for (let i = 0; i < rings; i++) {
		const t = i / (rings - 1);
		const base = radius * (0.22 + 0.78 * t);
		const amp = radius * (0.012 + rnd() * 0.018);
		const steps = 54;
		for (let s = 0; s <= steps; s++) {
			const angle = (s / steps) * Math.PI * 2;
			const r = base + amp * Math.sin(petals * angle + phase + i * 0.31);
			const x = cx + Math.cos(angle) * r;
			const y = cy + Math.sin(angle) * r * 0.92;
			d += `${s === 0 ? 'M' : 'L'}${round(x, 1)} ${round(y, 1)}`;
		}
		d += 'Z';
	}
	return d;
}

function wavePath(
	x: number,
	y: number,
	width: number,
	rows: number,
	amp: number,
	wavelength: number,
	phase: number
): string {
	let d = '';
	for (let row = 0; row < rows; row++) {
		for (let px = 0; px <= width; px += 4) {
			const py =
				y + row * (amp * 2.3) + Math.sin((px / wavelength) * Math.PI * 2 + phase + row * 0.7) * amp;
			d += `${px === 0 ? 'M' : 'L'}${round(x + px, 1)} ${round(py, 1)}`;
		}
	}
	return d;
}

function starburstPath(
	cx: number,
	cy: number,
	radius: number,
	count: number,
	inner: number
): string {
	let d = '';
	for (let i = 0; i < count; i++) {
		const angle = (i / count) * Math.PI * 2;
		const x1 = cx + Math.cos(angle) * inner;
		const y1 = cy + Math.sin(angle) * inner;
		const x2 = cx + Math.cos(angle) * radius;
		const y2 = cy + Math.sin(angle) * radius;
		d += `M${round(x1, 1)} ${round(y1, 1)}L${round(x2, 1)} ${round(y2, 1)}`;
	}
	return d;
}

function hatchPath(x: number, y: number, width: number, height: number, gap: number): string {
	let d = '';
	for (let offset = 0; offset <= width + height; offset += gap) {
		const x1 = x + Math.max(0, offset - height);
		const y1 = y + Math.max(0, height - offset);
		const x2 = x + Math.min(width, offset);
		const y2 = y + Math.min(height, offset);
		if (x1 === x2 && y1 === y2) continue;
		d += `M${round(x1, 1)} ${round(y1, 1)}L${round(x2, 1)} ${round(y2, 1)}`;
	}
	return d;
}

function barsPath(
	x: number,
	y: number,
	width: number,
	height: number,
	count: number,
	seed: number
): string {
	const rnd = mulberry32(seed);
	let d = '';
	let cursor = x;
	for (let i = 0; i < count; i++) {
		const bar = 0.8 + rnd() * 2.2;
		if (cursor + bar > x + width) break;
		d += `M${round(cursor, 1)} ${round(y, 1)}h${round(bar, 1)}v${round(height, 1)}h-${round(bar, 1)}Z`;
		cursor += bar + 1.2 + rnd() * 1.8;
	}
	return d;
}

function shapeConfig(rnd: () => number): ShapeConfig {
	return {
		radius: 3 + rnd() * 12,
		cut: 5 + rnd() * 9,
	};
}

function chooseShape(rnd: () => number): StampShape {
	const roll = rnd();
	if (roll < 0.4) return 'rect';
	if (roll < 0.62) return 'chamfer';
	if (roll < 0.84) return 'oval';
	return 'round';
}

function chooseLayout(shape: StampShape, rnd: () => number): StampLayout {
	if (shape === 'oval' || shape === 'round') return 'arc';
	const roll = rnd();
	if (roll < 0.35) return 'split';
	if (roll < 0.6) return 'band';
	if (roll < 0.82) return 'corner';
	return 'stack';
}

function chooseStatusStyle(layout: StampLayout, rnd: () => number): StatusStyle {
	if (layout === 'band') return chance(rnd, 0.82) ? 'plain' : 'outline';
	if (layout === 'stack') return pick(rnd, ['solid', 'plain', 'outline'] as const);
	return pick(rnd, ['solid', 'solid', 'plain', 'outline'] as const);
}

function chooseDateStyle(layout: StampLayout, rnd: () => number): DateStyle {
	if (layout === 'band') return 'band';
	if (layout === 'arc') return pick(rnd, ['line', 'line', 'stack'] as const);
	if (layout === 'split') return chance(rnd, 0.72) ? 'cells' : 'line';
	if (layout === 'corner') return pick(rnd, ['cells', 'cells', 'line', 'stack'] as const);
	return pick(rnd, ['line', 'stack', 'cells'] as const);
}

function portCode(capital: string): string {
	const letters = capital
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^A-Za-z]/g, '')
		.toUpperCase();
	return letters.slice(0, 3) || 'EVW';
}

interface LayoutBits {
	country: TextBlock;
	status: TextBlock;
	statusStyle: StatusStyle;
	statusBox?: Box;
	date: TextBlock;
	dateStyle: DateStyle;
	dateBox?: Box;
	dateSub?: TextBlock;
	port: TextBlock;
	serial: TextBlock;
	micro?: TextBlock;
	arcTop?: ArcBlock;
	arcBottom?: ArcBlock;
	crest: Ornament;
	ornament?: Ornament;
}

function crestAt(country: Country, x: number, y: number, r: number, opacity: number): Ornament {
	return {
		kind: 'crest',
		x: round(x),
		y: round(y),
		r: round(r),
		opacity: round(opacity),
		strokeWidth: 0.5,
		motif: country.motif,
	};
}

function geometricOrnament(
	left: number,
	top: number,
	cw: number,
	ch: number,
	rnd: () => number,
	seed: number
): Ornament | undefined {
	if (!chance(rnd, 0.72)) return undefined;
	const kind = pick(rnd, ['rosette', 'wave', 'starburst', 'hatch', 'bars'] as const);
	const opacity = 0.07 + rnd() * 0.08;
	if (kind === 'rosette') {
		const cx = left + cw * (0.34 + rnd() * 0.32);
		const cy = top + ch * (0.36 + rnd() * 0.32);
		const r = Math.min(cw, ch) * (0.24 + rnd() * 0.14);
		return {
			kind,
			x: round(cx),
			y: round(cy),
			r: round(r),
			opacity: round(opacity),
			strokeWidth: 0.26,
			path: rosettePath(cx, cy, r, seed + 11),
		};
	}
	if (kind === 'wave') {
		const y = top + ch * (0.58 + rnd() * 0.2);
		const width = cw * (0.5 + rnd() * 0.5);
		const x = left + rnd() * (cw - width);
		const rows = 3 + Math.floor(rnd() * 3);
		return {
			kind,
			x: round(x),
			y: round(y),
			r: round(width),
			opacity: round(opacity),
			strokeWidth: 0.28,
			path: wavePath(x, y, width, rows, 1.2 + rnd() * 2.2, 18 + rnd() * 16, rnd() * 6),
		};
	}
	if (kind === 'starburst') {
		const cx = left + cw * (0.32 + rnd() * 0.36);
		const cy = top + ch * (0.32 + rnd() * 0.36);
		const r = Math.min(cw, ch) * (0.22 + rnd() * 0.14);
		return {
			kind,
			x: round(cx),
			y: round(cy),
			r: round(r),
			opacity: round(opacity + 0.02),
			strokeWidth: 0.28,
			path: starburstPath(cx, cy, r, 12 + Math.floor(rnd() * 9), r * 0.18),
		};
	}
	if (kind === 'hatch') {
		const width = 24 + rnd() * 18;
		const height = 18 + rnd() * 14;
		const x = chance(rnd, 0.5) ? left + 4 : left + cw - width - 4;
		const y = top + ch - height - 4;
		return {
			kind,
			x: round(x),
			y: round(y),
			r: round(width),
			opacity: round(opacity + 0.03),
			strokeWidth: 0.35,
			path: hatchPath(x, y, width, height, 4 + rnd() * 2),
		};
	}
	const width = 24 + rnd() * 16;
	const height = 8 + rnd() * 5;
	const x = left + cw - width - 4;
	const y = top + ch - height - 4;
	return {
		kind,
		x: round(x),
		y: round(y),
		r: round(width),
		opacity: round(opacity + 0.06),
		strokeWidth: 0.4,
		path: barsPath(x, y, width, height, 5 + Math.floor(rnd() * 5), seed + 29),
	};
}

function rectLayout(
	country: Country,
	layout: Exclude<StampLayout, 'arc'>,
	width: number,
	height: number,
	inset: number,
	rnd: () => number,
	seed: number,
	displayFont: TextFont,
	dateFont: TextFont,
	portFont: TextFont,
	serialFont: TextFont
): LayoutBits {
	const left = inset + 8;
	const right = width - inset - 8;
	const top = inset + 8;
	const bottom = height - inset - 8;
	const cw = right - left;
	const ch = bottom - top;
	const cx = width / 2;
	const crestR = 7 + rnd() * 4;

	if (layout === 'band') {
		const countrySize = 18 + rnd() * 5;
		const statusSize = 14 + rnd() * 4;
		const bandY = top + 30;
		const bandH = 25 + rnd() * 8;
		return {
			country: block(left, top + 17, countrySize, cw * 0.55, 'start', displayFont),
			status: block(right - crestR * 2 - 4, top + 17, statusSize, cw * 0.32, 'end', displayFont),
			statusStyle: 'plain',
			date: block(cx, bandY + bandH * 0.7, 11 + rnd() * 2, cw - 10, 'middle', dateFont),
			dateStyle: 'band',
			dateBox: { x: left, y: bandY, w: cw, h: bandH },
			port: block(left, bottom - 10, 8 + rnd() * 1.5, cw * 0.5, 'start', portFont),
			serial: block(right, bottom - 10, 4 + rnd() * 0.8, cw * 0.2, 'end', serialFont),
			micro:
				chance(rnd, 0.5) && ch > 100
					? block(cx, bottom - 1, 3.1, cw * 0.66, 'middle', 'mono')
					: undefined,
			crest: crestAt(country, right - crestR - 1, top + crestR + 1, crestR, 0.3 + rnd() * 0.12),
			ornament: geometricOrnament(left, top, cw, ch, rnd, seed),
		};
	}

	if (layout === 'corner') {
		const countrySize = 20 + rnd() * 5;
		const statusSize = 24 + rnd() * 5;
		const statusY = bottom - 31;
		const statusBox = { x: left, y: statusY, w: cw * 0.34, h: 29 };
		const statusStyle = chance(rnd, 0.5) ? 'solid' : 'plain';
		const dateStyle = chooseDateStyle(layout, rnd);
		const dateBox =
			dateStyle === 'cells' ? { x: right - 88, y: top + 30, w: 88, h: 33 } : undefined;
		return {
			country: block(left, top + 17, countrySize, cw * 0.56, 'start', displayFont),
			status:
				statusStyle === 'solid'
					? block(
							statusBox.x + statusBox.w / 2,
							statusBox.y + 21,
							statusSize,
							statusBox.w - 10,
							'middle',
							displayFont
						)
					: block(left, bottom - 11, statusSize, cw * 0.52, 'start', displayFont),
			statusStyle,
			statusBox: statusStyle === 'solid' ? statusBox : undefined,
			date:
				dateStyle === 'line' || dateStyle === 'stack'
					? block(right - 44, top + 55, 10 + rnd() * 2, cw * 0.4, 'middle', dateFont)
					: block(
							(dateBox?.x ?? right) + 8,
							(dateBox?.y ?? top) + 30,
							8,
							(dateBox?.w ?? 80) - 16,
							'start',
							dateFont
						),
			dateStyle,
			dateBox,
			dateSub:
				dateStyle === 'stack'
					? block(right - 44, top + 66, 6.5 + rnd() * 1.2, cw * 0.4, 'middle', dateFont)
					: undefined,
			port: block(right, bottom - 12, 8 + rnd() * 1.5, cw * 0.35, 'end', portFont),
			serial: block(right, bottom - 4, 3.5 + rnd() * 0.6, cw * 0.24, 'end', serialFont),
			micro:
				chance(rnd, 0.45) && ch > 100
					? block(cx, bottom - 1, 3.1, cw * 0.62, 'middle', 'mono')
					: undefined,
			crest: crestAt(country, right - crestR - 1, top + crestR + 1, crestR, 0.3 + rnd() * 0.12),
			ornament: geometricOrnament(left, top, cw, ch, rnd, seed),
		};
	}

	if (layout === 'stack') {
		const countrySize = 20 + rnd() * 5;
		const statusSize = 22 + rnd() * 5;
		const statusStyle = chance(rnd, 0.45) ? 'solid' : 'plain';
		const statusBox = { x: cx - cw * 0.2, y: top + 31, w: cw * 0.4, h: 28 };
		const dateStyle = chooseDateStyle(layout, rnd);
		const dateBox = dateStyle === 'cells' ? { x: cx - 44, y: top + 64, w: 88, h: 30 } : undefined;
		return {
			country: block(cx, top + 19, countrySize, cw * 0.76, 'middle', displayFont),
			status:
				statusStyle === 'solid'
					? block(cx, statusBox.y + 20, statusSize, statusBox.w - 12, 'middle', displayFont)
					: block(cx, top + 47, statusSize, cw * 0.62, 'middle', displayFont),
			statusStyle,
			statusBox: statusStyle === 'solid' ? statusBox : undefined,
			date:
				dateStyle === 'stack'
					? block(cx, top + 72, 18 + rnd() * 4, cw * 0.6, 'middle', displayFont)
					: block(cx, top + 79, 11 + rnd() * 2, cw * 0.7, 'middle', dateFont),
			dateStyle,
			dateBox,
			dateSub:
				dateStyle === 'stack'
					? block(cx, top + 85, 6.4 + rnd() * 1.2, cw * 0.6, 'middle', dateFont)
					: undefined,
			port: block(cx, bottom - 12, 8 + rnd() * 1.5, cw * 0.6, 'middle', portFont),
			serial: block(right, bottom - 4, 3.5 + rnd() * 0.7, cw * 0.2, 'end', serialFont),
			micro:
				chance(rnd, 0.45) && ch > 105
					? block(cx, bottom - 1, 3.1, cw * 0.62, 'middle', 'mono')
					: undefined,
			crest: crestAt(country, left + crestR + 1, top + crestR + 1, crestR, 0.3 + rnd() * 0.12),
			ornament: geometricOrnament(left, top, cw, ch, rnd, seed),
		};
	}

	const countrySize = 20 + rnd() * 5;
	const statusSize = 24 + rnd() * 5;
	const statusStyle = chooseStatusStyle(layout, rnd);
	const dateStyle = chooseDateStyle(layout, rnd);
	const statusBox = { x: left, y: top + 35, w: cw * 0.34, h: 30 };
	const boxedStatus = statusStyle !== 'plain';
	const dateBox = dateStyle === 'cells' ? { x: right - 88, y: top + 31, w: 88, h: 34 } : undefined;
	return {
		country: block(left, top + 17, countrySize, cw * 0.58, 'start', displayFont),
		status: boxedStatus
			? block(
					statusBox.x + statusBox.w / 2,
					statusBox.y + 22,
					statusSize,
					statusBox.w - 10,
					'middle',
					displayFont
				)
			: block(left, top + 55, statusSize, cw * 0.44, 'start', displayFont),
		statusStyle,
		statusBox: boxedStatus ? statusBox : undefined,
		date:
			dateStyle === 'line'
				? block(right - 44, top + 56, 10 + rnd() * 2, cw * 0.42, 'middle', dateFont)
				: block(
						(dateBox?.x ?? right) + 8,
						(dateBox?.y ?? top) + 31,
						8,
						(dateBox?.w ?? 80) - 16,
						'start',
						dateFont
					),
		dateStyle,
		dateBox,
		port: block(left, bottom - 10, 8 + rnd() * 1.5, cw * 0.45, 'start', portFont),
		serial: block(right, bottom - 10, 4 + rnd() * 0.8, cw * 0.2, 'end', serialFont),
		micro:
			chance(rnd, 0.55) && ch > 95
				? block(cx, bottom - 1, 3.1, cw * 0.64, 'middle', 'mono')
				: undefined,
		crest: crestAt(country, right - crestR - 1, top + crestR + 1, crestR, 0.3 + rnd() * 0.12),
		ornament: geometricOrnament(left, top, cw, ch, rnd, seed),
	};
}

function arcLayout(
	country: Country,
	width: number,
	height: number,
	inset: number,
	rnd: () => number,
	seed: number,
	displayFont: TextFont,
	dateFont: TextFont,
	portFont: TextFont,
	serialFont: TextFont
): LayoutBits {
	const cx = width / 2;
	const cy = height / 2;
	const isRound = Math.abs(width - height) < 2;
	const rx = isRound ? Math.min(width, height) / 2 - inset - 28 : width / 2 - inset - 28;
	const ry = isRound ? rx : height / 2 - inset - 24;
	const arcWidth = Math.PI * ((rx + ry) / 2);
	const countrySize = 15 + rnd() * 4;
	const statusSize = 16 + rnd() * 5;
	const dateStyle = chooseDateStyle('arc', rnd);
	const crestR = 7 + rnd() * 3;
	const dateY = cy + 11;
	const portY = dateStyle === 'stack' ? cy + 29 : cy + 24;
	const serialY = portY + 9;
	return {
		country: block(cx, cy, countrySize, arcWidth * 0.82, 'middle', displayFont),
		status: block(cx, cy - 4, statusSize, rx * 1.32, 'middle', displayFont),
		statusStyle: 'plain',
		date:
			dateStyle === 'stack'
				? block(cx, dateY, 18 + rnd() * 3, rx * 0.9, 'middle', displayFont)
				: block(cx, dateY, 9.5 + rnd() * 2.5, rx * 1.4, 'middle', dateFont),
		dateStyle,
		dateSub:
			dateStyle === 'stack'
				? block(cx, dateY + 10, 6 + rnd() * 1.1, rx * 1.1, 'middle', dateFont)
				: undefined,
		port: block(cx, portY, 6.4 + rnd() * 1.6, rx * 1.25, 'middle', portFont),
		serial: block(cx, serialY, 3.6 + rnd() * 0.7, rx * 1.1, 'middle', serialFont),
		arcTop: {
			path: `M ${round(cx - rx)} ${round(cy)} A ${round(rx)} ${round(ry)} 0 0 1 ${round(cx + rx)} ${round(cy)}`,
			width: round(arcWidth * 0.82),
			size: round(countrySize),
			font: displayFont,
		},
		arcBottom: {
			path: `M ${round(cx - rx)} ${round(cy)} A ${round(rx)} ${round(ry)} 0 0 0 ${round(cx + rx)} ${round(cy)}`,
			width: round(arcWidth * 0.78),
			size: 5 + rnd() * 1.2,
			font: chance(rnd, 0.55) ? 'display' : 'mono',
		},
		crest: crestAt(country, cx - rx * 0.56, cy + 1, crestR, 0.28 + rnd() * 0.12),
		ornament: geometricOrnament(cx - rx, cy - ry, rx * 2, ry * 2, rnd, seed),
	};
}

const designCache = new Map<string, StampDesign>();

export function stampDesign(country: Country): StampDesign {
	const cached = designCache.get(country.code);
	if (cached) return cached;

	const seed = hash(`${country.name}|${country.iso3}`, 0x9e3779b9);
	const rnd = mulberry32(seed);
	const shape = chooseShape(rnd);
	const layout = chooseLayout(shape, rnd);
	const config = shapeConfig(rnd);
	const ink = pick(rnd, INK_KEYS);
	const displayFont = pick(rnd, DISPLAY_FONTS);
	const dateFont = pick(rnd, DATE_FONTS);
	const portFont = pick(rnd, PORT_FONTS);
	const serialFont = pick(rnd, SERIAL_FONTS);

	let width: number;
	let height: number;
	let inset: number;
	let baseWidth: number;
	if (shape === 'round') {
		width = 176 + Math.round(rnd() * 16);
		height = width;
		inset = 9 + rnd() * 4;
		baseWidth = 24 + rnd() * 5;
	} else if (shape === 'oval') {
		width = 236 + Math.round(rnd() * 10);
		height = 152 + Math.round(rnd() * 14);
		inset = 10 + rnd() * 4;
		baseWidth = 31 + rnd() * 6;
	} else {
		width = 240;
		height = 142 + Math.round(rnd() * 28);
		inset = 9 + rnd() * 5;
		baseWidth = 36 + rnd() * 8;
	}
	if (layout === 'band' || layout === 'stack') baseWidth += 1.5;
	baseWidth = clamp(baseWidth, 22, 46);

	const outline = outlinePath(shape, width, height, inset, config);
	const innerInset = shape === 'round' || shape === 'oval' ? inset + 4 : inset + 4;
	const innerOutline = outlinePath(shape, width, height, innerInset, {
		...config,
		radius: Math.max(1, config.radius - 1.5),
	});
	const borderWidth = 2.8 + rnd() * 0.8;
	const innerBorderWidth = 0.5 + rnd() * 0.25;
	const innerOpacity = 0.5 + rnd() * 0.18;
	const layoutBits =
		layout === 'arc'
			? arcLayout(
					country,
					width,
					height,
					inset,
					rnd,
					seed,
					displayFont,
					dateFont,
					portFont,
					serialFont
				)
			: rectLayout(
					country,
					layout,
					width,
					height,
					inset,
					rnd,
					seed,
					displayFont,
					dateFont,
					portFont,
					serialFont
				);

	const cornerTicks =
		shape !== 'round' && shape !== 'oval' && chance(rnd, 0.55)
			? (() => {
					const x = inset + 8;
					const y = inset + 8;
					const r = width - inset - 8;
					const b = height - inset - 8;
					const l = 4 + rnd() * 3;
					return [
						`M${round(x)} ${round(y + l)}V${round(y)}H${round(x + l)}`,
						`M${round(r - l)} ${round(y)}H${round(r)}V${round(y + l)}`,
						`M${round(x)} ${round(b - l)}V${round(b)}H${round(x + l)}`,
						`M${round(r - l)} ${round(b)}H${round(r)}V${round(b - l)}`,
					];
				})()
			: undefined;

	const microText = `IMMIGRATION · ${country.iso3} · ${portCode(country.capital)}`;
	const design: StampDesign = {
		code: country.code,
		width,
		height,
		aspect: round(height / width, 4),
		baseWidth: round(baseWidth, 2),
		shape,
		layout,
		ink,
		outline,
		innerOutline,
		borderWidth: round(borderWidth, 2),
		innerBorderWidth: round(innerBorderWidth, 2),
		innerOpacity: round(innerOpacity, 2),
		country: layoutBits.country,
		status: layoutBits.status,
		statusStyle: layoutBits.statusStyle,
		statusBox: layoutBits.statusBox,
		date: layoutBits.date,
		dateStyle: layoutBits.dateStyle,
		dateBox: layoutBits.dateBox,
		dateSub: layoutBits.dateSub,
		port: layoutBits.port,
		serial: layoutBits.serial,
		micro: layoutBits.micro,
		microText,
		arcTop: layoutBits.arcTop,
		arcBottom: layoutBits.arcBottom,
		crest: layoutBits.crest,
		ornament: layoutBits.ornament,
		cornerTicks,
		signature: '',
	};
	design.signature = [
		design.shape,
		design.layout,
		design.ink,
		design.country.font,
		design.status.font,
		design.date.font,
		design.statusStyle,
		design.dateStyle,
		`${design.width}x${design.height}`,
		design.borderWidth.toFixed(1),
		design.innerBorderWidth.toFixed(1),
		design.country.x.toFixed(0),
		design.status.x.toFixed(0),
		design.date.x.toFixed(0),
		design.status.y.toFixed(0),
		design.date.y.toFixed(0),
		design.port.y.toFixed(0),
		design.serial.y.toFixed(0),
		design.crest.r.toFixed(1),
		String(design.ornament?.kind ?? 'none'),
		String(design.cornerTicks?.length ?? 0),
	].join('|');
	designCache.set(country.code, design);
	return design;
}
