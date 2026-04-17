'use client';

import {
	ArrowRight01Icon,
	ArrowUp01Icon,
	ArrowUpRight01Icon,
	Cancel01Icon,
	ChevronRight,
	CodeIcon,
	Copy01Icon,
	CopyLinkIcon,
	Download01Icon,
	HugeiconsIcon,
	Mail01Icon,
	Moon02Icon,
	Search01Icon,
} from '@icons';
import * as Dialog from '@radix-ui/react-dialog';
import type { IconProps } from '@theexperiencecompany/gaia-icons';
import { Command } from 'cmdk';
import { AnimatePresence, LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';

import type { ComponentType } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { ALL_PAGES_FLAT, NAV_ICON_MAP, SOCIAL_LINKS } from '@/constants/navigation';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

type Action = {
	id: string;
	label: string;
	description: string;
	href?: string;
	iconComp: ComponentType<IconProps>;
	keywords?: string;
};

const ACTIONS: Action[] = [
	{
		id: 'theme',
		label: 'Toggle Theme',
		description: 'Switch between light and dark',
		iconComp: Moon02Icon,
		keywords: 'dark mode light mode switch',
	},
	{
		id: 'copy-email',
		label: 'Copy Email',
		description: 'aryan@heygaia.io',
		iconComp: Copy01Icon,
		keywords: 'mail contact address',
	},
	{
		id: 'email-me',
		label: 'Email me',
		description: 'Open a new message to aryan@heygaia.io',
		iconComp: Mail01Icon,
		keywords: 'mail contact message',
	},
	{
		id: 'copy-url',
		label: 'Copy link',
		description: 'Copy URL of this page',
		iconComp: CopyLinkIcon,
		keywords: 'link share permalink copy url',
	},
	{
		id: 'scroll-top',
		label: 'Scroll to top',
		description: 'Jump back to the top of the page',
		iconComp: ArrowUp01Icon,
		keywords: 'top home scroll up',
	},
	{
		id: 'resume-download',
		label: 'Download Resume',
		description: 'Get my CV as PDF',
		href: '/resume.pdf',
		iconComp: Download01Icon,
		keywords: 'cv pdf hire',
	},
	{
		id: 'view-source',
		label: 'View site source',
		description: 'github.com/aryanranderiya/website',
		href: 'https://github.com/aryanranderiya/website',
		iconComp: CodeIcon,
		keywords: 'repo github source code',
	},
];

const ITEM_ICON_SIZE = 14;

export default function CommandK() {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');

	// Open on ⌘K / Ctrl+K
	useEffect(() => {
		function onKeyDown(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				setOpen((prev) => !prev);
			}
			if (e.key === 'Escape') setOpen(false);
		}
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, []);

	// Listen for custom event from Navbar ⌘K button
	useEffect(() => {
		function onOpen() {
			setOpen(true);
		}
		window.addEventListener('open-cmdk', onOpen);
		return () => window.removeEventListener('open-cmdk', onOpen);
	}, []);

	const runAction = useCallback((id: string) => {
		switch (id) {
			case 'theme': {
				const html = document.documentElement;
				const isDark = html.classList.toggle('dark');
				localStorage.setItem('theme', isDark ? 'dark' : 'light');
				break;
			}
			case 'copy-email':
				void navigator.clipboard?.writeText('aryan@heygaia.io');
				break;
			case 'email-me':
				window.location.href =
					'mailto:aryan@heygaia.io?subject=Hey%20Aryan';
				break;
			case 'copy-url':
				void navigator.clipboard?.writeText(window.location.href);
				break;
			case 'scroll-top':
				window.scrollTo({ top: 0, behavior: 'smooth' });
				break;
			default:
				break;
		}
		setOpen(false);
		setQuery('');
	}, []);

	const navigate = useCallback((href: string, external?: boolean) => {
		setOpen(false);
		setQuery('');
		if (external) {
			window.open(href, '_blank', 'noopener');
		} else {
			window.location.href = href;
		}
	}, []);

	return (
		<LazyMotion features={loadFeatures}>
			<Dialog.Root open={open} onOpenChange={setOpen}>
				<AnimatePresence>
					{open && (
						<Dialog.Portal forceMount>
							<Dialog.Overlay asChild>
								<m.div
									className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.15 }}
								/>
							</Dialog.Overlay>

							<Dialog.Content asChild>
								<m.div
									className="fixed left-1/2 top-[20%] z-[101] w-full max-w-lg -translate-x-1/2 rounded-2xl overflow-hidden shadow-2xl bg-card outline-none"
									initial={{ opacity: 0, scale: 0.96, y: -8 }}
									animate={{ opacity: 1, scale: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.96, y: -8 }}
									transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
								>
									<Dialog.Title className="sr-only">Command Palette</Dialog.Title>

									<Command
										className="w-full outline-none"
										label="Command palette"
										shouldFilter={true}
									>
										{/* Search input */}
										<div className="flex items-center gap-3 px-4">
											<HugeiconsIcon
												icon={Search01Icon}
												size={13}
												color="var(--muted-foreground)"
											/>
											<Command.Input
												value={query}
												onValueChange={setQuery}
												placeholder="Search pages, actions, people..."
												aria-label="Search pages and actions"
												className="flex-1 py-4 text-sm outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 border-none shadow-none bg-transparent text-foreground caret-foreground placeholder:text-[var(--muted-foreground)]"
											/>
											<button
												type="button"
												onClick={() => setOpen(false)}
												className="w-6 h-6 rounded-full flex items-center justify-center bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--muted-foreground)]/20 transition-colors flex-shrink-0"
												aria-label="Close"
											>
												<HugeiconsIcon icon={Cancel01Icon} size={12} />
											</button>
										</div>

										{/* Results list */}
										<Command.List className="max-h-80 overflow-y-auto py-2 [&_[cmdk-group-heading]]:text-[0.7rem] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:tracking-[0.08em] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-[var(--muted-foreground)] [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-item]]:flex [&_[cmdk-item]]:items-center [&_[cmdk-item]]:gap-3 [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-2 [&_[cmdk-item]]:rounded-lg [&_[cmdk-item]]:cursor-pointer [&_[cmdk-item]]:text-sm [&_[cmdk-item]]:transition-colors [&_[cmdk-item]]:text-[var(--foreground)] [&_[cmdk-item]]:outline-none [&_[cmdk-item][aria-selected='true']]:bg-[var(--muted)] [&_[cmdk-item]:hover]:bg-[var(--muted)]">
											<Command.Empty className="py-8 text-center text-sm text-muted-foreground">
												No results found.
											</Command.Empty>

											{/* Pages */}
											<Command.Group heading="Pages" className="px-2">
												{ALL_PAGES_FLAT.map((page) => {
													const IconComp = page.icon
														? (NAV_ICON_MAP[page.icon] ?? ArrowRight01Icon)
														: ArrowRight01Icon;
													return (
														<Command.Item
															key={page.href}
															value={`${page.label} ${page.description}`}
															onSelect={() => navigate(page.href)}
														>
															<span className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 bg-[var(--muted)] text-[var(--muted-foreground)]">
																<HugeiconsIcon icon={IconComp} size={ITEM_ICON_SIZE} />
															</span>
															<div className="flex-1 min-w-0">
																<div className="font-medium tracking-[-0.01em]">{page.label}</div>
																{page.description && (
																	<div className="text-xs truncate mt-0.5 text-muted-foreground">
																		{page.description}
																	</div>
																)}
															</div>
															<ChevronRight
																size={12}
																className="flex-shrink-0 hidden sm:block opacity-30 text-[var(--muted-foreground)]"
															/>
														</Command.Item>
													);
												})}
											</Command.Group>

											{/* Social links */}
											<Command.Group heading="Social" className="px-2">
												{SOCIAL_LINKS.map((link) => {
													const IconComp = link.icon
														? (NAV_ICON_MAP[link.icon] ?? ArrowUpRight01Icon)
														: ArrowUpRight01Icon;
													return (
														<Command.Item
															key={link.href}
															value={`${link.label} social`}
															onSelect={() => navigate(link.href, true)}
														>
															<span className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 bg-[var(--muted)] text-[var(--muted-foreground)]">
																<HugeiconsIcon icon={IconComp} size={ITEM_ICON_SIZE} />
															</span>
															<div className="flex-1 min-w-0">
																<div className="font-medium tracking-[-0.01em]">{link.label}</div>
																{link.description && (
																	<div className="text-xs truncate mt-0.5 text-muted-foreground">
																		{link.description}
																	</div>
																)}
															</div>
															<ChevronRight
																size={12}
																className="flex-shrink-0 hidden sm:block opacity-30 text-[var(--muted-foreground)]"
															/>
														</Command.Item>
													);
												})}
											</Command.Group>

											{/* Actions */}
											<Command.Group heading="Actions" className="px-2">
												{ACTIONS.map((action) => (
													<Command.Item
														key={action.id}
														value={`${action.label} ${action.description} ${action.keywords ?? ''}`}
														onSelect={() => {
															if (action.href) navigate(action.href, action.href.startsWith('http'));
															else runAction(action.id);
														}}
													>
														<span className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 bg-[var(--muted)] text-[var(--muted-foreground)]">
															<HugeiconsIcon icon={action.iconComp} size={ITEM_ICON_SIZE} />
														</span>
														<div className="flex-1 min-w-0">
															<div className="font-medium tracking-[-0.01em]">{action.label}</div>
															{action.description && (
																<div className="text-xs truncate mt-0.5 text-muted-foreground">
																	{action.description}
																</div>
															)}
														</div>
													</Command.Item>
												))}
											</Command.Group>
										</Command.List>

										{/* Footer */}
										<div className="flex items-center gap-4 px-4 py-2">
											<span className="text-[11px] text-[var(--muted-foreground)] opacity-60">
												↑↓ navigate
											</span>
											<span className="text-[11px] text-[var(--muted-foreground)] opacity-60">
												↵ open
											</span>
											<span className="ml-auto text-[11px] text-[var(--muted-foreground)] opacity-60">
												⌘K
											</span>
										</div>
									</Command>
								</m.div>
							</Dialog.Content>
						</Dialog.Portal>
					)}
				</AnimatePresence>
			</Dialog.Root>
		</LazyMotion>
	);
}
