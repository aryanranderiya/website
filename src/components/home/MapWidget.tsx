'use client';

import { LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { useEffect, useRef, useState } from 'react';
import { SITE } from '@/constants/site';
import { useAfterPreloader } from '@/hooks/useAfterPreloader';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

const LNG = SITE.coords.lng;
const LAT = SITE.coords.lat;

const STYLE_LIGHT = 'mapbox://styles/mapbox/light-v11';
const STYLE_DARK = 'mapbox://styles/mapbox/dark-v11';

function isDarkMode() {
	return document.documentElement.classList.contains('dark');
}

const TOKEN = (import.meta.env as Record<string, string | undefined>).PUBLIC_MAPBOX_TOKEN;

function createAvatarMarkerEl() {
	const el = document.createElement('div');
	el.style.cssText = `
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background-image: url('/memoji.png');
    background-size: cover;
    background-position: center;
    border: 2.5px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    cursor: default;
  `;
	return el;
}

function MapWidgetFixture() {
	return <div className="h-40 rounded-[20px] bg-black/[0.06]" />;
}

function MapWidgetInner() {
	const containerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<{ setStyle: (s: string) => void; remove: () => void } | null>(null);
	const markerRef = useRef<{ remove: () => void } | null>(null);
	const observerRef = useRef<MutationObserver | null>(null);
	const [containerReady, setContainerReady] = useState(false);
	const ready = useAfterPreloader();

	// State-tracked ref so the init effect reruns once the container element
	// exists. Without this, hydration order between Spotify and Map could
	// leave the map permanently un-initialized.
	const setContainerRef = (el: HTMLDivElement | null) => {
		containerRef.current = el;
		if (el && !containerReady) setContainerReady(true);
	};

	useEffect(() => {
		if (!containerRef.current || mapRef.current || !TOKEN) return;

		let cancelled = false;

		async function initMap() {
			const [{ default: mapboxgl }] = await Promise.all([
				import('mapbox-gl'),
				import('mapbox-gl/dist/mapbox-gl.css'),
			]);

			if (cancelled || !containerRef.current) return;

			if (!TOKEN) return;
			mapboxgl.accessToken = TOKEN;

			const map = new mapboxgl.Map({
				container: containerRef.current,
				style: isDarkMode() ? STYLE_DARK : STYLE_LIGHT,
				center: [LNG, LAT],
				zoom: 10.5,
				interactive: true,
				attributionControl: false,
			});

			markerRef.current = new mapboxgl.Marker({ element: createAvatarMarkerEl(), offset: [0, -35] })
				.setLngLat([LNG, LAT])
				.addTo(map);

			mapRef.current = map;

			// Sync style when the `dark` class is toggled on <html>
			observerRef.current = new MutationObserver(() => {
				mapRef.current?.setStyle(isDarkMode() ? STYLE_DARK : STYLE_LIGHT);
			});
			observerRef.current.observe(document.documentElement, {
				attributes: true,
				attributeFilter: ['class'],
			});

			// Re-add marker after style reload (setStyle removes all layers/sources)
			map.on('style.load', () => {
				if (markerRef.current) {
					markerRef.current.remove();
					markerRef.current = new mapboxgl.Marker({
						element: createAvatarMarkerEl(),
						offset: [0, -35],
					})
						.setLngLat([LNG, LAT])
						.addTo(map);
				}
			});
		}

		initMap();

		return () => {
			cancelled = true;
			observerRef.current?.disconnect();
			observerRef.current = null;
			if (mapRef.current) {
				mapRef.current.remove();
				mapRef.current = null;
				markerRef.current = null;
			}
		};
	}, [containerReady]);

	if (!TOKEN) {
		return null;
	}

	return (
		<LazyMotion features={loadFeatures}>
			<m.div
				initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
				animate={ready ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
				transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1], delay: 0.32 }}
				className="rounded-2xl overflow-hidden h-40 bg-black/[0.06]"
			>
				<div ref={setContainerRef} className="w-full h-full" />
			</m.div>
		</LazyMotion>
	);
}

export default function MapWidget() {
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return <MapWidgetFixture />;
	return <MapWidgetInner />;
}
