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
import { Field, IconButton, optionColors, Swatches, TextOptions } from './controls';
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

function Thumbs<T>({
	items,
	value,
	onChange,
	src,
	title,
	label,
	className,
}: {
	items: readonly T[];
	value: T;
	onChange: (item: T) => void;
	src: (item: T) => string;
	title: (item: T) => string;
	label: string;
	className: string;
}) {
	return (
		<fieldset className="flex [scrollbar-width:thin] gap-1.5 overflow-x-auto overscroll-x-contain pb-1">
			<legend className="sr-only">{label}</legend>
			{items.map((item) => (
				<button
					key={src(item)}
					type="button"
					aria-pressed={item === value}
					aria-label={title(item)}
					title={title(item)}
					onClick={() => onChange(item)}
					className={cn(
						'shrink-0 overflow-hidden transition-opacity',
						className,
						item === value ? 'opacity-100' : 'opacity-40 hover:opacity-80'
					)}
				>
					<img src={src(item)} alt="" loading="lazy" className="size-full object-cover" />
				</button>
			))}
		</fieldset>
	);
}

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
	const axes = Object.entries(template.axes).filter(
		([axis]) => !(template.id === POSTAL_FAMILY && axis === 'city')
	);
	const stamp = STAMPS.find((s) => s.slug === look.stamp) ?? STAMPS[0];

	return (
		<div className="flex flex-col gap-1.5">
			<EditionPicker templates={templates} look={look} onChange={onChange} />
			{axes.map(([axis, options]) => {
				const value = look.skin[axis] ?? options[0].id;
				const set = (id: string) => onChange({ ...look, skin: { ...look.skin, [axis]: id } });
				return (
					<Field key={axis} label={axis}>
						{options.every((o) => optionColors(o).length > 0) ? (
							<Swatches options={options} value={value} onChange={set} label={axis} />
						) : (
							<TextOptions
								options={options.map((o) => ({
									id: o.id,
									label: o.label.replace(`${axis}: `, ''),
								}))}
								value={value}
								onChange={set}
								label={axis}
							/>
						)}
					</Field>
				);
			})}
			{template.id === POSTAL_FAMILY && (
				<Thumbs
					label="Stamp"
					items={STAMPS}
					value={stamp}
					onChange={(s) => onChange({ ...look, stamp: s.slug })}
					src={(s) => stampImage(s, 96)}
					title={(s) => `${s.name}, ${s.country}`}
					className="h-12 w-9"
				/>
			)}
			{ART_FAMILIES.has(template.id) && (
				<Thumbs
					label="Painting"
					items={ARTWORKS}
					value={ARTWORKS[look.art]}
					onChange={(a) => onChange({ ...look, art: ARTWORKS.indexOf(a) })}
					src={(a) => a.src}
					title={(a) => `${a.title}, ${a.artist}`}
					className="size-10 rounded-md"
				/>
			)}
		</div>
	);
}
