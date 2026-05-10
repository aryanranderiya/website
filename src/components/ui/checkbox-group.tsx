'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { AnimatePresence, motion } from 'framer-motion';
import {
	createContext,
	forwardRef,
	type HTMLAttributes,
	type ReactNode,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import { useProximityHover } from '@/hooks/use-proximity-hover';
import { fontWeights } from '@/lib/font-weight';
import { springs } from '@/lib/springs';
import { cn } from '@/lib/utils';

interface CheckboxGroupContextValue {
	registerItem: (index: number, element: HTMLElement | null) => void;
	activeIndex: number | null;
}

const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);

function useCheckboxGroup() {
	const ctx = useContext(CheckboxGroupContext);
	if (!ctx) throw new Error('useCheckboxGroup must be used within a CheckboxGroup');
	return ctx;
}

interface CheckboxGroupProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode;
	checkedIndices: Set<number>;
}

const CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>(
	({ children, checkedIndices, className, ...props }, ref) => {
		const containerRef = useRef<HTMLDivElement>(null);
		const groupIdCounter = useRef(0);
		const prevGroupMap = useRef(new Map<number, number>());

		const {
			activeIndex,
			setActiveIndex,
			itemRects,
			sessionRef,
			handlers,
			registerItem,
			measureItems,
		} = useProximityHover(containerRef);

		useEffect(() => {
			measureItems();
		}, [measureItems]);

		const runs: { start: number; end: number }[] = [];
		const sortedChecked = [...checkedIndices].sort((a, b) => a - b);
		for (const idx of sortedChecked) {
			const last = runs[runs.length - 1];
			if (last && idx === last.end + 1) {
				last.end = idx;
			} else {
				runs.push({ start: idx, end: idx });
			}
		}

		const usedIds = new Set<number>();
		const newGroupMap = new Map<number, number>();
		const checkedGroups = runs.map((run) => {
			let stableId: number | null = null;
			for (let i = run.start; i <= run.end; i++) {
				const prevId = prevGroupMap.current.get(i);
				if (prevId !== undefined && !usedIds.has(prevId)) {
					stableId = prevId;
					break;
				}
			}
			const id = stableId ?? ++groupIdCounter.current;
			usedIds.add(id);
			for (let i = run.start; i <= run.end; i++) {
				newGroupMap.set(i, id);
			}
			return { ...run, id };
		});
		prevGroupMap.current = newGroupMap;

		const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

		const activeRect = activeIndex !== null ? itemRects[activeIndex] : null;
		const focusRect = focusedIndex !== null ? itemRects[focusedIndex] : null;
		const isHoveringOther = activeIndex !== null && !checkedIndices.has(activeIndex);

		return (
			<CheckboxGroupContext.Provider value={{ registerItem, activeIndex }}>
				{/* biome-ignore lint/a11y/useSemanticElements: <fieldset> doesn't accept the proximity-hover handlers without restyling */}
				<div
					ref={(node) => {
						(containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
						if (typeof ref === 'function') ref(node);
						else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
					}}
					onMouseEnter={handlers.onMouseEnter}
					onMouseMove={handlers.onMouseMove}
					onMouseLeave={handlers.onMouseLeave}
					onFocus={(e) => {
						const indexAttr = (e.target as HTMLElement)
							.closest('[data-proximity-index]')
							?.getAttribute('data-proximity-index');
						if (indexAttr != null) {
							const idx = Number(indexAttr);
							setActiveIndex(idx);
							setFocusedIndex((e.target as HTMLElement).matches(':focus-visible') ? idx : null);
						}
					}}
					onBlur={(e) => {
						if (containerRef.current?.contains(e.relatedTarget as Node)) return;
						setFocusedIndex(null);
						setActiveIndex(null);
					}}
					onKeyDown={(e) => {
						const items = Array.from(
							containerRef.current?.querySelectorAll('[role="checkbox"]') ?? []
						) as HTMLElement[];
						const currentIdx = items.indexOf(e.target as HTMLElement);
						if (currentIdx === -1) return;

						if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
							e.preventDefault();
							const next =
								e.key === 'ArrowDown'
									? (currentIdx + 1) % items.length
									: (currentIdx - 1 + items.length) % items.length;
							items[next].focus();
						} else if (e.key === 'Home') {
							e.preventDefault();
							items[0]?.focus();
						} else if (e.key === 'End') {
							e.preventDefault();
							items[items.length - 1]?.focus();
						}
					}}
					role="group"
					className={cn('relative flex w-full max-w-full select-none flex-col gap-0.5', className)}
					{...props}
				>
					<AnimatePresence>
						{checkedGroups.map((group) => {
							const startRect = itemRects[group.start];
							const endRect = itemRects[group.end];
							if (!startRect || !endRect) return null;
							const mergedTop = startRect.top;
							const mergedHeight = endRect.top + endRect.height - startRect.top;
							const mergedLeft = Math.min(startRect.left, endRect.left);
							const mergedWidth = Math.max(startRect.width, endRect.width);
							return (
								<motion.div
									key={`group-${group.id}`}
									className="pointer-events-none absolute rounded-lg bg-[var(--muted-bg-strong,var(--muted-bg))]"
									initial={false}
									animate={{
										top: mergedTop,
										left: mergedLeft,
										width: mergedWidth,
										height: mergedHeight,
										opacity: isHoveringOther ? 0.8 : 1,
									}}
									exit={{ opacity: 0, transition: { duration: 0.12 } }}
									transition={{
										...springs.moderate,
										opacity: { duration: 0.08 },
									}}
								/>
							);
						})}
					</AnimatePresence>

					<AnimatePresence>
						{activeRect && (
							<motion.div
								key={sessionRef.current}
								className="pointer-events-none absolute rounded-lg bg-[var(--muted-bg)]"
								initial={{
									opacity: 0,
									top: activeRect.top,
									left: activeRect.left,
									width: activeRect.width,
									height: activeRect.height,
								}}
								animate={{
									opacity: 1,
									top: activeRect.top,
									left: activeRect.left,
									width: activeRect.width,
									height: activeRect.height,
								}}
								exit={{ opacity: 0, transition: { duration: 0.06 } }}
								transition={{
									...springs.fast,
									opacity: { duration: 0.08 },
								}}
							/>
						)}
					</AnimatePresence>

					<AnimatePresence>
						{focusRect && (
							<motion.div
								className="pointer-events-none absolute z-20 rounded-[10px] border border-[#6B97FF]"
								initial={false}
								animate={{
									left: focusRect.left - 2,
									top: focusRect.top - 2,
									width: focusRect.width + 4,
									height: focusRect.height + 4,
								}}
								exit={{ opacity: 0, transition: { duration: 0.06 } }}
								transition={{
									...springs.fast,
									opacity: { duration: 0.08 },
								}}
							/>
						)}
					</AnimatePresence>

					{children}
				</div>
			</CheckboxGroupContext.Provider>
		);
	}
);

