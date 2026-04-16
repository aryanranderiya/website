'use client';

import {
	ArrowRight01Icon,
	ArrowUpRight01Icon,
	Book01Icon,
	BookmarkIcon,
	BriefcaseIcon,
	Camera01Icon,
	CodeIcon,
	Download01Icon,
	Film01Icon,
	// Social brand icons
	GithubIcon,
	// Page icons
	Home01Icon,
	HugeiconsIcon,
	LinkedinIcon,
	Moon02Icon,
	NewTwitterIcon,
	NoteIcon,
	PenTool01Icon,
	PenTool02Icon,
	Search01Icon,
	SparklesIcon,
} from '@icons';
import * as Dialog from '@radix-ui/react-dialog';
import type { IconProps } from '@theexperiencecompany/gaia-icons';
import { Command } from 'cmdk';
import { AnimatePresence, LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';

import type { ComponentType } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { ALL_PAGES_FLAT, SOCIAL_LINKS } from '@/constants/navigation';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

const ICON_MAP: Record<string, ComponentType<IconProps>> = {
	Home01Icon,
	CodeIcon,
	BriefcaseIcon,
	PenTool02Icon,
	Book01Icon,
	BookmarkIcon,
	Film01Icon,
	Camera01Icon,
	PenTool01Icon,
	NoteIcon,
	SparklesIcon,
	GithubIcon,
	NewTwitterIcon,
	LinkedinIcon,
};

// Extra commands
const ACTIONS = [
	{
		id: 'theme',
		label: 'Toggle Theme',
		description: 'Switch between light and dark',
		iconComp: Moon02Icon,
	},
	{
		id: 'resume-download',
		label: 'Download Resume',
		description: 'Get my CV as PDF',
		href: '/resume.pdf',
		iconComp: Download01Icon,
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
		if (id === 'theme') {
			const html = document.documentElement;
			const isDark = html.classList.toggle('dark');
			localStorage.setItem('theme', isDark ? 'dark' : 'light');
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
									className="fixed left-1/2 top-[20%] z-[101] w-full max-w-lg -translate-x-1/2 rounded-2xl border border-border overflow-hidden shadow-2xl bg-card outline-none"
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
										<div className="flex items-center gap-3 px-4 border-b border-border">
											<HugeiconsIcon
												icon={Search01Icon}
												size={16}
												color="var(--muted-foreground)"
											/>
											<Command.Input
												value={query}
												onValueChange={setQuery}
												placeholder="Search pages, actions..."
												aria-label="Search pages and actions"
												className="flex-1 py-4 text-sm outline-none ring-0 border-none shadow-none bg-transparent text-foreground caret-foreground"
											/>
											<kbd className="hidden sm:inline-flex text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
												esc
											</kbd>
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
														? (ICON_MAP[page.icon] ?? ArrowRight01Icon)
														: ArrowRight01Icon;
													return (
														<Command.Item
															key={page.href}
															value={`${page.label} ${page.description}`}
															onSelect={() => navigate(page.href)}
														>
															<span className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 bg-muted border border-border text-muted-foreground">
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
															<kbd className="text-xs flex-shrink-0 hidden sm:block text-muted-foreground">
																↵
															</kbd>
														</Command.Item>
													);
												})}
											</Command.Group>

											{/* Social links */}
											<Command.Group heading="Social" className="px-2">
												{SOCIAL_LINKS.map((link) => {
													const IconComp = link.icon
														? (ICON_MAP[link.icon] ?? ArrowUpRight01Icon)
														: ArrowUpRight01Icon;
													return (
														<Command.Item
															key={link.href}
															value={`${link.label} social`}
															onSelect={() => navigate(link.href, true)}
														>
															<span className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 bg-muted border border-border text-muted-foreground">
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
															<kbd className="text-xs flex-shrink-0 hidden sm:block text-muted-foreground">
																↗
															</kbd>
														</Command.Item>
													);
												})}
											</Command.Group>

											{/* Actions */}
											<Command.Group heading="Actions" className="px-2">
												{ACTIONS.map((action) => (
													<Command.Item
														key={action.id}
														value={`${action.label} ${action.description}`}
														onSelect={() => {
															if (action.href) navigate(action.href);
															else runAction(action.id);
														}}
													>
														<span className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 bg-muted border border-border text-muted-foreground">
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
										<div className="flex items-center gap-3 px-4 py-2.5 border-t border-border">
											<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
												<kbd className="px-1.5 py-0.5 rounded text-xs bg-muted border border-border">
													↑↓
												</kbd>
												<span>navigate</span>
											</div>
											<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
												<kbd className="px-1.5 py-0.5 rounded text-xs bg-muted border border-border">
													↵
												</kbd>
												<span>open</span>
											</div>
											<div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
												<kbd className="px-1.5 py-0.5 rounded text-xs bg-muted border border-border">
													⌘K
												</kbd>
												<span>toggle</span>
											</div>
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
