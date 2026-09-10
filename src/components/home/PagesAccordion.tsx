'use client';

import { LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { useId, useState } from 'react';
import { type NavPage, PAGES } from '@/constants/navigation';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

function AccordionItem({ page, index }: { page: NavPage; index: number }) {
	const [open, setOpen] = useState(false);
	const hasChildren = !!page.children && page.children.length > 0;
	const expanded = open && hasChildren;
	const panelId = useId();

	return (
		<LazyMotion features={loadFeatures}>
			<m.div
				initial={{ opacity: 0, x: -12 }}
				whileInView={{ opacity: 1, x: 0 }}
				viewport={{ once: true, margin: '-10px' }}
				transition={{ delay: index * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
			>
				<div className="border-[var(--border)] border-b">
					{/* Row is a non-interactive wrapper: the page link and the expand
					    toggle are siblings so no <a> ever nests inside a <button>. */}
					<div className="flex w-full items-center justify-between gap-3 bg-transparent py-4 text-left transition-colors duration-150">
						<div className="flex min-w-0 items-center gap-4">
							<a
								href={page.href}
								className="font-medium text-[var(--foreground)] text-sm tracking-[-0.01em] transition-opacity hover:opacity-60"
							>
								{page.label}
							</a>
							<span className="hidden truncate text-[var(--muted-foreground)] text-xs sm:block">
								{page.description}
							</span>
						</div>
						{hasChildren && (
							<button
								type="button"
								onClick={() => setOpen((o) => !o)}
								aria-expanded={expanded}
								aria-controls={panelId}
								aria-label={`${expanded ? 'Collapse' : 'Expand'} ${page.label}`}
								className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-[18px] text-[var(--muted-foreground)] leading-none transition-colors duration-150 hover:text-[var(--foreground)]"
							>
								<m.span
									animate={{ rotate: expanded ? 45 : 0 }}
									transition={{ duration: 0.2 }}
									className="flex leading-none"
									aria-hidden="true"
								>
									+
								</m.span>
							</button>
						)}
					</div>

					{/* Expandable children: height is driven by CSS grid-template-rows
					    (toggled via style) with an opacity fade — no per-frame JS height
					    interpolation, so siblings reflow from layout without layout-thrash
					    animation. Content stays mounted so the open/close transition can
					    run; visibility hides it from sight and keyboard when collapsed. */}
					{hasChildren && (
						<div
							id={panelId}
							// biome-ignore lint/nursery/noInlineStyles: gridTemplateRows/opacity/visibility driven by expand state
							style={{
								display: 'grid',
								gridTemplateRows: expanded ? '1fr' : '0fr',
								opacity: expanded ? 1 : 0,
								visibility: expanded ? 'visible' : 'hidden',
							}}
							className="transition-[grid-template-rows,opacity,visibility] duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] motion-reduce:transition-none"
							aria-hidden={!expanded}
						>
							<div className="overflow-hidden">
								<div className="flex flex-col gap-1 pb-3 pl-4">
									{page.children?.map((child) => (
										<a
											key={child.href}
											href={child.href}
											className="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--muted-foreground)] text-sm transition-colors duration-150 hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
										>
											<span className="h-1 w-1 flex-shrink-0 rounded-full bg-[var(--muted-foreground)]" />
											<span>{child.label}</span>
											{child.description && (
												<span className="ml-auto hidden text-[var(--muted-foreground)] text-xs opacity-70 sm:block">
													{child.description}
												</span>
											)}
										</a>
									))}
								</div>
							</div>
						</div>
					)}
				</div>
			</m.div>
		</LazyMotion>
	);
}

export default function PagesAccordion() {
	const pages = PAGES.filter((p) => p.href !== '/');

	return (
		<section className="py-16">
			<div className="mb-6 text-[var(--muted-foreground)] text-label">Explore</div>
			<div>
				{pages.map((page, i) => (
					<AccordionItem key={page.href} page={page} index={i} />
				))}
			</div>
		</section>
	);
}
