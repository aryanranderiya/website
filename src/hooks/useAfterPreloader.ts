import { useEffect, useState } from 'react';

function isPreloaderDone() {
	try {
		return !!sessionStorage.getItem('preloader_shown');
	} catch {
		return false;
	}
}

export function useAfterPreloader() {
	// Always start as `false` even if the preloader has already been shown.
	// This guarantees that any framer-motion `animate={ready ? ... : ...}`
	// observes a state change after mount, so entrance animations actually
	// run on subsequent navigations within the same session.
	const [ready, setReady] = useState(false);

	useEffect(() => {
		if (ready) return;
		// If preloader already finished in this session, flip to ready on the
		// next frame so the initial render paints with `ready=false`, then
		// animation kicks in.
		if (isPreloaderDone()) {
			const id = requestAnimationFrame(() => setReady(true));
			return () => cancelAnimationFrame(id);
		}

		// Primary: listen for the event dispatched by Preloader
		const handler = () => setReady(true);
		window.addEventListener('preloader:done', handler, { once: true });

		// Fallback: if we mounted after the event already fired, poll sessionStorage
		// (sessionStorage is written ~400ms after the event, so poll briefly)
		const interval = setInterval(() => {
			if (isPreloaderDone()) {
				setReady(true);
				clearInterval(interval);
			}
		}, 100);

		return () => {
			window.removeEventListener('preloader:done', handler);
			clearInterval(interval);
		};
	}, [ready]);

	return ready;
}
