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

export default function BlogLinks() {
	const [active, setActive] = useState<ActiveLink | null>(null);
	const [visible, setVisible] = useState(false);
	const leaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const activeAnchorRef = useRef<HTMLAnchorElement | null>(null);

	useEffect(() => {
		const cleanup: Array<() => void> = [];

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
			});
		};

		const scan = () => {
			document.querySelectorAll<HTMLAnchorElement>('.prose a[data-preview]').forEach(bindAnchor);
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
