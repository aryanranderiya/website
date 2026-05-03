'use client';

import { HugeiconsIcon, Layers01Icon } from '@icons';
import { LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { useEffect, useMemo, useState } from 'react';
import { Map as MapcnMap, MapMarker, MarkerContent } from '@/components/ui/map';
import { SITE } from '@/constants/site';
import { useAfterPreloader } from '@/hooks/useAfterPreloader';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

const LNG = SITE.coords.lng;
const LAT = SITE.coords.lat;

// Free CARTO basemap presets. Each preset has a light + dark variant so the
// map stays theme-compatible no matter which preset is selected.
const BASEMAPS = [
	{
		id: 'positron',
		light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
		dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
	},
	{
		id: 'voyager',
		light: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
		dark: 'https://basemaps.cartocdn.com/gl/voyager-nolabels-gl-style/style.json',
	},
	{
		id: 'minimal',
		light: 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json',
		dark: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
	},
] as const;

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
			onClick={onClick}
			aria-label="Shuffle map theme"
			className="absolute top-2 right-2 z-10 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/85 text-[rgba(0,0,0,0.7)] shadow-[0_1px_3px_rgba(0,0,0,0.15)] backdrop-blur-md transition hover:bg-white dark:bg-neutral-900/85 dark:text-white/80 dark:hover:bg-neutral-900"
		>
			<HugeiconsIcon icon={Layers01Icon} size={14} />
		</button>
	);
}

function MapWidgetInner() {
	const ready = useAfterPreloader();
	const [presetIndex, setPresetIndex] = useState(0);

	const styles = useMemo(() => {
		const preset = BASEMAPS[presetIndex];
		return { light: preset.light, dark: preset.dark };
	}, [presetIndex]);

	const cycleBasemap = () => setPresetIndex((i) => (i + 1) % BASEMAPS.length);

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
