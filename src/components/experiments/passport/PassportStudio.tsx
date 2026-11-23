'use client';

import {
	Cursor02Icon,
	Delete02Icon,
	DicesIcon,
	HugeiconsIcon,
	PlusSignIcon,
	RefreshIcon,
	ShuffleIcon,
} from '@icons';
import { useEffect, useRef, useState } from 'react';
import { CountrySelect } from './CountrySelect';
import { COUNTRIES, COUNTRY_BY_CODE } from './data/countries';
import { PassportPage } from './PassportPage';
import {
	addEntry,
	initialEntries,
	MAX_STAMPS,
	randomSeed,
	reinkEntries,
	type StampEntry,
	shuffleEntries,
} from './state';
import './studio.css';

const INITIAL = ['jp', 'ke', 'th', 'br', 'za', 'pl', 'no'];

export default function PassportStudio() {
	const [entries, setEntries] = useState<StampEntry[]>(() => initialEntries(INITIAL));
	const pageSeed = useRef(197);
	const [notice, setNotice] = useState('');
	const [arranging, setArranging] = useState(false);
	const [canUndo, setCanUndo] = useState(false);
	const cleared = useRef<StampEntry[] | null>(null);
	const noticeTimer = useRef<number | null>(null);

	const announce = (message: string) => {
		setNotice(message);
		if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
		noticeTimer.current = window.setTimeout(() => setNotice(''), 3200);
	};

	useEffect(() => {
		return () => {
			if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
		};
	}, []);

	const selected = entries.map((entry) => entry.code);
	const full = entries.length >= MAX_STAMPS;

	const add = (code: string) => {
		if (entries.some((entry) => entry.code === code)) return;
		setCanUndo(false);
		cleared.current = null;
		if (full) {
			announce(`Page full. ${MAX_STAMPS} stamps is the limit.`);
			return;
		}
		const country = COUNTRY_BY_CODE[code];
		setEntries((current) => [...current, addEntry(code, current, pageSeed.current)]);
		if (country) announce(`${country.name} stamped.`);
	};

	const remove = (code: string) => {
		const country = COUNTRY_BY_CODE[code];
		setEntries((current) => current.filter((entry) => entry.code !== code));
		if (country) announce(`${country.name} removed.`);
	};

	const toggle = (code: string) => {
		if (selected.includes(code)) remove(code);
		else add(code);
	};

	const move = (code: string, x: number, y: number) => {
		setEntries((current) =>
			current.map((entry) => (entry.code === code ? { ...entry, x, y } : entry))
		);
	};

	const redate = () => {
		setCanUndo(false);
		cleared.current = null;
		const nextSeed = randomSeed();
		pageSeed.current = nextSeed;
		setEntries((current) => reinkEntries(current, nextSeed));
		announce('New dates pressed.');
	};

	const shuffle = () => {
		setCanUndo(false);
		cleared.current = null;
		const nextSeed = randomSeed();
		pageSeed.current = nextSeed;
		setEntries((current) => shuffleEntries(current, nextSeed));
		announce('Layout shuffled.');
	};

	const clear = () => {
		if (!entries.length) return;
		cleared.current = entries;
		setCanUndo(true);
		setEntries([]);
		announce('Page cleared.');
		window.requestAnimationFrame(() => {
			document.getElementById('passport-country-trigger')?.focus();
		});
	};

	const undoClear = () => {
		if (!cleared.current) return;
		setEntries(cleared.current);
		setCanUndo(false);
		cleared.current = null;
		announce('Page restored.');
	};

	const addRandom = () => {
		setCanUndo(false);
		cleared.current = null;
		const room = MAX_STAMPS - entries.length;
		if (room <= 0) {
			announce('Page full. Remove a stamp first.');
			return;
		}
		const pool = COUNTRIES.filter((country) => !selected.includes(country.code));
		const shuffled = [...pool];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		shuffled.length = Math.min(3, room);
		if (shuffled.length === 0) return;
		setEntries((current) => {
			const next = [...current];
			for (const country of shuffled) {
				if (next.length >= MAX_STAMPS) break;
				next.push(addEntry(country.code, next, pageSeed.current));
			}
			return next;
		});
		announce(`${shuffled.length} stamp${shuffled.length === 1 ? '' : 's'} added.`);
	};

	return (
		<div className="passport-studio">
			<div className="passport-stage">
				<div className="passport-mobile-bar">
					<button
						type="button"
						className="passport-mobile-action"
						onClick={() => {
							const trigger = document.getElementById('passport-country-trigger');
							trigger?.scrollIntoView({ behavior: 'smooth', block: 'center' });
							window.setTimeout(() => trigger?.click(), 220);
						}}
					>
						<HugeiconsIcon icon={PlusSignIcon} size={14} />
						Add a country
					</button>
					<button
						type="button"
						className={arranging ? 'passport-mobile-action is-on' : 'passport-mobile-action'}
						aria-pressed={arranging}
						onClick={() => setArranging((value) => !value)}
					>
						<HugeiconsIcon icon={Cursor02Icon} size={14} />
						{arranging ? 'Done' : 'Arrange'}
					</button>
				</div>
				<PassportPage entries={entries} onMove={move} onRemove={remove} arranging={arranging} />
			</div>

			<aside className="passport-controls" aria-label="Passport controls">
				<div className="passport-controls-head">
					<span className="passport-controls-title">Stamps</span>
					<span className="passport-controls-count">
						{entries.length} of {MAX_STAMPS}
					</span>
				</div>

				<CountrySelect selected={selected} onToggle={toggle} onRemove={remove} />

				<div className="passport-toolbar" role="toolbar" aria-label="Stamp actions">
					<button
						type="button"
						className="passport-tool"
						onClick={shuffle}
						disabled={entries.length < 2}
						title="Shuffle placement"
						aria-label="Shuffle placement"
					>
						<HugeiconsIcon icon={ShuffleIcon} size={14} />
					</button>
					<button
						type="button"
						className="passport-tool"
						onClick={redate}
						disabled={entries.length === 0}
						title="New dates"
						aria-label="New dates"
					>
						<HugeiconsIcon icon={RefreshIcon} size={14} />
					</button>
					<button
						type="button"
						className="passport-tool"
						onClick={addRandom}
						disabled={full}
						title="Add random stamps"
						aria-label="Add random stamps"
					>
						<DicesIcon size={14} />
					</button>
					<span className="passport-toolbar-spacer" />
					<button
						type="button"
						className="passport-tool passport-tool--danger"
						onClick={clear}
						disabled={entries.length === 0}
						title="Clear page"
						aria-label="Clear page"
					>
						<HugeiconsIcon icon={Delete02Icon} size={14} />
					</button>
				</div>

				<div className="passport-live" role="status" aria-live="polite">
					{notice}
					{canUndo && (
						<button type="button" className="passport-undo" onClick={undoClear}>
							Undo
						</button>
					)}
				</div>
			</aside>
		</div>
	);
}
