'use client';

import { LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { useEffect, useState } from 'react';
import { Map as MapcnMap, MapMarker, MarkerContent } from '@/components/ui/map';
import { SITE } from '@/constants/site';
import { useAfterPreloader } from '@/hooks/useAfterPreloader';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

const LNG = SITE.coords.lng;
const LAT = SITE.coords.lat;

function MapWidgetFixture() {
	return <div className="h-40 rounded-2xl bg-black/[0.06]" />;
}

function AvatarMarker() {
	return (
		<div className="h-11 w-11 cursor-default rounded-full border-[2.5px] border-white bg-[url('/memoji.webp')] bg-center bg-cover shadow-[0_2px_8px_rgba(0,0,0,0.25)]" />
	);
}

function MapWidgetInner() {
	const ready = useAfterPreloader();

	return (
		<LazyMotion features={loadFeatures}>
			<m.div
				initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
				animate={ready ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
				transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1], delay: 0.32 }}
				className="h-40 overflow-hidden rounded-2xl bg-black/[0.06]"
			>
				<MapcnMap
					className="h-full w-full"
					viewport={{ center: [LNG, LAT], zoom: 10.5 }}
					attributionControl={false}
					interactive
				>
					<MapMarker longitude={LNG} latitude={LAT} anchor="bottom">
						<MarkerContent className="cursor-default">
							<AvatarMarker />
						</MarkerContent>
					</MapMarker>
				</MapcnMap>
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
