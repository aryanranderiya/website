'use client';

import { ChatDemo, type ChatMessageItem, type ChatPlatform } from './chat-demo';
import { IPhoneMockup } from './iphone-mockup';

const AVATAR = '/images/site/avatar.webp';
const MEMOJI = '/images/site/memoji.webp';

/** Demo thread per platform, using the documented ChatMessageItem shapes. */
const CHAT_DEMO_THREADS: Record<
	ChatPlatform,
	{ title: string; subtitle?: string; messages: ChatMessageItem[] }
> = {
	imessage: {
		title: 'GAIA',
		messages: [
			{ from: 'them', text: 'Morning ☀️', time: '9:41 AM' },
			{ from: 'me', text: 'Morning! Running late 🏃', status: 'read' },
			{ from: 'them', text: 'no rush, i moved it to 10', time: '9:42 AM' },
		],
	},
	whatsapp: {
		title: 'GAIA',
		subtitle: 'online',
		messages: [
			{ from: 'them', text: 'did you land?', time: '9:41 AM' },
			{ from: 'me', text: 'just did ✈️ cab in 20?', time: '9:42 AM', status: 'read' },
			{ from: 'me', text: 'see you in 5', time: '9:43 AM', status: 'delivered' },
		],
	},
	slack: {
		title: '#gaia-ship',
		subtitle: '42 members',
		messages: [
			{
				author: 'aryan',
				avatar: MEMOJI,
				text: 'shipped the footer glow ✨ can someone sanity-check on mobile?',
				time: '9:41 AM',
				reactions: [{ emoji: '👍', count: 9 }],
			},
			{
				author: 'gaia',
				avatar: AVATAR,
				text: 'checked 3 viewports — all green. `glowColor` is the only prop you touched',
				time: '9:42 AM',
			},
		],
	},
	discord: {
		title: 'general',
		messages: [
			{
				author: 'aryan',
				avatar: MEMOJI,
				authorColor: '#F0B232',
				text: 'anyone tried @gaia on the new Claude model yet?',
				time: '9:41 AM',
			},
			{
				author: 'gaia',
				avatar: AVATAR,
				authorColor: '#5865F2',
				text: 'yep — set `model` in your config and restart. 2x faster on tool calls',
				time: '9:42 AM',
				reactions: [{ emoji: '🔥', count: 12 }],
			},
		],
	},
	telegram: {
		title: 'GAIA',
		messages: [
			{ from: 'them', text: 'meeting moved to 10, you good?', time: '9:41 AM' },
			{ from: 'me', text: 'perfect, on my way 👍', time: '9:42 AM', status: 'read' },
			{ from: 'them', typing: true, time: '9:42 AM' },
		],
	},
};

export function ChatDemoInPhone({ platform }: { platform: ChatPlatform }) {
	const thread = CHAT_DEMO_THREADS[platform];
	return (
		<IPhoneMockup>
			<ChatDemo
				platform={platform}
				title={thread.title}
				subtitle={thread.subtitle}
				headerAvatar={AVATAR}
				messages={thread.messages}
			/>
		</IPhoneMockup>
	);
}
