'use client';

import { Cancel01Icon, HugeiconsIcon } from '@icons';
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
import { MAX_STAMPS, type StampEntry, stampHeight } from './state';

interface Props {
	entries: StampEntry[];
	onMove: (code: string, x: number, y: number) => void;
	onRemove?: (code: string) => void;
	preview?: boolean;
	arranging?: boolean;
}

function clampPosition(
	width: number,
	aspect: number,
	x: number,
	y: number
): { x: number; y: number } {
	const halfW = width / 2 + 1;
	const halfH = stampHeight(width, aspect) / 2 + 1;
	return {
		x: Math.min(99 - halfW, Math.max(halfW, x)),
		y: Math.min(99 - halfH, Math.max(halfH, y)),
	};
}

interface Press {
	code: string;
	pointerId: number;
	startX: number;
	startY: number;
	originX: number;
	originY: number;
	width: number;
	height: number;
	stampWidth: number;
	aspect: number;
	moved: boolean;
}

export function PassportPage({
	entries,
	onMove,
	onRemove,
	preview = false,
	arranging = false,
}: Props) {
	const press = useRef<Press | null>(null);
	const [dragging, setDragging] = useState<string | null>(null);
	const [selected, setSelected] = useState<string | null>(null);
	const activeSelection =
		selected && entries.some((entry) => entry.code === selected) ? selected : null;

	const handleDown = (event: ReactPointerEvent<HTMLButtonElement>, entry: StampEntry) => {
		setSelected(entry.code);
		if (event.pointerType === 'touch' && !arranging) return;
		const page = event.currentTarget.closest('.passport-page');
		if (!(page instanceof HTMLElement)) return;
		const rect = page.getBoundingClientRect();
		press.current = {
			code: entry.code,
			pointerId: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			originX: entry.x,
			originY: entry.y,
			width: rect.width,
			height: rect.height,
			stampWidth: entry.width,
			aspect: entry.aspect,
			moved: false,
		};
	};

	const handleMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
		const state = press.current;
		if (!state || state.pointerId !== event.pointerId) return;
		if (!state.moved) {
			const distance = Math.hypot(event.clientX - state.startX, event.clientY - state.startY);
			if (distance < 4) return;
			state.moved = true;
			event.currentTarget.setPointerCapture(event.pointerId);
			setDragging(state.code);
		}
		const dx = ((event.clientX - state.startX) / state.width) * 100;
		const dy = ((event.clientY - state.startY) / state.height) * 100;
		const moved = clampPosition(
			state.stampWidth,
			state.aspect,
			state.originX + dx,
			state.originY + dy
		);
		onMove(state.code, moved.x, moved.y);
	};

	const handleUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
		if (press.current?.pointerId !== event.pointerId) return;
		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
		press.current = null;
		setDragging(null);
	};

	const handleKey = (event: ReactKeyboardEvent<HTMLButtonElement>, entry: StampEntry) => {
		if (event.key === 'Escape') {
			setSelected(null);
			return;
		}
		if ((event.key === 'Delete' || event.key === 'Backspace') && onRemove) {
			event.preventDefault();
			setSelected(null);
			onRemove(entry.code);
			return;
		}
		const step = event.shiftKey ? 4 : 1.4;
		const dx = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0;
		const dy = event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0;
		if (!dx && !dy) return;
		event.preventDefault();
		setSelected(entry.code);
		const next = clampPosition(entry.width, entry.aspect, entry.x + dx, entry.y + dy);
		onMove(entry.code, next.x, next.y);
	};

	const count = String(entries.length).padStart(2, '0');
	const max = String(MAX_STAMPS).padStart(2, '0');

	return (
		<div className="passport-page-wrap">
			<div className="passport-book">
				<div className="passport-cover" aria-hidden="true" />
				<div className="passport-page-stack" aria-hidden="true" />
				<div
					className={arranging ? 'passport-page is-arranging' : 'passport-page'}
					onPointerDown={(event) => {
						if (preview) return;
						if ((event.target as HTMLElement).closest('.passport-stamp-slot')) return;
						setSelected(null);
					}}
				>
					{preview ? (
						<div className="passport-thumb-security" aria-hidden="true" />
					) : (
						<SecurityPrint />
					)}
					<div className="passport-gutter" aria-hidden="true" />
					<header className="passport-header">
						<div className="passport-issuer">
							<span className="passport-issuer-name">Republic of Everywhere</span>
							<span className="passport-issuer-micro">Ministry of Foreign Affairs</span>
						</div>
						<div className="passport-doc">
							<span>EV 197 000</span>
							<span>Page 07</span>
						</div>
						<div className="passport-heading">
							<h2>Visas</h2>
							<span className="passport-heading-rule" aria-hidden="true" />
							<span className="passport-heading-meta">
								{count} / {max}
							</span>
						</div>
					</header>

					<div className="passport-stamp-layer">
						{entries.map((entry, index) => {
							const country = COUNTRY_BY_CODE[entry.code];
							if (!country) return null;
							const isSelected = activeSelection === entry.code;
							const slotStyle = {
								left: `${entry.x}%`,
								top: `${entry.y}%`,
								width: `${entry.width}%`,
								zIndex: isSelected ? 40 : 2 + index,
								'--rot': `${entry.rotation}deg`,
								'--stagger': `${Math.min(index * 38, 120)}ms`,
							} as CSSProperties;

							if (preview) {
								return (
									<div
										key={`${entry.code}-${entry.seed}`}
										className="passport-stamp-slot"
										style={slotStyle}
									>
										<div className="passport-stamp-tilt">
											<Stamp country={country} seed={entry.seed} decorative />
										</div>
									</div>
								);
							}

							return (
								<div
									key={`${entry.code}-${entry.seed}`}
									className={[
										'passport-stamp-slot',
										isSelected ? 'is-selected' : '',
										dragging === entry.code ? 'is-dragging' : '',
									]
										.filter(Boolean)
										.join(' ')}
									style={slotStyle}
								>
									<button
										type="button"
										className="passport-stamp-hit"
										onPointerDown={(event) => handleDown(event, entry)}
										onPointerMove={handleMove}
										onPointerUp={handleUp}
										onPointerCancel={handleUp}
										onKeyDown={(event) => handleKey(event, entry)}
										aria-label={`${country.name} stamp`}
										aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight Delete"
										data-code={entry.code}
									>
										<div className="passport-stamp-tilt">
											<Stamp country={country} seed={entry.seed} decorative />
										</div>
									</button>
									{isSelected && onRemove && (
										<button
											type="button"
											className="passport-stamp-remove"
											onClick={() => {
												setSelected(null);
												onRemove(entry.code);
											}}
											aria-label={`Remove ${country.name} stamp`}
										>
											<HugeiconsIcon icon={Cancel01Icon} size={11} />
										</button>
									)}
								</div>
							);
						})}
					</div>

					{entries.length === 0 && (
						<div className="passport-empty">
							<span className="passport-empty-word">Visas</span>
							<span className="passport-empty-hint">Choose a country</span>
						</div>
					)}

					<footer className="passport-footer">
						<span>Republic of Everywhere</span>
						<span>EV 197 000 · 07</span>
					</footer>
				</div>
			</div>
		</div>
	);
}
