'use client';

import { memo, useId } from 'react';
import { MOTIFS } from './data/motifs';
import { FORM_BOX } from './stamp/form';
import {
	CONDENSED,
	cleanId,
	fitSize,
	INK_HEX,
	MONO,
	type StampSpec,
	stampSpec,
	TYPEWRITER,
} from './stamp/ink';
import type { Country, MotifKey } from './types';

interface FormProps {
	country: Country;
	spec: StampSpec;
}

const r3 = (n: number): number => Math.round(n * 1000) / 1000;

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
			strokeWidth={1.25}
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			{MOTIFS[name]}
		</g>
	);
}

function ArcName({
	id,
	d,
	name,
	size,
	arcWidth = 160,
}: {
	id: string;
	d: string;
	name: string;
	size: number;
	arcWidth?: number;
}) {
	const fontSize = fitSize(name, size, arcWidth, CONDENSED, 0);
	return (
		<>
			<path id={id} d={d} fill="none" />
			<text fill="currentColor" fontFamily={CONDENSED} fontSize={fontSize}>
				<textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
					{name}
				</textPath>
			</text>
		</>
	);
}

function Name({
	name,
	x,
	y,
	size,
	maxWidth,
	anchor = 'middle',
}: {
	name: string;
	x: number;
	y: number;
	size: number;
	maxWidth: number;
	anchor?: 'start' | 'middle' | 'end';
}) {
	const fontSize = fitSize(name, size, maxWidth, CONDENSED, 0);
	return (
		<text
			x={x}
			y={y}
			fill="currentColor"
			fontFamily={CONDENSED}
			fontSize={fontSize}
			textAnchor={anchor}
		>
			{name}
		</text>
	);
}

function Micro({
	children,
	x,
	y,
	size = 3.8,
	anchor = 'middle',
	opacity = 0.64,
}: {
	children: string;
	x: number;
	y: number;
	size?: number;
	anchor?: 'start' | 'middle' | 'end';
	opacity?: number;
}) {
	return (
		<text
			x={x}
			y={y}
			fill="currentColor"
			fontFamily={MONO}
			fontSize={size}
			textAnchor={anchor}
			opacity={opacity}
		>
			{children}
		</text>
	);
}

function DateCells({
	x,
	y,
	width,
	height,
	spec,
}: {
	x: number;
	y: number;
	width: number;
	height: number;
	spec: StampSpec;
}) {
	const cell = width / 3;
	return (
		<g>
			<rect
				x={x}
				y={y}
				width={width}
				height={height}
				fill="none"
				stroke="currentColor"
				strokeWidth={0.9}
			/>
			<line
				x1={x + cell}
				y1={y}
				x2={x + cell}
				y2={y + height}
				stroke="currentColor"
				strokeWidth={0.55}
				opacity={0.65}
			/>
			<line
				x1={x + cell * 2}
				y1={y}
				x2={x + cell * 2}
				y2={y + height}
				stroke="currentColor"
				strokeWidth={0.55}
				opacity={0.65}
			/>
			<text
				x={x + cell * 0.5}
				y={y + height * 0.7}
				fill="currentColor"
				fontFamily={CONDENSED}
				fontSize={r3(height * 0.58)}
				textAnchor="middle"
			>
				{spec.day}
			</text>
			<text
				x={x + cell * 1.5}
				y={y + height * 0.65}
				fill="currentColor"
				fontFamily={MONO}
				fontSize={r3(height * 0.36)}
				textAnchor="middle"
			>
				{spec.month}
			</text>
			<text
				x={x + cell * 2.5}
				y={y + height * 0.65}
				fill="currentColor"
				fontFamily={MONO}
				fontSize={r3(height * 0.4)}
				textAnchor="middle"
			>
				{spec.shortYear}
			</text>
		</g>
	);
}

function Rule({ x1, x2, y }: { x1: number; x2: number; y: number }) {
	return (
		<line x1={x1} y1={y} x2={x2} y2={y} stroke="currentColor" strokeWidth={0.8} opacity={0.55} />
	);
}

