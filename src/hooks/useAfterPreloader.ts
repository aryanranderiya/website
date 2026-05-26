import { useEffect, useState } from 'react';

function isPreloaderDone() {
	try {
		return !!sessionStorage.getItem('preloader_shown');
	} catch {
		// sessionStorage unavailable (private browsing, sandboxed iframe, etc.) —
		// treat as done so components are never permanently hidden.
		return true;
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

		const markReady = () => setReady(true);

		const handler = () => markReady();
		window.addEventListener('preloader:done', handler, { once: true });

		// Fallback poll: catches the case where this component hydrated (via
		// client:visible) in the ~400ms window after preloader:done fired but
		// before Preloader.tsx writes sessionStorage (it delays the write to let
		// the overlay fade out). The poll resolves within 100ms of the write.
		const interval = setInterval(() => {
			if (isPreloaderDone()) {
				markReady();
				clearInterval(interval);
			}
		}, 100);

		// Hard safety net: if preloader:done was missed AND sessionStorage is
		// never written (e.g. sessionStorage quota error on the Preloader side,
		// or a view-transition navigation where the Preloader component didn't
		// run), force ready after 1.5s so content is never permanently invisible.
		const safetyTimer = setTimeout(markReady, 1500);

		return () => {
			window.removeEventListener('preloader:done', handler);
			clearInterval(interval);
			clearTimeout(safetyTimer);
		};
	}, []);

	return ready;
}
