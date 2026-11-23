'use client';

import { memo, useId } from 'react';
import { MOTIFS } from './data/motifs';
import {
	CONDENSED,
	cleanId,
	fitSize,
	INK_HEX,
	MONO,
	SERIF,
	type StampSpec,
	stampSpec,
	TYPEWRITER,
} from './stamp/ink';
import type { Country, MotifKey } from './types';

interface FormProps {
	country: Country;
	spec: StampSpec;
	uid: string;
}

interface MotifProps {
	name: MotifKey;
	x: number;
	y: number;
	size: number;
	opacity?: number;
}

function Motif({ name, x, y, size, opacity = 1 }: MotifProps) {
	return (
		<g
			transform={`translate(${x - size / 2} ${y - size / 2}) scale(${size / 48})`}
			opacity={opacity}
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			{MOTIFS[name]}
		</g>
	);
}

function r3Number(n: number): number {
	return Math.round(n * 1000) / 1000;
}

function Star({ cx, cy, r, opacity = 1 }: { cx: number; cy: number; r: number; opacity?: number }) {
	const points: string[] = [];
	for (let i = 0; i < 10; i++) {
		const radius = i % 2 === 0 ? r : r * 0.4;
		const angle = -Math.PI / 2 + (i * Math.PI) / 5;
		points.push(
			`${r3Number(cx + Math.cos(angle) * radius)},${r3Number(cy + Math.sin(angle) * radius)}`
		);
	}
	return <polygon points={points.join(' ')} fill="currentColor" opacity={opacity} />;
}

function Rosette({
	cx,
	cy,
	r,
	seed,
	opacity = 0.12,
}: {
	cx: number;
	cy: number;
	r: number;
	seed: number;
	opacity?: number;
}) {
	const rings = Array.from({ length: 22 }, (_, i) => {
		const t = i / 21;
		const ringR = r3Number(r * (0.34 + 0.66 * t));
		const squash = 0.58 + (((seed % 7) + i) % 5) * 0.014;
		return (
			<ellipse
				// biome-ignore lint/suspicious/noArrayIndexKey: rings are a fixed generated set
				key={i}
				cx={cx}
				cy={cy}
				rx={ringR}
				ry={r3Number(ringR * squash)}
				transform={`rotate(${r3Number(i * 4.1 + (seed % 17))} ${cx} ${cy})`}
			/>
		);
	});
	return (
		<g fill="none" stroke="currentColor" strokeWidth={0.28} opacity={opacity}>
			{rings}
		</g>
	);
}

function ArcText({
	id,
	d,
	children,
	fontFamily = MONO,
	fontSize = 4.1,
	letterSpacing = 0.45,
	opacity = 0.72,
	dy = 0,
	baseline = 'auto',
}: {
	id: string;
	d: string;
	children: string;
	fontFamily?: string;
	fontSize?: number;
	letterSpacing?: number;
	opacity?: number;
	dy?: number;
	baseline?: 'auto' | 'middle';
}) {
	return (
		<>
			<path id={id} d={d} fill="none" />
			<text
				fill="currentColor"
				fontFamily={fontFamily}
				fontSize={fontSize}
				letterSpacing={letterSpacing}
				opacity={opacity}
				dy={dy}
				dominantBaseline={baseline}
			>
				<textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
					{children}
				</textPath>
			</text>
		</>
	);
}

function NameArc({
	id,
	d,
	name,
	size,
	fontFamily = CONDENSED,
	letterSpacing = 1.2,
	arcWidth = 250,
}: {
	id: string;
	d: string;
	name: string;
	size: number;
	fontFamily?: string;
	letterSpacing?: number;
	arcWidth?: number;
}) {
	const fontSize = fitSize(name, size, arcWidth, fontFamily, letterSpacing);
	return (
		<>
			<path id={id} d={d} fill="none" />
			<text
				fill="currentColor"
				fontFamily={fontFamily}
				fontSize={fontSize}
				letterSpacing={letterSpacing}
			>
				<textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
					{name}
				</textPath>
			</text>
		</>
	);
}

