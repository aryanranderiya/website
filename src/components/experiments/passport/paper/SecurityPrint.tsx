'use client';

import { useId } from 'react';
import './paper.css';

const round = (n: number) => Math.round(n * 10) / 10;

interface DiscOptions {
	count: number;
	from: number;
	to: number;
	petals: number;
	amp0: number;
	amp1: number;
	drift: number;
	steps?: number;
	phase?: number;
	wander?: number;
}

function disc(cx: number, cy: number, radius: number, opts: DiscOptions): string {
	const { count, from, to, petals, amp0, amp1, drift, steps = 60, phase = 0, wander = 0 } = opts;
	let d = '';
	for (let i = 0; i < count; i++) {
		const u = i / (count - 1);
		const base = radius * (from + (to - from) * u);
		const amp = amp0 + (amp1 - amp0) * u;
		const ph = drift * i + phase;
		const ox = wander * Math.cos(i * 0.83 + phase);
		const oy = wander * Math.sin(i * 1.07 + phase);
		for (let s = 0; s <= steps; s++) {
			const t = (s / steps) * Math.PI * 2;
			const r =
				base +
				amp * Math.sin(petals * t + ph) +
				amp * 0.45 * Math.sin((petals + 14) * t - ph * 0.7);
			d += `${s === 0 ? 'M' : 'L'}${round(cx + ox + r * Math.cos(t))} ${round(cy + oy + r * Math.sin(t))}`;
		}
		d += 'Z';
	}
	return d;
}

interface BandOptions {
	x: number;
	y: number;
	width: number;
	rows: number;
	gap: number;
	amp: number;
	wavelength: number;
	phaseStep: number;
}

function waveBand({ x, y, width, rows, gap, amp, wavelength, phaseStep }: BandOptions): string {
	let d = '';
	for (let i = 0; i < rows; i++) {
		const swell = 0.6 + 0.4 * Math.sin((Math.PI * i) / (rows - 1));
		for (let px = 0; px <= width; px += 3) {
			const wave = amp * swell * Math.sin((px / wavelength) * Math.PI * 2 + i * phaseStep);
			d += `${px === 0 ? 'M' : 'L'}${round(x + px)} ${round(y + i * gap + wave)}`;
		}
	}
	return d;
}

interface EdgeOptions {
	side: 'top' | 'bottom' | 'left' | 'right';
	x: number;
	y: number;
	width: number;
	height: number;
	rows: number;
	gap: number;
	amp: number;
	wavelength: number;
	phaseStep: number;
}

function edgeBand({
	side,
	x,
	y,
	width,
	height,
	rows,
	gap,
	amp,
	wavelength,
	phaseStep,
}: EdgeOptions): string {
	const horizontal = side === 'top' || side === 'bottom';
	const from = horizontal ? x : y;
	const length = horizontal ? width : height;
	const fixed = horizontal ? y : x;
	const sign = side === 'top' || side === 'left' ? 1 : -1;
	let d = '';
	for (let i = 0; i < rows; i++) {
		for (let p = 0; p <= length; p += 3) {
			const wave = amp * Math.sin((p / wavelength) * Math.PI * 2 + i * phaseStep);
			const line = fixed + sign * (i * gap + wave);
			d += `${p === 0 ? 'M' : 'L'}${round(horizontal ? from + p : line)} ${round(horizontal ? line : from + p)}`;
		}
	}
	return d;
}

function spineBand(x: number, height: number, cols: number, gap: number, amp: number): string {
	let d = '';
	for (let i = 0; i < cols; i++) {
		for (let py = 0; py <= height; py += 5) {
			const wave = amp * Math.sin((py / 54) * Math.PI * 2 + i * 0.8);
			d += `${py === 0 ? 'M' : 'L'}${round(x + i * gap + wave)} ${round(py)}`;
		}
	}
	return d;
}

function laidLines(x: number, y: number, width: number, height: number, gap: number): string {
	let d = '';
	for (let py = y; py <= y + height; py += gap) {
		d += `M${x} ${round(py)}H${x + width}`;
	}
	return d;
}

