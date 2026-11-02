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

/** What frame.html exposes on its window. */
export interface BriefingFrame {
	templates: Template[];
	render: (family: string, skin: Record<string, AxisOption>, ed: Edition) => number;
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

export interface StampCity {
	slug: string;
	name: string;
	country: string;
	url: string;
	air: string;
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

/** Everything the sidebar edits; edition.ts turns it into an Edition. */
export interface Draft {
	deck: string;
	recipient: string;
	/** ISO date */
	date: string;
	/** 24h "HH:MM" */
	sentAt: string;
	editionNo: number;
	decisions: { id: string; verb: string; label: string }[];
	today: { id: string; t24: string; label: string; note: string }[];
	overnight: { id: string; t24: string; label: string }[];
	running: { id: string; label: string }[];
	figures: {
		show: boolean;
		you: number;
		gaia: number;
		mail: number;
		focusMinutes: number;
	};
	week: {
		days: WeekDay[];
		ahead: { id: string; day: string; label: string }[];
		shipped: { id: string; label: string }[];
		handled: { id: string; label: string }[];
	};
}

/** The look: which template, which option per axis, and the art it hangs. */
export interface Look {
	family: string;
	skin: Record<string, string>;
	art: number;
	stamp: string;
}
