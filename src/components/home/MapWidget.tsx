'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { SITE } from '@/constants/site';

const LNG = SITE.coords.lng;
const LAT = SITE.coords.lat;

const STYLE_LIGHT = 'mapbox://styles/mapbox/light-v11';
const STYLE_DARK  = 'mapbox://styles/mapbox/dark-v11';

function isDarkMode() {
  return document.documentElement.classList.contains('dark');
}

const TOKEN = (import.meta as any).env?.PUBLIC_MAPBOX_TOKEN as string | undefined;

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

export default function MapWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !TOKEN) return;

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
    const observer = new MutationObserver(() => {
      mapRef.current?.setStyle(isDarkMode() ? STYLE_DARK : STYLE_LIGHT);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Re-add marker after style reload (setStyle removes all layers/sources)
    map.on('style.load', () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = new mapboxgl.Marker({ element: createAvatarMarkerEl(), offset: [0, -35] })
          .setLngLat([LNG, LAT])
          .addTo(map);
      }
    });

    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  if (!TOKEN) {
    return (
      <div
        className="rounded-2xl bg-[var(--muted-bg)] flex items-center justify-center"
        style={{ height: 160 }}
      >
        <span className="text-xs text-[var(--text-ghost)]">
          Set <code className="font-mono">PUBLIC_MAPBOX_TOKEN</code> to enable map
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ height: 160 }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