function StraightName({
	name,
	x,
	y,
	size,
	maxWidth,
	fontFamily = CONDENSED,
	letterSpacing = 1.2,
	anchor = 'middle',
}: {
	name: string;
	x: number;
	y: number;
	size: number;
	maxWidth: number;
	fontFamily?: string;
	letterSpacing?: number;
	anchor?: 'start' | 'middle' | 'end';
}) {
	const fontSize = fitSize(name, size, maxWidth, fontFamily, letterSpacing);
	return (
		<text
			x={x}
			y={y}
			fill="currentColor"
			fontFamily={fontFamily}
			fontSize={fontSize}
			letterSpacing={letterSpacing}
			textAnchor={anchor}
		>
			{name}
		</text>
	);
}

function Ticks({
	cx,
	cy,
	rx,
	ry,
	count = 12,
	length = 2.4,
}: {
	cx: number;
	cy: number;
	rx: number;
	ry: number;
	count?: number;
	length?: number;
}) {
	return (
		<g stroke="currentColor" strokeWidth={0.45} opacity={0.45}>
			{Array.from({ length: count }, (_, i) => {
				const angle = (i * Math.PI * 2) / count;
				const x1 = r3Number(cx + Math.cos(angle) * (rx - length));
				const y1 = r3Number(cy + Math.sin(angle) * (ry - length));
				const x2 = r3Number(cx + Math.cos(angle) * (rx + 0.6));
				const y2 = r3Number(cy + Math.sin(angle) * (ry + 0.6));
				return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} />;
			})}
		</g>
	);
}

function Micro({
	children,
	x,
	y,
	size = 4.15,
	anchor = 'middle',
	opacity = 0.7,
	letterSpacing = 0.28,
}: {
	children: string;
	x: number;
	y: number;
	size?: number;
	anchor?: 'start' | 'middle' | 'end';
	opacity?: number;
	letterSpacing?: number;
}) {
	return (
		<text
			x={x}
			y={y}
			fill="currentColor"
			fontFamily={MONO}
			fontSize={size}
			letterSpacing={letterSpacing}
			textAnchor={anchor}
			opacity={opacity}
		>
			{children}
		</text>
	);
}

function repeat(text: string, times: number): string {
	return Array.from({ length: times }, () => text).join('');
}

function OvalForm({ country, spec, uid }: FormProps) {
	const name = country.stampName;
	return (
		<g>
			<ellipse
				cx={120}
				cy={80}
				rx={97}
				ry={64}
				fill="none"
				stroke="currentColor"
				strokeWidth={2.6}
			/>
			<ellipse
				cx={120}
				cy={80}
				rx={91}
				ry={58}
				fill="none"
				stroke="currentColor"
				strokeWidth={0.7}
				opacity={0.9}
			/>
			<Ticks cx={120} cy={80} rx={94} ry={61} count={16} />
			<Rosette cx={120} cy={84} r={55} seed={spec.seed} />
			<NameArc
				id={`${uid}-oval-name`}
				d="M 40 72 A 80 24 0 0 1 200 72"
				name={name}
				size={20}
				fontFamily={CONDENSED}
				letterSpacing={1.5}
				arcWidth={152}
			/>
			<ArcText
				id={`${uid}-oval-micro`}
				d="M 40 84 A 80 44 0 0 0 200 84"
				fontSize={4.15}
				opacity={0.68}
				letterSpacing={0.4}
				baseline="middle"
			>
				{repeat(`${spec.reference} / ${country.iso3} /`, 3)}
			</ArcText>
			<line
				x1={114}
				y1={56}
				x2={114}
				y2={104}
				stroke="currentColor"
				strokeWidth={0.5}
				opacity={0.38}
			/>
			<Motif name={country.motif} x={74} y={83} size={motifSize(country, 38)} />
			{country.motif2 && <Motif name={country.motif2} x={186} y={116} size={13} opacity={0.6} />}
			<text
				x={146}
				y={73}
				fill="currentColor"
				fontFamily={CONDENSED}
				fontSize={26}
				letterSpacing={0.8}
				textAnchor="middle"
			>
				{spec.day}
			</text>
			<Micro x={146} y={83} size={6.6} letterSpacing={0.5}>
				{`${spec.month} ${spec.year}`}
			</Micro>
			<text
				x={146}
				y={96}
				fill="currentColor"
				fontFamily={CONDENSED}
				fontSize={9.8}
				letterSpacing={1.8}
				textAnchor="middle"
			>
				{country.entryWord}
			</text>
			<line
				x1={128}
				y1={101}
				x2={194}
				y2={101}
				stroke="currentColor"
				strokeWidth={0.5}
				opacity={0.5}
			/>
			<Micro x={146} y={109} size={5} opacity={0.82}>
				{`CLASS ${spec.classCode} / ${spec.serial}`}
			</Micro>
			<Micro x={120} y={118} size={4.4} opacity={0.62}>
				{`PORT ${(country.stampCapital ?? country.capital).toUpperCase()} / ${spec.serial}`}
			</Micro>
			<Star cx={33} cy={80} r={3.2} opacity={0.72} />
			<Star cx={207} cy={80} r={3.2} opacity={0.72} />
		</g>
	);
}

