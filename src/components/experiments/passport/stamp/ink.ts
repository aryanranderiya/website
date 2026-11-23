import type { Country, InkKey } from '../types';
import { hash, mulberry32 } from './random';

export const INK_HEX: Record<InkKey, string> = {
	ultramarine: '#1f3b73',
	ink: '#25221d',
	oxblood: '#7c2930',
	violet: '#513765',
	umber: '#6b4a2f',
};

export const CONDENSED = "'Bebas Neue', 'Arial Narrow', sans-serif";
export const SERIF = "'Instrument Serif', Georgia, serif";
export const MONO = "'DM Mono', 'SF Mono', ui-monospace, monospace";
export const TYPEWRITER = "'Special Elite', 'Courier New', monospace";
export const INTER = "'Inter Variable', Inter, sans-serif";

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

export type StampDirection = 'ENTRY' | 'EXIT' | 'TRANSIT' | 'ADMITTED';

export interface Void {
	x: number;
	y: number;
	rx: number;
	ry: number;
	rotation: number;
	opacity?: number;
}

export interface Speck {
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
	shortYear: string;
	isoDate: string;
	dateLine: string;
	untilLine: string;
	serial: string;
	reference: string;
	classCode: string;
	direction: StampDirection;
	portCode: string;
	officer: string;
	specks: Speck[];
	voids: Void[];
}

function formatDate(date: Date, style: Country['dateStyle']): string {
	const day = String(date.getUTCDate()).padStart(2, '0');
	const month = MONTHS[date.getUTCMonth()];
	const year = String(date.getUTCFullYear());
	if (style === 'mdy') return `${month} ${day} ${year}`;
	if (style === 'ymd') return `${year}.${month}.${day}`;
	return `${day} ${month} ${year}`;
}

function portCode(capital: string): string {
	const letters = capital
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^A-Za-z]/g, '')
		.toUpperCase();
	return letters.slice(0, 3) || 'EVW';
}

function directionFor(roll: number): StampDirection {
	if (roll < 0.08) return 'TRANSIT';
	if (roll < 0.68) return 'ENTRY';
	if (roll < 0.88) return 'EXIT';
	return 'ADMITTED';
}

export function stampSpec(country: Country, seed: number): StampSpec {
	const rnd = mulberry32(hash(country.code, seed));
	const start = Date.UTC(2019, 0, 1);
	const end = Date.UTC(2026, 10, 20);
	const date = new Date(start + rnd() * (end - start));
	const until = new Date(date.getTime() + 90 * 24 * 60 * 60 * 1000);
	const day = String(date.getUTCDate()).padStart(2, '0');
	const month = MONTHS[date.getUTCMonth()];
	const year = String(date.getUTCFullYear());
	const shortYear = year.slice(2);
	const serial = `${country.serial}/${shortYear}`;
	const reference = `${country.iso3} ${String(100 + Math.floor(rnd() * 900))}`;
	const classCode = CLASSES[Math.floor(rnd() * CLASSES.length)];
	const dateLine = formatDate(date, country.dateStyle);
	const untilLine = formatDate(until, country.dateStyle);
	const direction = directionFor(rnd());
	const officer = String(10 + Math.floor(rnd() * 89));

	const voids: Void[] = [];
	for (let i = 0; i < 5; i++) {
		const x = i < 2 ? (rnd() < 0.5 ? 20 + rnd() * 8 : 212 + rnd() * 8) : 34 + rnd() * 172;
		const y = i < 2 ? 26 + rnd() * 108 : rnd() < 0.5 ? 12 + rnd() * 8 : 140 + rnd() * 8;
		voids.push({
			x: r3(x),
			y: r3(y),
			rx: r3(0.7 + rnd() * 2.6),
			ry: r3(0.6 + rnd() * 1.6),
			rotation: r3(rnd() * 180),
		});
	}
	for (let i = 0; i < 20; i++) {
		voids.push({
			x: r3(16 + rnd() * 208),
			y: r3(16 + rnd() * 128),
			rx: r3(0.2 + rnd() * 0.7),
			ry: r3(0.2 + rnd() * 0.45),
			rotation: r3(rnd() * 180),
		});
	}
	for (let i = 0; i < 3; i++) {
		voids.push({
			x: r3(46 + rnd() * 148),
			y: r3(36 + rnd() * 88),
			rx: r3(10 + rnd() * 24),
			ry: r3(6 + rnd() * 14),
			rotation: r3(rnd() * 180),
			opacity: r3(0.11 + rnd() * 0.08),
		});
	}

	const specks: Speck[] = [];
	const count = 10 + Math.floor(rnd() * 8);
	for (let i = 0; i < count; i++) {
		const angle = rnd() * Math.PI * 2;
		const radius = 82 + rnd() * 48;
		const x = 120 + Math.cos(angle) * radius;
		const y = 80 + Math.sin(angle) * radius * 0.62;
		if (x < 4 || x > 236 || y < 4 || y > 156) continue;
		const kindRoll = rnd();
		specks.push({
			x: r3(x),
			y: r3(y),
			r: r3(0.35 + rnd() * 1.05),
			opacity: r3(0.2 + rnd() * 0.4),
			kind: kindRoll > 0.88 ? 'ring' : kindRoll > 0.76 ? 'dash' : 'dot',
			angle: r3(rnd() * Math.PI),
		});
	}

	return {
		seed,
		day,
		month,
		year,
		shortYear,
		isoDate: `${year}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${day}`,
		dateLine,
		untilLine,
		serial,
		reference,
		classCode,
		direction,
		portCode: portCode(country.capital),
		officer,
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
	tracking = 0
): number {
	const factor =
		family === CONDENSED ? 0.45 : family === SERIF ? 0.48 : family === INTER ? 0.56 : 0.64;
	const width = text.length * size * factor + Math.max(0, text.length - 1) * tracking;
	return Math.round((width > maxWidth ? Math.max(6, (size * maxWidth) / width) : size) * 100) / 100;
}
