'use client';

import { ArrowDown01Icon, HugeiconsIcon, ShuffleIcon } from '@icons';
import { AnimatePresence, LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { useEffect, useMemo, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { STAMP_CITIES, type StampCity, stampImage } from '@/data/stamps';
import { cn } from '@/lib/utils';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

const ROTATE_MS = 3500;
const STAMP_PX = 480;

const flagSrc = (city: StampCity) => `https://flagcdn.com/${city.countryCode}.svg`;

/** A small, stable tilt per stamp so the pile looks hand-placed. */
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

const byCountry = [
	...STAMP_CITIES.reduce((groups, city) => {
		groups.set(city.country, [...(groups.get(city.country) ?? []), city]);
		return groups;
	}, new Map<string, StampCity[]>()),
].sort(([a], [b]) => a.localeCompare(b));

function Flag({ city, className }: { city: StampCity; className?: string }) {
	return (
		<img
			src={flagSrc(city)}
			alt=""
			className={cn('h-3 w-[18px] shrink-0 rounded-[2px] object-cover', className)}
		/>
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
			<PopoverTrigger className="flex items-center gap-2 text-[14px]">
				<Flag city={value} />
				<span className="font-medium">{value.name}</span>
				<span className="text-[var(--text-ghost)]">{value.country}</span>
				<HugeiconsIcon icon={ArrowDown01Icon} size={13} color="var(--text-ghost)" />
			</PopoverTrigger>
			<PopoverContent className="max-h-[50vh] w-72 overflow-y-auto overscroll-contain">
				{byCountry.map(([country, cities]) => (
					<div key={country} className="px-2.5 py-1.5">
						<div className="flex items-center gap-2 text-[12px] text-[var(--text-ghost)]">
							<Flag city={cities[0]} />
							{country}
						</div>
						<div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 pl-[26px]">
							{cities.map((city) => (
								<button
									key={city.slug}
									type="button"
									onClick={() => {
										onChange(city);
										setOpen(false);
									}}
									className={cn(
										'text-[13px] transition-colors',
										city.slug === value.slug
											? 'text-[var(--foreground)]'
											: 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
									)}
								>
									{city.name}
								</button>
							))}
						</div>
					</div>
				))}
			</PopoverContent>
		</Popover>
	);
}

/** Every Air Mail stamp, rotating; click the stamp for the next one. */
export default function StampCarousel({ controls = true }: { controls?: boolean }) {
	const order = useMemo(() => shuffled(STAMP_CITIES), []);
	const [index, setIndex] = useState(0);
	const city = order[index];
	const next = () => setIndex((i) => (i + 1) % order.length);

	// Re-armed on every change, so a manual pick gets the full interval before rotating on.
	useEffect(() => {
		const timer = window.setTimeout(() => setIndex((i) => (i + 1) % order.length), ROTATE_MS);
		const preload = new Image();
		preload.src = stampImage(order[(index + 1) % order.length], STAMP_PX);
		return () => window.clearTimeout(timer);
	}, [index, order]);

	return (
		<LazyMotion features={loadFeatures}>
			<div className="flex flex-col items-center gap-6">
				<button
					type="button"
					onClick={next}
					aria-label={`${city.name} stamp, show the next one`}
					className="relative aspect-[600/848] w-full max-w-[300px] cursor-pointer"
				>
					<AnimatePresence initial={false}>
						<m.img
							key={city.slug}
							src={stampImage(city, STAMP_PX)}
							alt={`${city.name}, ${city.country}`}
							initial={{
								opacity: 0,
								y: 16,
								rotate: tilt(city.slug) - 4,
								scale: 0.96,
							}}
							animate={{ opacity: 1, y: 0, rotate: tilt(city.slug), scale: 1 }}
							exit={{
								opacity: 0,
								y: -12,
								rotate: tilt(city.slug) + 4,
								scale: 0.98,
							}}
							transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
							className="absolute inset-0 size-full object-contain"
							draggable={false}
						/>
					</AnimatePresence>
				</button>
				{controls && (
					<div className="flex items-center gap-2">
						<CityPicker
							value={city}
							onChange={(picked) => setIndex(order.findIndex((c) => c.slug === picked.slug))}
						/>
						<button
							type="button"
							aria-label="Shuffle"
							title="Shuffle"
							onClick={() =>
								setIndex(
									(i) => (i + 1 + Math.floor(Math.random() * (order.length - 1))) % order.length
								)
							}
							className="flex size-7 items-center justify-center rounded-lg text-[var(--text-ghost)] transition-colors hover:text-[var(--foreground)]"
						>
							<HugeiconsIcon icon={ShuffleIcon} size={15} />
						</button>
					</div>
				)}
			</div>
		</LazyMotion>
	);
}