function RoundForm({ country, spec, uid }: FormProps) {
	return (
		<g>
			<circle cx={120} cy={80} r={64} fill="none" stroke="currentColor" strokeWidth={2.6} />
			<circle
				cx={120}
				cy={80}
				r={58}
				fill="none"
				stroke="currentColor"
				strokeWidth={0.7}
				opacity={0.9}
			/>
			<Rosette cx={120} cy={84} r={49} seed={spec.seed} opacity={0.11} />
			<ArcText
				id={`${uid}-round-top`}
				d="M 59 80 A 61 61 0 0 1 181 80"
				fontSize={4.15}
				opacity={0.66}
				letterSpacing={0.35}
				baseline="middle"
			>
				{repeat(`${country.iso3} / ${country.name.toUpperCase()} / `, 2)}
			</ArcText>
			<ArcText
				id={`${uid}-round-bottom`}
				d="M 59 80 A 61 61 0 0 0 181 80"
				fontSize={4.15}
				opacity={0.66}
				letterSpacing={0.35}
				baseline="middle"
			>
				{repeat(`BORDER CONTROL / ${spec.reference} / `, 2)}
			</ArcText>
			<StraightName
				name={country.stampName}
				x={120}
				y={50}
				size={17}
				maxWidth={86}
				fontFamily={CONDENSED}
				letterSpacing={1.3}
			/>
			<line
				x1={82}
				y1={52}
				x2={158}
				y2={52}
				stroke="currentColor"
				strokeWidth={0.5}
				opacity={0.4}
			/>
			<Motif name={country.motif} x={120} y={72} size={motifSize(country, 38)} />
			<text
				x={120}
				y={99}
				fill="currentColor"
				fontFamily={MONO}
				fontSize={9.8}
				letterSpacing={0.7}
				textAnchor="middle"
			>
				{spec.dateLine}
			</text>
			<line
				x1={84}
				y1={106}
				x2={156}
				y2={106}
				stroke="currentColor"
				strokeWidth={0.5}
				opacity={0.4}
			/>
			<text
				x={120}
				y={118}
				fill="currentColor"
				fontFamily={CONDENSED}
				fontSize={12}
				letterSpacing={2.4}
				textAnchor="middle"
			>
				{country.entryWord}
			</text>
			<Micro x={120} y={129} size={4.35} opacity={0.66}>
				{`CLASS ${spec.classCode} / Nº ${spec.serial}`}
			</Micro>
			{country.motif2 && <Motif name={country.motif2} x={164} y={58} size={13} opacity={0.6} />}
		</g>
	);
}

