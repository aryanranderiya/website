import type { Draft, Look } from './types';

export const DEMO_DRAFT: Draft = {
	deck: 'Two calls need you before the 11:00 investor sync. Everything else was handled overnight.',
	recipient: 'Aryan Randeriya',
	date: '2026-11-02',
	sentAt: '06:02',
	editionNo: 42,
	decisions: [
		{
			id: 'd1',
			verb: 'Approve',
			label: 'the revised Q4 hiring plan Priya sent at 11:40 PM',
		},
		{
			id: 'd2',
			verb: 'Decide',
			label: 'whether to move the design review to Thursday',
		},
	],
	today: [
		{
			id: 't1',
			t24: '09:30',
			label: 'Standup with the platform team',
			note: 'Zoom',
		},
		{
			id: 't2',
			t24: '11:00',
			label: 'Investor sync with Sequoia',
			note: 'Deck is in your drafts',
		},
		{
			id: 't3',
			t24: '15:00',
			label: 'Coffee with Maya',
			note: 'Blue Tokai, Bandra',
		},
	],
	overnight: [
		{
			id: 'o1',
			t24: '01:14',
			label: 'Triaged 38 emails and archived the newsletters',
		},
		{
			id: 'o2',
			t24: '03:40',
			label: 'Drafted replies to the three customer escalations',
		},
		{ id: 'o3', t24: '05:20', label: 'Booked your Friday flight to Bengaluru' },
	],
	running: [
		{
			id: 'r1',
			label: 'Reconciling October expenses against the card statement',
		},
	],
	figures: { show: true, you: 7, gaia: 19, mail: 38, focusMinutes: 150 },
	week: {
		days: [
			{ you: 4, gaia: 9 },
			{ you: 6, gaia: 11 },
			{ you: 3, gaia: 8 },
			{ you: 7, gaia: 12 },
			{ you: 5, gaia: 10 },
			{ you: 1, gaia: 4 },
			{ you: 0, gaia: 3 },
		],
		ahead: [
			{ id: 'a1', day: 'Mon', label: 'Investor sync with Sequoia' },
			{ id: 'a2', day: 'Wed', label: 'Quarterly planning offsite' },
			{ id: 'a3', day: 'Fri', label: 'Flight to Bengaluru' },
		],
		shipped: [
			{ id: 's1', label: 'Postmarks globe for the briefing archive' },
			{ id: 's2', label: 'Self-host installer, one command' },
		],
		handled: [
			{ id: 'h1', label: 'Renewed the domain before it lapsed' },
			{ id: 'h2', label: 'Rescheduled two clashing calls' },
		],
	},
};

export const DEMO_LOOK: Look = {
	family: 'postal',
	skin: {},
	art: 0,
	stamp: 'tokyo',
};
