'use client';

import { memo, useId } from 'react';
import { MOTIFS } from './data/motifs';
import { type Box, stampDesign, type TextBlock, type TextFont } from './stamp/generate';
import {
	CONDENSED,
	cleanId,
	fitSize,
	INK_HEX,
	INTER,
	MONO,
	SERIF,
	type StampSpec,
	stampSpec,
	TYPEWRITER,
} from './stamp/ink';
import type { Country, MotifKey } from './types';

const r3 = (n: number): number => Math.round(n * 1000) / 1000;

const FONT_FAMILY: Record<TextFont, string> = {
	display: CONDENSED,
	serif: SERIF,
	mono: MONO,
	typewriter: TYPEWRITER,
	sans: INTER,
};

function Motif({
	name,
	x,
	y,
	size,
	opacity = 1,
}: {
	name: MotifKey;
	x: number;
	y: number;
	size: number;
	opacity?: number;
}) {
	return (
		<g
			transform={`translate(${x - size / 2} ${y - size / 2}) scale(${size / 48})`}
			opacity={opacity}
			fill="none"
			stroke="currentColor"
			strokeWidth={1.3}
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			{MOTIFS[name]}
		</g>
	);
}

function StampedText({
	block,
	children,
	fill = 'currentColor',
	opacity = 1,
}: {
	block: TextBlock;
	children: string;
	fill?: string;
	opacity?: number;
}) {
	const family = FONT_FAMILY[block.font];
	const fontSize = fitSize(children, block.size, block.maxWidth, family, 0);
	return (
		<text
			x={block.x}
			y={block.y}
			fill={fill}
			fontFamily={family}
			fontSize={fontSize}
			textAnchor={block.anchor}
			opacity={opacity}
		>
			{children}
		</text>
	);
}

function ArcText({
	id,
	path,
	width,
	text,
	size,
	font,
	opacity = 1,
}: {
	id: string;
	path: string;
	width: number;
	text: string;
	size: number;
	font: TextFont;
	opacity?: number;
}) {
	const family = FONT_FAMILY[font];
	const fontSize = fitSize(text, size, width, family, 0);
	return (
		<>
			<path id={id} d={path} fill="none" />
			<text fill="currentColor" fontFamily={family} fontSize={fontSize} opacity={opacity}>
				<textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
					{text}
				</textPath>
			</text>
		</>
	);
}

function DateCells({ box, spec }: { box: Box; spec: StampSpec }) {
	const cell = box.w / 3;
	return (
		<g>
			<rect
				x={box.x}
				y={box.y}
				width={box.w}
				height={box.h}
				fill="none"
				stroke="currentColor"
				strokeWidth={0.9}
			/>
			<line
				x1={box.x + cell}
				y1={box.y}
				x2={box.x + cell}
				y2={box.y + box.h}
				stroke="currentColor"
				strokeWidth={0.55}
				opacity={0.65}
			/>
			<line
				x1={box.x + cell * 2}
				y1={box.y}
				x2={box.x + cell * 2}
				y2={box.y + box.h}
				stroke="currentColor"
				strokeWidth={0.55}
				opacity={0.65}
			/>
			<text
				x={box.x + cell * 0.5}
				y={box.y + box.h * 0.7}
				fill="currentColor"
				fontFamily={CONDENSED}
				fontSize={r3(box.h * 0.58)}
				textAnchor="middle"
			>
				{spec.day}
			</text>
			<text
				x={box.x + cell * 1.5}
				y={box.y + box.h * 0.65}
				fill="currentColor"
				fontFamily={MONO}
				fontSize={r3(box.h * 0.36)}
				textAnchor="middle"
			>
				{spec.month}
			</text>
			<text
				x={box.x + cell * 2.5}
				y={box.y + box.h * 0.65}
				fill="currentColor"
				fontFamily={MONO}
				fontSize={r3(box.h * 0.4)}
				textAnchor="middle"
			>
				{spec.shortYear}
			</text>
		</g>
	);
}

function Crest({
	x,
	y,
	r,
	motif,
	opacity,
}: {
	x: number;
	y: number;
	r: number;
	motif: MotifKey;
	opacity: number;
}) {
	return (
		<g opacity={opacity}>
			<circle cx={x} cy={y} r={r} fill="none" stroke="currentColor" strokeWidth={0.55} />
			<Motif name={motif} x={x} y={y} size={r * 1.02} opacity={0.92} />
		</g>
	);
}

function Ornament({ design }: { design: ReturnType<typeof stampDesign> }) {
	const ornament = design.ornament;
	if (!ornament?.path) return null;
	const filled = ornament.kind === 'bars';
	return (
		<path
			d={ornament.path}
			fill={filled ? 'currentColor' : 'none'}
			stroke={filled ? 'none' : 'currentColor'}
			strokeWidth={ornament.strokeWidth}
			opacity={ornament.opacity}
		/>
	);
}

