'use client';
import { useEffect, useRef, useState } from 'react';
import { TextMorph } from 'torph/react';

const greetings = [
	'Hello, World',
	'こんにちは、世界',
	'Hola, Mundo',
	'Bonjour, Monde',
	'مرحباً، العالم',
	'नमस्ते, दुनिया',
	'你好，世界',
	'Ciao, Mondo',
	'Olá, Mundo',
	'Привет, Мир',
	'안녕하세요, 세계',
	'Hallo, Welt',
	'Merhaba, Dünya',
	'Hej, Världen',
	'Γεια σου, Κόσμε',
	'Hello, World',
];

export default function Preloader() {
	const [index, setIndex] = useState(0);
	const [show, setShow] = useState(true);
	const overlayRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (sessionStorage.getItem('preloader_shown')) {
			setShow(false);
			return;
		}

		// Cycle greetings while the page becomes ready, then fade out as soon
		// as it is — instead of a fixed ~800ms run. MIN keeps the morph from
		// flashing on instant loads; MAX caps a slow network so the intro
		// never hangs. This is what was inflating LCP/SI/TTI on first visit.
		const MIN_VISIBLE = 350;
		const MAX_VISIBLE = 1200;
		const STEP = 60;

		let cancelled = false;
		let finished = false;
		let i = 0;
		const start = performance.now();
		let cycleTimer: ReturnType<typeof setTimeout>;
		let doneTimer: ReturnType<typeof setTimeout>;

		const cycle = () => {
			if (cancelled) return;
			i = (i + 1) % greetings.length;
			setIndex(i);
			cycleTimer = setTimeout(cycle, STEP);
		};
		cycleTimer = setTimeout(cycle, STEP);

		const finish = () => {
			if (cancelled || finished) return;
			finished = true;
			clearTimeout(cycleTimer);
			const overlay = overlayRef.current;
			if (overlay) overlay.style.opacity = '0';
			window.dispatchEvent(new CustomEvent('preloader:done'));
			doneTimer = setTimeout(() => {
				if (!cancelled) {
					setShow(false);
					sessionStorage.setItem('preloader_shown', '1');
				}
			}, 400);
		};

		// Ready = DOM parsed. We deliberately do NOT wait for `window.load`
		// (blocks on below-the-fold images/maps) nor `document.fonts.ready`
		// (the variable woff2 is slow on throttled networks and was the main
		// thing pinning LCP — the greeting briefly swaps from the fallback,
		// which is a far better trade than a ~1.5s delay).
		const domReady =
			document.readyState === 'loading'
				? new Promise<void>((r) =>
						document.addEventListener('DOMContentLoaded', () => r(), { once: true })
					)
				: Promise.resolve();

		domReady.then(() => {
			if (cancelled) return;
			const wait = Math.max(0, MIN_VISIBLE - (performance.now() - start));
			setTimeout(finish, wait);
		});

		const capTimer = setTimeout(finish, MAX_VISIBLE);

		return () => {
			cancelled = true;
			clearTimeout(cycleTimer);
			clearTimeout(doneTimer);
			clearTimeout(capTimer);
		};
	}, []);

	if (!show) return null;

	return (
		<div
			ref={overlayRef}
			className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--background)] [transition:opacity_0.4s_cubic-bezier(0.19,1,0.22,1)]"
		>
			<TextMorph
				duration={120}
				ease="cubic-bezier(0.19, 1, 0.22, 1)"
				className="select-none text-[15px] text-[var(--text-muted)] leading-none tracking-[-0.02em]"
				style={{ fontVariationSettings: '"wght" 580' }}
			>
				{greetings[index]}
			</TextMorph>
		</div>
	);
}
