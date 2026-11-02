import { STAMP_CITIES } from '@/data/stamps';
import manifest from './manifest.json';
import type { AxisOption, Draft, Edition, Look, Template } from './types';

export const ARTWORKS = manifest.artworks;
export const STAMPS = STAMP_CITIES;

// GAIA's constants/briefing.py family ids that read data no other family does.
export const WEEKLY_FAMILY = 'weekly';
export const POSTAL_FAMILY = 'postal';
/** Families that hang a painting (ed.art). */
export const ART_FAMILIES = new Set(['broadsheet', 'exhibition', 'almanac']);

export const WEEKDAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Fixed parts of the demo edition the sidebar does not edit.
const EDITION_NO = 42;
const SENT_AT = '06:02';
const STATS = { done: 26, you: 7, gaia: 19, mail: 38, focus: '2h 30m' };

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
// explorer_adapter.py's _IMPERATIVE_VERBS: a leading one becomes the ask's verb.
const IMPERATIVE_VERBS = new Set([
	'approve',
	'decide',
	'confirm',
	'choose',
	'sign',
	'reject',
	'accept',
	'send',
	'pick',
	'cancel',
	'review',
	'authorize',
	'renew',
	'respond',
]);

function clock12(t24: string): string {
	const [h, m] = t24.split(':').map(Number);
	return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

/** explorer_adapter.py's _decision_verb: "Approve the plan" -> Approve / "the plan". */
function decisionVerb(text: string): { verb: string; label: string } {
	const [first = '', ...rest] = text.trim().split(/\s+/);
	const word = first.replace(/[:,.-]+$/, '');
	return IMPERATIVE_VERBS.has(word.toLowerCase())
		? {
				verb: word[0].toUpperCase() + word.slice(1).toLowerCase(),
				label: rest.join(' '),
			}
		: { verb: 'Review', label: text };
}

const filled = <T extends { label: string }>(rows: T[]) => rows.filter((r) => r.label.trim());

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
	const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()];
	const monthName = MONTHS[month - 1];
	const name = draft.recipient.trim().replace(/\s+/g, ' ');
	const stamp = look.family === POSTAL_FAMILY ? stampSkin(look.stamp) : null;
	const decisions = filled(draft.decisions);

	return {
		n: EDITION_NO,
		weekday,
		day,
		month: monthName,
		monthShort: monthName.slice(0, 3),
		year,
		dateLong: `${weekday}, ${day} ${monthName} ${year}`,
		editionNo: EDITION_NO,
		time: clock12(SENT_AT),
		time24: SENT_AT,
		deck: draft.deck,
		recipient: name ? { name, first: name.split(' ')[0] } : null,
		content: {
			decisions: decisions.map((d) => ({
				...decisionVerb(d.label),
				note: null,
			})),
			today: filled(draft.today).map((e) => ({
				time: e.t24 ? clock12(e.t24) : null,
				t24: e.t24 || null,
				label: e.label,
				note: null,
				tag: '',
			})),
			overnight: filled(draft.overnight).map((e) => ({
				t24: null,
				label: e.label,
				note: null,
				tag: 'DONE',
			})),
			running: filled(draft.running).map((e) => ({
				t24: null,
				label: e.label,
				note: null,
				tag: 'IN PROGRESS',
			})),
			awaiting: decisions.length || null,
			stats: draft.stats ? STATS : null,
		},
		week:
			look.family === WEEKLY_FAMILY
				? {
						days: draft.week.days,
						ahead: filled(draft.week.ahead).map(({ day: d, label }) => ({
							day: d,
							label,
						})),
						shipped: filled(draft.week.shipped).map((s) => s.label),
						handled: filled(draft.week.handled).map((s) => s.label),
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

export function shuffleLook(templates: Template[], look: Look): Look {
	const template = pick(templates.filter((t) => t.id !== look.family));
	return {
		family: template.id,
		skin: Object.fromEntries(
			Object.entries(template.axes).map(([axis, options]) => [axis, pick(options).id])
		),
		art: Math.floor(Math.random() * ARTWORKS.length),
		stamp: pick(STAMPS).slug,
	};
}
