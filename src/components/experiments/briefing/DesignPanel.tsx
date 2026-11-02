'use client';

import { cn } from '@/lib/utils';
import { Group, optionColors, Segmented, Swatches } from './controls';
import {
	ART_FAMILIES,
	ARTWORKS,
	displayName,
	POSTAL_FAMILY,
	STAMPS,
	WEEKLY_FAMILY,
} from './edition';
import type { Look, Template } from './types';

// Cloudinary delivery transform: a small thumbnail instead of the full stamp art.
const stampThumb = (url: string) => url.replace('/upload/', '/upload/w_112,q_auto/');

function EditionList({
	templates,
	value,
	onChange,
}: {
	templates: Template[];
	value: string;
	onChange: (template: Template) => void;
}) {
	const item = (t: Template) => (
		<button
			key={t.id}
			type="button"
			aria-pressed={t.id === value}
			onClick={() => onChange(t)}
			className={cn(
				'rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-colors',
				t.id === value
					? 'bg-[var(--muted-bg-strong)] text-[var(--foreground)]'
					: 'text-[var(--text-secondary)] hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)]'
			)}
		>
			{displayName(t)}
		</button>
	);
	const daily = templates.filter((t) => t.id !== WEEKLY_FAMILY);
	const weekly = templates.filter((t) => t.id === WEEKLY_FAMILY);
	return (
		<fieldset className="flex flex-col gap-3">
			<legend className="sr-only">Edition</legend>
			<div className="grid grid-cols-2 gap-0.5">{daily.map(item)}</div>
			<div className="flex flex-col gap-1">
				<span className="px-2.5 text-[12px] text-[var(--text-ghost)]">Weekly recap</span>
				<div className="grid grid-cols-2 gap-0.5">{weekly.map(item)}</div>
			</div>
		</fieldset>
	);
}

function StampPicker({ value, onChange }: { value: string; onChange: (slug: string) => void }) {
	return (
		<fieldset className="grid max-h-48 grid-cols-6 gap-1.5 overflow-y-auto rounded-xl bg-[var(--muted-bg)] p-2">
			<legend className="sr-only">Stamp city</legend>
			{STAMPS.map((s) => (
				<button
					key={s.slug}
					type="button"
					aria-pressed={s.slug === value}
					aria-label={s.name}
					title={`${s.name}, ${s.country}`}
					onClick={() => onChange(s.slug)}
					className={cn(
						'aspect-[4/5] overflow-hidden rounded-md transition-opacity',
						s.slug === value ? 'opacity-100' : 'opacity-45 hover:opacity-100'
					)}
				>
					<img src={stampThumb(s.url)} alt="" loading="lazy" className="size-full object-cover" />
				</button>
			))}
		</fieldset>
	);
}

function PaintingPicker({ value, onChange }: { value: number; onChange: (index: number) => void }) {
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

export function DesignPanel({
	templates,
	template,
	look,
	onChange,
}: {
	templates: Template[];
	template: Template;
	look: Look;
	onChange: (look: Look) => void;
}) {
	const axes = Object.entries(template.axes).filter(
		([axis]) => !(template.id === POSTAL_FAMILY && axis === 'city')
	);
	const stamp = STAMPS.find((s) => s.slug === look.stamp);
	const art = ARTWORKS[look.art];

	return (
		<div className="flex flex-col gap-7">
			<Group label="Edition" hint={`${templates.length} styles`}>
				<EditionList
					templates={templates}
					value={look.family}
					onChange={(t) => onChange({ ...look, family: t.id, skin: {} })}
				/>
			</Group>

			{axes.map(([axis, options]) => {
				const value = look.skin[axis] ?? options[0].id;
				const selected = options.find((o) => o.id === value) ?? options[0];
				const set = (id: string) => onChange({ ...look, skin: { ...look.skin, [axis]: id } });
				const isColor = options.every((o) => optionColors(o).length > 0);
				return (
					<Group key={axis} label={axis} hint={isColor ? selected.label : undefined}>
						{isColor ? (
							<Swatches options={options} value={value} onChange={set} label={axis} />
						) : (
							<Segmented
								options={options.map((o) => ({
									id: o.id,
									label: o.label.replace(`${axis}: `, ''),
								}))}
								value={value}
								onChange={set}
								label={axis}
							/>
						)}
					</Group>
				);
			})}

			{template.id === POSTAL_FAMILY && (
				<Group label="Stamp" hint={stamp && `${stamp.name}, ${stamp.country}`}>
					<StampPicker value={look.stamp} onChange={(slug) => onChange({ ...look, stamp: slug })} />
				</Group>
			)}

			{ART_FAMILIES.has(template.id) && (
				<Group label="Painting" hint={`${art.artist}, ${art.year}`}>
					<PaintingPicker value={look.art} onChange={(i) => onChange({ ...look, art: i })} />
				</Group>
			)}
		</div>
	);
}