export const Stamp = memo(function Stamp({
	country,
	seed,
	decorative = false,
}: {
	country: Country;
	seed: number;
	decorative?: boolean;
}) {
	const uid = cleanId(`${country.code}-${useId()}`);
	const spec = stampSpec(country, seed);
	const design = stampDesign(country);
	const doubleStrike = seed % 5 === 0;
	const inkOpacity = 0.9 + (seed % 4) * 0.025;
	const filterId = `${uid}-ink`;
	const maskId = `${uid}-press`;
	const arcTopId = `${uid}-arc-top`;
	const arcBottomId = `${uid}-arc-bottom`;

	return (
		<svg
			className="passport-stamp-art"
			viewBox={`0 0 ${design.width} ${design.height}`}
			aria-hidden={decorative ? 'true' : undefined}
			role={decorative ? undefined : 'img'}
			aria-label={
				decorative
					? undefined
					: `${country.name} ${spec.direction.toLowerCase()} stamp, ${spec.dateLine}, ${country.capital}`
			}
			style={{ color: INK_HEX[design.ink], opacity: inkOpacity }}
		>
			<defs>
				<filter
					id={filterId}
					x={-10}
					y={-10}
					width={design.width + 20}
					height={design.height + 20}
					filterUnits="userSpaceOnUse"
					colorInterpolationFilters="sRGB"
				>
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.16"
						numOctaves="2"
						seed={spec.seed % 907}
						result="warpNoise"
					/>
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.75"
						numOctaves="3"
						seed={(spec.seed + 137) % 811}
						result="grain"
					/>
					<feDisplacementMap
						in="SourceGraphic"
						in2="warpNoise"
						scale="1"
						xChannelSelector="R"
						yChannelSelector="G"
						result="warped"
					/>
					<feColorMatrix in="grain" type="luminanceToAlpha" result="lum" />
					<feComponentTransfer in="lum" result="holes">
						<feFuncA type="table" tableValues="0 0.45 0.7 0.9 1 1 1 1" />
					</feComponentTransfer>
					<feComposite in="warped" in2="holes" operator="in" result="inked" />
					<feGaussianBlur in="inked" stdDeviation="0.1" />
				</filter>
				<linearGradient
					id={`${uid}-pressure`}
					gradientUnits="userSpaceOnUse"
					x1={r3(design.width / 2 + Math.cos((spec.seed % 360) * (Math.PI / 180)) * design.width)}
					y1={r3(design.height / 2 + Math.sin((spec.seed % 360) * (Math.PI / 180)) * design.height)}
					x2={r3(design.width / 2 - Math.cos((spec.seed % 360) * (Math.PI / 180)) * design.width)}
					y2={r3(design.height / 2 - Math.sin((spec.seed % 360) * (Math.PI / 180)) * design.height)}
				>
					<stop offset="0" stopColor="#ffffff" />
					<stop offset="0.6" stopColor="#f2f2f2" />
					<stop offset="1" stopColor="#c8c8c8" />
				</linearGradient>
				<mask
					id={maskId}
					maskUnits="userSpaceOnUse"
					x={0}
					y={0}
					width={design.width}
					height={design.height}
				>
					<rect width={design.width} height={design.height} fill={`url(#${uid}-pressure)`} />
					{spec.voids.map((voidSpec) => (
						<ellipse
							key={`${voidSpec.x}-${voidSpec.y}`}
							cx={voidSpec.x}
							cy={voidSpec.y}
							rx={voidSpec.rx}
							ry={voidSpec.ry}
							fill="#000000"
							opacity={voidSpec.opacity ?? 1}
							transform={`rotate(${voidSpec.rotation} ${voidSpec.x} ${voidSpec.y})`}
						/>
					))}
				</mask>
			</defs>

			<g filter={`url(#${filterId})`} mask={`url(#${maskId})`}>
				{doubleStrike && (
					<g transform="translate(0.6 -0.4)" opacity={0.2}>
						<StampBody
							country={country}
							spec={spec}
							design={design}
							arcTopId={`${arcTopId}-ghost`}
							arcBottomId={`${arcBottomId}-ghost`}
						/>
					</g>
				)}
				<StampBody
					country={country}
					spec={spec}
					design={design}
					arcTopId={arcTopId}
					arcBottomId={arcBottomId}
				/>
			</g>
			<g fill="currentColor" opacity={0.5}>
				{spec.specks.map((speck) =>
					speck.kind === 'ring' ? (
						<circle
							key={`${speck.x}-${speck.y}`}
							cx={speck.x}
							cy={speck.y}
							r={speck.r}
							fill="none"
							stroke="currentColor"
							strokeWidth={0.35}
							opacity={speck.opacity}
						/>
					) : speck.kind === 'dash' ? (
						<line
							key={`${speck.x}-${speck.y}-dash`}
							x1={speck.x}
							y1={speck.y}
							x2={r3(speck.x + Math.cos(speck.angle) * 2.2)}
							y2={r3(speck.y + Math.sin(speck.angle) * 2.2)}
							stroke="currentColor"
							strokeWidth={0.45}
							opacity={speck.opacity}
						/>
					) : (
						<circle
							key={`${speck.x}-${speck.y}-dot`}
							cx={speck.x}
							cy={speck.y}
							r={speck.r}
							opacity={speck.opacity}
						/>
					)
				)}
			</g>
		</svg>
	);
});

