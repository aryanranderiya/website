'use client';

import type { KeyboardEvent, PointerEvent } from 'react';
import { cn } from '@/lib/utils';
import { WEEKDAYS_SHORT } from './edition';
import type { WeekDay } from './types';

const MAX_TASKS = 15;
const SERIES = [
	{ key: 'you', label: 'You', className: 'bg-[var(--foreground)]' },
	{ key: 'gaia', label: 'GAIA', className: 'bg-[var(--accent-blue)]' },
] as const;

function Bar({
	value,
	onChange,
	label,
	className,
}: {
	value: number;
	onChange: (value: number) => void;
	label: string;
	className: string;
}) {
	const setFromPointer = (e: PointerEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const ratio = (rect.bottom - e.clientY) / rect.height;
		onChange(Math.max(0, Math.min(MAX_TASKS, Math.round(ratio * MAX_TASKS))));
	};
	const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		const delta = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[e.key];
		if (delta === undefined) return;
		e.preventDefault();
		onChange(Math.max(0, Math.min(MAX_TASKS, value + delta)));
	};
	return (
		<div
			role="slider"
			tabIndex={0}
			aria-label={label}
			aria-valuemin={0}
			aria-valuemax={MAX_TASKS}
			aria-valuenow={value}
			onPointerDown={(e) => {
				e.currentTarget.setPointerCapture(e.pointerId);
				setFromPointer(e);
			}}
			onPointerMove={(e) => e.buttons === 1 && setFromPointer(e)}
			onKeyDown={onKeyDown}
			className="relative h-full flex-1 cursor-ns-resize touch-none rounded-[4px] outline-none focus-visible:bg-[var(--muted-bg-strong)]"
		>
			<div
				className={cn(
					'absolute inset-x-0 bottom-0 rounded-[4px] transition-[height] duration-100',
					className
				)}
				// biome-ignore lint/style/noInlineStyles: dynamic bar height from the day value
				style={{ height: `${(value / MAX_TASKS) * 100}%` }}
			/>
		</div>
	);
}

/** Drag each bar to set how many tasks you and GAIA finished that day. */
export function WeekChart({
	days,
	onChange,
}: {
	days: WeekDay[];
	onChange: (days: WeekDay[]) => void;
}) {
	const set = (i: number, patch: Partial<WeekDay>) =>
		onChange(days.map((d, j) => (j === i ? { ...d, ...patch } : d)));
	return (
		<div className="flex flex-col gap-2 rounded-xl bg-[var(--muted-bg)] p-3">
			<div className="flex h-24 gap-2">
				{days.map((day, i) => (
					<div key={WEEKDAYS_SHORT[i]} className={cn('flex flex-1 gap-0.5', i > 4 && 'opacity-50')}>
						{SERIES.map((s) => (
							<Bar
								key={s.key}
								value={day[s.key]}
								onChange={(v) => set(i, { [s.key]: v })}
								label={`${WEEKDAYS_SHORT[i]}, tasks done by ${s.label}`}
								className={s.className}
							/>
						))}
					</div>
				))}
			</div>
			<div className="flex gap-2 text-[11px] text-[var(--text-ghost)]">
				{WEEKDAYS_SHORT.map((d) => (
					<span key={d} className="flex-1 text-center">
						{d}
					</span>
				))}
			</div>
			<div className="flex gap-3 text-[12px] text-[var(--text-secondary)]">
				{SERIES.map((s) => (
					<span key={s.key} className="flex items-center gap-1.5">
						<span className={cn('size-2 rounded-full', s.className)} />
						{s.label}
					</span>
				))}
			</div>
		</div>
	);
}
