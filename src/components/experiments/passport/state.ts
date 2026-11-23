export interface StampEntry {
	code: string;
	seed: number;
	x: number;
	y: number;
	rotation: number;
	width: number;
}

export const MAX_STAMPS = 9;

const STAMP_RATIO = 160 / 240;

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

function box(entry: StampEntry) {
	const width = entry.width;
	const height = width * STAMP_RATIO;
	return {
		left: entry.x - width / 2,
		right: entry.x + width / 2,
		top: entry.y - height / 2,
		bottom: entry.y + height / 2,
		width,
		height,
	};
}

function overlapArea(a: StampEntry, b: StampEntry, core = false): number {
	const aa = box(a);
	const bb = box(b);
	if (core) {
		const inset = (value: { left: number; right: number; top: number; bottom: number }) => ({
			left: value.left + (value.right - value.left) * 0.2,
			right: value.right - (value.right - value.left) * 0.2,
			top: value.top + (value.bottom - value.top) * 0.2,
			bottom: value.bottom - (value.bottom - value.top) * 0.2,
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

function place(code: string, entries: StampEntry[], pageSeed: number, compact = false): StampEntry {
	const rnd = mulberry32(hash(code, pageSeed + entries.length * 7919));
	const seed = Math.floor(rnd() * 2 ** 30);
	let best: StampEntry | null = null;
	let bestScore = Number.POSITIVE_INFINITY;
	for (let attempt = 0; attempt < 140; attempt++) {
		const width = compact ? 28 + rnd() * 7 : 34 + rnd() * 9;
		const rotation = (rnd() * 2 - 1) * 15;
		const x = compact ? 18 + rnd() * 64 : 24 + rnd() * 52;
		const y = compact ? 20 + rnd() * 62 : 24 + rnd() * 54;
		const candidate: StampEntry = { code, seed: seed + attempt * 101, x, y, rotation, width };
		const area = box(candidate).width * box(candidate).height;
		let overlap = 0;
		let coreOverlap = 0;
		for (const entry of entries) {
			overlap += overlapArea(candidate, entry) / area;
			coreOverlap += overlapArea(candidate, entry, true) / area;
		}
		const score = coreOverlap * 3.2 + overlap * 0.45 + Math.abs(x - 50) * 0.0018;
		if (score < bestScore) {
			bestScore = score;
			best = candidate;
		}
		if (coreOverlap < 0.05 && overlap < 0.28) break;
	}
	return best as StampEntry;
}

const OPENING: Record<string, Pick<StampEntry, 'x' | 'y' | 'rotation' | 'width'>> = {
	ke: { x: 29, y: 27, rotation: -10, width: 45 },
	za: { x: 63, y: 28, rotation: 16, width: 36 },
	th: { x: 67, y: 49, rotation: -11, width: 43 },
	nl: { x: 30, y: 52, rotation: 9, width: 41 },
	jp: { x: 48, y: 65, rotation: -20, width: 28 },
	qa: { x: 10, y: 79, rotation: 16, width: 31 },
	no: { x: 75, y: 77, rotation: -13, width: 36 },
};

export function initialEntries(codes: string[]): StampEntry[] {
	const entries: StampEntry[] = [];
	for (const code of codes) {
		const at = OPENING[code];
		if (at) {
			entries.push({ code, seed: hash(code, 197) % 2 ** 30, ...at });
		} else {
			entries.push(place(code, entries, 197));
		}
	}
	return entries;
}

export function addEntry(code: string, entries: StampEntry[], pageSeed: number): StampEntry {
	return place(code, entries, pageSeed, true);
}

export function reinkEntries(entries: StampEntry[], pageSeed: number): StampEntry[] {
	return entries.map((entry, i) => {
		const rnd = mulberry32(hash(entry.code, pageSeed + i * 104729));
		return {
			...entry,
			seed: Math.floor(rnd() * 2 ** 30),
			rotation: Math.max(-16, Math.min(16, entry.rotation + (rnd() * 2 - 1) * 2.5)),
		};
	});
}

export function randomSeed(): number {
	return Math.floor(Math.random() * 2 ** 30);
}
