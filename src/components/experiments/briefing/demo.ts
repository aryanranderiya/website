import type { Draft, Look } from './types';

export const DEMO_DRAFT: Draft = {
	deck: 'Two calls need you before the 11:00 investor sync. Everything else was handled overnight.',
	recipient: 'Aryan Randeriya',
	date: '2026-11-02',
	decisions: [
		{ id: 'd1', label: 'Approve the revised Q4 hiring plan' },
		{ id: 'd2', label: 'Decide whether to move the design review to Thursday' },
	],
	today: [
		{ id: 't1', t24: '09:30', label: 'Standup with the platform team' },
		{ id: 't2', t24: '11:00', label: 'Investor sync with Sequoia' },
		{ id: 't3', t24: '15:00', label: 'Coffee with Maya' },
	],
	overnight: [
		{ id: 'o1', label: 'Triaged 38 emails and archived the newsletters' },
		{ id: 'o2', label: 'Drafted replies to three customer escalations' },
		{ id: 'o3', label: 'Booked your Friday flight to Bengaluru' },
	],
	running: [{ id: 'r1', label: 'Reconciling October expenses' }],
	stats: true,
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

export const DEMO_LOOK: Look = { family: 'postal', skin: { city: 'tokyo' }, art: 0 };
