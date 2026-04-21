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
				<div className="border-[var(--border)] border-b">
					<button
						type="button"
						onClick={() => hasChildren && setOpen((o) => !o)}
						className={`flex w-full select-none items-center justify-between border-0 bg-transparent p-[1rem_0] py-4 text-left transition-all duration-150 ${hasChildren ? 'cursor-pointer' : 'cursor-default'}`}
					>
						<div className="flex items-center gap-4">
							<a
								href={page.href}
								className="font-medium text-[var(--foreground)] text-sm tracking-[-0.01em] transition-opacity hover:opacity-60"
								onClick={(e) => e.stopPropagation()}
							>
								{page.label}
							</a>
							<span className="hidden text-[var(--muted-foreground)] text-xs sm:block">
								{page.description}
							</span>
						</div>
						{hasChildren && (
							<m.span
								animate={{ rotate: open ? 45 : 0 }}
								transition={{ duration: 0.2 }}
								className="flex text-[18px] text-[var(--muted-foreground)] leading-none"
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
								<div className="flex flex-col gap-1 pb-3 pl-4">
									{page.children?.map((child) => (
										<a
											key={child.href}
											href={child.href}
											className="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--muted-foreground)] text-sm transition-all duration-150 hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
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
			<div className="mb-6 text-[var(--muted-foreground)] text-label">Explore</div>
			<div>
				{pages.map((page, i) => (
					<AccordionItem key={page.href} page={page} index={i} />
				))}
			</div>
		</section>
	);
}
