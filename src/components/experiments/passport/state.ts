import { COUNTRY_BY_CODE } from './data/countries';
import { stampDesign } from './stamp/generate';
import { hash, mulberry32 } from './stamp/random';

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

const SAFE = { left: 8, right: 92, top: 19, bottom: 87 };

function designOf(code: string) {
	return stampDesign(COUNTRY_BY_CODE[code]);
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
	const baseWidth = designOf(code).baseWidth;
	const aspect = designOf(code).aspect;
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
				if (coreOverlap > 0.0005 || overlap > 0.03) continue;
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

function arrange(entries: StampEntry[], pageSeed: number): StampEntry[] {
	const sorted = [...entries].sort(
		(a, b) => designOf(b.code).baseWidth - designOf(a.code).baseWidth
	);
	const placed: StampEntry[] = [];
	for (const entry of sorted) {
		placed.push(place(entry.code, placed, pageSeed));
	}
	const byCode = new Map(placed.map((entry) => [entry.code, entry]));
	return entries.map((entry) => byCode.get(entry.code) as StampEntry);
}

export function initialEntries(codes: string[]): StampEntry[] {
	const entries = codes.map((code) => {
		const design = designOf(code);
		return {
			code,
			seed: hash(code, 197) % 2 ** 30,
			x: 50,
			y: 50,
			rotation: 0,
			width: design.baseWidth,
			aspect: design.aspect,
		};
	});
	return arrange(entries, 197);
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

export function shuffleEntries(entries: StampEntry[], pageSeed: number): StampEntry[] {
	const arranged = arrange(entries, pageSeed);
	const seeds = new Map(entries.map((entry) => [entry.code, entry.seed]));
	return arranged.map((entry) => ({ ...entry, seed: seeds.get(entry.code) ?? entry.seed }));
}

export function randomSeed(): number {
	return Math.floor(Math.random() * 2 ** 30);
}