const FRAME = { x: 36, y: 126, w: 534, h: 618, radius: 2 };
const GLOBE = { cx: 402, cy: 430, r: 168, tilt: -17 };

const ROSE_A =
	disc(104, 300, 112, {
		count: 80,
		from: 0.16,
		to: 1,
		petals: 41,
		amp0: 0.45,
		amp1: 0.75,
		drift: 0.4,
		wander: 0.3,
		steps: 64,
	}) +
	disc(104, 300, 112, {
		count: 9,
		from: 0.03,
		to: 0.14,
		petals: 11,
		amp0: 0.2,
		amp1: 0.35,
		drift: 0.4,
		steps: 40,
	});
const ROSE_B =
	disc(486, 636, 64, {
		count: 64,
		from: 0.16,
		to: 1,
		petals: 33,
		amp0: 0.35,
		amp1: 0.6,
		drift: -0.35,
		wander: 0.2,
		steps: 54,
	}) +
	disc(486, 636, 64, {
		count: 8,
		from: 0.03,
		to: 0.14,
		petals: 9,
		amp0: 0.15,
		amp1: 0.28,
		drift: 0.4,
		steps: 34,
	});

const SEAL = disc(300, 462, 176, {
	count: 72,
	from: 0.14,
	to: 1,
	petals: 43,
	amp0: 0.4,
	amp1: 0.72,
	drift: 0.31,
	wander: 0.24,
	steps: 72,
});

const CORNER = disc(0, 0, 14, {
	count: 14,
	from: 0.2,
	to: 1,
	petals: 11,
	amp0: 0.18,
	amp1: 0.45,
	drift: 0.3,
	steps: 28,
});

const SAFETY_TILE = 6;

const TOP_BAND = waveBand({
	x: 0,
	y: 93,
	width: 600,
	rows: 17,
	gap: 1.4,
	amp: 1,
	wavelength: 24,
	phaseStep: 0.62,
});

const BOTTOM_BAND = waveBand({
	x: 0,
	y: 753,
	width: 600,
	rows: 17,
	gap: 1.4,
	amp: 1,
	wavelength: 24,
	phaseStep: 0.62,
});

const FRAME_TOP = edgeBand({
	side: 'top',
	x: FRAME.x,
	y: FRAME.y,
	width: FRAME.w,
	height: FRAME.h,
	rows: 4,
	gap: 1.15,
	amp: 1,
	wavelength: 18,
	phaseStep: 0.9,
});
const FRAME_BOTTOM = edgeBand({
	side: 'bottom',
	x: FRAME.x,
	y: FRAME.y,
	width: FRAME.w,
	height: FRAME.h,
	rows: 4,
	gap: 1.15,
	amp: 1,
	wavelength: 18,
	phaseStep: 0.9,
});
const FRAME_LEFT = edgeBand({
	side: 'left',
	x: FRAME.x,
	y: FRAME.y,
	width: FRAME.w,
	height: FRAME.h,
	rows: 4,
	gap: 1.15,
	amp: 1,
	wavelength: 18,
	phaseStep: 0.9,
});
const FRAME_RIGHT = edgeBand({
	side: 'right',
	x: FRAME.x,
	y: FRAME.y,
	width: FRAME.w,
	height: FRAME.h,
	rows: 4,
	gap: 1.15,
	amp: 1,
	wavelength: 18,
	phaseStep: 0.9,
});

const LAID = laidLines(0, 20, 600, 800, 4.8);
const SPINE = spineBand(17, 840, 8, 1.25, 1.1);

const MERIDIANS = Array.from({ length: 43 }, (_, i) => {
	const deg = -84 + i * 4;
	return { deg, rx: GLOBE.r * Math.cos((deg * Math.PI) / 180), ry: GLOBE.r };
});

const PARALLELS = Array.from({ length: 38 }, (_, i) => {
	const deg = -74 + i * 4;
	const rad = (deg * Math.PI) / 180;
	const width = GLOBE.r * Math.cos(rad);
	return { deg, cy: GLOBE.r * Math.sin(rad), rx: width, ry: width * 0.22 };
});