function PermitForm({ country, spec }: FormProps) {
	return (
		<g>
			<rect
				x={14}
				y={20}
				width={212}
				height={120}
				rx={4}
				fill="none"
				stroke="currentColor"
				strokeWidth={2.6}
			/>
			<rect
				x={20}
				y={26}
				width={200}
				height={108}
				rx={2.5}
				fill="none"
				stroke="currentColor"
				strokeWidth={0.7}
				opacity={0.85}
			/>
			<line
				x1={20}
				y1={58}
				x2={220}
				y2={58}
				stroke="currentColor"
				strokeWidth={0.55}
				opacity={0.55}
			/>
			<line
				x1={20}
				y1={62}
				x2={220}
				y2={62}
				stroke="currentColor"
				strokeWidth={0.3}
				opacity={0.4}
			/>
			<line
				x1={118}
				y1={68}
				x2={118}
				y2={128}
				stroke="currentColor"
				strokeWidth={0.5}
				opacity={0.42}
			/>
			<Rosette cx={120} cy={94} r={58} seed={spec.seed} opacity={0.075} />
			<StraightName
				name={country.stampName}
				x={30}
				y={47}
				size={22}
				maxWidth={145}
				fontFamily={CONDENSED}
				letterSpacing={1.4}
				anchor="start"
			/>
			<rect
				x={184}
				y={32}
				width={32}
				height={18}
				fill="none"
				stroke="currentColor"
				strokeWidth={0.55}
				opacity={0.7}
			/>
			<Micro x={200} y={44.5} size={5} letterSpacing={0.7}>
				{country.iso3}
			</Micro>
			<Motif name={country.motif} x={62} y={88} size={motifSize(country, 38)} />
			{country.motif2 && <Motif name={country.motif2} x={90} y={103} size={13} opacity={0.6} />}
			<text
				x={62}
				y={116}
				fill="currentColor"
				fontFamily={CONDENSED}
				fontSize={11}
				letterSpacing={1.9}
				textAnchor="middle"
			>
				{country.entryWord}
			</text>
			<Micro x={62} y={124} size={4.15} opacity={0.65}>
				{`PORT ${(country.stampCapital ?? country.capital).toUpperCase()}`}
			</Micro>
			<rect
				x={126}
				y={70}
				width={88}
				height={50}
				fill="currentColor"
				fillOpacity={0.045}
				stroke="currentColor"
				strokeWidth={0.55}
				strokeOpacity={0.62}
			/>
			<Micro x={170} y={81} size={5.4} letterSpacing={1.1}>
				{`CLASS ${spec.classCode}`}
			</Micro>
			<line
				x1={132}
				y1={85}
				x2={208}
				y2={85}
				stroke="currentColor"
				strokeWidth={0.4}
				opacity={0.4}
			/>
			<text
				x={140}
				y={105}
				fill="currentColor"
				fontFamily={TYPEWRITER}
				fontSize={22}
				textAnchor="middle"
			>
				{spec.day}
			</text>
			<text
				x={163}
				y={101}
				fill="currentColor"
				fontFamily={MONO}
				fontSize={7.2}
				letterSpacing={0.35}
			>
				{spec.month}
			</text>
			<text
				x={163}
				y={109}
				fill="currentColor"
				fontFamily={MONO}
				fontSize={7.2}
				letterSpacing={0.35}
			>
				{spec.year}
			</text>
			<text
				x={207}
				y={105}
				fill="currentColor"
				fontFamily={MONO}
				fontSize={5.6}
				letterSpacing={0.3}
				textAnchor="end"
			>
				{spec.serial}
			</text>
			<Micro x={120} y={130} size={4.15} opacity={0.63} letterSpacing={0.5}>
				{`ADMITTED AT ${(country.stampCapital ?? country.capital).toUpperCase()} / ${spec.reference} / ${spec.isoDate.replaceAll('-', '.')}`}
			</Micro>
			<Ticks cx={120} cy={80} rx={101} ry={55} count={28} length={2} />
		</g>
	);
}

