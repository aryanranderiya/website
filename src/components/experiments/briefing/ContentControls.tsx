'use client';

import { cn } from '@/lib/utils';
import { inputClass, labelClass, RowList, Switch } from './controls';
import { WEEKDAYS_SHORT } from './edition';
import type { Draft } from './types';
import { WeekChart } from './WeekChart';

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

	return (
		<div className="flex flex-col gap-4">
			<div className="-mx-2 flex flex-col">
				<textarea
					aria-label="Headline"
					value={draft.deck}
					onChange={(e) => set({ deck: e.target.value })}
					className={cn(inputClass, 'resize-none leading-relaxed font-medium')}
				/>
				<div className="flex">
					<input
						aria-label="Addressed to"
						placeholder="Addressed to"
						value={draft.recipient}
						onChange={(e) => set({ recipient: e.target.value })}
						className={cn(inputClass, 'flex-1')}
					/>
					<input
						type="date"
						aria-label="Date"
						value={draft.date}
						onChange={(e) => e.target.value && set({ date: e.target.value })}
						className={cn(inputClass, 'text-[var(--text-secondary)]')}
					/>
				</div>
			</div>

			<RowList
				label={weekly ? 'Still yours to call' : 'Needs you'}
				rows={draft.decisions}
				onChange={(decisions) => set({ decisions })}
				create={() => ({ label: '' })}
			/>

			{weekly ? (
				<>
					<div className="flex flex-col gap-1.5">
						<span className={labelClass}>The week</span>
						<WeekChart days={draft.week.days} onChange={(days) => week({ days })} />
					</div>
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
					<RowList
						label="Shipped"
						rows={draft.week.shipped}
						onChange={(shipped) => week({ shipped })}
						create={() => ({ label: '' })}
					/>
					<RowList
						label="Handled quietly"
						rows={draft.week.handled}
						onChange={(handled) => week({ handled })}
						create={() => ({ label: '' })}
					/>
				</>
			) : (
				<>
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
					<RowList
						label="Overnight"
						rows={draft.overnight}
						onChange={(overnight) => set({ overnight })}
						create={() => ({ label: '' })}
					/>
					<RowList
						label="In progress"
						rows={draft.running}
						onChange={(running) => set({ running })}
						create={() => ({ label: '' })}
					/>
					<div className="flex items-center justify-between">
						<span className={labelClass}>Stats</span>
						<Switch label="Stats" checked={draft.stats} onChange={(stats) => set({ stats })} />
					</div>
				</>
			)}
		</div>
	);
}
