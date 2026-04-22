import { useEffect, useState } from 'react';

function isPreloaderDone() {
	try {
		return !!sessionStorage.getItem('preloader_shown');
	} catch {
		return false;
	}
}

export function useAfterPreloader() {
	// Start as `true` so SSR renders components in their visible (show) state.
	// This ensures the view-transition snapshot captures visible content, not
	// the opacity:0 initial state that caused content to vanish after navigation.
	//
	// On first visit (preloader not done), useEffect immediately resets to false
	// and waits for preloader:done — the preloader overlay covers the brief flash.
	const [ready, setReady] = useState(true);

	useEffect(() => {
		// Navigation / repeat visit: preloader already shown — stay ready immediately.
		if (isPreloaderDone()) return;

		// First visit: reset and wait for the preloader to signal done.
		setReady(false);

		const handler = () => setReady(true);
		window.addEventListener('preloader:done', handler, { once: true });

		// Fallback: poll in case the event fired before we mounted.
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
	}, []);

	return ready;
}
