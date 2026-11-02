'use client';

import { Cancel01Icon, HugeiconsIcon, PlusSignIcon } from '@icons';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { AxisOption, Row } from './types';

const COLOR_RE = /^(#[0-9a-f]{3,8}|rgba?\()/i;

/** An option's first two colour values: the swatch's ground and ink. */
export function optionColors(option: AxisOption): string[] {
	return Object.entries(option)
		.filter(([key, value]) => key !== 'id' && typeof value === 'string' && COLOR_RE.test(value))
		.map(([, value]) => String(value))
		.slice(0, 2);
}

export const labelClass = 'text-[12px] text-[var(--text-ghost)] first-letter:uppercase';

/** Borderless until hovered or focused: reads as text, edits like a field. */
export const inputClass =
	'min-w-0 rounded-md bg-transparent px-2 py-1 text-[13px] outline-none transition-colors placeholder:text-[var(--text-ghost)] hover:bg-[var(--muted-bg)] focus:bg-[var(--muted-bg)]';

/** A labelled row: the label on the left, its control on the right. */
export function Field({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div className="flex min-h-7 items-center gap-3">
			<span className={cn(labelClass, 'w-14 shrink-0')}>{label}</span>
			<div className="min-w-0 flex-1">{children}</div>
		</div>
	);
}

export function TextOptions({
	options,
	value,
	onChange,
	label,
}: {
	options: { id: string; label: string }[];
	value: string;
	onChange: (id: string) => void;
	label: string;
}) {
	return (
		<fieldset className="flex flex-wrap gap-x-3 gap-y-1">
			<legend className="sr-only">{label}</legend>
			{options.map((o) => (
				<button
					key={o.id}
					type="button"
					aria-pressed={o.id === value}
					onClick={() => onChange(o.id)}
					className={cn(
						'text-[13px] transition-colors',
						o.id === value
							? 'text-[var(--foreground)]'
							: 'text-[var(--text-ghost)] hover:text-[var(--text-secondary)]'
					)}
				>
					{o.label}
				</button>
			))}
		</fieldset>
	);
}

export function Swatches({
	options,
	value,
	onChange,
	label,
}: {
	options: AxisOption[];
	value: string;
	onChange: (id: string) => void;
	label: string;
}) {
	return (
		<fieldset className="flex flex-wrap gap-1">
			<legend className="sr-only">{label}</legend>
			{options.map((o) => {
				const [ground, ink = ground] = optionColors(o);
				return (
					<button
						key={o.id}
						type="button"
						aria-pressed={o.id === value}
						aria-label={o.label}
						title={o.label}
						onClick={() => onChange(o.id)}
						className={cn(
							'size-6 rounded-full p-[3px] transition-colors',
							o.id === value ? 'bg-[var(--foreground)]' : 'hover:bg-[var(--muted-bg-strong)]'
						)}
					>
						<span
							className="block size-full rounded-full"
							// biome-ignore lint/style/noInlineStyles: dynamic two-tone swatch from the template axis colours
							style={{
								background: `linear-gradient(135deg, ${ground} 50%, ${ink} 50%)`,
							}}
						/>
					</button>
				);
			})}
		</fieldset>
	);
}

export function Switch({
	checked,
	onChange,
	label,
}: {
	checked: boolean;
	onChange: (checked: boolean) => void;
	label: string;
}) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			aria-label={label}
			onClick={() => onChange(!checked)}
			className={cn(
				'relative h-4 w-7 shrink-0 rounded-full transition-colors',
				checked ? 'bg-[var(--foreground)]' : 'bg-[var(--muted-bg-strong)]'
			)}
		>
			<span
				className={cn(
					'absolute top-0.5 left-0.5 size-3 rounded-full bg-[var(--background)] transition-transform',
					checked && 'translate-x-3'
				)}
			/>
		</button>
	);
}

export function IconButton({
	label,
	onClick,
	className,
	children,
}: {
	label: string;
	onClick: () => void;
	className?: string;
	children: ReactNode;
}) {
	return (
		<button
			type="button"
			aria-label={label}
			title={label}
			onClick={onClick}
			className={cn(
				'flex size-7 shrink-0 items-center justify-center rounded-lg text-[var(--text-ghost)] transition-colors hover:text-[var(--foreground)]',
				className
			)}
		>
			{children}
		</button>
	);
}

/** A labelled, editable list of one-line rows; `lead` renders a field before the text. */
export function RowList<T extends Row>({
	label,
	rows,
	onChange,
	create,
	lead,
}: {
	label: string;
	rows: T[];
	onChange: (rows: T[]) => void;
	create: () => Omit<T, 'id'>;
	lead?: (row: T, update: (patch: Partial<T>) => void) => ReactNode;
}) {
	const update = (id: string, patch: Partial<T>) =>
		onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
	return (
		<div className="flex flex-col">
			<div className="flex items-center justify-between">
				<span className={labelClass}>{label}</span>
				<IconButton
					label={`Add to ${label.toLowerCase()}`}
					onClick={() => onChange([...rows, { ...create(), id: crypto.randomUUID() } as T])}
					className="size-6"
				>
					<HugeiconsIcon icon={PlusSignIcon} size={12} />
				</IconButton>
			</div>
			{rows.map((row) => (
				<div key={row.id} className="group -ml-2 flex items-start">
					{lead?.(row, (patch) => update(row.id, patch))}
					<textarea
						aria-label={label}
						rows={1}
						value={row.label}
						onChange={(e) => update(row.id, { label: e.target.value } as Partial<T>)}
						className={cn(inputClass, '[field-sizing:content] flex-1 resize-none')}
					/>
					<IconButton
						label="Remove"
						onClick={() => onChange(rows.filter((r) => r.id !== row.id))}
						className="size-6 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
					>
						<HugeiconsIcon icon={Cancel01Icon} size={11} />
					</IconButton>
				</div>
			))}
		</div>
	);
}
