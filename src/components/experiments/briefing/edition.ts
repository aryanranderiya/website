import manifest from './manifest.json';
import type { AxisOption, Draft, Edition, Look, StampCity, Template } from './types';

export const ARTWORKS = manifest.artworks;
export const STAMPS: StampCity[] = manifest.stamps;

// GAIA's constants/briefing.py family ids that read data no other family does.
export const WEEKLY_FAMILY = 'weekly';
export const POSTAL_FAMILY = 'postal';
/** Families that hang a painting (ed.art). */
export const ART_FAMILIES = new Set(['broadsheet', 'exhibition', 'almanac']);

export const DECISION_VERBS = ['Approve', 'Decide', 'Confirm', 'Review', 'Sign', 'Reply', 'Retry'];
export const WEEKDAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const STAMP_ASSET_KEY = 'STAMP_CITY';
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];

export function clock12(t24: string): string {
	const [h, m] = t24.split(':').map(Number);
	return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

export function formatFocus(minutes: number): string {
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return [h && `${h}h`, m && `${m}m`].filter(Boolean).join(' ');
}

const positive = (n: number) => (n > 0 ? n : null);

function stampSkin(slug: string): Edition['stamp'] {
	const city = STAMPS.find((s) => s.slug === slug) ?? STAMPS[0];
	return {
		id: city.slug,
		label: city.name,
		key: STAMP_ASSET_KEY,
		city: city.name.toUpperCase(),
		air: city.air,
	};
}

/** The ed object GAIA's explorer_adapter.build_ed would hand the template. */
export function buildEdition(draft: Draft, look: Look): Edition {
	const [year, month, day] = draft.date.split('-').map(Number);
	const date = new Date(year, month - 1, day);
	const weekday = WEEKDAYS[date.getDay()];
	const monthName = MONTHS[month - 1];
	const name = draft.recipient.trim().replace(/\s+/g, ' ');
	const stamp = look.family === POSTAL_FAMILY ? stampSkin(look.stamp) : null;
	const { figures } = draft;

	return {
		n: draft.editionNo,
		weekday,
		day,
		month: monthName,
		monthShort: monthName.slice(0, 3),
		year,
		dateLong: `${weekday}, ${day} ${monthName} ${year}`,
		editionNo: draft.editionNo,
		time: clock12(draft.sentAt),
		time24: draft.sentAt,
		deck: draft.deck,
		recipient: name ? { name, first: name.split(' ')[0] } : null,
		content: {
			decisions: draft.decisions.map((d) => ({
				verb: d.verb,
				label: d.label,
				note: null,
			})),
			today: draft.today.map((e) => ({
				time: e.t24 ? clock12(e.t24) : null,
				t24: e.t24 || null,
				label: e.label,
				note: e.note || null,
				tag: '',
			})),
			overnight: draft.overnight.map((e) => ({
				t24: e.t24 || null,
				label: e.label,
				note: null,
				tag: 'DONE',
			})),
			running: draft.running.map((e) => ({
				t24: null,
				label: e.label,
				note: null,
				tag: 'IN PROGRESS',
			})),
			awaiting: positive(draft.decisions.length),
			stats:
				figures.show && figures.you + figures.gaia > 0
					? {
							done: figures.you + figures.gaia,
							you: positive(figures.you),
							gaia: positive(figures.gaia),
							mail: positive(figures.mail),
							focus: figures.focusMinutes > 0 ? formatFocus(figures.focusMinutes) : null,
						}
					: null,
		},
		week:
			look.family === WEEKLY_FAMILY
				? {
						days: draft.week.days,
						ahead: draft.week.ahead.map(({ day: d, label }) => ({
							day: d,
							label,
						})),
						shipped: draft.week.shipped.map((s) => s.label),
						handled: draft.week.handled.map((s) => s.label),
					}
				: null,
		stamp,
		art: ARTWORKS[look.art],
		assets: {
			BAND: `${manifest.base}/band.webp`,
			TEC_MARK: `${manifest.base}/tec-mark.webp`,
			...(stamp && {
				[STAMP_ASSET_KEY]: STAMPS.find((s) => s.slug === stamp.id)?.url ?? '',
			}),
		},
	};
}

/** The skin objects for a look: the chosen option per axis, Air Mail's city from its stamp. */
export function resolveSkin(
	template: Template,
	look: Look,
	edition: Edition
): Record<string, AxisOption> {
	const skin: Record<string, AxisOption> = {};
	for (const [axis, options] of Object.entries(template.axes)) {
		skin[axis] = options.find((o) => o.id === look.skin[axis]) ?? options[0];
	}
	if (edition.stamp) skin.city = edition.stamp;
	return skin;
}

/** A template's name without its parenthetical ("The Week (weekly review)"). */
export const displayName = (template: Template) => template.name.replace(/\s*\(.*\)$/, '');

const pick = <T>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

export function randomSkin(template: Template): Record<string, string> {
	return Object.fromEntries(
		Object.entries(template.axes).map(([axis, options]) => [axis, pick(options).id])
	);
}

export function shuffleLook(templates: Template[], look: Look): Look {
	const others = templates.filter((t) => t.id !== look.family);
	const template = pick(others);
	return {
		family: template.id,
		skin: randomSkin(template),
		art: Math.floor(Math.random() * ARTWORKS.length),
		stamp: pick(STAMPS).slug,
	};
}
