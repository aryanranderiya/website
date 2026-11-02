import type { Draft, Look } from './types';

export const DEMO_DRAFT: Draft = {
	deck: 'Two calls need you before the 11:00 investor sync. Everything else was handled overnight.',
	recipient: 'Aryan Randeriya',
	date: '2026-11-02',
	decisions: [
		{ id: 'd1', label: 'Approve the revised Q4 hiring plan' },
		{ id: 'd2', label: 'Decide whether to move the design review to Thursday' },
		{ id: 'd3', label: 'Sign the renewal for the Figma team plan' },
	],
	today: [
		{ id: 't2', t24: '09:30', label: 'Standup with the platform team' },
		{ id: 't3', t24: '11:00', label: 'Investor sync with Sequoia' },
		{ id: 't4', t24: '13:00', label: 'Lunch with the design team' },
		{ id: 't5', t24: '15:00', label: 'Coffee with Maya' },
		{ id: 't6', t24: '16:30', label: 'Candidate interview for the infra role' },
	],
	overnight: [
		{ id: 'o1', label: 'Triaged 38 emails and archived the newsletters' },
		{ id: 'o2', label: 'Drafted replies to three customer escalations' },
		{ id: 'o3', label: 'Booked your Friday flight to Bengaluru' },
		{ id: 'o4', label: 'Moved the 1:1 with Priya to Wednesday' },
		{ id: 'o5', label: 'Filed the October expense report' },
		{ id: 'o6', label: 'Summarised the Slack thread on the outage' },
		{ id: 'o7', label: 'Renewed the domain before it lapsed' },
	],
	running: [
		{ id: 'r1', label: 'Reconciling October expenses' },
		{ id: 'r2', label: 'Researching venues for the team offsite' },
		{ id: 'r3', label: 'Drafting the monthly investor update' },
	],
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
			{ id: 'a2', day: 'Tue', label: 'Board deck review' },
			{ id: 'a3', day: 'Wed', label: 'Quarterly planning offsite' },
			{ id: 'a4', day: 'Thu', label: 'Design review' },
			{ id: 'a5', day: 'Fri', label: 'Flight to Bengaluru' },
			{ id: 'a6', day: 'Sat', label: 'Meetup talk on agents' },
		],
		shipped: [
			{ id: 's1', label: 'Postmarks globe for the briefing archive' },
			{ id: 's2', label: 'Self-host installer, one command' },
			{ id: 's3', label: 'Slack bot threads that remember context' },
			{ id: 's4', label: 'Faster cold start for the desktop app' },
			{ id: 's5', label: 'Weekly recap edition' },
		],
		handled: [
			{ id: 'h1', label: 'Renewed the domain before it lapsed' },
			{ id: 'h2', label: 'Rescheduled two clashing calls' },
			{ id: 'h3', label: 'Paid the AWS invoice' },
			{ id: 'h4', label: 'Declined four cold sales calls' },
			{ id: 'h5', label: 'Followed up on the unsigned NDA' },
		],
	},
};

export const DEMO_LOOK: Look = { family: 'postal', skin: { city: 'tokyo' }, art: 0 };
