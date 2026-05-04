'use client';

import { DicesIcon } from '@icons';
import { LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { useEffect, useMemo, useState } from 'react';
import { Map as MapcnMap, MapMarker, MarkerContent } from '@/components/ui/map';
import { SITE } from '@/constants/site';
import { useAfterPreloader } from '@/hooks/useAfterPreloader';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

const LNG = SITE.coords.lng;
const LAT = SITE.coords.lat;

// Light-mode basemaps (only used when the site is in light mode).
const LIGHT_STYLES = [
	'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
	'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
	'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json',
	'https://basemaps.cartocdn.com/gl/voyager-nolabels-gl-style/style.json',
	'https://tiles.openfreemap.org/styles/liberty',
	'https://tiles.openfreemap.org/styles/bright',
	'https://tiles.openfreemap.org/styles/positron',
] as const;

// Dark-mode basemaps (only used when the site is in dark mode).
const DARK_STYLES = [
	'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
	'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
	'https://tiles.openfreemap.org/styles/dark',
] as const;

function useIsDark() {
	const [dark, setDark] = useState(false);
	useEffect(() => {
		const compute = () => document.documentElement.classList.contains('dark');
		setDark(compute());
		const obs = new MutationObserver(() => setDark(compute()));
		obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
		return () => obs.disconnect();
	}, []);
	return dark;
}

function MapWidgetFixture() {
	return <div className="h-40 rounded-2xl bg-black/[0.06]" />;
}

function AvatarMarker() {
	return (
		<div className="h-11 w-11 cursor-default rounded-full border-[2.5px] border-white bg-[url('/memoji.webp')] bg-center bg-cover shadow-[0_2px_8px_rgba(0,0,0,0.25)]" />
	);
}

function BasemapShuffle({ onClick }: { onClick: () => void }) {
	return (
		<button
			type="button"
			onPointerDown={(e) => e.stopPropagation()}
			onMouseDown={(e) => e.stopPropagation()}
			onClick={(e) => {
				e.stopPropagation();
				onClick();
			}}
			aria-label="Shuffle map theme"
			className="pointer-events-auto absolute top-2 right-2 z-50 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/40 text-[rgba(0,0,0,0.7)] shadow-[0_1px_3px_rgba(0,0,0,0.15)] backdrop-blur-md transition-all duration-200 ease-out hover:bg-white/60 active:scale-110 dark:bg-neutral-900/40 dark:text-white/80 dark:hover:bg-neutral-900/60"
		>
			<DicesIcon size={14} />
		</button>
	);
}

function MapWidgetInner() {
	const ready = useAfterPreloader();
	const isDark = useIsDark();
	const [lightIdx, setLightIdx] = useState(0);
	const [darkIdx, setDarkIdx] = useState(0);

	const styles = useMemo(
		() => ({ light: LIGHT_STYLES[lightIdx], dark: DARK_STYLES[darkIdx] }),
		[lightIdx, darkIdx]
	);

	const cycleBasemap = () => {
		if (isDark) setDarkIdx((i) => (i + 1) % DARK_STYLES.length);
		else setLightIdx((i) => (i + 1) % LIGHT_STYLES.length);
	};

	return (
		<LazyMotion features={loadFeatures}>
			<m.div
				initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
				animate={ready ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
				transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1], delay: 0.32 }}
				className="relative h-40 overflow-hidden rounded-2xl bg-black/[0.06]"
			>
				<MapcnMap
					className="h-full w-full"
					viewport={{ center: [LNG, LAT], zoom: 10.5 }}
					styles={styles}
					attributionControl={false}
					interactive
				>
					<MapMarker longitude={LNG} latitude={LAT} anchor="bottom">
						<MarkerContent className="cursor-default">
							<AvatarMarker />
						</MarkerContent>
					</MapMarker>
				</MapcnMap>
				<BasemapShuffle onClick={cycleBasemap} />
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