function ArrivalForm({ country, spec }: FormProps) {
	return (
		<g>
			<rect
				x={11}
				y={12}
				width={218}
				height={126}
				rx={3}
				fill="none"
				stroke="currentColor"
				strokeWidth={3.2}
			/>
			<rect
				x={18}
				y={19}
				width={204}
				height={112}
				rx={1.5}
				fill="none"
				stroke="currentColor"
				strokeWidth={0.7}
				opacity={0.6}
			/>
			<Name
				name={country.name.toUpperCase()}
				x={23}
				y={45}
				size={22}
				maxWidth={148}
				anchor="start"
			/>
			<Rule x1={23} x2={217} y={51} />
			<rect x={23} y={59} width={96} height={30} fill="currentColor" />
			<text
				x={26}
				y={82}
				fill="var(--paper, #f4ecdc)"
				fontFamily={CONDENSED}
				fontSize={24}
				textAnchor="start"
			>
				{spec.direction}
			</text>
			<Name
				name={country.capital.toUpperCase()}
				x={23}
				y={105}
				size={9.4}
				maxWidth={94}
				anchor="start"
			/>
			<DateCells x={132} y={58} width={85} height={37} spec={spec} />
			<Micro x={132} y={108} size={4.5} anchor="start">
				{`NO. ${spec.serial}`}
			</Micro>
			<Motif name={country.motif} x={208} y={120} size={18} opacity={0.18} />
		</g>
	);
}

function OvalForm({ country, spec }: FormProps) {
	return (
		<g>
			<ellipse
				cx={120}
				cy={80}
				rx={100}
				ry={67}
				fill="none"
				stroke="currentColor"
				strokeWidth={3}
			/>
			<ellipse
				cx={120}
				cy={80}
				rx={94.5}
				ry={61.5}
				fill="none"
				stroke="currentColor"
				strokeWidth={0.65}
				opacity={0.6}
			/>
			<ArcName
				id={`${country.code}-${spec.seed}-oval-name`}
				d="M 30 70 A 90 43 0 0 1 210 70"
				name={country.name.toUpperCase()}
				size={20}
				arcWidth={166}
			/>
			<ArcName
				id={`${country.code}-${spec.seed}-oval-control`}
				d="M 30 94 A 90 37 0 0 0 210 94"
				name={`IMMIGRATION · ${country.iso3}`}
				size={5.6}
				arcWidth={154}
			/>
			<text
				x={120}
				y={75}
				fill="currentColor"
				fontFamily={CONDENSED}
				fontSize={21}
				textAnchor="middle"
			>
				{spec.direction}
			</text>
			<text
				x={120}
				y={90}
				fill="currentColor"
				fontFamily={MONO}
				fontSize={11.5}
				textAnchor="middle"
			>
				{spec.dateLine}
			</text>
			<Name name={country.capital.toUpperCase()} x={120} y={103} size={8} maxWidth={104} />
			<Micro x={120} y={115} size={4.3}>
				{`NO. ${spec.serial}`}
			</Micro>
			<Motif name={country.motif} x={46} y={80} size={18} opacity={0.2} />
		</g>
	);
}