function Frame({ design }: { design: ReturnType<typeof stampDesign> }) {
	return (
		<>
			<path d={design.outline} fill="none" stroke="currentColor" strokeWidth={design.borderWidth} />
			<path
				d={design.innerOutline}
				fill="none"
				stroke="currentColor"
				strokeWidth={design.innerBorderWidth}
				opacity={design.innerOpacity}
			/>
			{design.cornerTicks?.map((path) => (
				<path
					key={path}
					d={path}
					fill="none"
					stroke="currentColor"
					strokeWidth={0.45}
					opacity={0.45}
				/>
			))}
			<Ornament design={design} />
		</>
	);
}

function StatusBlock({
	design,
	spec,
}: {
	design: ReturnType<typeof stampDesign>;
	spec: StampSpec;
}) {
	if (design.statusStyle === 'solid' && design.statusBox) {
		return (
			<>
				<rect
					x={design.statusBox.x}
					y={design.statusBox.y}
					width={design.statusBox.w}
					height={design.statusBox.h}
					fill="currentColor"
				/>
				<StampedText block={design.status} fill="var(--paper, #f1e6d2)">
					{spec.direction}
				</StampedText>
			</>
		);
	}
	if (design.statusStyle === 'outline' && design.statusBox) {
		return (
			<>
				<rect
					x={design.statusBox.x}
					y={design.statusBox.y}
					width={design.statusBox.w}
					height={design.statusBox.h}
					fill="none"
					stroke="currentColor"
					strokeWidth={0.7}
				/>
				<StampedText block={design.status}>{spec.direction}</StampedText>
			</>
		);
	}
	return <StampedText block={design.status}>{spec.direction}</StampedText>;
}

function DateBlock({ design, spec }: { design: ReturnType<typeof stampDesign>; spec: StampSpec }) {
	if (design.dateStyle === 'cells' && design.dateBox) {
		return <DateCells box={design.dateBox} spec={spec} />;
	}
	if (design.dateStyle === 'band' && design.dateBox) {
		return (
			<>
				<rect
					x={design.dateBox.x}
					y={design.dateBox.y}
					width={design.dateBox.w}
					height={design.dateBox.h}
					fill="currentColor"
				/>
				<StampedText block={design.date} fill="var(--paper, #f1e6d2)">
					{spec.dateLine}
				</StampedText>
			</>
		);
	}
	if (design.dateStyle === 'stack') {
		return (
			<>
				<StampedText block={design.date}>{spec.day}</StampedText>
				{design.dateSub && (
					<StampedText block={design.dateSub}>{`${spec.month} ${spec.year}`}</StampedText>
				)}
			</>
		);
	}
	return <StampedText block={design.date}>{spec.dateLine}</StampedText>;
}

function StampBody({
	country,
	spec,
	design,
	arcTopId,
	arcBottomId,
}: {
	country: Country;
	spec: StampSpec;
	design: ReturnType<typeof stampDesign>;
	arcTopId: string;
	arcBottomId: string;
}) {
	return (
		<g>
			<Frame design={design} />
			{design.arcTop ? (
				<ArcText
					id={arcTopId}
					path={design.arcTop.path}
					width={design.arcTop.width}
					text={country.name.toUpperCase()}
					size={design.arcTop.size}
					font={design.arcTop.font}
				/>
			) : (
				<StampedText block={design.country}>{country.name.toUpperCase()}</StampedText>
			)}
			<StatusBlock design={design} spec={spec} />
			<DateBlock design={design} spec={spec} />
			<StampedText block={design.port}>{country.capital.toUpperCase()}</StampedText>
			<StampedText block={design.serial}>{`NO. ${spec.serial}`}</StampedText>
			{design.micro && design.microText && (
				<StampedText block={design.micro} opacity={0.55}>
					{design.microText}
				</StampedText>
			)}
			{design.arcBottom && (
				<ArcText
					id={arcBottomId}
					path={design.arcBottom.path}
					width={design.arcBottom.width}
					text={`IMMIGRATION · ${country.iso3}`}
					size={design.arcBottom.size}
					font={design.arcBottom.font}
					opacity={0.72}
				/>
			)}
			{design.crest.motif && (
				<Crest
					x={design.crest.x}
					y={design.crest.y}
					r={design.crest.r}
					motif={design.crest.motif}
					opacity={design.crest.opacity}
				/>
			)}
		</g>
	);
}
