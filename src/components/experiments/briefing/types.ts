// The vendored templates' contract (GAIA's explorer_adapter.py): render(ed, skin).

/** One option of a skin axis; its other keys are CSS values the template reads. */
export interface AxisOption {
	id: string;
	label: string;
	[key: string]: string | number;
}

export interface Template {
	id: string;
	name: string;
	axes: Record<string, AxisOption[]>;
}

/** The lists the sidebar edits; the weekly edition uses decisions plus the last three. */
export type SectionKey =
	| 'decisions'
	| 'today'
	| 'overnight'
	| 'running'
	| 'ahead'
	| 'shipped'
	| 'handled';

/** Section headings by section: an edition's own, or the reader's renames. */
export type Headings = Partial<Record<SectionKey, string>>;

/** What frame.html (scripts/briefing-harness.js) exposes on its window. */
export interface BriefingFrame {
	templates: Template[];
	render: (
		family: string,
		skin: Record<string, AxisOption>,
		ed: Edition,
		overrides: Headings
	) => { height: number; headings: Headings };
	onHeight: (height: number) => void;
}

export interface TodayItem {
	time: string | null;
	t24: string | null;
	label: string;
	note: string | null;
	tag: string;
}

export interface OvernightItem {
	t24: string | null;
	label: string;
	note: string | null;
	tag: string;
}

export interface DecisionItem {
	verb: string;
	label: string;
	note: string | null;
}

export interface Stats {
	done: number | null;
	you: number | null;
	gaia: number | null;
	mail: number | null;
	focus: string | null;
}

export interface Artwork {
	title: string;
	artist: string;
	year: string;
	medium: string;
	src: string;
}

export interface WeekDay {
	you: number;
	gaia: number;
}

export interface Edition {
	n: number;
	weekday: string;
	day: number;
	month: string;
	monthShort: string;
	year: number;
	dateLong: string;
	editionNo: number;
	time: string;
	time24: string;
	deck: string;
	recipient: { name: string; first: string } | null;
	content: {
		today: TodayItem[];
		overnight: OvernightItem[];
		running: OvernightItem[];
		decisions: DecisionItem[];
		awaiting: number | null;
		stats: Stats | null;
	};
	week: {
		days: WeekDay[];
		shipped: string[];
		handled: string[];
		ahead: { day: string; label: string }[];
	} | null;
	stamp: {
		id: string;
		label: string;
		key: string;
		city: string;
		air: string;
	} | null;
	art: Artwork;
	assets: Record<string, string>;
}

export interface Row {
	id: string;
	label: string;
}

/** Everything the sidebar edits; edition.ts turns it into an Edition. */
export interface Draft {
	deck: string;
	recipient: string;
	/** ISO date */
	date: string;
	/** Asks, verb first: "Approve the Q4 plan". */
	decisions: Row[];
	today: (Row & { t24: string })[];
	overnight: Row[];
	running: Row[];
	stats: boolean;
	week: {
		days: WeekDay[];
		ahead: (Row & { day: string })[];
		shipped: Row[];
		handled: Row[];
	};
}

/** The look: which template, which option per axis (Air Mail's city included), and the art it hangs. */
export interface Look {
	family: string;
	skin: Record<string, string>;
	art: number;
}