function ShieldForm({ country, spec }: FormProps) {
	const compactDate = `${spec.day}.${spec.isoDate.slice(5, 7)}.${spec.isoDate.slice(2, 4)}`;
	return (
		<g>
			<path
				d="M 38 26 H 202 L 194 104 L 120 144 L 46 104 Z"
				fill="none"
				stroke="currentColor"
				strokeWidth={2.6}
				strokeLinejoin="round"
			/>
			<path
				d="M 44 33 H 196 L 188.6 100.5 L 120 136.5 L 51.4 100.5 Z"
				fill="none"
				stroke="currentColor"
				strokeWidth={0.7}
				strokeDasharray="3 1.6"
				opacity={0.65}
			/>
			<Rosette cx={120} cy={84} r={28} seed={spec.seed} opacity={0.12} />
			<StraightName
				name={country.stampName}
				x={120}
				y={51}
				size={21}
				maxWidth={150}
				fontFamily={SERIF}
				letterSpacing={1.5}
			/>
			<Micro x={120} y={60} size={4.15} opacity={0.66}>
				{`IMMIGRATION / ${country.iso3} / ${spec.reference}`}
			</Micro>
			<circle
				cx={120}
				cy={84}
				r={17}
				fill="currentColor"
				fillOpacity={0.05}
				stroke="currentColor"
				strokeWidth={0.6}
				strokeOpacity={0.52}
			/>
			<Motif name={country.motif} x={120} y={84} size={motifSize(country, 30)} />
			<Star cx={42} cy={33} r={2.6} opacity={0.6} />
			<Star cx={198} cy={33} r={2.6} opacity={0.6} />
			<line
				x1={82}
				y1={106}
				x2={158}
				y2={106}
				stroke="currentColor"
				strokeWidth={0.45}
				opacity={0.4}
			/>
			<text
				x={105}
				y={110}
				fill="currentColor"
				fontFamily={CONDENSED}
				fontSize={5.8}
				letterSpacing={1.1}
				textAnchor="middle"
			>
				{country.entryWord}
			</text>
			<text
				x={108}
				y={117}
				fill="currentColor"
				fontFamily={MONO}
				fontSize={8.4}
				letterSpacing={0.15}
				textAnchor="middle"
			>
				{compactDate}
			</text>
			<text
				x={137}
				y={110}
				fill="currentColor"
				fontFamily={CONDENSED}
				fontSize={5.8}
				letterSpacing={1.1}
				textAnchor="middle"
			>
				{`CLASS ${spec.classCode}`}
			</text>
			<text
				x={137}
				y={119}
				fill="currentColor"
				fontFamily={MONO}
				fontSize={5.2}
				letterSpacing={0.2}
				textAnchor="middle"
			>
				{spec.serial}
			</text>
			<Micro x={120} y={128} size={3.2} opacity={0.55} letterSpacing={0.5}>
				CONSULAR
			</Micro>
			<line
				x1={44}
				y1={66}
				x2={196}
				y2={66}
				stroke="currentColor"
				strokeWidth={0.45}
				opacity={0.35}
			/>
		</g>
	);
}

function TransitForm({ country, spec }: FormProps) {
	return (
		<g>
			<path
				d="M 120 18 L 204 52 L 204 108 L 120 142 L 36 108 L 36 52 Z"
				fill="none"
				stroke="currentColor"
				strokeWidth={2.6}
				strokeLinejoin="round"
			/>
			<path
				d="M 120 25 L 197.5 56 L 197.5 104 L 120 135 L 42.5 104 L 42.5 56 Z"
				fill="none"
				stroke="currentColor"
				strokeWidth={0.7}
				strokeDasharray="2.6 1.8"
				opacity={0.62}
			/>
			<Rosette cx={120} cy={84} r={52} seed={spec.seed} opacity={0.09} />
			<StraightName
				name={country.stampName}
				x={120}
				y={53}
				size={17}
				maxWidth={96}
				fontFamily={CONDENSED}
				letterSpacing={1.4}
			/>
			<line
				x1={54}
				y1={58}
				x2={186}
				y2={58}
				stroke="currentColor"
				strokeWidth={0.45}
				opacity={0.38}
			/>
			<Motif name={country.motif} x={73} y={85} size={motifSize(country, 40)} />
			{country.motif2 && <Motif name={country.motif2} x={98} y={102} size={13} opacity={0.6} />}
			<text
				x={145}
				y={80}
				fill="currentColor"
				fontFamily={CONDENSED}
				fontSize={14}
				letterSpacing={2.2}
				textAnchor="middle"
			>
				TRANSIT
			</text>
			<line
				x1={126}
				y1={86}
				x2={180}
				y2={86}
				stroke="currentColor"
				strokeWidth={0.45}
				opacity={0.45}
			/>
			<text
				x={145}
				y={96}
				fill="currentColor"
				fontFamily={MONO}
				fontSize={8.2}
				letterSpacing={0.25}
				textAnchor="middle"
			>
				{spec.dateLine}
			</text>
			<text
				x={145}
				y={108}
				fill="currentColor"
				fontFamily={CONDENSED}
				fontSize={8}
				letterSpacing={1.4}
				textAnchor="middle"
			>
				{country.entryWord}
			</text>
			<Micro x={120} y={126} size={4} opacity={0.6} letterSpacing={0.2}>
				{`Nº ${spec.serial}`}
			</Micro>
			<Star cx={120} cy={24} r={2.3} opacity={0.55} />
		</g>
	);
}

