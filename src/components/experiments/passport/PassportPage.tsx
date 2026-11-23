'use client';

import {
	type CSSProperties,
	type KeyboardEvent as ReactKeyboardEvent,
	type PointerEvent as ReactPointerEvent,
	useRef,
	useState,
} from 'react';
import { COUNTRY_BY_CODE } from './data/countries';
import SecurityPrint from './paper/SecurityPrint';
import { Stamp } from './Stamp';
import { MAX_STAMPS, type StampEntry } from './state';

interface Props {
	entries: StampEntry[];
	onMove: (code: string, x: number, y: number) => void;
	preview?: boolean;
	arranging?: boolean;
}

function clampPosition(width: number, x: number, y: number): { x: number; y: number } {
	const halfW = width / 2 + 1;
	const halfH = width * 0.2333 + 1;
	return {
		x: Math.min(99 - halfW, Math.max(halfW, x)),
		y: Math.min(99 - halfH, Math.max(halfH, y)),
	};
}

interface Drag {
	code: string;
	pointerId: number;
	startX: number;
	startY: number;
	originX: number;
	originY: number;
	width: number;
	height: number;
	stampWidth: number;
}

export function PassportPage({ entries, onMove, preview = false, arranging = false }: Props) {
	const drag = useRef<Drag | null>(null);
	const [dragging, setDragging] = useState<string | null>(null);

	const handleDown = (event: ReactPointerEvent<HTMLButtonElement>, entry: StampEntry) => {
		if (event.pointerType === 'touch' && !arranging) return;
		const page = event.currentTarget.closest('.passport-page');
		if (!(page instanceof HTMLElement)) return;
		const rect = page.getBoundingClientRect();
		drag.current = {
			code: entry.code,
			pointerId: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			originX: entry.x,
			originY: entry.y,
			width: rect.width,
			height: rect.height,
			stampWidth: entry.width,
		};
		event.currentTarget.setPointerCapture(event.pointerId);
		event.preventDefault();
		setDragging(entry.code);
	};

	const handleMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
		const state = drag.current;
		if (!state || state.pointerId !== event.pointerId) return;
		const dx = ((event.clientX - state.startX) / state.width) * 100;
		const dy = ((event.clientY - state.startY) / state.height) * 100;
		const moved = clampPosition(state.stampWidth, state.originX + dx, state.originY + dy);
		onMove(state.code, moved.x, moved.y);
	};

	const handleKey = (event: ReactKeyboardEvent<HTMLButtonElement>, entry: StampEntry) => {
		const step = event.shiftKey ? 4 : 1.4;
		const dx = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0;
		const dy = event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0;
		if (!dx && !dy) return;
		event.preventDefault();
		const next = clampPosition(entry.width, entry.x + dx, entry.y + dy);
		onMove(entry.code, next.x, next.y);
	};

	const handleUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
		if (drag.current?.pointerId !== event.pointerId) return;
		event.currentTarget.releasePointerCapture(event.pointerId);
		drag.current = null;
		setDragging(null);
	};

	const count = String(entries.length).padStart(2, '0');
	const max = String(MAX_STAMPS).padStart(2, '0');

	return (
		<div className="passport-page-wrap">
			<div className="passport-book">
				<div className="passport-cover" aria-hidden="true" />
				<div className="passport-page-stack" aria-hidden="true" />
				<div className={arranging ? 'passport-page is-arranging' : 'passport-page'}>
					{preview ? (
						<div className="passport-thumb-security" aria-hidden="true" />
					) : (
						<SecurityPrint />
					)}
					<div className="passport-gutter" aria-hidden="true" />
					<header className="passport-header">
						<div className="passport-issuer">
							<span className="passport-issuer-name">REPUBLIC OF EVERYWHERE</span>
							<span className="passport-issuer-micro">
								MINISTRY OF FOREIGN AFFAIRS · DÉPARTEMENT DES VISAS
							</span>
						</div>
						<div className="passport-doc">
							<span>No. EV 197 000</span>
							<span>PAGE 07</span>
						</div>
						<div className="passport-heading">
							<h2>VISAS</h2>
							<span className="passport-heading-rule" aria-hidden="true" />
							<span className="passport-heading-meta">
								{count} / {max} ENDORSEMENTS
							</span>
						</div>
					</header>

					<div className="passport-stamp-layer">
						{entries.map((entry, index) => {
							const country = COUNTRY_BY_CODE[entry.code];
							if (!country) return null;
							return preview ? (
								<div
									key={`${entry.code}-${entry.seed}`}
									className="passport-stamp-slot"
									style={
										{
											left: `${entry.x}%`,
											top: `${entry.y}%`,
											width: `${entry.width}%`,
											zIndex: 2 + index,
											'--rot': `${entry.rotation}deg`,
											'--stagger': `${Math.min(index * 38, 120)}ms`,
										} as CSSProperties
									}
								>
									<div className="passport-stamp-tilt">
										<Stamp country={country} seed={entry.seed} decorative />
									</div>
								</div>
							) : (
								<button
									key={`${entry.code}-${entry.seed}`}
									type="button"
									className={
										dragging === entry.code
											? 'passport-stamp-slot is-dragging'
											: 'passport-stamp-slot'
									}
									style={
										{
											left: `${entry.x}%`,
											top: `${entry.y}%`,
											width: `${entry.width}%`,
											zIndex: 2 + index,
											'--rot': `${entry.rotation}deg`,
											'--stagger': `${Math.min(index * 38, 120)}ms`,
										} as CSSProperties
									}
									onPointerDown={(event) => handleDown(event, entry)}
									onPointerMove={handleMove}
									onPointerUp={handleUp}
									onPointerCancel={handleUp}
									onKeyDown={(event) => handleKey(event, entry)}
									aria-label={`${country.name} stamp. Use arrow keys to move.`}
									aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"
									data-code={entry.code}
								>
									<div className="passport-stamp-tilt">
										<Stamp country={country} seed={entry.seed} decorative />
									</div>
								</button>
							);
						})}
					</div>

					{entries.length === 0 && (
						<div className="passport-empty">
							<div className="passport-empty-oval" aria-hidden="true">
								<span>NO ENDORSEMENTS</span>
							</div>
							<p>Choose a country to ink the first stamp.</p>
						</div>
					)}

					<footer className="passport-footer">
						<div className="passport-footer-rule" aria-hidden="true" />
						<p>
							THIS PASSPORT REMAINS THE PROPERTY OF THE REPUBLIC OF EVERYWHERE · CE PASSEPORT
							DEMEURE LA PROPRIÉTÉ DE LA RÉPUBLIQUE DE PARTOUT
						</p>
						<div className="passport-footer-meta">
							<span>VISAS · VISADOS · VISAS</span>
							<span>07</span>
						</div>
					</footer>
				</div>
			</div>
		</div>
	);
}
