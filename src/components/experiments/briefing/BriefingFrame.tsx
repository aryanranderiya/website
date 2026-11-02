'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { buildEdition, resolveSkin } from './edition';
import manifest from './manifest.json';
import type { Draft, FrameReply, FrameRequest, Headings, Look, Template } from './types';

const NO_HEADINGS: Headings = {};

/** The frame is sandboxed to an opaque origin, so its target origin can only be "*". */
function send(frame: HTMLIFrameElement | null, request: FrameRequest) {
	frame?.contentWindow?.postMessage(request, '*');
}

/** The templates' design canvas (GAIA's EXPLORER_CANVAS_PX). */
const CANVAS_PX = 540;

interface Props {
	draft: Draft;
	look: Look;
	/** Renamed section headings for this edition. */
	headings?: Headings;
	onTemplates?: (templates: Template[]) => void;
	/** The edition's own section headings, after every render. */
	onHeadings?: (headings: Headings) => void;
	className?: string;
}

/** Renders one edition in an isolated frame, scaled down to fit its container. */
export function BriefingFrame({
	draft,
	look,
	headings = NO_HEADINGS,
	onTemplates,
	onHeadings,
	className,
}: Props) {
	const wrapRef = useRef<HTMLDivElement>(null);
	const frameRef = useRef<HTMLIFrameElement>(null);
	const [templates, setTemplates] = useState<Template[] | null>(null);
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

	const onReply = useEffectEvent((reply: FrameReply) => {
		if (reply.type === 'ready') {
			setTemplates(reply.templates);
			onTemplates?.(reply.templates);
		} else if (reply.type === 'rendered') {
			setHeight(reply.height);
			onHeadings?.(reply.headings);
		} else {
			setHeight(reply.height);
		}
	});

	useEffect(() => {
		const onMessage = (event: MessageEvent<FrameReply>) => {
			if (event.source === frameRef.current?.contentWindow) onReply(event.data);
		};
		window.addEventListener('message', onMessage);
		return () => window.removeEventListener('message', onMessage);
	}, []);

	useEffect(() => {
		if (!templates) return;
		const template = templates.find((t) => t.id === look.family);
		if (!template) throw new Error(`unknown edition family: ${look.family}`);
		send(frameRef.current, {
			type: 'render',
			family: look.family,
			skin: resolveSkin(template, look),
			ed: buildEdition(draft, look),
			overrides: headings,
		});
	}, [templates, draft, look, headings]);

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
					ref={frameRef}
					src={`${manifest.base}/frame.html`}
					title="Briefing preview"
					// scripts only: the templates are JS; no same-origin, so the frame talks by message
					sandbox="allow-scripts"
					onLoad={(event) => send(event.currentTarget, { type: 'hello' })}
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
