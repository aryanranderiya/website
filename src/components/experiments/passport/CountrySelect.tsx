// biome-ignore-all lint/a11y/useSemanticElements: the country picker is a custom combobox listbox, not a native select
'use client';

import {
	Cancel01Icon,
	CheckmarkCircle01Icon,
	HugeiconsIcon,
	PlusSignIcon,
	Search01Icon,
} from '@icons';
import { useEffect, useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { COUNTRIES, COUNTRY_BY_CODE } from './data/countries';
import { MAX_STAMPS } from './state';

const REGIONS = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'] as const;
const TRIGGER_ID = 'passport-country-trigger';
const LIST_ID = 'passport-country-list';

const ALIASES: Record<string, string> = {
	ae: 'uae emirates',
	cd: 'drc congo kinshasa zaire',
	cf: 'car',
	ci: 'ivory coast',
	cv: 'cape verde',
	cz: 'czech republic',
	do: 'dominican rep',
	gb: 'uk britain great britain',
	kn: 'st kitts',
	kp: 'north korea dprk',
	kr: 'south korea',
	lc: 'st lucia',
	mk: 'macedonia',
	mm: 'burma',
	nl: 'holland',
	ps: 'west bank',
	ru: 'russian federation',
	sz: 'swaziland',
	tl: 'east timor',
	tr: 'turkey',
	tw: 'republic of china',
	us: 'usa america',
	va: 'holy see',
	vc: 'st vincent',
	xk: 'kosovo',
};

type Country = (typeof COUNTRIES)[number];

function normalize(value: string): string {
	return value
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase();
}

function scoreCountry(country: Country, query: string): number {
	const name = normalize(country.name);
	const capital = normalize(country.capital);
	const alias = normalize(ALIASES[country.code] ?? '');
	const nameWords = name.split(/\s+/);
	const capitalWords = capital.split(/\s+/);
	const aliasWords = alias.split(/\s+/);
	if (name === query) return 240;
	if (alias === query || aliasWords.includes(query)) return 220;
	if (name.startsWith(query)) return 190;
	if (nameWords.includes(query)) return 170;
	if (country.code === query || country.iso3.toLowerCase() === query) return 150;
	if (alias.startsWith(query)) return 130;
	if (capital === query) return 80;
	if (capital.startsWith(query)) return 70;
	if (capitalWords.includes(query)) return 60;
	if (name.includes(query)) return 40;
	return 0;
}

function Flag({ code, size = 'small' }: { code: string; size?: 'small' | 'chip' }) {
	return (
		<img
			className={`passport-flag passport-flag--${size}`}
			src={`https://flagcdn.com/${code}.svg`}
			alt=""
			width={size === 'chip' ? 18 : 18}
			height={size === 'chip' ? 13 : 13}
			loading="lazy"
			decoding="async"
		/>
	);
}

function focusTrigger() {
	window.requestAnimationFrame(() => {
		document.getElementById(TRIGGER_ID)?.focus();
	});
}

const optionId = (code: string) => `passport-option-${code}`;

interface Props {
	selected: string[];
	onToggle: (code: string) => void;
	onRemove: (code: string) => void;
}

interface CountryOptionProps {
	country: Country;
	isSelected: boolean;
	disabled: boolean;
	active: boolean;
	onHover: (code: string) => void;
	onPick: (code: string) => void;
}

function CountryOption({
	country,
	isSelected,
	disabled,
	active,
	onHover,
	onPick,
}: CountryOptionProps) {
	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: keyboard is handled by the combobox input via aria-activedescendant
		<div
			id={optionId(country.code)}
			role="option"
			tabIndex={-1}
			aria-selected={isSelected}
			aria-disabled={disabled}
			data-active={active}
			data-disabled={disabled}
			onMouseEnter={() => {
				if (!disabled) onHover(country.code);
			}}
			onClick={() => {
				if (!disabled) onPick(country.code);
			}}
			className="passport-command-item"
		>
			<Flag code={country.code} />
			<span className="passport-command-text">
				<span className="passport-command-name">{country.name}</span>
				<span className="passport-command-meta">{country.capital}</span>
			</span>
			{isSelected ? (
				<span className="passport-command-check" aria-hidden="true">
					<HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} />
				</span>
			) : (
				<span className="passport-command-iso">{country.iso3}</span>
			)}
		</div>
	);
}

