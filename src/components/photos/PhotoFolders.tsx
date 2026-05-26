'use client';

import { LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { useState } from 'react';
import { type PhotoFolder, photoFolders } from '@/data/photo-folders';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

// Exact macOS Finder folder silhouette from miskov.ee (viewBox 190x140): sloped tab + tapered body.
const FOLDER_PATH =
	'M0.918 12.855C0.422 5.909 5.924 0 12.888 0L80.656 0C84.057 0 87.299 1.444 89.575 3.972L100.425 16.028C102.701 18.556 105.943 20 109.344 20L176.958 20C183.979 20 189.5 26 188.917 32.997L180.917 128.997C180.399 135.216 175.199 140 168.958 140L21.173 140C14.878 140 9.652 135.135 9.204 128.855Z';

// Per-photo rest layout, reverse-engineered 1:1 from miskov.ee's folders, then
// scaled to the smaller card. Because `size` is a % and the x/y offsets are scaled
// by the SAME factor as the card width, the relative placement is identical to the
// full-size fan — shrinking the folder never shifts the photos out of place.
//   size = width as a % of the card (the stack mixes sizes, it isn't uniform)
//   x    = horizontal center offset in px — a WIDE fan, edges spilling past the folder
//   y    = vertical nudge in px (negative lifts a photo higher above the folder top)
//   r    = resting rotation (organic, not a clean arc)
// Photos sit BEHIND the folder and peek above its top edge.
const SHUFFLE = [
	{ size: 43, x: -58, y: 6, r: -20 },
	{ size: 34, x: -34, y: -9, r: 2 },
	{ size: 38, x: 11, y: -4, r: -8 },
	{ size: 38, x: 58, y: 13, r: 8 },
];

function EmojiSticker({
	emoji,
	rotate = 0,
	style,
}: {
	emoji: string;
	rotate?: number;
	style?: React.CSSProperties;
}) {
	return (
		<span
			aria-hidden="true"
			className="emoji-sticker pointer-events-none absolute select-none text-[24px] leading-none"
			// biome-ignore lint/nursery/noInlineStyles: per-sticker placement + rotation come from config
			style={{ ...style, transform: `${style?.transform ?? ''} rotate(${rotate}deg)` }}
		>
			{emoji}
		</span>
	);
}

function FolderCard({ folder }: { folder: PhotoFolder }) {
	const [hovered, setHovered] = useState(false);
	const peek = folder.photos.slice(0, 4);
	const n = peek.length;
	const count = folder.photos.length;
	// Centre the resting fan on the folder regardless of how many photos it has,
	// so a 1- or 3-photo folder doesn't sit lopsided to one side.
	const meanX = peek.reduce((sum, _, i) => sum + SHUFFLE[i % SHUFFLE.length].x, 0) / (n || 1);

	return (
		<m.a
			href={`/camera/${folder.id}`}
			onHoverStart={() => setHovered(true)}
			onHoverEnd={() => setHovered(false)}
			onFocus={() => setHovered(true)}
			onBlur={() => setHovered(false)}
			className="group flex w-full cursor-pointer flex-col items-center no-underline"
			aria-label={`Open ${folder.name} — ${count} photos`}
		>
			<m.div
				className="relative w-full max-w-[172px] pt-[29px]"
				animate={{ y: hovered ? -8 : 0 }}
				transition={{ type: 'spring', stiffness: 320, damping: 24 }}
			>
				<div className="relative aspect-[190/140] w-full">
					{/* soft float shadow — its OWN element; the folder front can't carry a CSS
					    filter or it would disable its own backdrop-filter (blur) */}
					<div
						className="absolute inset-x-[14%] top-full z-0 h-[14px] -translate-y-[5px] rounded-[50%] bg-[rgba(34,50,67,0.16)] blur-[8px]"
						aria-hidden="true"
					/>
					{/* Photos — BEHIND the folder, peeking above the body's top edge; fan up on hover */}
					{peek.map((photo, i) => {
						const s = SHUFFLE[i % SHUFFLE.length];
						const t = n === 1 ? 0 : i / (n - 1) - 0.5;
						const restRot = s.r;
						const restX = s.x - meanX;
						const restY = s.y;
						const hovRot = t * 32;
						const hovX = t * 134;
						const hovY = -34 + Math.abs(t) * 6;
						return (
							<m.div
								key={photo.url}
								className="absolute top-[-6px] left-1/2 aspect-square rounded-[7px] bg-white p-[3px] shadow-[0_4px_9px_-3px_rgba(0,0,0,0.28),0_10px_18px_-9px_rgba(0,0,0,0.2)]"
								// biome-ignore lint/nursery/noInlineStyles: per-photo z-order + size come from the rest-fan config
								style={{ zIndex: i + 1, width: `${s.size}%` }}
								animate={{
									rotate: hovered ? hovRot : restRot,
									x: `calc(-50% + ${hovered ? hovX : restX}px)`,
									y: hovered ? hovY : restY,
								}}
								transition={{ type: 'spring', stiffness: 300, damping: 22 }}
							>
								<img
									src={photo.url}
									alt={photo.alt}
									loading="lazy"
									decoding="async"
									className="h-full w-full rounded-[5px] object-cover shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]"
								/>
							</m.div>
						);
					})}

					{/* Folder front — frosted translucent glass in the macOS folder shape, over the
					    photos. The clipped div blurs + tints whatever sits behind it (the photos);
					    the SVG draws the crisp folder edge on top. */}
					<div
						className="absolute inset-0 z-10 [-webkit-backdrop-filter:blur(30px)_saturate(1.6)] [backdrop-filter:blur(30px)_saturate(1.6)]"
						// biome-ignore lint/nursery/noInlineStyles: clip-path url() + layered sheen/milky fill have no Tailwind equivalent
						style={{
							clipPath: 'url(#folder-clip)',
							WebkitClipPath: 'url(#folder-clip)',
							background:
								'linear-gradient(180deg, var(--folder-sheen) 0%, rgba(255, 255, 255, 0) 52%), linear-gradient(180deg, var(--folder-fill-top), var(--folder-fill-bot))',
						}}
					/>
					<svg
						viewBox="0 0 190 140"
						preserveAspectRatio="none"
						className="pointer-events-none absolute inset-0 z-10 h-full w-full"
						aria-hidden="true"
					>
						<title>folder</title>
						<path d={FOLDER_PATH} fill="none" stroke="var(--folder-edge)" strokeWidth="1" />
					</svg>

					{/* On the folder front: divider lines + stickers */}
					<div className="absolute inset-0 z-20">
						<div className="absolute top-[82%] right-[12%] left-[12%] h-[2px] rounded-full bg-[var(--folder-line)]" />
						<div className="absolute top-[89%] right-[12%] left-[12%] h-[2px] rounded-full bg-[var(--folder-line)]" />
						{folder.stickers.slice(0, 2).map((sticker, i) => {
							const pos = [
								{ left: '31%', top: '50%' },
								{ left: '69%', top: '63%' },
							][i] ?? { left: '50%', top: '56%' };
							return (
								<EmojiSticker
									// biome-ignore lint/suspicious/noArrayIndexKey: stickers are a fixed config list
									key={i}
									emoji={sticker.emoji}
									rotate={sticker.rotate ?? 0}
									style={{ left: pos.left, top: pos.top, transform: 'translate(-50%, -50%)' }}
								/>
							);
						})}
					</div>
				</div>
			</m.div>

			{/* ── LABEL + COUNT ── */}
			<div className="mt-3 flex flex-col items-center gap-[5px]">
				<span className="font-medium text-[13px] text-[var(--text-primary)] tracking-[-0.01em]">
					{folder.name}
				</span>
				<span className="rounded-full bg-[rgba(139,146,155,0.15)] px-[9px] py-[2px] text-[10.5px] text-[var(--text-muted)] tracking-[0.01em]">
					{count} {count === 1 ? 'photo' : 'photos'}
				</span>
			</div>
		</m.a>
	);
}

export default function PhotoFolders() {
	return (
		<LazyMotion features={loadFeatures}>
			{/* shared SVG defs: die-cut sticker outline + the folder clip path */}
			<svg className="absolute h-0 w-0" aria-hidden="true">
				<title>folder defs</title>
				<defs>
					<filter id="sticker-outline" x="-30%" y="-30%" width="160%" height="160%">
						<feMorphology in="SourceAlpha" operator="dilate" radius="2" result="d" />
						<feFlood floodColor="#ffffff" result="w" />
						<feComposite in="w" in2="d" operator="in" result="o" />
						<feMerge result="s">
							<feMergeNode in="o" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
						<feDropShadow dx="0" dy="2" stdDeviation="1.4" floodColor="#000000" floodOpacity="0.3" />
					</filter>
					{/* normalised to a 0–1 box so the clip scales with any folder size */}
					<clipPath id="folder-clip" clipPathUnits="objectBoundingBox">
						<path d={FOLDER_PATH} transform="scale(0.0052632, 0.0071429)" />
					</clipPath>
				</defs>
			</svg>

			<m.div
				initial="hidden"
				whileInView="show"
				viewport={{ once: true }}
				variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
				className="grid grid-cols-2 gap-x-6 gap-y-9"
			>
				{photoFolders.map((folder) => (
					<m.div
						key={folder.id}
						variants={{
							hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
							show: {
								opacity: 1,
								y: 0,
								filter: 'blur(0px)',
								transition: { duration: 0.5, ease: [0.19, 1, 0.22, 1] },
							},
						}}
						className="flex justify-center"
					>
						<FolderCard folder={folder} />
					</m.div>
				))}
			</m.div>
		</LazyMotion>
	);
}