function RoundForm({ country, spec }: FormProps) {
	return (
		<g>
			<circle cx={80} cy={80} r={73} fill="none" stroke="currentColor" strokeWidth={3} />
			<circle
				cx={80}
				cy={80}
				r={67}
				fill="none"
				stroke="currentColor"
				strokeWidth={0.65}
				opacity={0.6}
			/>
			<ArcName
				id={`${country.code}-${spec.seed}-round-name`}
				d="M 15 80 A 65 65 0 0 1 145 80"
				name={country.name.toUpperCase()}
				size={15}
				arcWidth={150}
			/>
			<ArcName
				id={`${country.code}-${spec.seed}-round-control`}
				d="M 15 80 A 65 65 0 0 0 145 80"
				name={`IMMIGRATION · ${country.iso3}`}
				size={5}
				arcWidth={144}
			/>
			<text
				x={80}
				y={67}
				fill="currentColor"
				fontFamily={CONDENSED}
				fontSize={12}
				textAnchor="middle"
			>
				{spec.direction}
			</text>
			<text
				x={80}
				y={85}
				fill="currentColor"
				fontFamily={CONDENSED}
				fontSize={26}
				textAnchor="middle"
			>
				{spec.day}
			</text>
			<Micro x={80} y={94} size={7}>
				{`${spec.month} ${spec.year}`}
			</Micro>
			<Name name={country.capital.toUpperCase()} x={80} y={106} size={6} maxWidth={94} />
			<Micro x={80} y={116} size={4}>
				{`NO. ${spec.serial}`}
			</Micro>
			<Motif name={country.motif} x={80} y={51} size={10} opacity={0.16} />
		</g>
	);
}

function DateForm({ country, spec }: FormProps) {
	return (
		<g>
			<rect
				x={12}
				y={10}
				width={216}
				height={80}
				rx={1.5}
				fill="none"
				stroke="currentColor"
				strokeWidth={2.8}
			/>
			<rect
				x={18}
				y={16}
				width={204}
				height={68}
				rx={1.5}
				fill="none"
				stroke="currentColor"
				strokeWidth={0.65}
				opacity={0.6}
			/>
			<Name
				name={country.name.toUpperCase()}
				x={24}
				y={33}
				size={18}
				maxWidth={140}
				anchor="start"
			/>
			<text
				x={216}
				y={33}
				fill="currentColor"
				fontFamily={CONDENSED}
				fontSize={16}
				textAnchor="end"
			>
				{spec.direction}
			</text>
			<Rule x1={24} x2={216} y={38} />
			<rect x={24} y={45} width={192} height={28} fill="currentColor" />
			<text
				x={120}
				y={65}
				fill="var(--paper, #f1e6d2)"
				fontFamily={TYPEWRITER}
				fontSize={14}
				textAnchor="middle"
			>
				{spec.dateLine}
			</text>
			<Micro x={24} y={83} size={4.5} anchor="start">
				{`PORT ${country.capital.toUpperCase()}`}
			</Micro>
			<Micro x={216} y={83} size={4.5} anchor="end">
				{`NO. ${spec.serial}`}
			</Micro>
		</g>
	);
}

function PermitForm({ country, spec }: FormProps) {
	return (
		<g>
			<rect
				x={11}
				y={14}
				width={218}
				height={112}
				rx={3}
				fill="none"
				stroke="currentColor"
				strokeWidth={3.2}
			/>
			<rect
				x={18}
				y={21}
				width={204}
				height={98}
				rx={1.5}
				fill="none"
				stroke="currentColor"
				strokeWidth={0.7}
				opacity={0.6}
			/>
			<Name
				name={country.name.toUpperCase()}
				x={23}
				y={45}
				size={21}
				maxWidth={146}
				anchor="start"
			/>
			<rect x={188} y={30} width={29} height={15} fill="currentColor" />
			<text
				x={202.5}
				y={41.5}
				fill="var(--paper, #f4ecdc)"
				fontFamily={CONDENSED}
				fontSize={12}
				textAnchor="middle"
			>
				VISA
			</text>
			<Rule x1={23} x2={217} y={50} />
			<text
				x={23}
				y={75}
				fill="currentColor"
				fontFamily={CONDENSED}
				fontSize={19}
				textAnchor="start"
			>
				{spec.direction}
			</text>
			<DateCells x={81} y={56} width={136} height={32} spec={spec} />
			<Micro x={23} y={99} size={4.5} anchor="start">
				{`UNTIL ${spec.untilLine}`}
			</Micro>
			<Micro x={23} y={110} size={4.5} anchor="start">
				{country.capital.toUpperCase()}
			</Micro>
			<Micro x={217} y={110} size={4.5} anchor="end">
				{`NO. ${spec.serial}`}
			</Micro>
			<Motif name={country.motif} x={54} y={119} size={14} opacity={0.17} />
		</g>
	);
}

