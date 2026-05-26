'use client';

import { LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';

import { useRef } from 'react';
import ProgressiveImg from '@/components/ui/ProgressiveImg';
import thumbhashes from '@/data/design-thumbhashes.json';
import { useAfterPreloader } from '@/hooks/useAfterPreloader';
import { openGroup } from '@/lib/flip-lightbox';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

// Convert public URL → thumbhash lookup key: "/design/apparel/foo.webp" → "design/apparel/foo.webp"
function getHash(src: string): string | undefined {
	return (thumbhashes as Record<string, string>)[src.replace(/^\//, '')];
}

interface DesignGalleryProps {
	apparel: string[];
	headers: string[];
	thumbnails: string[];
	adMockups: string[];
}

function apparelSrc(file: string) {
	return `/design/apparel/${file}`;
}
function headerSrc(file: string) {
	return `/design/headers/${file}`;
}
function thumbnailSrc(file: string) {
	return `/design/thumbnails/${file}`;
}
function adMockupSrc(file: string) {
	return `/design/ad_mockups/${file}`;
}

function altText(file: string) {
	return file.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
}

// Open the shared FLIP lightbox with a whole section as the navigable group.
// We pass the on-page wrappers (their box is the visible, clipped thumbnail —
// stable even while the inner image is hover-scaled); the engine resolves the
// real <img> inside each for the cached source.
function openSection(grid: HTMLElement | null, index: number) {
	if (!grid) return;
	const items = Array.from(grid.children) as HTMLElement[];
	if (items.length) openGroup(items, index);
}

export default function DesignGallery({
	apparel,
	headers,
	thumbnails,
	adMockups,
}: DesignGalleryProps) {
	const ready = useAfterPreloader();
	const apparelGrid = useRef<HTMLDivElement>(null);
	const headersGrid = useRef<HTMLDivElement>(null);
	const thumbnailsGrid = useRef<HTMLDivElement>(null);
	const adMockupsGrid = useRef<HTMLDivElement>(null);

	const apparelSrcs = apparel.map(apparelSrc);
	const headerSrcs = headers.map(headerSrc);
	const thumbnailSrcs = thumbnails.map(thumbnailSrc);
	const adMockupSrcs = adMockups.map(adMockupSrc);

	return (
		<LazyMotion features={loadFeatures}>
			<m.div
				initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
				animate={ready ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
				transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] as const, delay: 0.1 }}
			>
				{/* Apparel & Streetwear */}
				<section className="mb-14">
					<div className="section-header">Apparel &amp; Streetwear</div>
					<div ref={apparelGrid} className="grid grid-cols-3 gap-1.5 max-[480px]:grid-cols-2">
						{apparel.map((file, i) => (
							<ApparelItem
								key={file}
								src={apparelSrcs[i]}
								alt={altText(file)}
								onClick={() => openSection(apparelGrid.current, i)}
							/>
						))}
					</div>
				</section>

				{/* Banners & Headers */}
				<section className="mb-14">
					<div className="section-header">Banners &amp; Headers</div>
					<div ref={headersGrid} className="columns-2 [column-gap:6px] max-[480px]:columns-1">
						{headers.map((file, i) => (
							<MasonryItem
								key={file}
								src={headerSrcs[i]}
								alt={altText(file)}
								onClick={() => openSection(headersGrid.current, i)}
							/>
						))}
					</div>
				</section>

				{/* Thumbnails */}
				<section className="mb-14">
					<div className="section-header">Thumbnails</div>
					<div ref={thumbnailsGrid} className="columns-2 [column-gap:6px] max-[480px]:columns-1">
						{thumbnails.map((file, i) => (
							<MasonryItem
								key={file}
								src={thumbnailSrcs[i]}
								alt={altText(file)}
								onClick={() => openSection(thumbnailsGrid.current, i)}
							/>
						))}
					</div>
				</section>

				{/* Ad Mockups */}
				<section className="mb-14">
					<div className="section-header">Ad Mockups</div>
					<div ref={adMockupsGrid} className="columns-2 [column-gap:6px] max-[480px]:columns-1">
						{adMockups.map((file, i) => (
							<MasonryItem
								key={file}
								src={adMockupSrcs[i]}
								alt={altText(file)}
								onClick={() => openSection(adMockupsGrid.current, i)}
							/>
						))}
					</div>
				</section>
			</m.div>
		</LazyMotion>
	);
}

/* ── Sub-components ─────────────────────────────────────────── */

function ApparelItem({ src, alt, onClick }: { src: string; alt: string; onClick: () => void }) {
	return (
		<ProgressiveImg
			src={src}
			alt={alt}
			hash={getHash(src)}
			// No hover zoom and the image itself is never touched — only the
			// wrapper background colour changes on hover. Keeps the FLIP seamless.
			className="relative aspect-square cursor-zoom-in overflow-hidden rounded-2xl bg-transparent transition-colors duration-300 hover:bg-[var(--muted-bg)]"
			imgClassName="w-full h-full object-cover block"
			onClick={onClick}
		/>
	);
}

function MasonryItem({ src, alt, onClick }: { src: string; alt: string; onClick: () => void }) {
	return (
		<ProgressiveImg
			src={src}
			alt={alt}
			hash={getHash(src)}
			className="mb-1.5 cursor-zoom-in break-inside-avoid overflow-hidden rounded-2xl bg-transparent transition-colors duration-300 hover:bg-[var(--muted-bg)]"
			imgClassName="w-full object-cover block"
			onClick={onClick}
		/>
	);
}
