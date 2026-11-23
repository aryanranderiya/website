import type { Country, InkKey } from '../types';

export const INK_HEX: Record<InkKey, string> = {
	ultramarine: '#203a86',
	ink: '#221f1a',
	forest: '#214f3b',
	oxblood: '#76212b',
	violet: '#4a2f63',
	umber: '#6b4727',
	teal: '#185052',
};

export const CONDENSED = "'Bebas Neue', 'Arial Narrow', sans-serif";
export const SERIF = "'Instrument Serif', Georgia, serif";
export const MONO = "'DM Mono', 'SF Mono', ui-monospace, monospace";
export const TYPEWRITER = "'Special Elite', 'Courier New', monospace";

const MONTHS = [
	'JAN',
	'FEB',
	'MAR',
	'APR',
	'MAY',
	'JUN',
	'JUL',
	'AUG',
	'SEP',
	'OCT',
	'NOV',
	'DEC',
] as const;
const CLASSES = ['C', 'D', 'F', 'T', 'P'] as const;

export interface Void {
	x: number;
	y: number;
	rx: number;
	ry: number;
	rotation: number;
}

export interface Specks {
	x: number;
	y: number;
	r: number;
	opacity: number;
	kind: 'dot' | 'ring' | 'dash';
	angle: number;
}

export interface StampSpec {
	seed: number;
	day: string;
	month: string;
	year: string;
	isoDate: string;
	dateLine: string;
	serial: string;
	reference: string;
	classCode: string;
	specks: Specks[];
	voids: Void[];
}

function hash32(text: string, salt: number): number {
	let h = 2166136261 ^ salt;
	for (let i = 0; i < text.length; i++) {
		h ^= text.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}

function mulberry32(a: number): () => number {
	let t = a;
	return () => {
		t = (t + 0x6d2b79f5) | 0;
		let r = Math.imul(t ^ (t >>> 15), 1 | t);
		r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
		return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
	};
}

export function stampSpec(country: Country, seed: number): StampSpec {
	const rnd = mulberry32(hash32(country.code, seed));
	const start = Date.UTC(2019, 0, 1);
	const end = Date.UTC(2026, 10, 20);
	const date = new Date(start + rnd() * (end - start));
	const day = String(date.getUTCDate()).padStart(2, '0');
	const month = MONTHS[date.getUTCMonth()];
	const year = String(date.getUTCFullYear());
	const serial = `${country.serial}/${year.slice(2)}`;
	const reference = `${country.iso3} ${String(100 + Math.floor(rnd() * 900))}`;
	const classCode = CLASSES[Math.floor(rnd() * CLASSES.length)];
	const dateLine =
		country.dateStyle === 'mdy'
			? `${month} ${day} ${year}`
			: country.dateStyle === 'ymd'
				? `${year}.${month}.${day}`
				: `${day} ${month} ${year}`;
	const voids: Void[] = [];
	for (let i = 0; i < 7; i++) {
		const x = i < 2 ? (rnd() < 0.5 ? 24 + rnd() * 8 : 208 + rnd() * 8) : 34 + rnd() * 172;
		const y = i < 2 ? 28 + rnd() * 104 : rnd() < 0.5 ? 16 + rnd() * 10 : 132 + rnd() * 10;
		voids.push({
			x: r3(x),
			y: r3(y),
			rx: r3(0.7 + rnd() * 3),
			ry: r3(0.6 + rnd() * 1.8),
			rotation: r3(rnd() * 180),
		});
	}
	for (let i = 0; i < 22; i++) {
		voids.push({
			x: r3(22 + rnd() * 196),
			y: r3(22 + rnd() * 116),
			rx: r3(0.2 + rnd() * 0.8),
			ry: r3(0.2 + rnd() * 0.5),
			rotation: r3(rnd() * 180),
		});
	}
	const specks: Specks[] = [];
	const count = 11 + Math.floor(rnd() * 10);
	for (let i = 0; i < count; i++) {
		const angle = rnd() * Math.PI * 2;
		const radius = 74 + rnd() * 54;
		const x = 120 + Math.cos(angle) * radius;
		const y = 80 + Math.sin(angle) * radius * 0.62;
		if (x < 4 || x > 236 || y < 4 || y > 156) continue;
		const kindRoll = rnd();
		specks.push({
			x: r3(x),
			y: r3(y),
			r: r3(0.35 + rnd() * 1.15),
			opacity: r3(0.24 + rnd() * 0.42),
			kind: kindRoll > 0.86 ? 'ring' : kindRoll > 0.74 ? 'dash' : 'dot',
			angle: r3(rnd() * Math.PI),
		});
	}
	return {
		seed,
		day,
		month,
		year,
		isoDate: `${year}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${day}`,
		dateLine,
		serial,
		reference,
		classCode,
		specks,
		voids,
	};
}

const r3 = (n: number) => Math.round(n * 1000) / 1000;

export function cleanId(id: string): string {
	return id.replace(/[^a-zA-Z0-9_-]/g, '');
}

export function fitSize(
	text: string,
	size: number,
	maxWidth: number,
	family: string,
	tracking = 1
): number {
	const factor = family === CONDENSED ? 0.46 : family === SERIF ? 0.48 : 0.64;
	const width = text.length * size * factor + Math.max(0, text.length - 1) * tracking;
	return Math.round((width > maxWidth ? Math.max(8, (size * maxWidth) / width) : size) * 100) / 100;
}
