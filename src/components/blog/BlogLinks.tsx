'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { type LinkPreview, PreviewCard } from '@/components/ui/PreviewLink';

interface ActiveLink {
	rect: DOMRect;
	preview: LinkPreview;
	href: string;
	isExternal: boolean;
}

/** URLs already warmed via `new Image()` — module-level so repeat scans and client-side navigations never refetch. */
const preloadedUrls = new Set<string>();

function isPreloadableUrl(url: string | undefined): url is string {
	if (!url) return false;
	return !/^(data|blob):/i.test(url);
}

/** Kick off a low-priority fetch for the tooltip's remote images before hover. */
function warmPreviewImages(preview: LinkPreview) {
	for (const url of [preview.image, preview.favicon]) {
		if (!isPreloadableUrl(url) || preloadedUrls.has(url)) continue;
		preloadedUrls.add(url);
		const img = new Image();
		img.decoding = 'async';
		img.src = url;
	}
}

export default function BlogLinks() {
	const [active, setActive] = useState<ActiveLink | null>(null);
	const [visible, setVisible] = useState(false);
	const leaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const activeAnchorRef = useRef<HTMLAnchorElement | null>(null);

	// react-doctor-disable-next-line react-doctor/effect-needs-cleanup -- the cleanup below owns every allocation (observer disconnect, per-anchor listeners, scroll/swap listeners, pending timer); the array just keeps per-anchor teardown together.
	useEffect(() => {
		const cleanup: Array<() => void> = [];

		// Warm each anchor's preview images shortly before it can be hovered.
		const warmObserver =
			typeof IntersectionObserver === 'undefined'
				? null
				: new IntersectionObserver(
						(entries) => {
							for (const entry of entries) {
								if (!entry.isIntersecting) continue;
								const anchor = entry.target as HTMLAnchorElement;
								warmObserver?.unobserve(anchor);
								const raw = anchor.getAttribute('data-preview');
								if (!raw) continue;
								try {
									warmPreviewImages(JSON.parse(raw) as LinkPreview);
								} catch {
									// Malformed preview JSON — hover binding already skipped it.
								}
							}
						},
						{ rootMargin: '400px' }
					);
		if (warmObserver) cleanup.push(() => warmObserver.disconnect());

		const bindAnchor = (a: HTMLAnchorElement) => {
			if (a.dataset.previewBound === '1') return;
			const raw = a.getAttribute('data-preview');
			if (!raw) return;
			let preview: LinkPreview;
			try {
				preview = JSON.parse(raw) as LinkPreview;
			} catch {
				return;
			}
			a.dataset.previewBound = '1';

			const enter = () => {
				clearTimeout(leaveTimer.current);
				activeAnchorRef.current = a;
				const isExternal = !a.href.startsWith('mailto:');
				setActive({ rect: a.getBoundingClientRect(), preview, href: a.href, isExternal });
				setVisible(true);
			};
			const leave = () => {
				leaveTimer.current = setTimeout(() => {
					if (activeAnchorRef.current === a) setVisible(false);
				}, 120);
			};

			a.addEventListener('mouseenter', enter);
			a.addEventListener('mouseleave', leave);
			a.addEventListener('focus', enter);
			a.addEventListener('blur', leave);

			cleanup.push(() => {
				a.removeEventListener('mouseenter', enter);
				a.removeEventListener('mouseleave', leave);
				a.removeEventListener('focus', enter);
				a.removeEventListener('blur', leave);
				delete a.dataset.previewBound;
				delete a.dataset.previewWarmQueued;
			});
		};

		const scan = () => {
			document.querySelectorAll<HTMLAnchorElement>('.prose a[data-preview]').forEach((a) => {
				bindAnchor(a);
				if (!warmObserver) {
					// No IntersectionObserver (legacy browser): warm immediately.
					const raw = a.getAttribute('data-preview');
					if (!raw) return;
					try {
						warmPreviewImages(JSON.parse(raw) as LinkPreview);
					} catch {
						// Malformed preview JSON — hover binding already skipped it.
					}
					return;
				}
				if (a.dataset.previewWarmQueued === '1') return;
				a.dataset.previewWarmQueued = '1';
				warmObserver.observe(a);
			});
		};

		scan();
		document.addEventListener('astro:after-swap', scan);
		cleanup.push(() => document.removeEventListener('astro:after-swap', scan));

		const onScroll = () => setVisible(false);
		window.addEventListener('scroll', onScroll, { passive: true });
		cleanup.push(() => window.removeEventListener('scroll', onScroll));

		return () => {
			clearTimeout(leaveTimer.current);
			cleanup.forEach((fn) => {
				fn();
			});
		};
	}, []);

	const cardEnter = () => {
		clearTimeout(leaveTimer.current);
	};
	const cardLeave = () => {
		setVisible(false);
	};

	if (!active || typeof document === 'undefined') return null;
	return createPortal(
		<PreviewCard
			key={active.href}
			rect={active.rect}
			visible={visible}
			preview={active.preview}
			href={active.href}
			isExternal={active.isExternal}
			onMouseEnter={cardEnter}
			onMouseLeave={cardLeave}
		/>,
		document.body
	);
}