const SERIAL_BARS = [
	1.5, 0.6, 1.0, 1.8, 0.6, 1.3, 0.6, 1.7, 0.9, 0.6, 1.4, 0.7, 1.1, 0.6, 1.6, 0.9, 0.6, 1.3, 0.6,
	1.0, 1.7, 0.7, 1.2, 0.6, 1.5, 0.9, 0.6, 1.4, 0.8, 1.1, 0.6, 1.6,
];

function serial(x: number, y: number, height: number): string {
	let d = '';
	let cursor = x;
	for (const width of SERIAL_BARS) {
		d += `M${round(cursor)} ${y}h${width}v${height}h-${width}Z`;
		cursor += width + 1.1;
	}
	d += `M${round(x - 3)} ${y}h0.8v${height}h-0.8Z`;
	d += `M${round(cursor + 2)} ${y}h0.8v${height}h-0.8Z`;
	return d;
}

const SERIAL = serial(452, 722, 12);

const MICRO_FRAME = 'REPUBLIC OF EVERYWHERE · VISA PAGE · '.repeat(72);
const MICRO_GLOBE = 'EVERYWHERE · '.repeat(11);
const MICRO_SEAL = 'REPUBLIC OF EVERYWHERE · MINISTRY OF FOREIGN AFFAIRS · '.repeat(8);