function VisaForm({ country, spec, uid }: FormProps) {
	return (
		<g>
			<path
				d="M 36 138 V 78 A 84 54 0 0 1 204 78 V 138 Z"
				fill="none"
				stroke="currentColor"
				strokeWidth={2.6}
				strokeLinejoin="round"
			/>
			<path
				d="M 43 134 V 80 A 77 48 0 0 1 197 80 V 134"
				fill="none"
				stroke="currentColor"
				strokeWidth={0.7}
				opacity={0.7}
			/>
			<Rosette cx={120} cy={100} r={44} seed={spec.seed} opacity={0.12} />
			<NameArc
				id={`${uid}-visa-name`}
				d="M 44 82 A 76 22 0 0 1 196 82"
				name={country.stampName}
				size={18}
				fontFamily={CONDENSED}
				letterSpacing={1.6}
				arcWidth={148}
			/>
			<rect
				x={98}
				y={79}
				width={44}
				height={13}
				fill="currentColor"
				fillOpacity={0.05}
				stroke="currentColor"
				strokeWidth={0.6}
				strokeOpacity={0.66}
			/>
			<text
				x={120}
				y={88}
				fill="currentColor"
				fontFamily={MONO}
				fontSize={5.9}
				letterSpacing={1.2}
				textAnchor="middle"
			>
				VISA
			</text>
			<Motif name={country.motif} x={80} y={104} size={motifSize(country, 34)} />
			{country.motif2 && <Motif name={country.motif2} x={108} y={116} size={13} opacity={0.6} />}
			<rect
				x={120}
				y={96}
				width={78}
				height={38}
				fill="currentColor"
				fillOpacity={0.05}
				stroke="currentColor"
				strokeWidth={0.55}
				strokeOpacity={0.62}
			/>
			<Micro x={161} y={104} size={4.5} letterSpacing={1}>
				{country.entryWord}
			</Micro>
			<line
				x1={126}
				y1={108}
				x2={196}
				y2={108}
				stroke="currentColor"
				strokeWidth={0.4}
				opacity={0.4}
			/>
			<text
				x={138}
				y={124}
				fill="currentColor"
				fontFamily={CONDENSED}
				fontSize={22}
				letterSpacing={0.8}
				textAnchor="middle"
			>
				{spec.day}
			</text>
			<text
				x={161}
				y={116}
				fill="currentColor"
				fontFamily={MONO}
				fontSize={6.4}
				letterSpacing={0.3}
				textAnchor="middle"
			>
				{spec.month}
			</text>
			<text
				x={161}
				y={124}
				fill="currentColor"
				fontFamily={MONO}
				fontSize={6.4}
				letterSpacing={0.3}
				textAnchor="middle"
			>
				{spec.year}
			</text>
			<text
				x={184}
				y={117}
				fill="currentColor"
				fontFamily={CONDENSED}
				fontSize={5.8}
				letterSpacing={0.9}
				textAnchor="middle"
			>
				{`CL ${spec.classCode}`}
			</text>
			<Micro x={194} y={128} size={4.3} letterSpacing={0.15} anchor="end">
				{`Nº ${spec.serial}`}
			</Micro>
			<Micro x={80} y={130} size={4.2} opacity={0.68}>
				{`PORT ${(country.stampCapital ?? country.capital).toUpperCase()}`}
			</Micro>

			<Star cx={46} cy={98} r={2.2} opacity={0.55} />
			<Star cx={194} cy={92} r={2.2} opacity={0.55} />
			<line
				x1={38}
				y1={88}
				x2={38}
				y2={110}
				stroke="currentColor"
				strokeWidth={0.4}
				opacity={0.3}
			/>
			<line
				x1={202}
				y1={88}
				x2={202}
				y2={110}
				stroke="currentColor"
				strokeWidth={0.4}
				opacity={0.3}
			/>
		</g>
	);
}

