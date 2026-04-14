import { useEffect, useState } from 'react';

function isPreloaderDone() {
	try {
		return !!sessionStorage.getItem('preloader_shown');
	} catch {
		return false;
	}
}

export function useAfterPreloader() {
	const [ready, setReady] = useState(isPreloaderDone);

	useEffect(() => {
		if (ready) return;

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
