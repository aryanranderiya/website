'use client';

import { Cancel01Icon, HugeiconsIcon, LinkSquare02Icon } from '@icons';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { useState } from 'react';
import { TOOL_CATEGORIES, TOOLS, type Tool, type ToolCategory } from '@/data/tools';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

const EASE = [0.19, 1, 0.22, 1] as const;

const CATEGORY_COLORS: Record<ToolCategory, string> = {
	Development: 'rgba(0,187,255,0.12)',
	Design: 'rgba(180,90,255,0.12)',
	Productivity: 'rgba(255,160,50,0.12)',
	AI: 'rgba(100,220,130,0.12)',
	Utility: 'rgba(200,200,200,0.10)',
	Media: 'rgba(255,80,100,0.12)',
	Communication: 'rgba(50,150,255,0.12)',
};

const CATEGORY_TEXT: Record<ToolCategory, string> = {
	Development: '#00bbff',
	Design: '#b45aff',
	Productivity: '#ffa032',
	AI: '#64dc82',
	Utility: 'var(--text-muted)',
	Media: '#ff5064',
	Communication: '#3296ff',
};

function ToolIcon({ src, name, size = 40 }: { src: string; name: string; size?: number }) {
	const [errored, setErrored] = useState(false);

	if (errored) {
		return (
			<div
				className="flex items-center justify-center bg-[var(--muted-bg)] font-semibold text-[var(--text-ghost)]"
				// biome-ignore lint/nursery/noInlineStyles: dynamic size/borderRadius/fontSize computed from prop
				style={{ width: size, height: size, borderRadius: size * 0.225, fontSize: size * 0.4 }}
			>
				{name[0]}
			</div>
		);
	}

	return (
		<img
			src={src}
			alt={name}
			width={size}
			height={size}
			onError={() => setErrored(true)}
			className="block shrink-0 object-cover"
			// biome-ignore lint/nursery/noInlineStyles: dynamic borderRadius computed from prop
			style={{ borderRadius: size * 0.225 }}
		/>
	);
}

