'use client';

import {
	ArrowDown01Icon,
	ArrowLeft01Icon,
	ArrowRight01Icon,
	HugeiconsIcon,
	ShuffleIcon,
} from '@icons';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { stampImage } from '@/data/stamps';
import { cn } from '@/lib/utils';
import { Field, IconButton, optionColors, Section, Swatches, TextOptions } from './controls';
import { ART_FAMILIES, ARTWORKS, displayName, POSTAL_FAMILY, STAMPS, shuffleLook } from './edition';
import type { Look, Template } from './types';

function EditionPicker({
	templates,
	look,
	onChange,
}: {
	templates: Template[];
	look: Look;
	onChange: (look: Look) => void;
}) {
	const [open, setOpen] = useState(false);
	const index = templates.findIndex((t) => t.id === look.family);
	const choose = (t: Template) => onChange({ ...look, family: t.id, skin: {} });
	const step = (delta: number) =>
		choose(templates[(index + delta + templates.length) % templates.length]);

	return (
		<div className="flex items-center gap-1">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger className="flex min-w-0 flex-1 items-center gap-1.5 text-left text-[15px] font-medium">
					<span className="truncate">{displayName(templates[index])}</span>
					<HugeiconsIcon icon={ArrowDown01Icon} size={14} color="var(--text-ghost)" />
				</PopoverTrigger>
				<PopoverContent
					align="start"
					className="max-h-[60vh] w-56 overflow-y-auto overscroll-contain"
				>
					{templates.map((t) => (
						<button
							key={t.id}
							type="button"
							onClick={() => {
								choose(t);
								setOpen(false);
							}}
							className={cn(
								'block w-full rounded-[14px] px-3 py-1.5 text-left text-[13px] transition-colors hover:bg-[var(--muted-bg)]',
								t.id === look.family ? 'text-[var(--foreground)]' : 'text-[var(--text-secondary)]'
							)}
						>
							{displayName(t)}
						</button>
					))}
				</PopoverContent>
			</Popover>
			<IconButton label="Previous edition" onClick={() => step(-1)}>
				<HugeiconsIcon icon={ArrowLeft01Icon} size={15} />
			</IconButton>
			<IconButton label="Next edition" onClick={() => step(1)}>
				<HugeiconsIcon icon={ArrowRight01Icon} size={15} />
			</IconButton>
			<IconButton label="Shuffle" onClick={() => onChange(shuffleLook(templates, look))}>
				<HugeiconsIcon icon={ShuffleIcon} size={15} />
			</IconButton>
		</div>
	);
}

const STAMPS_COLLAPSED = 12;

function StampGrid({ value, onChange }: { value: string; onChange: (slug: string) => void }) {
	const [all, setAll] = useState(false);
	const shown = all ? STAMPS : STAMPS.slice(0, STAMPS_COLLAPSED);
	return (
		<>
			<fieldset className="grid grid-cols-6 gap-1.5">
				<legend className="sr-only">Stamp</legend>
				{shown.map((s) => (
					<button
						key={s.slug}
						type="button"
						aria-pressed={s.slug === value}
						aria-label={s.name}
						title={`${s.name}, ${s.country}`}
						onClick={() => onChange(s.slug)}
						className={cn(
							'aspect-[5/7] transition-opacity',
							s.slug === value ? 'opacity-100' : 'opacity-50 hover:opacity-100'
						)}
					>
						<img
							src={stampImage(s, 96)}
							alt=""
							loading="lazy"
							className="size-full object-contain"
						/>
					</button>
				))}
			</fieldset>
			<button
				type="button"
				onClick={() => setAll(!all)}
				className="w-fit text-[12px] text-[var(--text-ghost)] transition-colors hover:text-[var(--foreground)]"
			>
				{all ? 'Show fewer' : `Show all ${STAMPS.length}`}
			</button>
		</>
	);
}

function Paintings({ value, onChange }: { value: number; onChange: (index: number) => void }) {
	return (
		<fieldset className="grid grid-cols-5 gap-1.5">
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
						'aspect-square overflow-hidden rounded-lg transition-opacity',
						i === value ? 'opacity-100' : 'opacity-50 hover:opacity-100'
					)}
				>
					<img src={a.src} alt="" loading="lazy" className="size-full object-cover" />
				</button>
			))}
		</fieldset>
	);
}

/** The edition picker, then a card per kind of look the edition has. */
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
			<EditionPicker templates={templates} look={look} onChange={onChange} />
			<Section title="Style" open>
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
			</Section>
			{isPostal && (
				<Section title="Stamp" hint={city.name}>
					<StampGrid value={city.slug} onChange={(slug) => setAxis('city', slug)} />
				</Section>
			)}
			{ART_FAMILIES.has(template.id) && (
				<Section title="Painting" hint={art.artist}>
					<Paintings value={look.art} onChange={(i) => onChange({ ...look, art: i })} />
				</Section>
			)}
		</>
	);
}
