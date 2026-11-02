'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { cardClass, Field, inputClass, RowList, Section, Switch } from './controls';
import { MAX_ASKS, MAX_EVENTS, WEEKDAYS_SHORT } from './edition';
import type { Draft, Headings, Row, SectionKey } from './types';
import { WeekChart } from './WeekChart';

/** Used until the edition reports its own heading, or when it prints none. */
const FALLBACK_TITLES: Record<SectionKey, string> = {
	decisions: 'Needs you',
	today: 'Today',
	overnight: 'Overnight',
	running: 'In progress',
	ahead: 'The week ahead',
	shipped: 'Shipped',
	handled: 'Handled quietly',
};

const countHint = (rows: Row[]) => String(rows.filter((r) => r.label.trim()).length);

export function ContentControls({
	draft,
	onChange,
	weekly,
	headings,
	renames,
	onRename,
}: {
	draft: Draft;
	onChange: (draft: Draft) => void;
	weekly: boolean;
	/** The edition's own section headings. */
	headings: Headings;
	/** The reader's renames for this edition. */
	renames: Headings;
	onRename: (section: SectionKey, text: string) => void;
}) {
	const set = (patch: Partial<Draft>) => onChange({ ...draft, ...patch });
	const week = (patch: Partial<Draft['week']>) => set({ week: { ...draft.week, ...patch } });

	/** One list's card: titled with the edition's own heading, which can be renamed here. */
	const section = (key: SectionKey, rows: Row[], body: ReactNode) => {
		const own = headings[key];
		return (
			<Section title={renames[key] || own || FALLBACK_TITLES[key]} hint={countHint(rows)}>
				{own && (
					<Field label="Heading">
						<input
							aria-label={`${FALLBACK_TITLES[key]} heading`}
							value={renames[key] ?? ''}
							placeholder={own}
							onChange={(e) => onRename(key, e.target.value)}
							className={cn(inputClass, '-mx-2 w-[calc(100%+1rem)]')}
						/>
					</Field>
				)}
				{body}
			</Section>
		);
	};
	const list = (key: SectionKey, rows: Row[], save: (rows: Row[]) => void, max?: number) =>
		section(
			key,
			rows,
			<RowList
				label={FALLBACK_TITLES[key]}
				rows={rows}
				onChange={save}
				create={() => ({ label: '' })}
				max={max}
			/>
		);

	return (
		<div className={cn(cardClass, 'flex flex-col py-1')}>
			<Section title="Masthead" open>
				<div className="-mx-2 flex flex-col">
					<textarea
						aria-label="Headline"
						value={draft.deck}
						onChange={(e) => set({ deck: e.target.value })}
						className={cn(inputClass, '[field-sizing:content] resize-none leading-relaxed')}
					/>
					<input
						aria-label="Addressed to"
						placeholder="Addressed to"
						value={draft.recipient}
						onChange={(e) => set({ recipient: e.target.value })}
						className={inputClass}
					/>
					<input
						type="date"
						aria-label="Date"
						value={draft.date}
						onChange={(e) => e.target.value && set({ date: e.target.value })}
						className={cn(inputClass, 'w-fit text-[var(--text-secondary)]')}
					/>
				</div>
			</Section>

			{list('decisions', draft.decisions, (decisions) => set({ decisions }), MAX_ASKS)}

			{weekly ? (
				<>
					<Section title="The numbers">
						<WeekChart days={draft.week.days} onChange={(days) => week({ days })} />
					</Section>
					{section(
						'ahead',
						draft.week.ahead,
						<RowList
							label={FALLBACK_TITLES.ahead}
							rows={draft.week.ahead}
							onChange={(ahead) => week({ ahead })}
							create={() => ({ day: 'Mon', label: '' })}
							lead={(row, update) => (
								<select
									aria-label="Day"
									value={row.day}
									onChange={(e) => update({ day: e.target.value })}
									className={cn(
										inputClass,
										'w-14 shrink-0 cursor-pointer appearance-none text-[var(--text-secondary)]'
									)}
								>
									{WEEKDAYS_SHORT.map((d) => (
										<option key={d}>{d}</option>
									))}
								</select>
							)}
						/>
					)}
					{list('shipped', draft.week.shipped, (shipped) => week({ shipped }))}
					{list('handled', draft.week.handled, (handled) => week({ handled }))}
				</>
			) : (
				<>
					{section(
						'today',
						draft.today,
						<RowList
							label={FALLBACK_TITLES.today}
							rows={draft.today}
							onChange={(today) => set({ today })}
							create={() => ({ t24: '12:00', label: '' })}
							max={MAX_EVENTS}
							lead={(row, update) => (
								<input
									type="time"
									aria-label="Time"
									value={row.t24}
									onChange={(e) => update({ t24: e.target.value })}
									className={cn(
										inputClass,
										'w-[5.5rem] shrink-0 text-[var(--text-secondary)] tabular-nums'
									)}
								/>
							)}
						/>
					)}
					{list('overnight', draft.overnight, (overnight) => set({ overnight }))}
					{list('running', draft.running, (running) => set({ running }))}
					<div className="flex items-center justify-between px-4 py-3 text-[13px]">
						<span className="font-medium">Stats</span>
						<Switch label="Stats" checked={draft.stats} onChange={(stats) => set({ stats })} />
					</div>
				</>
			)}
		</div>
	);
}
