'use client';

import { useEffect, useRef, useState } from 'react';
import { HoverTooltip } from '@/components/ui/hover-tooltip';
import { stampImage } from '@/data/stamps';
import { cn } from '@/lib/utils';
import { cardClass, Field, optionColors, Section, Swatches, TextOptions } from './controls';
import { ART_FAMILIES, ARTWORKS, POSTAL_FAMILY, STAMPS } from './edition';
import type { Look, Template } from './types';

const STAMP_BATCH = 18;
const selectedClass =
	'ring-2 ring-[var(--accent-blue)] ring-offset-2 ring-offset-[var(--background)]';

/** Renders stamps a batch at a time as the grid's own scroll nears the end. */
function StampGrid({ value, onChange }: { value: string; onChange: (slug: string) => void }) {
	const [count, setCount] = useState(STAMP_BATCH);
	const sentinel = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const el = sentinel.current;
		if (!el) return;
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) setCount((c) => Math.min(c + STAMP_BATCH, STAMPS.length));
		});
		observer.observe(el);
		return () => observer.disconnect();
	}, []);
	return (
		<div className="-mx-1 max-h-64 [scrollbar-width:thin] overflow-y-auto overscroll-contain px-1 py-1">
			<fieldset className="grid grid-cols-6 gap-2">
				<legend className="sr-only">Stamp</legend>
				{STAMPS.slice(0, count).map((s) => (
					<HoverTooltip key={s.slug} label={s.name} className="flex">
						<button
							type="button"
							aria-pressed={s.slug === value}
							aria-label={s.name}
							onClick={() => onChange(s.slug)}
							className={cn(
								'aspect-[5/7] w-full cursor-pointer rounded-[3px]',
								s.slug === value && selectedClass
							)}
						>
							<img
								src={stampImage(s, 96)}
								alt=""
								loading="lazy"
								className="size-full object-contain"
							/>
						</button>
					</HoverTooltip>
				))}
			</fieldset>
			{count < STAMPS.length && <div ref={sentinel} className="h-px" />}
		</div>
	);
}

function Paintings({ value, onChange }: { value: number; onChange: (index: number) => void }) {
	return (
		<fieldset className="grid grid-cols-5 gap-2">
			<legend className="sr-only">Painting</legend>
			{ARTWORKS.map((a, i) => (
				<button
					key={a.src}
					type="button"
					aria-pressed={i === value}
					aria-label={`${a.title}, ${a.artist}`}
					title={`${a.title}, ${a.artist}`}
					onClick={() => onChange(i)}
					className={cn(
						'aspect-square cursor-pointer overflow-hidden rounded-lg',
						i === value && selectedClass
					)}
				>
					<img src={a.src} alt="" loading="lazy" className="size-full object-cover" />
				</button>
			))}
		</fieldset>
	);
}

/** The edition's style axes, then its artwork when it hangs any. */
export function LookControls({
	templates,
	look,
	onChange,
}: {
	templates: Template[];
	look: Look;
	onChange: (look: Look) => void;
}) {
	const template = templates.find((t) => t.id === look.family);
	if (!template) throw new Error(`unknown edition family: ${look.family}`);
	const isPostal = template.id === POSTAL_FAMILY;
	// Air Mail's city gets the stamp grid; a one-option axis is no choice at all.
	const axes = Object.entries(template.axes).filter(
		([axis, options]) => options.length > 1 && !(isPostal && axis === 'city')
	);
	const setAxis = (axis: string, id: string) =>
		onChange({ ...look, skin: { ...look.skin, [axis]: id } });
	const city = STAMPS.find((s) => s.slug === look.skin.city) ?? STAMPS[0];
	const art = ARTWORKS[look.art];

	return (
		<>
			<div className={cn(cardClass, 'flex flex-col gap-2 px-4 py-3')}>
				{axes.map(([axis, options]) => {
					const value = look.skin[axis] ?? options[0].id;
					return (
						<Field key={axis} label={axis}>
							{options.every((o) => optionColors(o).length > 0) ? (
								<Swatches
									options={options}
									value={value}
									onChange={(id) => setAxis(axis, id)}
									label={axis}
								/>
							) : (
								<TextOptions
									options={options.map((o) => ({
										id: o.id,
										label: o.label.replace(`${axis}: `, ''),
									}))}
									value={value}
									onChange={(id) => setAxis(axis, id)}
									label={axis}
								/>
							)}
						</Field>
					);
				})}
			</div>
			{isPostal && (
				<Section title="Stamp" hint={city.name} className={cardClass}>
					<StampGrid value={city.slug} onChange={(slug) => setAxis('city', slug)} />
				</Section>
			)}
			{ART_FAMILIES.has(template.id) && (
				<Section title="Painting" hint={art.artist} className={cardClass}>
					<Paintings value={look.art} onChange={(i) => onChange({ ...look, art: i })} />
				</Section>
			)}
		</>
	);
}