interface CountryListProps {
	groups: Array<{ region: string; items: Country[] }>;
	selectedSet: Set<string>;
	activeOptionCode: string | null;
	isDisabled: (country: Country) => boolean;
	onHover: (code: string) => void;
	onPick: (code: string) => void;
}

function CountryList({
	groups,
	selectedSet,
	activeOptionCode,
	isDisabled,
	onHover,
	onPick,
}: CountryListProps) {
	const count = groups.reduce((total, group) => total + group.items.length, 0);
	return (
		<div
			id={LIST_ID}
			role="listbox"
			aria-multiselectable="true"
			aria-label="Countries"
			className="passport-command-list"
		>
			{count === 0 && <div className="passport-command-empty">No country found.</div>}
			{groups.map(({ region, items }) => {
				if (!items.length) return null;
				const headingId = `passport-group-${region.toLowerCase().replaceAll(' ', '-')}`;
				return (
					<div
						key={region}
						role="group"
						aria-labelledby={headingId}
						className="passport-command-group-block"
					>
						<div id={headingId} role="presentation" className="passport-command-group-heading">
							<span className="passport-command-group">
								{region}
								<span>{items.length}</span>
							</span>
						</div>
						{items.map((country) => (
							<CountryOption
								key={country.code}
								country={country}
								isSelected={selectedSet.has(country.code)}
								disabled={isDisabled(country)}
								active={activeOptionCode === country.code}
								onHover={onHover}
								onPick={onPick}
							/>
						))}
					</div>
				);
			})}
		</div>
	);
}

