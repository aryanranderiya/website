import { COUNTRY_BY_CODE } from './data/countries';
import { FORM_BOX, FORM_WIDTH } from './stamp/form';
import type { StampForm } from './types';

export interface StampEntry {
	code: string;
	seed: number;
	x: number;
	y: number;
	rotation: number;
	width: number;
	aspect: number;
}

export const MAX_STAMPS = 9;

const SAFE = { left: 8, right: 92, top: 19, bottom: 90 };

function hash(text: string, salt: number): number {
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

function formOf(code: string): StampForm {
	return COUNTRY_BY_CODE[code]?.form ?? 'arrival';
}

function aspectOf(code: string): number {
	return FORM_BOX[formOf(code)].aspect;
}

export function stampHeight(width: number, aspect: number): number {
	return width * aspect * (5 / 7);
}

function box(entry: StampEntry) {
	const height = stampHeight(entry.width, entry.aspect);
	return {
		left: entry.x - entry.width / 2,
		right: entry.x + entry.width / 2,
		top: entry.y - height / 2,
		bottom: entry.y + height / 2,
		width: entry.width,
		height,
	};
}

function overlapArea(a: StampEntry, b: StampEntry, core = false): number {
	const aa = box(a);
	const bb = box(b);
	if (core) {
		const inset = (value: { left: number; right: number; top: number; bottom: number }) => ({
			left: value.left + (value.right - value.left) * 0.22,
			right: value.right - (value.right - value.left) * 0.22,
			top: value.top + (value.bottom - value.top) * 0.22,
			bottom: value.bottom - (value.bottom - value.top) * 0.22,
		});
		const c = inset(aa);
		const d = inset(bb);
		const w = Math.max(0, Math.min(c.right, d.right) - Math.max(c.left, d.left));
		const h = Math.max(0, Math.min(c.bottom, d.bottom) - Math.max(c.top, d.top));
		return w * h;
	}
	const w = Math.max(0, Math.min(aa.right, bb.right) - Math.max(aa.left, bb.left));
	const h = Math.max(0, Math.min(aa.bottom, bb.bottom) - Math.max(aa.top, bb.top));
	return w * h;
}

function zoneOf(x: number, y: number): number {
	const col = x < 37 ? 0 : x < 63 ? 1 : 2;
	const row = y < 40 ? 0 : y < 67 ? 1 : 2;
	return row * 3 + col;
}

function place(code: string, entries: StampEntry[], pageSeed: number): StampEntry {
	const rnd = mulberry32(hash(code, pageSeed + entries.length * 7919));
	const baseSeed = Math.floor(rnd() * 2 ** 30);
	const baseWidth = FORM_WIDTH[formOf(code)];
	const aspect = aspectOf(code);
	const rotations = [-10, -7, -4, -1, 2, 5, 8, 11];
	const scales = [1, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6];
	const grid = Array.from({ length: 11 }, (_, i) => i / 10);
	const zoneCounts = new Array(9).fill(0);
	for (const entry of entries) zoneCounts[zoneOf(entry.x, entry.y)] += 1;
	let fallback: StampEntry | null = null;
	let fallbackScore = Number.POSITIVE_INFINITY;

	for (let scaleIndex = 0; scaleIndex < scales.length; scaleIndex++) {
		const width = baseWidth * scales[scaleIndex];
		const halfW = width / 2;
		const halfH = stampHeight(width, aspect) / 2;
		const xMin = SAFE.left + halfW;
		const xMax = SAFE.right - halfW;
		const yMin = SAFE.top + halfH;
		const yMax = SAFE.bottom - halfH;
		if (xMax <= xMin || yMax <= yMin) continue;
		let best: StampEntry | null = null;
		let bestScore = Number.POSITIVE_INFINITY;

		for (const gx of grid) {
			for (const gy of grid) {
				const x = xMin + (xMax - xMin) * gx + (rnd() - 0.5) * 1.4;
				const y = yMin + (yMax - yMin) * gy + (rnd() - 0.5) * 1.4;
				const rotation = rotations[Math.floor(rnd() * rotations.length)];
				const next: StampEntry = {
					code,
					seed: baseSeed + scaleIndex * 101 + Math.floor(rnd() * 1000),
					x,
					y,
					rotation,
					width,
					aspect,
				};
				const area = width * stampHeight(width, aspect);
				let overlap = 0;
				let coreOverlap = 0;
				let nearest = 100;
				for (const entry of entries) {
					overlap += overlapArea(next, entry) / area;
					coreOverlap += overlapArea(next, entry, true) / area;
					nearest = Math.min(nearest, Math.hypot(next.x - entry.x, (next.y - entry.y) * 1.35));
				}
				const rawScore = coreOverlap * 20 + overlap * 10;
				if (rawScore < fallbackScore) {
					fallbackScore = rawScore;
					fallback = next;
				}
				if (coreOverlap > 0.001 || overlap > 0.03) continue;
				const crowding = entries.length > 0 ? Math.max(0, 14 - nearest) * 0.22 : 0;
				const zonePenalty = zoneCounts[zoneOf(x, y)] * 0.55;
				const score =
					overlap * 6 + crowding + zonePenalty + (1 - scales[scaleIndex]) * 0.4 + rnd() * 0.004;
				if (score < bestScore) {
					bestScore = score;
					best = next;
				}
			}
		}

		if (best) return best;
	}

	if (fallback) return fallback;
	const width = baseWidth * scales[scales.length - 1];
	return {
		code,
		seed: baseSeed,
		x: 50,
		y: 50,
		rotation: 0,
		width,
		aspect,
	};
}

const OPENING: Record<string, Pick<StampEntry, 'x' | 'y' | 'rotation' | 'width'>> = {
	ke: { x: 30, y: 30, rotation: -8, width: 44 },
	za: { x: 68, y: 28, rotation: 10, width: 34 },
	nl: { x: 29, y: 54, rotation: 5, width: 41 },
	th: { x: 70, y: 42, rotation: -11, width: 33 },
	jp: { x: 50, y: 72, rotation: -16, width: 28 },
	qa: { x: 19, y: 83.5, rotation: 8, width: 32 },
	no: { x: 82, y: 80, rotation: -6, width: 31 },
};

export function initialEntries(codes: string[]): StampEntry[] {
	const entries: StampEntry[] = [];
	for (const code of codes) {
		const at = OPENING[code];
		if (at) {
			entries.push({
				code,
				seed: hash(code, 197) % 2 ** 30,
				aspect: aspectOf(code),
				...at,
			});
		} else {
			entries.push(place(code, entries, 197));
		}
	}
	return entries;
}

export function addEntry(code: string, entries: StampEntry[], pageSeed: number): StampEntry {
	return place(code, entries, pageSeed);
}

export function reinkEntries(entries: StampEntry[], pageSeed: number): StampEntry[] {
	return entries.map((entry, i) => {
		const rnd = mulberry32(hash(entry.code, pageSeed + i * 104729));
		return {
			...entry,
			seed: Math.floor(rnd() * 2 ** 30),
			rotation: Math.max(-15, Math.min(15, entry.rotation + (rnd() * 2 - 1) * 2.8)),
		};
	});
}

const SHUFFLE_SLOTS = Object.values(OPENING);

export function shuffleEntries(entries: StampEntry[], pageSeed: number): StampEntry[] {
	const rnd = mulberry32(hash('shuffle', pageSeed));
	const slots = [...SHUFFLE_SLOTS];
	for (let i = slots.length - 1; i > 0; i--) {
		const j = Math.floor(rnd() * (i + 1));
		[slots[i], slots[j]] = [slots[j], slots[i]];
	}
	const next: StampEntry[] = [];
	entries.slice(0, slots.length).forEach((entry, index) => {
		const slot = slots[index];
		const width = Math.min(slot.width, FORM_WIDTH[formOf(entry.code)] * 1.12);
		next.push({
			...entry,
			x: slot.x + (rnd() - 0.5) * 2.4,
			y: slot.y + (rnd() - 0.5) * 2.4,
			rotation: slot.rotation + (rnd() - 0.5) * 4,
			width,
			aspect: aspectOf(entry.code),
		});
	});
	for (const entry of entries.slice(slots.length)) {
		next.push(place(entry.code, next, pageSeed));
	}
	return next;
}

export function randomSeed(): number {
	return Math.floor(Math.random() * 2 ** 30);
}
