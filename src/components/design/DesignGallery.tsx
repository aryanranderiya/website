'use client';

import { ArrowLeft02Icon, ArrowRight02Icon, Cancel01Icon, HugeiconsIcon } from '@icons';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import ProgressiveImg from '@/components/ui/ProgressiveImg';
import thumbhashes from '@/data/design-thumbhashes.json';
import { useAfterPreloader } from '@/hooks/useAfterPreloader';

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

export default function DesignGallery({
	apparel,
	headers,
	thumbnails,
	adMockups,
}: DesignGalleryProps) {
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const ready = useAfterPreloader();
	const [lightboxImages, setLightboxImages] = useState<string[]>([]);
	const [lightboxIndex, setLightboxIndex] = useState(0);

	const openLightbox = (images: string[], index: number) => {
		setLightboxImages(images);
		setLightboxIndex(index);
		setLightboxOpen(true);
	};

	const closeLightbox = useCallback(() => setLightboxOpen(false), []);

	const goPrev = useCallback(() => {
		setLightboxIndex((i) => (i - 1 + lightboxImages.length) % lightboxImages.length);
	}, [lightboxImages.length]);

	const goNext = useCallback(() => {
		setLightboxIndex((i) => (i + 1) % lightboxImages.length);
	}, [lightboxImages.length]);

	useEffect(() => {
		if (!lightboxOpen) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') closeLightbox();
			if (e.key === 'ArrowLeft') goPrev();
			if (e.key === 'ArrowRight') goNext();
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [lightboxOpen, goPrev, goNext, closeLightbox]);

	// Lock scroll + blur page content when lightbox is open
	useEffect(() => {
		const content = document.getElementById('page-content') as HTMLElement | null;
		const DURATION = 180;
		if (lightboxOpen) {
			document.body.style.overflow = 'hidden';
			if (content) {
				content.style.transition = `filter ${DURATION}ms ease`;
				requestAnimationFrame(() => {
					content.style.filter = 'blur(12px) brightness(0.6)';
				});
			}
		} else {
			document.body.style.overflow = '';
			if (content) {
				content.style.transition = `filter ${DURATION}ms ease`;
				content.style.filter = 'blur(0px) brightness(1)';
				const t = setTimeout(() => {
					content.style.filter = '';
					content.style.transition = '';
				}, DURATION + 20);
				return () => clearTimeout(t);
			}
		}
		return () => {
			document.body.style.overflow = '';
			if (content) {
				content.style.filter = '';
				content.style.transition = '';
			}
		};
	}, [lightboxOpen]);

	const apparelSrcs = apparel.map(apparelSrc);
	const headerSrcs = headers.map(headerSrc);
	const thumbnailSrcs = thumbnails.map(thumbnailSrc);
	const adMockupSrcs = adMockups.map(adMockupSrc);

	return (
		<motion.div
			initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
			animate={ready ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
			transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] as const, delay: 0.1 }}
		>
			{/* Apparel & Streetwear */}
			<section className="mb-14">
				<div className="section-header">Apparel &amp; Streetwear</div>
				<div className="grid grid-cols-3 max-[480px]:grid-cols-2 gap-1.5">
					{apparel.map((file, i) => (
						<ApparelItem
							key={file}
							src={apparelSrcs[i]}
							alt={altText(file)}
							onClick={() => openLightbox(apparelSrcs, i)}
						/>
					))}
				</div>
			</section>

			{/* Banners & Headers */}
			<section className="mb-14">
				<div className="section-header">Banners &amp; Headers</div>
				<div className="columns-2 max-[480px]:columns-1 [column-gap:6px]">
					{headers.map((file, i) => (
						<MasonryItem
							key={file}
							src={headerSrcs[i]}
							alt={altText(file)}
							onClick={() => openLightbox(headerSrcs, i)}
						/>
					))}
				</div>
			</section>

			{/* Thumbnails */}
			<section className="mb-14">
				<div className="section-header">Thumbnails</div>
				<div className="columns-2 max-[480px]:columns-1 [column-gap:6px]">
					{thumbnails.map((file, i) => (
						<MasonryItem
							key={file}
							src={thumbnailSrcs[i]}
							alt={altText(file)}
							onClick={() => openLightbox(thumbnailSrcs, i)}
						/>
					))}
				</div>
			</section>

			{/* Ad Mockups */}
			<section className="mb-14">
				<div className="section-header">Ad Mockups</div>
				<div className="columns-2 max-[480px]:columns-1 [column-gap:6px]">
					{adMockups.map((file, i) => (
						<MasonryItem
							key={file}
							src={adMockupSrcs[i]}
							alt={altText(file)}
							onClick={() => openLightbox(adMockupSrcs, i)}
						/>
					))}
				</div>
			</section>

			{/* Lightbox -- portalled to document.body so CSS filter on #page-content doesn't affect it */}
			{typeof document !== 'undefined' &&
				createPortal(
					<AnimatePresence>
						{lightboxOpen && (
							<Lightbox
								src={lightboxImages[lightboxIndex]}
								alt={altText(lightboxImages[lightboxIndex]?.split('/').pop() ?? '')}
								index={lightboxIndex}
								total={lightboxImages.length}
								onClose={closeLightbox}
								onPrev={goPrev}
								onNext={goNext}
							/>
						)}
					</AnimatePresence>,
					document.body
				)}
		</motion.div>
	);
}