function ToolDrawer({
	tool,
	open,
	onClose,
}: {
	tool: Tool | null;
	open: boolean;
	onClose: () => void;
}) {
	return (
		<LazyMotion features={loadFeatures}>
			<Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
				<AnimatePresence>
					{open && tool && (
						<Dialog.Portal forceMount>
							<Dialog.Overlay asChild>
								<m.div
									className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[4px]"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.2 }}
									onClick={onClose}
								/>
							</Dialog.Overlay>

							<Dialog.Content asChild>
								<m.div
									className="fixed top-0 right-0 bottom-0 z-50 w-[min(360px,100vw)] overflow-y-auto rounded-tl-xl rounded-bl-xl bg-[var(--background)] shadow-[-8px_0_32px_rgba(0,0,0,0.12)]"
									initial={{ x: '100%' }}
									animate={{ x: 0 }}
									exit={{ x: '100%' }}
									transition={{ duration: 0.32, ease: EASE }}
								>
									<Dialog.Title className="sr-only">{tool.name}</Dialog.Title>

									{/* Close */}
									<Dialog.Close asChild>
										<button
											type="button"
											className="absolute top-4 left-4 flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] bg-[var(--muted-bg)] text-[var(--text-muted)]"
											aria-label="Close"
										>
											<HugeiconsIcon icon={Cancel01Icon} size={12} />
										</button>
									</Dialog.Close>

									{/* Content */}
									<div className="px-6 pt-14 pb-10">
										{/* Icon centered at top */}
										<div className="mb-5 flex flex-col items-center">
											<ToolIcon src={tool.icon} name={tool.name} size={64} />
											<h2 className="mt-3 mb-1.5 text-center font-semibold text-[20px] text-[var(--text-primary)] leading-[1.2] tracking-[-0.03em]">
												{tool.name}
											</h2>
											<div className="mb-4 flex items-center gap-1.5">
												<span
													className="rounded-full px-2 py-[2px] font-medium text-[10px] tracking-[0.02em]"
													// biome-ignore lint/nursery/noInlineStyles: dynamic category-based colors from lookup table
													style={{
														background: CATEGORY_COLORS[tool.category],
														color: CATEGORY_TEXT[tool.category],
													}}
												>
													{tool.category}
												</span>
												<span className="text-[11px] text-[var(--text-ghost)] tracking-[-0.01em]">
													{tool.tagline}
												</span>
											</div>

											{/* Flat visit link */}
											<a
												href={tool.website}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center gap-[5px] text-[12px] text-[var(--text-muted)] tracking-[-0.01em] no-underline transition-colors duration-150 hover:text-[var(--text-primary)]"
											>
												{tool.website.replace(/^https?:\/\//, '')}
												<HugeiconsIcon icon={LinkSquare02Icon} size={11} />
											</a>
										</div>

										{/* Divider */}
										<div className="mb-5 h-px bg-[var(--border)]" />

										{/* Thoughts */}
										<div className="mb-2.5 font-medium text-[10px] text-[var(--text-ghost)] uppercase tracking-[0.07em]">
											My thoughts
										</div>
										<p className="m-0 text-[13px] text-[var(--text-muted)] leading-[1.7]">
											{tool.thoughts}
										</p>
									</div>
								</m.div>
							</Dialog.Content>
						</Dialog.Portal>
					)}
				</AnimatePresence>
			</Dialog.Root>
		</LazyMotion>
	);
}

export default function ToolsGrid() {
	const [selected, setSelected] = useState<Tool | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [activeCategory, setActiveCategory] = useState<ToolCategory | 'All'>('All');

	const filtered =
		activeCategory === 'All' ? TOOLS : TOOLS.filter((t) => t.category === activeCategory);

	const openTool = (tool: Tool) => {
		setSelected(tool);
		setDrawerOpen(true);
	};

	return (
		<LazyMotion features={loadFeatures}>
			<div>
				{/* Category filters */}
				<div className="mb-7 flex flex-wrap gap-1.5">
					{(['All', ...TOOL_CATEGORIES] as const).map((cat) => (
						<button
							type="button"
							key={cat}
							onClick={() => setActiveCategory(cat)}
							className="cursor-pointer rounded-full border px-[10px] py-[3px] text-[11px] tracking-[0.01em] transition-all duration-150"
							// biome-ignore lint/nursery/noInlineStyles: dynamic background/color/borderColor based on active category
							style={{
								background: activeCategory === cat ? 'var(--foreground)' : 'transparent',
								color: activeCategory === cat ? 'var(--background)' : 'var(--text-ghost)',
								borderColor: activeCategory === cat ? 'var(--foreground)' : 'var(--border)',
							}}
						>
							{cat}
						</button>
					))}
				</div>

				{/* Grid */}
				<div className="grid gap-x-4 gap-y-6 [grid-template-columns:repeat(auto-fill,minmax(80px,1fr))]">
					<AnimatePresence mode="popLayout">
						{filtered.map((tool, i) => (
							<m.button
								key={tool.id}
								layout
								initial={{ opacity: 0, scale: 0.85, filter: 'blur(4px)' }}
								animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
								exit={{ opacity: 0, scale: 0.85, filter: 'blur(4px)' }}
								transition={{ duration: 0.3, ease: EASE, delay: i * 0.03 }}
								whileHover={{ scale: 1.06 }}
								whileTap={{ scale: 0.96 }}
								onClick={() => openTool(tool)}
								className="flex cursor-pointer flex-col items-center gap-2 rounded-[10px] bg-transparent px-1 py-2"
							>
								<ToolIcon src={tool.icon} name={tool.name} size={44} />
								<span className="max-w-[72px] text-center text-[11px] text-[var(--text-muted)] leading-[1.2] tracking-[-0.01em]">
									{tool.name}
								</span>
							</m.button>
						))}
					</AnimatePresence>
				</div>

				<ToolDrawer tool={selected} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
			</div>
		</LazyMotion>
	);
}