export function CountrySelect({ selected, onToggle, onRemove }: Props) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');
	const [activeCode, setActiveCode] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const commandRef = useRef<HTMLDivElement>(null);
	const full = selected.length >= MAX_STAMPS;
	const selectedSet = new Set(selected);

	const needle = normalize(query).trim();
	const groups = needle
		? [
				{
					region: 'Results',
					items: COUNTRIES.map((country) => ({ country, score: scoreCountry(country, needle) }))
						.filter((match) => match.score > 0)
						.sort((a, b) => b.score - a.score || a.country.name.localeCompare(b.country.name))
						.map((match) => match.country),
				},
			]
		: REGIONS.map((region) => ({
				region,
				items: COUNTRIES.filter((country) => country.region === region),
			}));
	const options = groups.flatMap((group) => group.items);
	const isDisabled = (country: Country) => full && !selectedSet.has(country.code);
	const activeCountry =
		options.find((country) => country.code === activeCode && !isDisabled(country)) ??
		options.find((country) => !isDisabled(country)) ??
		null;
	const activeOptionCode = activeCountry?.code ?? null;

	useEffect(() => {
		if (!open) return;
		inputRef.current?.focus();
	}, [open]);

	useEffect(() => {
		if (!open) return;
		const preserveFocus = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			if (!commandRef.current?.contains(target)) return;
			if (target.closest('input, button, [role="option"]:not([aria-disabled="true"])')) return;
			event.preventDefault();
			inputRef.current?.focus();
		};
		document.addEventListener('mousedown', preserveFocus, true);
		return () => document.removeEventListener('mousedown', preserveFocus, true);
	}, [open]);

	useEffect(() => {
		if (!open || !activeOptionCode) return;
		document.getElementById(optionId(activeOptionCode))?.scrollIntoView({ block: 'nearest' });
	}, [open, activeOptionCode]);

	const pick = (code: string) => {
		onToggle(code);
		window.setTimeout(() => inputRef.current?.focus(), 0);
	};

	const move = (direction: 1 | -1) => {
		if (!options.length) return;
		const current = activeCountry
			? options.findIndex((country) => country.code === activeCountry.code)
			: -1;
		let index = current;
		for (let step = 0; step < options.length; step++) {
			index = (index + direction + options.length) % options.length;
			const candidate = options[index];
			if (!isDisabled(candidate)) {
				setActiveCode(candidate.code);
				return;
			}
		}
	};

	const handleKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				move(1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				move(-1);
				break;
			case 'Home':
				event.preventDefault();
				setActiveCode(options.find((country) => !isDisabled(country))?.code ?? null);
				break;
			case 'End': {
				event.preventDefault();
				const reversed = [...options].reverse().find((country) => !isDisabled(country));
				setActiveCode(reversed?.code ?? null);
				break;
			}
			case 'Enter':
				if (activeCountry && !isDisabled(activeCountry)) {
					event.preventDefault();
					pick(activeCountry.code);
				}
				break;
			case 'Escape':
				event.preventDefault();
				setOpen(false);
				break;
			case 'Tab':
				setOpen(false);
				break;
		}
	};

	return (
		<div className="passport-picker">
			<Popover
				open={open}
				onOpenChange={(next) => {
					setOpen(next);
					if (next) {
						setQuery('');
						setActiveCode(null);
					}
				}}
			>
				<PopoverTrigger asChild>
					<button id={TRIGGER_ID} type="button" className={`passport-add ${full ? 'is-full' : ''}`}>
						<HugeiconsIcon icon={Search01Icon} size={14} className="passport-add-icon" />
						<span className="passport-add-text">{full ? 'Page full' : 'Find a country'}</span>
						<HugeiconsIcon icon={PlusSignIcon} size={14} className="passport-add-plus" />
					</button>
				</PopoverTrigger>
				<PopoverContent
					align="start"
					sideOffset={8}
					collisionPadding={12}
					aria-label="Country picker"
					className="passport-picker-popover"
				>
					<div ref={commandRef} className="passport-command">
						<div className="passport-command-search">
							<HugeiconsIcon icon={Search01Icon} size={14} className="passport-search-icon" />
							<input
								ref={inputRef}
								type="text"
								value={query}
								onChange={(event) => {
									setQuery(event.target.value);
									setActiveCode(null);
								}}
								onKeyDown={handleKey}
								autoComplete="off"
								spellCheck={false}
								placeholder={`Search ${COUNTRIES.length} countries`}
								aria-label="Search countries"
								aria-autocomplete="list"
								aria-expanded="true"
								aria-controls={LIST_ID}
								aria-activedescendant={activeOptionCode ? optionId(activeOptionCode) : undefined}
								role="combobox"
								className="passport-command-input"
							/>
							<kbd>Esc</kbd>
							<button
								type="button"
								className="passport-command-close"
								onClick={() => setOpen(false)}
								aria-label="Close country picker"
							>
								<HugeiconsIcon icon={Cancel01Icon} size={13} />
							</button>
						</div>
						{full && (
							<p className="passport-command-note">Page full. Remove a stamp to add another.</p>
						)}
						<CountryList
							groups={groups}
							selectedSet={selectedSet}
							activeOptionCode={activeOptionCode}
							isDisabled={isDisabled}
							onHover={setActiveCode}
							onPick={pick}
						/>
						<div className="passport-command-footer">
							<span>{COUNTRIES.length} countries</span>
							<span>Enter to add</span>
						</div>
					</div>
				</PopoverContent>
			</Popover>

			<div className="passport-selected">
				{selected.length === 0 ? (
					<p className="passport-selected-empty">No stamps yet.</p>
				) : (
					selected.map((code) => {
						const country = COUNTRY_BY_CODE[code];
						if (!country) return null;
						return (
							<div className="passport-selected-row" key={code}>
								<Flag code={code} size="chip" />
								<span className="passport-selected-text">
									<span className="passport-selected-name">{country.name}</span>
									<span className="passport-selected-capital">{country.capital}</span>
								</span>
								<button
									type="button"
									className="passport-selected-remove"
									onClick={() => {
										onRemove(code);
										focusTrigger();
									}}
									aria-label={`Remove ${country.name}`}
								>
									<HugeiconsIcon icon={Cancel01Icon} size={11} />
								</button>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}