/* ── Sub-components ─────────────────────────────────────────── */

function ApparelItem({ src, alt, onClick }: { src: string; alt: string; onClick: () => void }) {
	return (
		<ProgressiveImg
			src={src}
			alt={alt}
			hash={getHash(src)}
			className="aspect-square rounded-md overflow-hidden cursor-zoom-in group relative"
			imgClassName="w-full h-full object-cover block transition-[scale,filter] duration-300 ease-in-out group-hover:scale-[1.6] group-hover:brightness-[1.04]"
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
			className="break-inside-avoid rounded-md overflow-hidden mb-1.5 cursor-zoom-in group"
			imgClassName="w-full object-cover block transition-[scale,filter] duration-300 ease-in-out group-hover:scale-[1.12] group-hover:brightness-[1.04]"
			onClick={onClick}
		/>
	);
}

interface LightboxProps {
	src: string;
	alt: string;
	index: number;
	total: number;
	onClose: () => void;
	onPrev: () => void;
	onNext: () => void;
}

function Lightbox({ src, alt, index, total, onClose, onPrev, onNext }: LightboxProps) {
	return (
		<motion.div
			key="lightbox-overlay"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
			onClick={onClose}
			className="fixed inset-0 z-[100] flex items-center justify-center bg-[color-mix(in_srgb,var(--background)_60%,transparent)]"
		>
			{/* Image -- entry animation on src change only; close fades with the parent */}
			<motion.img
				key={src}
				src={src}
				alt={alt}
				initial={{ scale: 0.94, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.94, opacity: 0 }}
				transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
				onClick={(e) => e.stopPropagation()}
				className="relative max-h-[90vh] max-w-[90vw] object-contain block rounded-[6px] pointer-events-auto"
				draggable={false}
			/>

			{/* Close button */}
			<button
				type="button"
				onClick={(e) => {
					e.stopPropagation();
					onClose();
				}}
				aria-label="Close"
				className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center border-none rounded-full cursor-pointer shrink-0 bg-[color-mix(in_srgb,var(--foreground)_10%,transparent)] text-[var(--foreground)]"
			>
				<HugeiconsIcon icon={Cancel01Icon} size={16} color="currentColor" />
			</button>

			{/* Prev button */}
			{total > 1 && (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						onPrev();
					}}
					aria-label="Previous image"
					className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border-none rounded-full cursor-pointer shrink-0 bg-[color-mix(in_srgb,var(--foreground)_10%,transparent)] text-[var(--foreground)]"
				>
					<HugeiconsIcon icon={ArrowLeft02Icon} size={16} color="currentColor" />
				</button>
			)}

			{/* Next button */}
			{total > 1 && (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						onNext();
					}}
					aria-label="Next image"
					className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border-none rounded-full cursor-pointer shrink-0 bg-[color-mix(in_srgb,var(--foreground)_10%,transparent)] text-[var(--foreground)]"
				>
					<HugeiconsIcon icon={ArrowRight02Icon} size={16} color="currentColor" />
				</button>
			)}

			{/* Counter */}
			<div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[12px] tabular-nums tracking-[0.04em] pointer-events-none select-none text-[color-mix(in_srgb,var(--foreground)_50%,transparent)]">
				{index + 1} / {total}
			</div>
		</motion.div>
	);
}
