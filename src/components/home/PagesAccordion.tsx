'use client';

import { AnimatePresence, LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { useState } from 'react';
import { type NavPage, PAGES } from '@/constants/navigation';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

function AccordionItem({ page, index }: { page: NavPage; index: number }) {
	const [open, setOpen] = useState(false);
	const hasChildren = page.children && page.children.length > 0;

	return (
		<LazyMotion features={loadFeatures}>
			<m.div
				initial={{ opacity: 0, x: -12 }}
				whileInView={{ opacity: 1, x: 0 }}
				viewport={{ once: true, margin: '-10px' }}
				transition={{ delay: index * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
			>
				<div className="border-b border-[var(--border)]">
					<button
						type="button"
						onClick={() => hasChildren && setOpen((o) => !o)}
						className={`flex items-center justify-between w-full py-4 text-left transition-all duration-150 bg-transparent border-0 p-[1rem_0] select-none ${hasChildren ? 'cursor-pointer' : 'cursor-default'}`}
					>
						<div className="flex items-center gap-4">
							<a
								href={page.href}
								className="text-sm font-medium tracking-[-0.01em] text-[var(--foreground)] transition-opacity hover:opacity-60"
								onClick={(e) => e.stopPropagation()}
							>
								{page.label}
							</a>
							<span className="text-xs hidden sm:block text-[var(--muted-foreground)]">
								{page.description}
							</span>
						</div>
						{hasChildren && (
							<m.span
								animate={{ rotate: open ? 45 : 0 }}
								transition={{ duration: 0.2 }}
								className="text-[var(--muted-foreground)] text-[18px] leading-none flex"
							>
								+
							</m.span>
						)}
					</button>

					<AnimatePresence initial={false}>
						{open && hasChildren && (
							<m.div
								key="content"
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: 'auto', opacity: 1 }}
								exit={{ height: 0, opacity: 0 }}
								transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
								className="overflow-hidden"
							>
								<div className="pb-3 pl-4 flex flex-col gap-1">
									{page.children?.map((child) => (
										<a
											key={child.href}
											href={child.href}
											className="flex items-center gap-3 py-2 rounded-lg px-3 text-sm transition-all duration-150 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
										>
											<span className="w-1 h-1 rounded-full flex-shrink-0 bg-[var(--muted-foreground)]" />
											<span>{child.label}</span>
											{child.description && (
												<span className="ml-auto text-xs hidden sm:block text-[var(--muted-foreground)] opacity-70">
													{child.description}
												</span>
											)}
										</a>
									))}
								</div>
							</m.div>
						)}
					</AnimatePresence>
				</div>
			</m.div>
		</LazyMotion>
	);
}

export default function PagesAccordion() {
	const pages = PAGES.filter((p) => p.href !== '/');

	return (
		<section className="py-16">
			<div className="text-label mb-6 text-[var(--muted-foreground)]">Explore</div>
			<div>
				{pages.map((page, i) => (
					<AccordionItem key={page.href} page={page} index={i} />
				))}
			</div>
		</section>
	);
}
