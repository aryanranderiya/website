'use client';

import { cn } from '@/lib/utils';
import { fieldClass, Group, RowList, Stepper, Switch } from './controls';
import { DECISION_VERBS, formatFocus, WEEKDAYS_SHORT } from './edition';
import type { Draft } from './types';
import { WeekChart } from './WeekChart';

type Patch = (patch: Partial<Draft>) => void;

const timeClass = cn(fieldClass, 'w-[5.5rem] shrink-0 tabular-nums');
const selectClass = cn(fieldClass, 'w-[5.5rem] shrink-0 appearance-none');

function Masthead({ draft, set }: { draft: Draft; set: Patch }) {
	return (
		<Group label="Masthead">
			<textarea
				aria-label="Headline"
				value={draft.deck}
				onChange={(e) => set({ deck: e.target.value })}
				rows={3}
				className={`${fieldClass} resize-none leading-relaxed`}
			/>
			<input
				aria-label="Addressed to"
				placeholder="Addressed to"
				value={draft.recipient}
				onChange={(e) => set({ recipient: e.target.value })}
				className={fieldClass}
			/>
			<div className="flex gap-1.5">
				<input
					type="date"
					aria-label="Date"
					value={draft.date}
					onChange={(e) => e.target.value && set({ date: e.target.value })}
					className={fieldClass}
				/>
				<input
					type="time"
					aria-label="Sent at"
					value={draft.sentAt}
					onChange={(e) => e.target.value && set({ sentAt: e.target.value })}
					className={timeClass}
				/>
			</div>
			<Stepper
				label="Edition number"
				value={draft.editionNo}
				onChange={(editionNo) => set({ editionNo: Math.max(1, editionNo) })}
				max={999}
			/>
		</Group>
	);
}

function DailySections({ draft, set }: { draft: Draft; set: Patch }) {
	return (
		<>
			<Group label="Needs you">
				<RowList
					noun="ask"
					rows={draft.decisions}
					onChange={(decisions) => set({ decisions })}
					create={() => ({ verb: 'Review', label: '' })}
					renderRow={(row, update) => (
						<>
							<select
								aria-label="Verb"
								value={row.verb}
								onChange={(e) => update({ verb: e.target.value })}
								className={selectClass}
							>
								{DECISION_VERBS.map((v) => (
									<option key={v}>{v}</option>
								))}
							</select>
							<input
								aria-label="Ask"
								value={row.label}
								onChange={(e) => update({ label: e.target.value })}
								className={fieldClass}
							/>
						</>
					)}
				/>
			</Group>
			<Group label="On today">
				<RowList
					noun="event"
					rows={draft.today}
					onChange={(today) => set({ today })}
					create={() => ({ t24: '12:00', label: '', note: '' })}
					renderRow={(row, update) => (
						<>
							<input
								type="time"
								aria-label="Time"
								value={row.t24}
								onChange={(e) => update({ t24: e.target.value })}
								className={timeClass}
							/>
							<input
								aria-label="Event"
								value={row.label}
								onChange={(e) => update({ label: e.target.value })}
								className={fieldClass}
							/>
						</>
					)}
				/>
			</Group>
			<Group label="Done overnight">
				<RowList
					noun="task"
					rows={draft.overnight}
					onChange={(overnight) => set({ overnight })}
					create={() => ({ t24: '04:00', label: '' })}
					renderRow={(row, update) => (
						<>
							<input
								type="time"
								aria-label="Finished at"
								value={row.t24}
								onChange={(e) => update({ t24: e.target.value })}
								className={timeClass}
							/>
							<input
								aria-label="Task"
								value={row.label}
								onChange={(e) => update({ label: e.target.value })}
								className={fieldClass}
							/>
						</>
					)}
				/>
			</Group>
			<Group label="Still running">
				<RowList
					noun="task"
					rows={draft.running}
					onChange={(running) => set({ running })}
					create={() => ({ label: '' })}
					max={3}
					renderRow={(row, update) => (
						<input
							aria-label="Task"
							value={row.label}
							onChange={(e) => update({ label: e.target.value })}
							className={fieldClass}
						/>
					)}
				/>
			</Group>
			<Group
				label="Figures"
				action={
					<Switch
						label="Show figures"
						checked={draft.figures.show}
						onChange={(show) => set({ figures: { ...draft.figures, show } })}
					/>
				}
			>
				{draft.figures.show && (
					<div className="flex flex-col gap-2">
						{(
							[
								['you', 'Done by you', 30, 1],
								['gaia', 'Done by GAIA', 60, 1],
								['mail', 'Emails handled', 200, 5],
								['focusMinutes', 'Focus time', 480, 15],
							] as const
						).map(([key, label, max, step]) => (
							<Stepper
								key={key}
								label={label}
								value={draft.figures[key]}
								max={max}
								step={step}
								format={key === 'focusMinutes' ? formatFocus : String}
								onChange={(v) => set({ figures: { ...draft.figures, [key]: v } })}
							/>
						))}
					</div>
				)}
			</Group>
		</>
	);
}

function WeeklySections({ draft, set }: { draft: Draft; set: Patch }) {
	const week = (patch: Partial<Draft['week']>) => set({ week: { ...draft.week, ...patch } });
	const labelRow = (row: { label: string }, update: (p: { label: string }) => void) => (
		<input
			aria-label="Item"
			value={row.label}
			onChange={(e) => update({ label: e.target.value })}
			className={fieldClass}
		/>
	);
	return (
		<>
			<Group label="The numbers" hint="drag the bars">
				<WeekChart days={draft.week.days} onChange={(days) => week({ days })} />
			</Group>
			<Group label="Still yours to call">
				<RowList
					noun="ask"
					rows={draft.decisions}
					onChange={(decisions) => set({ decisions })}
					create={() => ({ verb: 'Review', label: '' })}
					renderRow={labelRow}
				/>
			</Group>
			<Group label="The week ahead">
				<RowList
					noun="day"
					rows={draft.week.ahead}
					onChange={(ahead) => week({ ahead })}
					create={() => ({ day: 'Mon', label: '' })}
					renderRow={(row, update) => (
						<>
							<select
								aria-label="Day"
								value={row.day}
								onChange={(e) => update({ day: e.target.value })}
								className={selectClass}
							>
								{WEEKDAYS_SHORT.map((d) => (
									<option key={d}>{d}</option>
								))}
							</select>
							{labelRow(row, update)}
						</>
					)}
				/>
			</Group>
			<Group label="Shipped this week">
				<RowList
					noun="item"
					rows={draft.week.shipped}
					onChange={(shipped) => week({ shipped })}
					create={() => ({ label: '' })}
					renderRow={labelRow}
				/>
			</Group>
			<Group label="Handled quietly">
				<RowList
					noun="item"
					rows={draft.week.handled}
					onChange={(handled) => week({ handled })}
					create={() => ({ label: '' })}
					renderRow={labelRow}
				/>
			</Group>
		</>
	);
}

export function ContentPanel({
	draft,
	onChange,
	weekly,
}: {
	draft: Draft;
	onChange: (draft: Draft) => void;
	weekly: boolean;
}) {
	const set: Patch = (patch) => onChange({ ...draft, ...patch });
	return (
		<div className="flex flex-col gap-7">
			<Masthead draft={draft} set={set} />
			{weekly ? (
				<WeeklySections draft={draft} set={set} />
			) : (
				<DailySections draft={draft} set={set} />
			)}
		</div>
	);
}
