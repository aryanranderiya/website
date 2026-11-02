'use client';

import { ChevronDown, HugeiconsIcon, Search01Icon, ShuffleIcon } from '@icons';
import { Command } from 'cmdk';
import { AnimatePresence, LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { useEffect, useReducer, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { STAMP_CITIES, type StampCity, stampImage } from '@/data/stamps';
import { cn } from '@/lib/utils';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

const ROTATE_MS = 3500;
/** ~2x the pile's width. */
const FULL_PX = 640;
/** Shown instantly while the full art loads; all of them are fetched up front. */
const PREVIEW_PX = 120;
const PRELOAD_AHEAD = 2;
/** Stamps kept on the pile; the oldest fades out from the bottom. */
const PILE_SIZE = 4;

const flagSrc = (city: StampCity) => `https://flagcdn.com/${city.countryCode}.svg`;

interface Placement {
	rotate: number;
	x: number;
	y: number;
}

/** A fresh landing spot: 4-16 degrees, leaning the other way from the stamp below. */
function landing(below?: Placement): Placement {
	const lean = below && below.rotate > 0 ? -1 : 1;
	return {
		rotate: lean * (4 + Math.random() * 12),
		x: (Math.random() - 0.5) * 28,
		y: (Math.random() - 0.5) * 20,
	};
}

function shuffled<T>(items: readonly T[]): T[] {
	const out = [...items];
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
}

function preload(src: string) {
	new Image().src = src;
}

/** The low-res art at once, the full art faded over it once it has loaded. */
function StampArt({ city }: { city: StampCity }) {
	const [loaded, setLoaded] = useState(false);
	return (
		<div className="relative size-full">
			<img
				src={stampImage(city, PREVIEW_PX)}
				alt=""
				className="absolute inset-0 size-full object-contain"
				draggable={false}
			/>
			<img
				src={stampImage(city, FULL_PX)}
				alt={`${city.name}, ${city.country}`}
				onLoad={() => setLoaded(true)}
				className={cn(
					'absolute inset-0 size-full object-contain transition-opacity duration-300',
					loaded ? 'opacity-100' : 'opacity-0'
				)}
				draggable={false}
			/>
		</div>
	);
}

function Flag({ city }: { city: StampCity }) {
	return (
		<img
			src={flagSrc(city)}
			alt=""
			loading="lazy"
			className="h-3 w-[18px] shrink-0 rounded-[2px] object-cover"
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
			<PopoverTrigger className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[14px] transition-colors hover:bg-[var(--muted-bg)]">
				<Flag city={value} />
				<span className="font-medium">{value.name}</span>
				<span className="text-[var(--text-ghost)]">{value.country}</span>
				<ChevronDown size={14} className="text-[var(--text-ghost)]" />
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

interface Dealt {
	key: number;
	city: StampCity;
	at: Placement;
}

interface Pile {
	order: StampCity[];
	/** Index into order of the stamp on top. */
	cursor: number;
	dealt: Dealt[];
}

/** `at` is drawn by the caller (landing) so the reducer stays pure. */
type Deal = { type: 'next'; at: Placement } | { type: 'at'; index: number; at: Placement };

const topOf = (pile: Pile) => pile.dealt[pile.dealt.length - 1];

function dealReducer(pile: Pile, action: Deal): Pile {
	const cursor = action.type === 'next' ? (pile.cursor + 1) % pile.order.length : action.index;
	const key = topOf(pile).key + 1;
	return {
		...pile,
		cursor,
		dealt: [...pile.dealt, { key, city: pile.order[cursor], at: action.at }].slice(-PILE_SIZE),
	};
}

function initialPile(): Pile {
	const order = shuffled(STAMP_CITIES);
	return { order, cursor: 0, dealt: [{ key: 0, city: order[0], at: landing() }] };
}

/** Every Air Mail stamp, dealt one onto another; click the pile for the next. */
export default function StampCarousel({ controls = true }: { controls?: boolean }) {
	const [pile, dispatch] = useReducer(dealReducer, undefined, initialPile);
	const { order } = pile;
	const top = topOf(pile).city;

	useEffect(() => {
		for (const city of STAMP_CITIES) preload(stampImage(city, PREVIEW_PX));
	}, []);

	// Re-armed after every deal, so a manual pick gets the full interval before the next.
	useEffect(() => {
		for (let i = 1; i <= PRELOAD_AHEAD; i++) {
			preload(stampImage(pile.order[(pile.cursor + i) % pile.order.length], FULL_PX));
		}
		const timer = window.setTimeout(
			() => dispatch({ type: 'next', at: landing(topOf(pile).at) }),
			ROTATE_MS
		);
		return () => window.clearTimeout(timer);
	}, [pile]);

	return (
		<LazyMotion features={loadFeatures}>
			<div className="flex w-full flex-col items-center gap-4">
				{controls && (
					<div className="flex items-center gap-1">
						<CityPicker
							value={top}
							onChange={(picked) =>
								dispatch({
									type: 'at',
									index: order.findIndex((c) => c.slug === picked.slug),
									at: landing(topOf(pile).at),
								})
							}
						/>
						<button
							type="button"
							aria-label="Shuffle"
							title="Shuffle"
							onClick={() =>
								dispatch({
									type: 'at',
									index:
										(pile.cursor + 1 + Math.floor(Math.random() * (order.length - 1))) %
										order.length,
									at: landing(topOf(pile).at),
								})
							}
							className="flex size-8 items-center justify-center rounded-lg text-[var(--text-ghost)] transition-colors hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)]"
						>
							<HugeiconsIcon icon={ShuffleIcon} size={15} />
						</button>
					</div>
				)}
				<button
					type="button"
					onClick={() => dispatch({ type: 'next', at: landing(topOf(pile).at) })}
					aria-label={`${top.name} stamp, deal the next one`}
					className="relative aspect-[5/7] w-full max-w-[380px] cursor-pointer select-none"
				>
					<AnimatePresence initial={false}>
						{pile.dealt.map(({ key, city, at }) => {
							return (
								<m.div
									key={key}
									initial={{
										opacity: 0,
										scale: 1.12,
										x: at.x,
										y: at.y - 28,
										rotate: at.rotate + 9,
									}}
									animate={{
										opacity: 1,
										scale: 1,
										x: at.x,
										y: at.y,
										rotate: at.rotate,
									}}
									exit={{ opacity: 0, transition: { duration: 0.3 } }}
									transition={{ type: 'spring', duration: 0.5, bounce: 0.22 }}
									className="absolute inset-[11%]"
								>
									<StampArt city={city} />
								</m.div>
							);
						})}
					</AnimatePresence>
				</button>
			</div>
		</LazyMotion>
	);
}