function framePath(inset: number): string {
	const x = FRAME.x + inset;
	const y = FRAME.y + inset;
	const w = FRAME.w - inset * 2;
	const h = FRAME.h - inset * 2;
	const r = FRAME.radius;
	return `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
}

const MICRO_PATH = framePath(10.5);
const GLOBE_LAT = -0.61;
const GLOBE_ARC_RX = GLOBE.r * Math.cos(GLOBE_LAT);
const GLOBE_ARC_RY = GLOBE_ARC_RX * 0.22;
const GLOBE_ARC_Y = GLOBE.r * Math.sin(GLOBE_LAT);
const globeTextPath = `M${round(-GLOBE_ARC_RX)} ${round(GLOBE_ARC_Y)}A${round(GLOBE_ARC_RX)} ${round(GLOBE_ARC_RY)} 0 0 1 ${round(GLOBE_ARC_RX)} ${round(GLOBE_ARC_Y)}`;

export default function SecurityPrint({ className }: { className?: string }) {
	const uid = useId().replace(/:/g, '');
	const ink = { stroke: 'currentColor', fill: 'none' } as const;
	const clip = `url(#${uid}-frame)`;
	const globeClip = `url(#${uid}-globe)`;

	return (
		<svg
			aria-hidden="true"
			className={className ? `passport-security ${className}` : 'passport-security'}
			height="100%"
			preserveAspectRatio="xMidYMid meet"
			shapeRendering="geometricPrecision"
			viewBox="0 0 600 840"
			width="100%"
		>
			<defs>
				<clipPath id={`${uid}-frame`}>
					<rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} rx={FRAME.radius} />
				</clipPath>
				<clipPath id={`${uid}-globe`}>
					<circle cx={GLOBE.cx} cy={GLOBE.cy} r={GLOBE.r} />
				</clipPath>
				<linearGradient id={`${uid}-gutter`} x1="0" x2="1" y1="0" y2="0">
					<stop offset="0" stopColor="#3b3323" stopOpacity="0.26" />
					<stop offset="0.14" stopColor="#3b3323" stopOpacity="0.1" />
					<stop offset="0.4" stopColor="#3b3323" stopOpacity="0.025" />
					<stop offset="1" stopColor="#3b3323" stopOpacity="0" />
				</linearGradient>
				<filter id={`${uid}-grain`} x="0" y="0" width="100%" height="100%">
					<feTurbulence
						baseFrequency="0.9"
						numOctaves="2"
						seed="4"
						stitchTiles="stitch"
						type="fractalNoise"
					/>
					<feColorMatrix type="saturate" values="0" />
					<feComponentTransfer>
						<feFuncA type="linear" slope="0" intercept="1" />
					</feComponentTransfer>
				</filter>
				<pattern
					id={`${uid}-screen`}
					width={SAFETY_TILE}
					height={SAFETY_TILE}
					patternUnits="userSpaceOnUse"
				>
					<path
						d={`M0 0L${SAFETY_TILE} ${SAFETY_TILE}M${SAFETY_TILE} 0L0 ${SAFETY_TILE}`}
						fill="none"
						stroke="currentColor"
						strokeWidth={0.22}
						opacity={0.5}
					/>
				</pattern>
				<path d={MICRO_PATH} id={`${uid}-micro-frame`} />
				<path d={globeTextPath} id={`${uid}-micro-globe`} />
				<path
					d="M 300 462 m -184 0 a 184 184 0 1 1 368 0 a 184 184 0 1 1 -368 0"
					id={`${uid}-micro-seal`}
				/>
			</defs>

			<g opacity={0.08}>
				<path d={LAID} strokeWidth={0.22} {...ink} />
			</g>

			<g clipPath={clip} opacity={0.3}>
				<rect
					x={FRAME.x}
					y={FRAME.y}
					width={FRAME.w}
					height={FRAME.h}
					fill={`url(#${uid}-screen)`}
				/>
			</g>

			<g opacity={0.1}>
				<g clipPath={globeClip}>
					<g transform={`translate(${GLOBE.cx} ${GLOBE.cy}) rotate(${GLOBE.tilt})`}>
						{MERIDIANS.map((m) => (
							<ellipse
								key={m.deg}
								cx={0}
								cy={0}
								rx={round(m.rx)}
								ry={round(m.ry)}
								strokeWidth={0.34}
								{...ink}
							/>
						))}
						{PARALLELS.map((p) => (
							<ellipse
								key={p.deg}
								cx={0}
								cy={round(p.cy)}
								rx={round(p.rx)}
								ry={round(p.ry)}
								strokeWidth={0.34}
								{...ink}
							/>
						))}
						<ellipse
							cx={0}
							cy={0}
							rx={GLOBE.r}
							ry={round(GLOBE.r * 0.22)}
							strokeWidth={0.55}
							{...ink}
						/>
						<ellipse
							cx={0}
							cy={round(GLOBE.r * 0.385)}
							rx={round(GLOBE.r * 0.9)}
							ry={round(GLOBE.r * 0.1)}
							strokeWidth={0.4}
							{...ink}
						/>
						<ellipse
							cx={0}
							cy={round(-GLOBE.r * 0.385)}
							rx={round(GLOBE.r * 0.9)}
							ry={round(GLOBE.r * 0.1)}
							strokeWidth={0.4}
							{...ink}
						/>
					</g>
				</g>
				<circle cx={GLOBE.cx} cy={GLOBE.cy} r={GLOBE.r} strokeWidth={0.32} {...ink} />
				<circle
					cx={GLOBE.cx + 0.8}
					cy={GLOBE.cy + 0.7}
					r={GLOBE.r - 1.2}
					strokeWidth={0.26}
					{...ink}
					opacity={0.3}
				/>
			</g>
			<g transform={`translate(${GLOBE.cx} ${GLOBE.cy}) rotate(${GLOBE.tilt})`}>
				<text className="ps-micro" fontSize={2.9} opacity={0.22}>
					<textPath href={`#${uid}-micro-globe`} startOffset="0">
						{MICRO_GLOBE}
					</textPath>
				</text>
			</g>

			<g opacity={0.32}>
				<path d={ROSE_A} strokeWidth={0.25} {...ink} strokeLinejoin="round" />
			</g>
			<g opacity={0.27}>
				<path d={ROSE_B} strokeWidth={0.25} {...ink} strokeLinejoin="round" />
			</g>

			<g opacity={0.075}>
				<path d={SEAL} strokeWidth={0.24} {...ink} strokeLinejoin="round" />
			</g>
			<g opacity={0.12}>
				<circle cx={300} cy={462} r={184} strokeWidth={0.32} {...ink} />
				<circle cx={300} cy={462} r={178} strokeWidth={0.24} {...ink} opacity={0.6} />
			</g>
			<text className="ps-micro" fontSize={2.85} opacity={0.17}>
				<textPath href={`#${uid}-micro-seal`} startOffset="0">
					{MICRO_SEAL}
				</textPath>
			</text>

			<g opacity={0.38}>
				<path d={TOP_BAND} strokeWidth={0.28} {...ink} />
				<path d={BOTTOM_BAND} strokeWidth={0.28} {...ink} />
				<path
					d={'M0 89.4H600M0 120.6H600M0 749.4H600M0 780.6H600'}
					strokeWidth={0.3}
					{...ink}
					opacity={0.7}
				/>
			</g>

			<g opacity={0.45}>
				<path d={FRAME_TOP} strokeWidth={0.28} {...ink} />
				<path d={FRAME_BOTTOM} strokeWidth={0.28} {...ink} />
				<path d={FRAME_LEFT} strokeWidth={0.28} {...ink} />
				<path d={FRAME_RIGHT} strokeWidth={0.28} {...ink} />
			</g>

			<g opacity={0.55}>
				<rect
					x={FRAME.x}
					y={FRAME.y}
					width={FRAME.w}
					height={FRAME.h}
					rx={FRAME.radius}
					strokeWidth={0.4}
					{...ink}
				/>
				<rect
					x={FRAME.x + 5.6}
					y={FRAME.y + 5.6}
					width={FRAME.w - 11.2}
					height={FRAME.h - 11.2}
					rx={1.5}
					strokeWidth={0.28}
					{...ink}
					opacity={0.55}
				/>
			</g>
			<text className="ps-micro" fontSize={3.05} opacity={0.4}>
				<textPath href={`#${uid}-micro-frame`} startOffset="0">
					{MICRO_FRAME}
				</textPath>
			</text>

			<g opacity={0.4} strokeWidth={0.24} {...ink}>
				{[
					[FRAME.x, FRAME.y],
					[FRAME.x + FRAME.w, FRAME.y],
					[FRAME.x, FRAME.y + FRAME.h],
					[FRAME.x + FRAME.w, FRAME.y + FRAME.h],
				].map(([x, y]) => (
					<g key={`c${x}-${y}`} transform={`translate(${x} ${y})`}>
						<path d={CORNER} />
					</g>
				))}
			</g>

			<g opacity={0.34}>
				<path d={SPINE} strokeWidth={0.28} {...ink} />
				<path d="M27 0V840M29.5 0V840" strokeWidth={0.32} {...ink} opacity={0.85} />
				<path
					d={Array.from({ length: 94 }, (_, i) => `M8.5 ${14 + i * 8.7}h0`).join('')}
					strokeWidth={1.9}
					strokeLinecap="round"
					{...ink}
				/>
				<path d="M9 11H26M9 829H26" strokeWidth={0.4} {...ink} />
				<path d="M0.8 0V840" strokeWidth={1.4} {...ink} opacity={0.5} />
			</g>

			<g opacity={0.34} fill="currentColor" stroke="none">
				<path d={SERIAL} />
			</g>
			<text className="ps-micro" x={556} y={717} textAnchor="end" fontSize={2.7} opacity={0.36}>
				EVW 4E8 2210 77 · V
			</text>

			<g opacity={0.38} strokeWidth={0.3} {...ink}>
				<circle cx={300} cy={782} r={4.6} />
				<path d="M293 782H307M300 775V789" />
				<path d="M300 773.4v1.2M300 789.4v1.2M291.4 782h1.2M307.4 782h1.2" opacity={0.6} />
			</g>

			<rect x="0" y="0" width="52" height="840" fill={`url(#${uid}-gutter)`} />
			<rect x="0" y="0" width="600" height="840" filter={`url(#${uid}-grain)`} opacity={0.045} />
		</svg>
	);
}
