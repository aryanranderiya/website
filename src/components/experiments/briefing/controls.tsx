'use client';

import { Cancel01Icon, HugeiconsIcon, MinusSignIcon, PlusSignIcon } from '@icons';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { AxisOption } from './types';

const COLOR_RE = /^(#[0-9a-f]{3,8}|rgba?\()/i;

/** An option's first two colour values: the swatch's ground and ink. */
export function optionColors(option: AxisOption): string[] {
	return Object.entries(option)
		.filter(([key, value]) => key !== 'id' && typeof value === 'string' && COLOR_RE.test(value))
		.map(([, value]) => String(value))
		.slice(0, 2);
}

export function Group({
	label,
	hint,
	action,
	children,
}: {
	label: string;
	hint?: string;
	action?: ReactNode;
	children: ReactNode;
}) {
	return (
		<section className="flex flex-col gap-2.5">
			<div className="flex min-h-6 items-center justify-between gap-2">
				<h3 className="text-[13px] font-medium first-letter:uppercase">
					{label}
					{hint && <span className="ml-1.5 font-normal text-[var(--text-ghost)]">{hint}</span>}
				</h3>
				{action}
			</div>
			{children}
		</section>
	);
}

export function Segmented<T extends string>({
	options,
	value,
	onChange,
	label,
}: {
	options: { id: T; label: string }[];
	value: T;
	onChange: (id: T) => void;
	label: string;
}) {
	return (
		<fieldset className="flex rounded-xl bg-[var(--muted-bg)] p-1">
			<legend className="sr-only">{label}</legend>
			{options.map((o) => (
				<button
					key={o.id}
					type="button"
					aria-pressed={o.id === value}
					onClick={() => onChange(o.id)}
					className={cn(
						'flex-1 truncate rounded-lg px-2.5 py-1.5 text-[13px] transition-colors',
						o.id === value
							? 'bg-[var(--background)] text-[var(--foreground)] shadow-[0_1px_2px_rgba(0,0,0,0.08)]'
							: 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
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
		<fieldset className="flex flex-wrap gap-2">
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
							'size-7 rounded-full p-0.5 transition-transform hover:scale-110',
							o.id === value && 'bg-[var(--foreground)]'
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

export function Stepper({
	label,
	value,
	onChange,
	step = 1,
	max,
	format = String,
}: {
	label: string;
	value: number;
	onChange: (value: number) => void;
	step?: number;
	max: number;
	format?: (value: number) => string;
}) {
	const set = (v: number) => onChange(Math.max(0, Math.min(max, v)));
	return (
		<div className="flex items-center justify-between gap-3 text-[13px]">
			<span className="text-[var(--text-secondary)]">{label}</span>
			<div className="flex items-center rounded-xl bg-[var(--muted-bg)]">
				<IconButton
					label={`Decrease ${label}`}
					onClick={() => set(value - step)}
					disabled={value <= 0}
				>
					<HugeiconsIcon icon={MinusSignIcon} size={12} />
				</IconButton>
				<span className="w-14 text-center tabular-nums">{value > 0 ? format(value) : 'None'}</span>
				<IconButton
					label={`Increase ${label}`}
					onClick={() => set(value + step)}
					disabled={value >= max}
				>
					<HugeiconsIcon icon={PlusSignIcon} size={12} />
				</IconButton>
			</div>
		</div>
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
				'relative h-5 w-9 rounded-full transition-colors',
				checked ? 'bg-[var(--foreground)]' : 'bg-[var(--muted-bg-strong)]'
			)}
		>
			<span
				className={cn(
					'absolute top-0.5 left-0.5 size-4 rounded-full bg-[var(--background)] transition-transform',
					checked && 'translate-x-4'
				)}
			/>
		</button>
	);
}

export function IconButton({
	label,
	onClick,
	disabled,
	className,
	children,
}: {
	label: string;
	onClick: () => void;
	disabled?: boolean;
	className?: string;
	children: ReactNode;
}) {
	return (
		<button
			type="button"
			aria-label={label}
			title={label}
			onClick={onClick}
			disabled={disabled}
			className={cn(
				'flex size-7 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--muted-bg-strong)] hover:text-[var(--foreground)] disabled:pointer-events-none disabled:opacity-30',
				className
			)}
		>
			{children}
		</button>
	);
}

export const fieldClass =
	'w-full min-w-0 rounded-lg bg-[var(--muted-bg)] px-2.5 py-1.5 text-[13px] outline-none transition-colors placeholder:text-[var(--text-ghost)] focus:bg-[var(--muted-bg-strong)]';

/** An editable list: each row renders its own fields; rows can be removed and added. */
export function RowList<T extends { id: string }>({
	rows,
	onChange,
	create,
	renderRow,
	max = 6,
	noun,
}: {
	rows: T[];
	onChange: (rows: T[]) => void;
	create: () => Omit<T, 'id'>;
	renderRow: (row: T, update: (patch: Partial<T>) => void) => ReactNode;
	max?: number;
	noun: string;
}) {
	const update = (id: string, patch: Partial<T>) =>
		onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
	return (
		<div className="flex flex-col gap-1.5">
			{rows.map((row) => (
				<div key={row.id} className="group flex items-center gap-1.5">
					{renderRow(row, (patch) => update(row.id, patch))}
					<IconButton
						label={`Remove ${noun}`}
						onClick={() => onChange(rows.filter((r) => r.id !== row.id))}
						className="shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
					>
						<HugeiconsIcon icon={Cancel01Icon} size={12} />
					</IconButton>
				</div>
			))}
			{rows.length < max && (
				<button
					type="button"
					onClick={() => onChange([...rows, { ...create(), id: crypto.randomUUID() } as T])}
					className="flex w-fit items-center gap-1.5 rounded-lg px-1 py-1 text-[13px] text-[var(--text-ghost)] transition-colors hover:text-[var(--foreground)]"
				>
					<HugeiconsIcon icon={PlusSignIcon} size={12} />
					Add {noun}
				</button>
			)}
		</div>
	);
}
