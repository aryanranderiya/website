'use client';

import { useEffect, useRef, useState } from 'react';
import { BriefingFrame } from './BriefingFrame';
import { ContentControls } from './ContentControls';
import { DEMO_DRAFT, DEMO_LOOK } from './demo';
import { WEEKLY_FAMILY } from './edition';
import { LookControls } from './LookControls';
import type { Look, Template } from './types';

const SIDE_BY_SIDE = '(min-width: 1024px)';
// Clears the page's fixed bottom blur so the panes end where they stay legible.
const BOTTOM_GAP_PX = 56;
const MIN_HEIGHT_PX = 480;

/** Fill the viewport below the element, so preview and controls scroll on their own. */
function useViewportHeight(ref: React.RefObject<HTMLElement | null>) {
	const [height, setHeight] = useState<number>();
	useEffect(() => {
		const query = window.matchMedia(SIDE_BY_SIDE);
		const measure = () => {
			const el = ref.current;
			if (!el || !query.matches) return setHeight(undefined);
			const top = el.getBoundingClientRect().top + window.scrollY;
			setHeight(Math.max(MIN_HEIGHT_PX, window.innerHeight - top - BOTTOM_GAP_PX));
		};
		measure();
		window.addEventListener('resize', measure);
		query.addEventListener('change', measure);
		return () => {
			window.removeEventListener('resize', measure);
			query.removeEventListener('change', measure);
		};
	}, [ref]);
	return height;
}

export default function BriefingConfigurator() {
	const rootRef = useRef<HTMLDivElement>(null);
	const height = useViewportHeight(rootRef);
	const [templates, setTemplates] = useState<Template[]>([]);
	const [look, setLook] = useState<Look>(DEMO_LOOK);
	const [draft, setDraft] = useState(DEMO_DRAFT);

	return (
		<div
			ref={rootRef}
			className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]"
			// biome-ignore lint/style/noInlineStyles: measured viewport height
			style={{ height }}
		>
			<div className="min-h-0 [scrollbar-width:none] overflow-y-auto overscroll-contain">
				<BriefingFrame draft={draft} look={look} onTemplates={setTemplates} />
			</div>
			<aside className="flex min-h-0 [scrollbar-width:thin] flex-col gap-8 overflow-y-auto overscroll-contain pr-1">
				{templates.length > 0 && (
					<LookControls templates={templates} look={look} onChange={setLook} />
				)}
				<ContentControls draft={draft} onChange={setDraft} weekly={look.family === WEEKLY_FAMILY} />
			</aside>
		</div>
	);
}
