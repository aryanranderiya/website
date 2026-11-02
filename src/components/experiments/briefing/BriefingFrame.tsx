'use client';

import { useEffect, useRef, useState } from 'react';
import { buildEdition, resolveSkin } from './edition';
import manifest from './manifest.json';
import type { Draft, BriefingFrame as Frame, Look, Template } from './types';

/** The templates' design canvas (GAIA's EXPLORER_CANVAS_PX). */
const CANVAS_PX = 540;

interface Props {
	draft: Draft;
	look: Look;
	onTemplates?: (templates: Template[]) => void;
	className?: string;
}

/** Renders one edition in an isolated frame, scaled down to fit its container. */
export function BriefingFrame({ draft, look, onTemplates, className }: Props) {
	const wrapRef = useRef<HTMLDivElement>(null);
	const [frame, setFrame] = useState<Frame | null>(null);
	const [height, setHeight] = useState(0);
	const [scale, setScale] = useState(1);

	useEffect(() => {
		const el = wrapRef.current;
		if (!el) return;
		const observer = new ResizeObserver(([entry]) =>
			setScale(Math.min(1, entry.contentRect.width / CANVAS_PX))
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (!frame) return;
		const template = frame.templates.find((t) => t.id === look.family);
		if (!template) throw new Error(`unknown edition family: ${look.family}`);
		const edition = buildEdition(draft, look);
		setHeight(frame.render(look.family, resolveSkin(template, look), edition));
	}, [frame, draft, look]);

	const handleLoad = (event: React.SyntheticEvent<HTMLIFrameElement>) => {
		const win = event.currentTarget.contentWindow as (Window & { briefing: Frame }) | null;
		if (!win?.briefing) throw new Error('briefing frame did not expose its templates');
		win.briefing.onHeight = setHeight;
		setFrame(win.briefing);
		onTemplates?.(win.briefing.templates);
	};

	return (
		<div ref={wrapRef} className={className}>
			<div
				className="relative mx-auto overflow-hidden"
				// biome-ignore lint/style/noInlineStyles: dynamic size from the measured edition height and container scale
				style={{
					width: CANVAS_PX * scale,
					height: height ? height * scale : CANVAS_PX * 1.4 * scale,
				}}
			>
				<iframe
					src={`${manifest.base}/frame.html`}
					title="Briefing preview"
					// same-origin: the parent calls the frame's render(); scripts: the templates are JS
					sandbox="allow-scripts allow-same-origin"
					onLoad={handleLoad}
					tabIndex={-1}
					className="pointer-events-none absolute top-0 left-0 origin-top-left transition-opacity duration-300"
					// biome-ignore lint/style/noInlineStyles: dynamic canvas height and scale transform
					style={{
						width: CANVAS_PX,
						height: height || CANVAS_PX * 1.4,
						transform: `scale(${scale})`,
						opacity: height ? 1 : 0,
					}}
				/>
			</div>
		</div>
	);
}
