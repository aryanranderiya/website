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
		// Every allocation below is owned by this effect and released by the
		// single teardown: each timer id is captured in a top-level `const`
		// and cleared there, and the fade-end listener is removed by reference.
		let cancelled = false;

		if (sessionStorage.getItem('preloader_shown')) {
			setShow(false);
		} else {
			// Cycle greetings while the page becomes ready, then fade out as soon
			// as it is — instead of a fixed ~800ms run. MIN keeps the morph from
			// flashing on instant loads; MAX caps a slow network so the intro
			// never hangs. This is what was inflating LCP/SI/TTI on first visit.
			const MIN_VISIBLE = 350;
			const MAX_VISIBLE = 1200;
			const STEP = 60;

			let finished = false;
			let minElapsed = false;
			let domReadyFired = false;
			let i = 0;

			const finish = () => {
				if (cancelled || finished) return;
				finished = true;
				clearInterval(cycleTimer);
				const overlay = overlayRef.current;
				if (overlay) overlay.style.opacity = '0';
				window.dispatchEvent(new CustomEvent('preloader:done'));
			};

			const maybeFinish = () => {
				if (minElapsed && domReadyFired) finish();
			};

			const cycleTimer = setInterval(() => {
				i = (i + 1) % greetings.length;
				setIndex(i);
			}, STEP);

			const minTimer = setTimeout(() => {
				minElapsed = true;
				maybeFinish();
			}, MIN_VISIBLE);

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
				domReadyFired = true;
				maybeFinish();
			});

			const capTimer = setTimeout(finish, MAX_VISIBLE);

			// Bricks-proof fallback: finish() runs at most at MAX_VISIBLE and
			// the fade takes 400ms, so if the overlay is still mounted past
			// MAX_VISIBLE + 700 the opacity transitionend never fired — force
			// the unmount instead of bricking the site behind a full-screen
			// overlay. Idempotent with the transitionend path (teardown clears
			// whichever loses the race).
			const fadeFallback = setTimeout(() => {
				setShow(false);
				sessionStorage.setItem('preloader_shown', '1');
			}, MAX_VISIBLE + 700);

			// The overlay fades via its 0.4s CSS opacity transition; unmount
			// when the fade completes instead of racing it with another timer.
			// Guard on target + property: transitionend bubbles, so a child
			// transition (e.g. the TextMorph greeting swap) must not trigger
			// the unmount. The fallback timer bricks-proof this: if the fade
			// never fires, the full-screen overlay still goes away.
			const overlay = overlayRef.current;
			const onFaded = (e: TransitionEvent) => {
				if (e.target !== overlay || e.propertyName !== 'opacity') return;
				if (fadeFallback) clearTimeout(fadeFallback);
				setShow(false);
				sessionStorage.setItem('preloader_shown', '1');
			};
			overlay?.addEventListener('transitionend', onFaded);

			return () => {
				cancelled = true;
				clearInterval(cycleTimer);
				clearTimeout(minTimer);
				clearTimeout(capTimer);
				clearTimeout(fadeFallback);
				overlay?.removeEventListener('transitionend', onFaded);
			};
		}
	}, []);

	if (!show) return null;

	return (
		<div
			ref={overlayRef}
			className="preloader-overlay fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--background)] [transition:opacity_0.4s_cubic-bezier(0.19,1,0.22,1)]"
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
