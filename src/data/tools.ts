export type ToolCategory =
	| 'Development'
	| 'Design'
	| 'Productivity'
	| 'AI'
	| 'Utility'
	| 'Media'
	| 'Communication';

export interface Tool {
	id: string;
	name: string;
	website: string;
	category: ToolCategory;
	thoughts: string;
	/** Path under /icons/apps/ or full URL for favicon fallback */
	icon: string;
	/** Optional short tagline shown in the grid */
	tagline: string;
	free?: boolean;
}

export const TOOLS: Tool[] = [
	// ── Development ─────────────────────────────────────────────────────
	{
		id: 'arc',
		name: 'Arc',
		website: 'https://arc.net',
		category: 'Development',
		tagline: 'Browser reimagined',
		icon: '/icons/apps/arc.png',
		thoughts:
			"Arc changed how I use the web. Spaces keep work and personal browsing separate, Boosts let me restyle any page, and Little Arc handles quick lookups without losing focus. It's the only browser that actually got me to unlearn Safari habits.",
	},
	{
		id: 'cursor',
		name: 'Cursor',
		website: 'https://cursor.sh',
		category: 'Development',
		tagline: 'AI-first code editor',
		icon: '/icons/apps/cursor.png',
		thoughts:
			'Built on VS Code so nothing feels foreign, but the AI integration is a league above Copilot. Tab completion that anticipates multi-line edits, and Composer for larger refactors — it genuinely feels like pair programming with someone fast.',
	},
	{
		id: 'ghostty',
		name: 'Ghostty',
		website: 'https://ghostty.org',
		category: 'Development',
		tagline: 'Fast native terminal',
		icon: '/icons/apps/ghostty.png',
		thoughts:
			"Feels like what a macOS terminal app should have always been. Native GPU rendering, zero config to get started, and it's absurdly fast. Built by @mitchellh (HashiCorp founder) — you can tell the engineering is meticulous.",
	},
	{
		id: 'orbstack',
		name: 'OrbStack',
		website: 'https://orbstack.dev',
		category: 'Development',
		tagline: 'Docker Desktop replacement',
		icon: '/icons/apps/orbstack.png',
		thoughts:
			'Replaced Docker Desktop immediately after trying it. Starts in under a second, uses a fraction of the memory, and the native Linux VM integration is seamless. Free for personal use.',
	},
	{
		id: 'zed',
		name: 'Zed',
		website: 'https://zed.dev',
		category: 'Development',
		tagline: 'Blazing fast editor',
		icon: '/icons/apps/zed.png',
		thoughts:
			'When I need raw speed — grep a huge monorepo, open a giant log file — Zed is the answer. Written in Rust, opens instantly, and the multiplayer collaboration is genuinely impressive. Great fallback when I want zero AI overhead.',
	},

	// ── Design ──────────────────────────────────────────────────────────
	{
		id: 'figma',
		name: 'Figma',
		website: 'https://figma.com',
		category: 'Design',
		tagline: 'Design & prototyping',
		icon: '/icons/apps/figma.png',
		thoughts:
			'Still the best design tool. Auto layout and component variants make complex UIs manageable, and being browser-based means sharing with engineers is frictionless. Dev Mode bridging the design–code gap is underrated.',
	},
	{
		id: 'spline',
		name: 'Spline',
		website: 'https://spline.design',
		category: 'Design',
		tagline: '3D design for the web',
		icon: '/icons/apps/spline.png',
		thoughts:
			"Democratises 3D for web designers. You get physics, interactions, and animations — then export a single <script> tag that embeds the scene. I've used it for hero sections and it consistently impresses without a Three.js build step.",
	},
	{
		id: 'screenstudio',
		name: 'Screen Studio',
		website: 'https://screen.studio',
		category: 'Design',
		tagline: 'Cinematic screen recordings',
		icon: '/icons/apps/screenstudio.png',
		thoughts:
			'Makes demos look like Apple keynote recordings. Auto-zoom follows your cursor, background blur adds depth, and the built-in motion curves are beautiful. The before/after difference is wild — raw QuickTime vs Screen Studio is embarrassing.',
	},

	// ── Productivity ─────────────────────────────────────────────────────
	{
		id: 'raycast',
		name: 'Raycast',
		website: 'https://raycast.com',
		category: 'Productivity',
		tagline: 'Supercharged launcher',
		icon: '/icons/apps/raycast.png',
		thoughts:
			"Replaced Spotlight on day one and I've never looked back. Clipboard history, window management, snippets, and an extension store with hundreds of integrations — I trigger it hundreds of times a day. The Script Commands feature is a superpower.",
	},
	{
		id: 'linear',
		name: 'Linear',
		website: 'https://linear.app',
		category: 'Productivity',
		tagline: 'Issue tracking done right',
		icon: '/icons/apps/linear.png',
		thoughts:
			"The best issue tracker I've used. Keyboard-first, blazing fast, and opinionated in the right ways. Cycles feel like a natural way to plan sprints without ceremony. The GitHub integration is tight — commits auto-close issues.",
	},
	{
		id: 'notion',
		name: 'Notion',
		website: 'https://notion.so',
		category: 'Productivity',
		tagline: 'Wiki & notes',
		icon: '/icons/apps/notion.png',
		thoughts:
			"My second brain for everything that isn't code. Project docs, reading notes, reference databases — Notion's flexibility makes it work for all of it. I've tried to replace it multiple times and always come back.",
	},
	{
		id: 'mymind',
		name: 'mymind',
		website: 'https://mymind.com',
		category: 'Productivity',
		tagline: 'Visual bookmarks with AI',
		icon: '/icons/apps/mymind.png',
		thoughts:
			"Save anything from the web — articles, images, tweets, color palettes — and find it again without ever tagging. The AI search just works. It's the only bookmarking tool that doesn't eventually become a graveyard of unsorted links.",
	},
	{
		id: 'obsidian',
		name: 'Obsidian',
		website: 'https://obsidian.md',
		category: 'Productivity',
		tagline: 'Knowledge graph notes',
		icon: '/icons/apps/obsidian.png',
		thoughts:
			"Plain Markdown files, stored locally, linked into a knowledge graph. It's the opposite of lock-in. The graph view is satisfying to explore, but the real value is that your notes are portable forever. I use it for deep research and evergreen notes.",
	},

	// ── AI ───────────────────────────────────────────────────────────────
	{
		id: 'claude',
		name: 'Claude',
		website: 'https://claude.ai',
		category: 'AI',
		tagline: 'Primary AI assistant',
		icon: '/icons/favicons/claude-ai.png',
		thoughts:
			'My go-to for almost everything AI-related. Best reasoning, best long-context handling, and the writing quality is noticeably higher. Claude Code in the terminal has changed how I prototype — I think in terms of what I want and let it scaffold.',
	},
	{
		id: 'ollama',
		name: 'Ollama',
		website: 'https://ollama.com',
		category: 'AI',
		tagline: 'Local LLMs, zero friction',
		icon: '/icons/apps/ollama.png',
		thoughts:
			'Run any open-source model locally with one command — `ollama run llama3`. Privacy-sensitive tasks, offline use, or just experimenting with Mistral/DeepSeek without sending data anywhere. The OpenAI-compatible API makes it a drop-in for local dev.',
	},

	// ── Utility ──────────────────────────────────────────────────────────
	{
		id: 'maccy',
		name: 'Maccy',
		website: 'https://maccy.app',
		category: 'Utility',
		tagline: 'Clipboard history',
		icon: '/icons/apps/maccy.png',
		thoughts:
			"Lightweight, open-source clipboard manager. ⌥⌘V shows your full copy history instantly. Saved me countless times — copy something, copy something else, realise you needed the first thing. It's one of those tools you forget about until you use someone else's Mac.",
	},
	{
		id: 'loop',
		name: 'Loop',
		website: 'https://loop.lol',
		category: 'Utility',
		tagline: 'Radial window management',
		icon: '/icons/apps/loop.png',
		thoughts:
			"The most satisfying window manager I've tried. Hold a hotkey and drag to any screen edge — a radial menu appears with snap zones. Free and open source. It replaced Rectangle for me purely because of how tactile it feels.",
	},
	{
		id: 'ice',
		name: 'Ice',
		website: 'https://icemenubar.com',
		category: 'Utility',
		tagline: 'Menu bar declutter',
		icon: '/icons/apps/ice.png',
		thoughts:
			'Hides menu bar icons behind a single toggle, keeping the bar clean without paying for Bartender. Free, open source, and actively maintained. The hidden section appears on hover — no click needed.',
	},
	{
		id: 'bitwarden',
		name: 'Bitwarden',
		website: 'https://bitwarden.com',
		category: 'Utility',
		tagline: 'Open source passwords',
		icon: '/icons/apps/bitwarden.png',
		thoughts:
			"Open-source, end-to-end encrypted, self-hostable if you want full control. Free for individuals with no meaningful limits. I switched from 1Password when the subscription price went up — haven't missed it.",
	},

	// ── Media ────────────────────────────────────────────────────────────
	{
		id: 'iina',
		name: 'IINA',
		website: 'https://iina.io',
		category: 'Media',
		tagline: 'Best macOS video player',
		icon: '/icons/apps/iina.png',
		thoughts:
			'Beautiful native macOS video player that plays literally everything — MKV, HEVC, subtitles in every format. Open source, actively maintained, and the UI actually looks like a macOS app instead of a port. VLC can stay on other platforms.',
	},
	{
		id: 'spotify',
		name: 'Spotify',
		website: 'https://spotify.com',
		category: 'Media',
		tagline: 'Music',
		icon: '/icons/apps/spotify.png',
		thoughts:
			"Discover Weekly still hits every Monday. The curated playlist algorithm is miles ahead of alternatives I've tried. I use it alongside Last.fm scrobbling to track listening history — the year-end data is always interesting.",
	},

	// ── Communication ────────────────────────────────────────────────────
	{
		id: 'telegram',
		name: 'Telegram',
		website: 'https://telegram.org',
		category: 'Communication',
		tagline: 'Fast, feature-rich messaging',
		icon: '/icons/apps/telegram.png',
		thoughts:
			'The messaging app I wish everyone used. Channels for following topics, bots for automation, file sharing up to 2GB, and a speed and stability that WhatsApp has never matched. The developer community especially lives here.',
	},
];

export const TOOL_CATEGORIES: ToolCategory[] = [
	'Development',
	'Design',
	'Productivity',
	'AI',
	'Utility',
	'Media',
	'Communication',
];