function TransitForm({ country, spec }: FormProps) {
	return (
		<g>
			<rect
				x={11}
				y={18}
				width={218}
				height={94}
				rx={5}
				fill="none"
				stroke="currentColor"
				strokeWidth={2.8}
			/>
			<rect
				x={17}
				y={24}
				width={206}
				height={82}
				rx={1.5}
				fill="none"
				stroke="currentColor"
				strokeWidth={0.65}
				opacity={0.6}
			/>
			<Name
				name={country.name.toUpperCase()}
				x={23}
				y={40}
				size={15}
				maxWidth={142}
				anchor="start"
			/>
			<Rule x1={23} x2={217} y={46} />
			<text
				x={23}
				y={78}
				fill="currentColor"
				fontFamily={CONDENSED}
				fontSize={30}
				textAnchor="start"
			>
				TRANSIT
			</text>
			<text x={217} y={68} fill="currentColor" fontFamily={MONO} fontSize={8.4} textAnchor="end">
				{spec.dateLine}
			</text>
			<Micro x={23} y={92} size={3.8} anchor="start">
				{`PORT ${country.capital.toUpperCase()}`}
			</Micro>
			<Micro x={217} y={92} size={3.8} anchor="end">
				{`NO. ${spec.serial}`}
			</Micro>
			<Motif name={country.motif} x={202} y={78} size={14} opacity={0.13} />
		</g>
	);
}

const FORMS = {
	arrival: ArrivalForm,
	oval: OvalForm,
	round: RoundForm,
	date: DateForm,
	permit: PermitForm,
	transit: TransitForm,
} as const;

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
	const Form = FORMS[country.form];
	const box = FORM_BOX[country.form];
	const doubleStrike = seed % 5 === 0;
	const inkOpacity = 0.9 + (seed % 4) * 0.025;
	return (
		<svg
			className="passport-stamp-art"
			viewBox={`0 0 ${box.width} ${box.height}`}
			aria-hidden={decorative ? 'true' : undefined}
			role={decorative ? undefined : 'img'}
			aria-label={
				decorative
					? undefined
					: `${country.name} ${spec.direction.toLowerCase()} stamp, ${spec.dateLine}, ${country.capital}`
			}
			style={{ color: INK_HEX[country.ink], opacity: inkOpacity }}
		>
			<defs>
				<filter
					id={`${uid}-ink`}
					x={-10}
					y={-10}
					width={box.width + 20}
					height={box.height + 20}
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
					x1={r3(box.width / 2 + Math.cos((spec.seed % 360) * (Math.PI / 180)) * box.width)}
					y1={r3(box.height / 2 + Math.sin((spec.seed % 360) * (Math.PI / 180)) * box.height)}
					x2={r3(box.width / 2 - Math.cos((spec.seed % 360) * (Math.PI / 180)) * box.width)}
					y2={r3(box.height / 2 - Math.sin((spec.seed % 360) * (Math.PI / 180)) * box.height)}
				>
					<stop offset="0" stopColor="#ffffff" />
					<stop offset="0.6" stopColor="#f2f2f2" />
					<stop offset="1" stopColor="#c8c8c8" />
				</linearGradient>
				<mask
					id={`${uid}-press`}
					maskUnits="userSpaceOnUse"
					x={0}
					y={0}
					width={box.width}
					height={box.height}
				>
					<rect width={box.width} height={box.height} fill={`url(#${uid}-pressure)`} />
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
				<g id={`${uid}-body`}>
					<Form country={country} spec={spec} />
				</g>
			</defs>
			<g filter={`url(#${uid}-ink)`} mask={`url(#${uid}-press)`}>
				{doubleStrike && (
					<use href={`#${uid}-body`} transform="translate(0.6 -0.4)" opacity={0.2} />
				)}
				<use href={`#${uid}-body`} />
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
							x2={speck.x + Math.cos(speck.angle) * 2.2}
							y2={speck.y + Math.sin(speck.angle) * 2.2}
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
