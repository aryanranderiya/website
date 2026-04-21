'use client';

import { LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { useState } from 'react';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

interface BookProps {
	title: string;
	author: string;
	cover?: string;
	color?: string;
	pages?: number;
	onClick?: () => void;
	index?: number;
}

function bookColor(title: string): string {
	const palettes = [
		{ spine: '#1a3a5c', cover: '#1e4570' },
		{ spine: '#3a1a4a', cover: '#4a2060' },
		{ spine: '#1a3a1a', cover: '#1e4a20' },
		{ spine: '#5c2a10', cover: '#6e3412' },
		{ spine: '#1a1a4a', cover: '#222260' },
		{ spine: '#3a1a1a', cover: '#4e2020' },
		{ spine: '#2a3a1a', cover: '#344a20' },
		{ spine: '#1a3a3a', cover: '#1e4a4a' },
	];
	let hash = 0;
	for (let i = 0; i < title.length; i++) {
		hash = title.charCodeAt(i) + ((hash << 5) - hash);
	}
	return palettes[Math.abs(hash) % palettes.length].spine;
}

function bookDimensions(pages?: number) {
	const p = pages ?? 300;
	const height = Math.round(148 + Math.min((p / 900) * 38, 38));
	const coverWidth = Math.round(88 + Math.min((p / 900) * 18, 18));
	// spine: roughly 1px per 12 pages, min 14, max 28
	const spineWidth = Math.round(Math.min(Math.max(p / 12, 14), 28));
	return { height, coverWidth, spineWidth };
}

export default function Book3D({ title, author, cover, pages, onClick, index = 0 }: BookProps) {
	const [hovered, setHovered] = useState(false);
	const [imgError, setImgError] = useState(false);
	const { height, coverWidth, spineWidth } = bookDimensions(pages);
	const bg = bookColor(title);
	const showCover = cover && !imgError;

	return (
		<LazyMotion features={loadFeatures}>
			<m.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ delay: index * 0.07, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
				onHoverStart={() => setHovered(true)}
				onHoverEnd={() => setHovered(false)}
				onClick={onClick}
				className="relative flex-shrink-0 cursor-pointer select-none"
				style={{
					width: `${spineWidth + coverWidth}px`,
					height: `${height}px`,
					// No perspective here - parent row owns the 3D context
					transformStyle: 'preserve-3d',
				}}
				aria-label={`${title} by ${author}`}
			>
				{/* Book group -- rotates as one unit around spine (left edge) */}
				{/* transformPerspective adds perspective() into the transform chain -- this is the
          framer-motion-native way to get real 3D depth without relying on parent CSS perspective */}
				<m.div
					animate={{
						rotateY: hovered ? -32 : 0,
						y: hovered ? -14 : 0,
						x: hovered ? 8 : 0,
						transformPerspective: hovered ? 900 : 1400,
					}}
					transition={{ type: 'spring', stiffness: 260, damping: 20 }}
					style={{
						width: '100%',
						height: '100%',
						transformOrigin: 'left center',
						position: 'relative',
					}}
				>
					{/* ── SPINE (left face) ── */}
					<div
						className="absolute top-0 left-0 flex items-center justify-center overflow-hidden rounded-[2px_0_0_2px]"
						// biome-ignore lint/nursery/noInlineStyles: dynamic dimensions and gradient from props
						style={{
							width: spineWidth,
							height,
							background: showCover
								? 'linear-gradient(90deg, #111 0%, #2a1a0a 60%, #3a2410 100%)'
								: `linear-gradient(180deg, ${bg}dd 0%, ${bg} 100%)`,
							boxShadow: 'inset -4px 0 8px rgba(0,0,0,0.5)',
						}}
					>
						{/* Spine title text */}
						<span
							className="overflow-hidden whitespace-nowrap font-bold text-[7.5px] text-[rgba(255,255,255,0.7)] uppercase tracking-[0.08em]"
							// biome-ignore lint/nursery/noInlineStyles: dynamic maxHeight from props; writingMode/textOrientation have no Tailwind equivalent
							style={{
								writingMode: 'vertical-rl',
								textOrientation: 'mixed',
								transform: 'rotate(180deg)',
								maxHeight: height - 20,
							}}
						>
							{title}
						</span>
						{/* Spine gloss strip */}
						<div
							className="pointer-events-none absolute top-0 bottom-0 left-0 w-[45%]"
							// biome-ignore lint/nursery/noInlineStyles: gradient has no Tailwind equivalent
							style={{
								background: 'linear-gradient(90deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
							}}
						/>
					</div>

					{/* ── COVER (front face) ── */}
					<div
						className="absolute top-0 overflow-hidden rounded-[0_2px_2px_0]"
						// biome-ignore lint/nursery/noInlineStyles: dynamic dimensions and hover-based boxShadow from props
						style={{
							left: spineWidth,
							width: coverWidth,
							height,
							boxShadow: hovered
								? '4px 16px 40px rgba(0,0,0,0.65), 0 4px 12px rgba(0,0,0,0.4)'
								: '2px 6px 18px rgba(0,0,0,0.55), 1px 1px 0 rgba(0,0,0,0.3)',
						}}
					>
						{showCover ? (
							<img
								src={cover}
								alt={`${title} cover`}
								onError={() => setImgError(true)}
								className="block h-full w-full object-cover"
							/>
						) : (
							<div
								className="flex h-full w-full flex-col items-center justify-center gap-[5px] px-[8px] py-[10px]"
								// biome-ignore lint/nursery/noInlineStyles: dynamic gradient from props
								style={{
									background: `linear-gradient(150deg, ${bg}ee 0%, ${bg}99 100%)`,
								}}
							>
								<div
									className="mb-[3px] h-[1px] w-[55%]"
									// biome-ignore lint/nursery/noInlineStyles: rgba background has no Tailwind equivalent
									style={{ background: 'rgba(255,255,255,0.22)' }}
								/>
								<span className="text-center font-bold text-[9px] text-[rgba(255,255,255,0.9)] leading-[1.3] tracking-[0.01em]">
									{title}
								</span>
								<div
									className="h-[1px] w-[38%]"
									// biome-ignore lint/nursery/noInlineStyles: rgba background has no Tailwind equivalent
									style={{ background: 'rgba(255,255,255,0.15)' }}
								/>
								<span className="text-center text-[7px] text-[rgba(255,255,255,0.5)] tracking-[0.04em]">
									{author}
								</span>
							</div>
						)}

						{/* Page-edge line -- right side */}
						<div
							className="pointer-events-none absolute top-0 right-0 bottom-0 w-[2px]"
							// biome-ignore lint/nursery/noInlineStyles: gradient has no Tailwind equivalent
							style={{
								background:
									'linear-gradient(180deg, rgba(240,230,215,0.5) 0%, rgba(220,210,195,0.3) 100%)',
							}}
						/>

						{/* Cover gloss -- top-left diagonal highlight */}
						<div
							className="pointer-events-none absolute inset-0"
							// biome-ignore lint/nursery/noInlineStyles: gradient has no Tailwind equivalent
							style={{
								background: 'linear-gradient(150deg, rgba(255,255,255,0.09) 0%, transparent 40%)',
							}}
						/>
					</div>

					{/* ── PAGE EDGES (top strip, fakes the book depth) ── */}
					<div
						className="absolute top-0 h-[4px] rounded-[0_2px_0_0]"
						// biome-ignore lint/nursery/noInlineStyles: dynamic dimensions and gradient from props
						style={{
							left: spineWidth + 1,
							width: coverWidth - 3,
							background: 'linear-gradient(180deg, #f0e8d8 0%, #d8ccba 100%)',
							boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
						}}
					/>

					{/* ── SHELF SHADOW (cast downward when hovering) ── */}
					<m.div
						animate={{ opacity: hovered ? 0.7 : 0.35, scaleX: hovered ? 1.15 : 1 }}
						transition={{ type: 'spring', stiffness: 280, damping: 22 }}
						style={{
							position: 'absolute',
							bottom: -10,
							left: spineWidth,
							width: coverWidth,
							height: 14,
							background:
								'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,0,0,0.55) 0%, transparent 100%)',
							filter: 'blur(3px)',
							transformOrigin: 'center top',
							pointerEvents: 'none',
						}}
					/>
				</m.div>

				{/* ── HOVER GLOW -- subtle warm light behind pulled book ── */}
				<m.div
					animate={{ opacity: hovered ? 0.6 : 0 }}
					transition={{ duration: 0.25 }}
					style={{
						position: 'absolute',
						inset: -6,
						background:
							'radial-gradient(ellipse at 50% 80%, rgba(255,180,80,0.18) 0%, transparent 70%)',
						pointerEvents: 'none',
					}}
				/>
			</m.div>
		</LazyMotion>
	);
}
