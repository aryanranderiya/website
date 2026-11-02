'use client';

import { cn } from '@/lib/utils';
import { inputClass, RowList, Section, Switch } from './controls';
import { WEEKDAYS_SHORT } from './edition';
import type { Draft, Row } from './types';
import { WeekChart } from './WeekChart';

const countHint = (rows: Row[]) => String(rows.filter((r) => r.label.trim()).length);

export function ContentControls({
	draft,
	onChange,
	weekly,
}: {
	draft: Draft;
	onChange: (draft: Draft) => void;
	weekly: boolean;
}) {
	const set = (patch: Partial<Draft>) => onChange({ ...draft, ...patch });
	const week = (patch: Partial<Draft['week']>) => set({ week: { ...draft.week, ...patch } });
	const list = (title: string, rows: Row[], save: (rows: Row[]) => void) => (
		<Section title={title} hint={countHint(rows)}>
			<RowList label={title} rows={rows} onChange={save} create={() => ({ label: '' })} />
		</Section>
	);

	return (
		<>
			<Section title="Masthead">
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

			{list(weekly ? 'Still yours to call' : 'Needs you', draft.decisions, (decisions) =>
				set({ decisions })
			)}

			{weekly ? (
				<>
					<Section title="The week">
						<WeekChart days={draft.week.days} onChange={(days) => week({ days })} />
					</Section>
					<Section title="Ahead" hint={countHint(draft.week.ahead)}>
						<RowList
							label="Ahead"
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
										'w-14 shrink-0 appearance-none text-[var(--text-secondary)]'
									)}
								>
									{WEEKDAYS_SHORT.map((d) => (
										<option key={d}>{d}</option>
									))}
								</select>
							)}
						/>
					</Section>
					{list('Shipped', draft.week.shipped, (shipped) => week({ shipped }))}
					{list('Handled quietly', draft.week.handled, (handled) => week({ handled }))}
				</>
			) : (
				<>
					<Section title="Today" hint={countHint(draft.today)}>
						<RowList
							label="Today"
							rows={draft.today}
							onChange={(today) => set({ today })}
							create={() => ({ t24: '12:00', label: '' })}
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
					</Section>
					{list('Overnight', draft.overnight, (overnight) => set({ overnight }))}
					{list('In progress', draft.running, (running) => set({ running }))}
					<div className="flex items-center justify-between rounded-2xl bg-[var(--muted-bg)] px-4 py-3 text-[13px]">
						<span className="font-medium">Stats</span>
						<Switch label="Stats" checked={draft.stats} onChange={(stats) => set({ stats })} />
					</div>
				</>
			)}
		</>
	);
}
