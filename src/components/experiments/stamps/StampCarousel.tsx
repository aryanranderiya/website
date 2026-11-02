'use client';

import { ArrowDown01Icon, HugeiconsIcon, Search01Icon, ShuffleIcon } from '@icons';
import { Command } from 'cmdk';
import { AnimatePresence, LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { STAMP_CITIES, type StampCity, stampImage } from '@/data/stamps';
import { cn } from '@/lib/utils';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

const ROTATE_MS = 3500;
/** 2x the largest display width. */
const STAMP_PX = 720;
const PRELOAD_AHEAD = 3;

const flagSrc = (city: StampCity) => `https://flagcdn.com/${city.countryCode}.svg`;

/** A small, stable tilt per stamp so each one looks hand-placed. */
function tilt(slug: string): number {
	let h = 0;
	for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) | 0;
	return ((Math.abs(h) % 7) - 3) * 1.2;
}

function shuffled<T>(items: readonly T[]): T[] {
	const out = [...items];
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
}

/** Fetch and decode a stamp once; later calls reuse the same promise. */
const decoded = new Map<string, Promise<void>>();
function decodeStamp(city: StampCity): Promise<void> {
	const src = stampImage(city, STAMP_PX);
	let ready = decoded.get(src);
	if (!ready) {
		const img = new Image();
		img.src = src;
		ready = img.decode();
		decoded.set(src, ready);
	}
	return ready;
}

function Flag({ city }: { city: StampCity }) {
	return (
		<img src={flagSrc(city)} alt="" className="h-3 w-[18px] shrink-0 rounded-[2px] object-cover" />
	);
}

function CityPicker({
	value,
	onChange,
}: {
	value: StampCity;
	onChange: (city: StampCity) => void;
}) {
	const [open, setOpen] = useState(false);
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger className="flex items-center gap-2 rounded-lg px-2 py-1 text-[14px] transition-colors hover:bg-[var(--muted-bg)]">
				<Flag city={value} />
				<span className="font-medium">{value.name}</span>
				<span className="text-[var(--text-ghost)]">{value.country}</span>
				<HugeiconsIcon icon={ArrowDown01Icon} size={13} color="var(--text-ghost)" />
			</PopoverTrigger>
			<PopoverContent className="w-72 p-0">
				<Command>
					<div className="flex items-center gap-2 px-3 pt-3 pb-2">
						<HugeiconsIcon icon={Search01Icon} size={13} color="var(--text-ghost)" />
						<Command.Input
							autoFocus
							placeholder="Search cities or countries"
							aria-label="Search cities or countries"
							className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-[var(--text-ghost)]"
						/>
					</div>
					<Command.List className="max-h-72 overflow-y-auto overscroll-contain p-1.5">
						<Command.Empty className="py-6 text-center text-[13px] text-[var(--text-ghost)]">
							No city found
						</Command.Empty>
						{STAMP_CITIES.map((city) => (
							<Command.Item
								key={city.slug}
								value={`${city.name} ${city.country}`}
								onSelect={() => {
									onChange(city);
									setOpen(false);
								}}
								className="flex cursor-pointer items-center gap-2.5 rounded-[12px] px-2.5 py-1.5 text-[13px] data-[selected=true]:bg-[var(--muted-bg-strong)]"
							>
								<Flag city={city} />
								<span className={cn(city.slug === value.slug && 'font-medium')}>{city.name}</span>
								<span className="ml-auto text-[12px] text-[var(--text-ghost)]">{city.country}</span>
							</Command.Item>
						))}
					</Command.List>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

/** Every Air Mail stamp, rotating; click the stamp for the next one. */
export default function StampCarousel({ controls = true }: { controls?: boolean }) {
	const order = useMemo(() => shuffled(STAMP_CITIES), []);
	const [index, setIndex] = useState(0);
	const requested = useRef(0);
	const city = order[index];

	// Swap only once the requested stamp is decoded, so the old one never gives way to a blank.
	const show = useCallback(
		(next: number) => {
			requested.current = next;
			decodeStamp(order[next]).then(() => {
				if (requested.current === next) setIndex(next);
			});
		},
		[order]
	);

	// Re-armed on every change, so a manual pick gets the full interval before rotating on.
	useEffect(() => {
		for (let i = 1; i <= PRELOAD_AHEAD; i++) decodeStamp(order[(index + i) % order.length]);
		const timer = window.setTimeout(() => show((index + 1) % order.length), ROTATE_MS);
		return () => window.clearTimeout(timer);
	}, [index, order, show]);

	return (
		<LazyMotion features={loadFeatures}>
			<div className="flex w-full flex-col items-center gap-6">
				<button
					type="button"
					onClick={() => show((index + 1) % order.length)}
					aria-label={`${city.name} stamp, show the next one`}
					className="relative aspect-[5/7] w-full max-w-[360px] cursor-pointer"
				>
					<AnimatePresence initial={false}>
						<m.img
							key={city.slug}
							src={stampImage(city, STAMP_PX)}
							alt={`${city.name}, ${city.country}`}
							initial={{ opacity: 0, y: 12, rotate: tilt(city.slug) - 3 }}
							animate={{ opacity: 1, y: 0, rotate: tilt(city.slug) }}
							exit={{ opacity: 0, y: -8, rotate: tilt(city.slug) + 3 }}
							transition={{ type: 'spring', duration: 0.45, bounce: 0.15 }}
							className="absolute inset-0 size-full object-contain"
							draggable={false}
						/>
					</AnimatePresence>
				</button>
				{controls && (
					<div className="flex items-center gap-1">
						<CityPicker
							value={city}
							onChange={(picked) => show(order.findIndex((c) => c.slug === picked.slug))}
						/>
						<button
							type="button"
							aria-label="Shuffle"
							title="Shuffle"
							onClick={() =>
								show((index + 1 + Math.floor(Math.random() * (order.length - 1))) % order.length)
							}
							className="flex size-8 items-center justify-center rounded-lg text-[var(--text-ghost)] transition-colors hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)]"
						>
							<HugeiconsIcon icon={ShuffleIcon} size={15} />
						</button>
					</div>
				)}
			</div>
		</LazyMotion>
	);
}
