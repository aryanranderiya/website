'use client';

import { lazy, Suspense, useEffect, useState } from 'react';

// The map UI pulls in maplibre-gl (~280KiB). Keep it out of the eagerly
// loaded chunk: this wrapper ships only the fixture, then lazy-imports the
// real map after the browser is idle (or on first interaction), so it never
// sits on the initial render path.
const MapWidgetInner = lazy(() => import('./MapWidgetInner'));

function MapWidgetFixture() {
	return <div className="h-40 rounded-2xl bg-black/[0.06]" />;
}

export default function MapWidget() {
	const [load, setLoad] = useState(false);

	useEffect(() => {
		let done = false;
		const trigger = () => {
			if (done) return;
			done = true;
			cleanup();
			setLoad(true);
		};

		const evts = ['pointerdown', 'keydown', 'scroll', 'mousemove', 'touchstart'];
		const cleanup = () => {
			for (const e of evts) window.removeEventListener(e, trigger);
		};
		for (const e of evts) window.addEventListener(e, trigger, { passive: true, once: true });

		const ric = window.requestIdleCallback;
		let idleId: number | undefined;
		let timeoutId: ReturnType<typeof setTimeout> | undefined;
		if (typeof ric === 'function') idleId = ric(trigger, { timeout: 3000 });
		else timeoutId = setTimeout(trigger, 1500);

		return () => {
			cleanup();
			if (idleId !== undefined && typeof window.cancelIdleCallback === 'function') {
				window.cancelIdleCallback(idleId);
			}
			if (timeoutId !== undefined) clearTimeout(timeoutId);
		};
	}, []);

	if (!load) return <MapWidgetFixture />;
	return (
		<Suspense fallback={<MapWidgetFixture />}>
			<MapWidgetInner />
		</Suspense>
	);
}
