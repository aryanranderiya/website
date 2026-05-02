'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { AnimatePresence, motion } from 'framer-motion';
import {
	Children,
	type ComponentPropsWithoutRef,
	cloneElement,
	createContext,
	forwardRef,
	isValidElement,
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import { useProximityHover } from '@/hooks/use-proximity-hover';
import { fontWeights } from '@/lib/font-weight';
import { springs } from '@/lib/springs';
import { cn } from '@/lib/utils';

interface TabsValueOrderContextValue {
	valueOrder: string[];
	setValueOrder: (order: string[]) => void;
	selectedValue: string | undefined;
}

const TabsValueOrderContext = createContext<TabsValueOrderContextValue | null>(null);

interface TabsListContextValue {
	registerTab: (index: number, value: string, el: HTMLElement | null) => void;
	hoveredIndex: number | null;
	selectedValue: string | undefined;
	setOptimisticIdx: (index: number) => void;
}

const TabsListContext = createContext<TabsListContextValue | null>(null);

function useTabsList() {
	const ctx = useContext(TabsListContext);
	if (!ctx) throw new Error('TabItem must be used within a TabsList');
	return ctx;
}

interface TabsProps
	extends Omit<ComponentPropsWithoutRef<typeof TabsPrimitive.Root>, 'onValueChange' | 'onSelect'> {
	value?: string;
	onValueChange?: (value: string) => void;
	selectedIndex?: number;
	onSelect?: (index: number) => void;
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
	({ value, onValueChange, selectedIndex, onSelect, defaultValue, children, ...props }, ref) => {
		const [valueOrder, setValueOrder] = useState<string[]>([]);
		const [uncontrolledValue, setUncontrolledValue] = useState<string | undefined>(defaultValue);

		const updateValueOrder = useCallback((order: string[]) => {
			setValueOrder((current) => {
				if (current.length === order.length && current.every((v, index) => v === order[index])) {
					return current;
				}
				return order;
			});
		}, []);

		const resolvedValue =
			value ?? (selectedIndex != null ? valueOrder[selectedIndex] : uncontrolledValue);

		const handleValueChange = useCallback(
			(newValue: string) => {
				if (value === undefined && selectedIndex == null) {
					setUncontrolledValue(newValue);
				}
				onValueChange?.(newValue);
				if (onSelect) {
					const idx = valueOrder.indexOf(newValue);
					if (idx !== -1) onSelect(idx);
				}
			},
			[onValueChange, onSelect, valueOrder, value, selectedIndex]
		);

		return (
			<TabsValueOrderContext.Provider
				value={{
					valueOrder,
					setValueOrder: updateValueOrder,
					selectedValue: resolvedValue,
				}}
			>
				<TabsPrimitive.Root
					ref={ref}
					value={resolvedValue}
					onValueChange={handleValueChange}
					defaultValue={resolvedValue == null ? defaultValue : undefined}
					activationMode="automatic"
					{...props}
				>
					{children}
				</TabsPrimitive.Root>
			</TabsValueOrderContext.Provider>
		);
	}
);

Tabs.displayName = 'Tabs';

type TabsListProps = ComponentPropsWithoutRef<typeof TabsPrimitive.List>;

const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
	({ children, className, ...props }, ref) => {
		const containerRef = useRef<HTMLDivElement>(null);
		const isMouseInside = useRef(false);
		const valueOrderCtx = useContext(TabsValueOrderContext);
		const [optimisticIdx, setOptimisticIdx] = useState<number | null>(null);

		const values = Children.toArray(children)
			.filter(isValidElement)
			.map((child) => (child.props as { value?: string }).value)
			.filter((v): v is string => typeof v === 'string');
		const _valueOrderKey = values.join(',');
		const setValueOrder = valueOrderCtx?.setValueOrder;

		useLayoutEffect(() => {
			setValueOrder?.(values);
		}, [setValueOrder, values]);

		const {
			activeIndex: hoveredIndex,
			setActiveIndex: setHoveredIndex,
			itemRects,
			handlers,
			registerItem,
			measureItems,
		} = useProximityHover(containerRef, { axis: 'x' });

		const registerTab = useCallback(
			(index: number, _value: string, el: HTMLElement | null) => {
				registerItem(index, el);
			},
			[registerItem]
		);

		useEffect(() => {
			measureItems();
		}, [measureItems]);

		useEffect(() => {
			const el = containerRef.current;
			if (!el) return;
			const ro = new ResizeObserver(() => measureItems());
			ro.observe(el);
			return () => ro.disconnect();
		}, [measureItems]);

		const handleMouseMove = useCallback(
			(e: React.MouseEvent) => {
				isMouseInside.current = true;
				handlers.onMouseMove(e);
			},
			[handlers]
		);

		const handleMouseLeave = useCallback(() => {
			isMouseInside.current = false;
			handlers.onMouseLeave();
		}, [handlers]);

		const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
		const selectedValue = valueOrderCtx?.selectedValue;
		const selectedIdx = selectedValue !== undefined ? values.indexOf(selectedValue) : -1;

		useEffect(() => {
			setOptimisticIdx(selectedIdx >= 0 ? selectedIdx : null);
		}, [selectedIdx]);

		const activeSelectedIdx = optimisticIdx;
		const selectedRect = activeSelectedIdx !== null ? itemRects[activeSelectedIdx] : null;
		const hoverRect = hoveredIndex !== null ? itemRects[hoveredIndex] : null;
		const focusRect = focusedIndex !== null ? itemRects[focusedIndex] : null;
		const isHoveringSelected = hoveredIndex === activeSelectedIdx;
		const isHovering = hoveredIndex !== null && !isHoveringSelected;

		const indexedChildren = Children.map(children, (child, i) => {
			if (isValidElement(child)) {
				return cloneElement(child, { _index: i } as Record<string, unknown>);
			}
			return child;
		});

		return (
			<TabsListContext.Provider
				value={{
					registerTab,
					hoveredIndex,
					selectedValue,
					setOptimisticIdx,
				}}
			>
				<TabsPrimitive.List
					ref={(node) => {
						(containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
						if (typeof ref === 'function') ref(node);
						else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
					}}
					onMouseMove={handleMouseMove}
					onMouseLeave={handleMouseLeave}
					onFocus={(e) => {
						const trigger = (e.target as HTMLElement).closest('[role="tab"]');
						if (!trigger) return;
						const indexAttr = trigger.getAttribute('data-proximity-index');
						if (indexAttr != null) {
							const idx = Number(indexAttr);
							setHoveredIndex(idx);
							setFocusedIndex((e.target as HTMLElement).matches(':focus-visible') ? idx : null);
						}
					}}
					onBlur={(e) => {
						if (containerRef.current?.contains(e.relatedTarget as Node)) return;
						setFocusedIndex(null);
						if (isMouseInside.current) return;
						setHoveredIndex(null);
					}}
					className={cn(
						'relative inline-flex select-none items-center gap-0.5 rounded-xl bg-[var(--muted-bg)] p-1',
						className
					)}
					{...props}
				>
					{selectedRect && (
						<motion.div
							className="pointer-events-none absolute rounded-lg bg-[var(--background)] shadow-sm dark:shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
							initial={false}
							animate={{
								left: selectedRect.left,
								width: selectedRect.width,
								top: selectedRect.top,
								height: selectedRect.height,
								opacity: isHovering ? 0.85 : 1,
							}}
							transition={{
								...springs.moderate,
								opacity: { duration: 0.08 },
							}}
						/>
					)}

					<AnimatePresence>
						{hoverRect && !isHoveringSelected && selectedRect && (
							<motion.div
								className="pointer-events-none absolute rounded-lg bg-[var(--foreground)]/10"
								initial={{
									left: selectedRect.left,
									width: selectedRect.width,
									top: selectedRect.top,
									height: selectedRect.height,
									opacity: 0,
								}}
								animate={{
									left: hoverRect.left,
									width: hoverRect.width,
									top: hoverRect.top,
									height: hoverRect.height,
									opacity: 0.4,
								}}
								exit={
									!isMouseInside.current && selectedRect
										? {
												left: selectedRect.left,
												width: selectedRect.width,
												top: selectedRect.top,
												height: selectedRect.height,
												opacity: 0,
												transition: {
													...springs.moderate,
													opacity: { duration: 0.06 },
												},
											}
										: { opacity: 0, transition: { duration: 0.06 } }
								}
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

					{indexedChildren}
				</TabsPrimitive.List>
			</TabsListContext.Provider>
		);
	}
);

TabsList.displayName = 'TabsList';

interface TabItemProps extends ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
	value: string;
	label: string;
	_index?: number;
}

const TabItem = forwardRef<HTMLButtonElement, TabItemProps>(
	({ value, label, _index = 0, className, ...props }, ref) => {
		const internalRef = useRef<HTMLButtonElement>(null);
		const { registerTab, selectedValue, setOptimisticIdx } = useTabsList();

		useEffect(() => {
			registerTab(_index, value, internalRef.current);
			return () => registerTab(_index, value, null);
		}, [_index, value, registerTab]);

		const isSelected = selectedValue === value;

		return (
			<TabsPrimitive.Trigger
				onClick={() => setOptimisticIdx(_index)}
				ref={(node) => {
					(internalRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
					if (typeof ref === 'function') ref(node);
					else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
				}}
				value={value}
				data-proximity-index={_index}
				className={cn(
					'relative z-10 flex cursor-pointer items-center gap-2 border-none bg-transparent px-3 py-1.5 outline-none',
					className
				)}
				{...props}
			>
				<span className="inline-grid whitespace-nowrap text-[12px]">
					<span
						className="invisible col-start-1 row-start-1"
						// biome-ignore lint/nursery/noInlineStyles: fontVariationSettings has no Tailwind equivalent
						style={{ fontVariationSettings: fontWeights.semibold }}
						aria-hidden="true"
					>
						{label}
					</span>
					<span
						className={cn(
							'col-start-1 row-start-1 transition-[color,font-variation-settings] duration-100',
							isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-ghost)]'
						)}
						// biome-ignore lint/nursery/noInlineStyles: fontVariationSettings has no Tailwind equivalent
						style={{
							fontVariationSettings: isSelected ? fontWeights.semibold : fontWeights.normal,
						}}
					>
						{label}
					</span>
				</span>
			</TabsPrimitive.Trigger>
		);
	}
);

TabItem.displayName = 'TabItem';

interface TabPanelProps extends ComponentPropsWithoutRef<typeof TabsPrimitive.Content> {
	value: string;
}

const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(({ className, ...props }, ref) => {
	return <TabsPrimitive.Content ref={ref} className={cn('outline-none', className)} {...props} />;
});

TabPanel.displayName = 'TabPanel';

export type { TabItemProps, TabPanelProps, TabsListProps, TabsProps };
export { TabItem, TabPanel, Tabs, TabsList };