CheckboxGroup.displayName = 'CheckboxGroup';

interface CheckboxItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'aria-label'> {
	label: ReactNode;
	ariaLabel: string;
	index: number;
	checked: boolean;
	onToggle: () => void;
}

const CheckboxItem = forwardRef<HTMLDivElement, CheckboxItemProps>(
	({ label, ariaLabel, index, checked, onToggle, className, ...props }, ref) => {
		const internalRef = useRef<HTMLDivElement>(null);
		const hasMounted = useRef(false);
		const { registerItem, activeIndex } = useCheckboxGroup();

		useEffect(() => {
			registerItem(index, internalRef.current);
			return () => registerItem(index, null);
		}, [index, registerItem]);

		useEffect(() => {
			hasMounted.current = true;
		}, []);

		const isActive = activeIndex === index;
		const skipAnimation = !hasMounted.current;

		return (
			// biome-ignore lint/a11y/useSemanticElements: native checkbox can't host the rich ReactNode label content (icons, counts) inline
			<div
				ref={(node) => {
					(internalRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
					if (typeof ref === 'function') ref(node);
					else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
				}}
				data-proximity-index={index}
				tabIndex={0}
				role="checkbox"
				aria-checked={checked}
				aria-label={ariaLabel}
				onClick={onToggle}
				onKeyDown={(e) => {
					if (e.key === ' ' || e.key === 'Enter') {
						e.preventDefault();
						onToggle();
					}
				}}
				className={cn(
					'relative z-10 flex cursor-pointer items-center gap-2 rounded-lg px-2 py-[7px] outline-none',
					className
				)}
				{...props}
			>
				<CheckboxPrimitive.Root
					checked={checked}
					onCheckedChange={() => onToggle()}
					tabIndex={-1}
					aria-hidden
					className="relative h-[14px] w-[14px] shrink-0 cursor-pointer appearance-none border-0 bg-transparent p-0 outline-none"
					onClick={(e) => e.stopPropagation()}
				>
					<div
						className={cn(
							'absolute inset-0 rounded-[4px] border-solid transition-all duration-100',
							checked
								? 'border-[1.5px] border-transparent bg-[var(--text-primary)]'
								: isActive
									? 'border-[1.5px] border-[var(--text-ghost)]'
									: 'border-[1.5px] border-[var(--border-strong,var(--border))]'
						)}
					/>
					<AnimatePresence>
						{checked && (
							<CheckboxPrimitive.Indicator forceMount asChild>
								<motion.svg
									width={14}
									height={14}
									viewBox="0 0 24 24"
									fill="none"
									stroke="var(--popover)"
									strokeWidth={3}
									strokeLinecap="round"
									strokeLinejoin="round"
									className="absolute inset-0"
									initial={{ opacity: 1 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 1 }}
								>
									<title>Checked</title>
									<motion.path
										d="M6 12L10 16L18 8"
										initial={{ pathLength: skipAnimation ? 1 : 0 }}
										animate={{
											pathLength: 1,
											transition: { duration: 0.12, ease: 'easeOut' },
										}}
										exit={{
											pathLength: 0,
											transition: { duration: 0.06, ease: 'easeIn' },
										}}
									/>
								</motion.svg>
							</CheckboxPrimitive.Indicator>
						)}
					</AnimatePresence>
				</CheckboxPrimitive.Root>

				<span
					className={cn(
						'flex flex-1 items-center gap-[7px] text-[12px] tracking-[-0.01em] transition-[color,font-variation-settings] duration-100',
						checked || isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
					)}
					// biome-ignore lint/nursery/noInlineStyles: fontVariationSettings has no Tailwind equivalent
					style={{
						fontVariationSettings: checked ? fontWeights.semibold : fontWeights.normal,
					}}
				>
					{label}
				</span>
			</div>
		);
	}
);

CheckboxItem.displayName = 'CheckboxItem';

export { CheckboxGroup, CheckboxItem };