function motifSize(country: Country, base: number): number {
	if (country.stampName.length > 22) return r3Number(base * 0.74);
	if (country.stampName.length > 17) return r3Number(base * 0.86);
	return base;
}

const FORMS = {
	oval: OvalForm,
	round: RoundForm,
	permit: PermitForm,
	shield: ShieldForm,
	transit: TransitForm,
	visa: VisaForm,
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
	return (
		<svg
			className="passport-stamp-art"
			viewBox="0 0 240 160"
			aria-hidden={decorative ? 'true' : undefined}
			role={decorative ? undefined : 'img'}
			aria-label={
				decorative
					? undefined
					: `${country.name} entry stamp, ${spec.dateLine}, ${country.entryWord.toLowerCase()}`
			}
			style={{ color: INK_HEX[country.ink] }}
		>
			<defs>
				<filter
					id={`${uid}-ink`}
					x={-8}
					y={-8}
					width={256}
					height={176}
					filterUnits="userSpaceOnUse"
					colorInterpolationFilters="sRGB"
				>
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.22"
						numOctaves="2"
						seed={spec.seed % 907}
						result="warpNoise"
					/>
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.9"
						numOctaves="3"
						seed={(spec.seed + 137) % 811}
						result="grain"
					/>
					<feDisplacementMap
						in="SourceGraphic"
						in2="warpNoise"
						scale="0.7"
						xChannelSelector="R"
						yChannelSelector="G"
						result="warped"
					/>
					<feColorMatrix in="grain" type="luminanceToAlpha" result="lum" />
					<feComponentTransfer in="lum" result="holes">
						<feFuncA type="table" tableValues="0 0.8 0.95 1 1 1 1 1" />
					</feComponentTransfer>
					<feComposite in="warped" in2="holes" operator="in" />
				</filter>
				<linearGradient
					id={`${uid}-pressure`}
					gradientUnits="userSpaceOnUse"
					x1={r3Number(120 + Math.cos((spec.seed % 360) * (Math.PI / 180)) * 130)}
					y1={r3Number(80 + Math.sin((spec.seed % 360) * (Math.PI / 180)) * 90)}
					x2={r3Number(120 - Math.cos((spec.seed % 360) * (Math.PI / 180)) * 130)}
					y2={r3Number(80 - Math.sin((spec.seed % 360) * (Math.PI / 180)) * 90)}
				>
					<stop offset="0" stopColor="#ffffff" />
					<stop offset="0.55" stopColor="#f7f7f7" />
					<stop offset="1" stopColor="#d8d8d8" />
				</linearGradient>
				<mask id={`${uid}-press`} maskUnits="userSpaceOnUse" x={0} y={0} width={240} height={160}>
					<rect width={240} height={160} fill={`url(#${uid}-pressure)`} />
					{spec.voids.map((voidSpec) => (
						<ellipse
							key={`${voidSpec.x}-${voidSpec.y}`}
							cx={voidSpec.x}
							cy={voidSpec.y}
							rx={voidSpec.rx}
							ry={voidSpec.ry}
							fill="#000000"
							transform={`rotate(${voidSpec.rotation} ${voidSpec.x} ${voidSpec.y})`}
						/>
					))}
				</mask>
				<g id={`${uid}-body`}>
					<Form country={country} spec={spec} uid={uid} />
				</g>
			</defs>
			<g filter={`url(#${uid}-ink)`} mask={`url(#${uid}-press)`}>
				<use href={`#${uid}-body`} />
			</g>
			<g fill="currentColor" opacity={0.6}>
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
							x2={speck.x + Math.cos(speck.angle) * 2.4}
							y2={speck.y + Math.sin(speck.angle) * 2.4}
							stroke="currentColor"
							strokeWidth={0.5}
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
