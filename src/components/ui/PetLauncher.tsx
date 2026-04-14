import { Add01Icon, Github01Icon, HugeiconsIcon } from '@icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAfterPreloader } from '@/hooks/useAfterPreloader';
import { WebPet } from './web-pet';

const ANIMAL_MAP: Record<string, { color: string; label: string }> = {
	chicken: { color: 'brown', label: 'Chicken' },
	clippy: { color: 'black', label: 'Clippy' },
	cockatiel: { color: 'brown', label: 'Cockatiel' },
	crab: { color: 'red', label: 'Crab' },
	deno: { color: 'green', label: 'Deno' },
	dog: { color: 'brown', label: 'Dog' },
	fox: { color: 'red', label: 'Fox' },
	horse: { color: 'brown', label: 'Horse' },
	mod: { color: 'purple', label: 'Mod' },
	monkey: { color: 'gray', label: 'Monkey' },
	morph: { color: 'purple', label: 'Morph' },
	panda: { color: 'black', label: 'Panda' },
	rat: { color: 'brown', label: 'Rat' },
	rocky: { color: 'gray', label: 'Rocky' },
	'rubber-duck': { color: 'yellow', label: 'Duck' },
	skeleton: { color: 'blue', label: 'Skeleton' },
	snail: { color: 'brown', label: 'Snail' },
	snake: { color: 'green', label: 'Snake' },
	totoro: { color: 'gray', label: 'Totoro' },
	turtle: { color: 'green', label: 'Turtle' },
	vampire: { color: 'converted', label: 'Vampire' },
	zappy: { color: 'yellow', label: 'Zappy' },
};

const ANIMALS = Object.keys(ANIMAL_MAP);
const STORAGE_KEY = 'portfolio-pet';
const NO_PET = 'none';

const RANDOM_DEFAULTS: Array<{ animal: string; color: string }> = [
	{ animal: 'dog', color: 'brown' },
	{ animal: 'deno', color: 'green' },
	{ animal: 'panda', color: 'black' },
];

function getStored(): { animal: string; color: string } {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) return JSON.parse(raw);
	} catch {}
	// No stored preference — pick randomly between dog, deno, panda
	const pick =
		RANDOM_DEFAULTS[Math.floor(Math.random() * RANDOM_DEFAULTS.length)] ?? RANDOM_DEFAULTS[0];
	return pick;
}

export function PetLauncher() {
	const preloaderDone = useAfterPreloader();
	const [pet, setPet] = useState<{ animal: string; color: string }>({
		animal: 'dog',
		color: 'brown',
	});
	const [open, setOpen] = useState(false);
	const [petPos, setPetPos] = useState<{ x: number; y: number } | null>(null);
	const popoverRef = useRef<HTMLDivElement>(null);
	const rafRef = useRef<number | null>(null);

	useEffect(() => {
		setPet(getStored());
	}, []);

	const trackPos = useCallback(() => {
		const el = document.querySelector('[data-webpet-container]') as HTMLElement;
		if (el) {
			const rect = el.getBoundingClientRect();
			setPetPos({ x: rect.left + rect.width / 2, y: rect.top });
		}
		rafRef.current = requestAnimationFrame(trackPos);
	}, []);

	useEffect(() => {
		if (open) {
			rafRef.current = requestAnimationFrame(trackPos);
		} else {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		}
		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, [open, trackPos]);

	useEffect(() => {
		if (!open) return;
		const handler = (e: MouseEvent) => {
			const petEl = document.querySelector('[data-webpet-container]');
			if (
				popoverRef.current &&
				!popoverRef.current.contains(e.target as Node) &&
				!petEl?.contains(e.target as Node)
			) {
				setOpen(false);
			}
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, [open]);

	const select = (animal: string) => {
		const color = ANIMAL_MAP[animal]?.color ?? 'brown';
		const next = { animal, color };
		setPet(next);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
		setOpen(false);
	};

	const getPopoverStyle = (): React.CSSProperties => {
		const popW = 272;
		const gap = 10;
		if (!petPos) {
			return {
				position: 'fixed',
				top: '50%',
				left: '50%',
				transform: 'translate(-50%, -50%)',
				width: popW,
				zIndex: 10000,
			};
		}
		const left = Math.min(Math.max(8, petPos.x - popW / 2), window.innerWidth - popW - 8);
		return {
			position: 'fixed',
			top: petPos.y - gap,
			left,
			width: popW,
			zIndex: 10000,
			transform: 'translateY(-100%)',
		};
	};

	const isNone = pet.animal === NO_PET;

	return (
		<>
			{preloaderDone && !isNone && (
				<WebPet
					animal={pet.animal}
					color={pet.color}
					followMouse={true}
					paused={open}
					speed={12}
					onClick={() => setOpen((o) => !o)}
				/>
			)}

			{open && (
				// biome-ignore lint/nursery/noInlineStyles: dynamic position computed from pet coordinates
				<div ref={popoverRef} style={getPopoverStyle()}>
					<div className="bg-[var(--card,#fafafa)] rounded-[18px] px-[10px] pt-[10px] pb-[8px] shadow-[0_4px_24px_rgba(0,0,0,0.10)]">
						<p className="text-[9px] tracking-[0.06em] uppercase text-[var(--text-ghost,rgba(0,0,0,0.3))] mb-[7px] font-medium">
							Choose pet
						</p>

						<div className="grid [grid-template-columns:repeat(5,1fr)] gap-[3px]">
							{/* No pet option */}
							<PetButton isSelected={isNone} onClick={() => select(NO_PET)} title="None">
								<span
									className="w-[28px] h-[28px] flex items-center justify-center text-[16px]"
									// biome-ignore lint/nursery/noInlineStyles: dynamic color based on selection state
									style={{
										color: isNone
											? 'var(--text-primary, rgba(0,0,0,0.7))'
											: 'var(--text-ghost, rgba(0,0,0,0.3))',
									}}
								>
									✕
								</span>
								{/* biome-ignore lint/nursery/noInlineStyles: dynamic label styles based on selection state */}
								<span style={labelStyle(isNone)}>None</span>
							</PetButton>

							{ANIMALS.map((animal) => {
								const isSelected = !isNone && pet.animal === animal;
								return (
									<PetButton
										key={animal}
										isSelected={isSelected}
										onClick={() => select(animal)}
										title={ANIMAL_MAP[animal]?.label}
									>
										<img
											src={`/media/${animal}/icon.png`}
											alt={ANIMAL_MAP[animal]?.label}
											width={28}
											height={28}
											className="[image-rendering:pixelated] object-contain"
										/>
										{/* biome-ignore lint/nursery/noInlineStyles: dynamic label styles based on selection state */}
										<span style={labelStyle(isSelected)}>{ANIMAL_MAP[animal]?.label}</span>
									</PetButton>
								);
							})}
						</div>

						<a
							href="https://github.com/sankalpaacharya/webpets"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center justify-center gap-[4px] mt-[8px] text-[9px] text-[var(--text-ghost,rgba(0,0,0,0.28))] no-underline transition-[color] duration-[120ms]"
							onMouseEnter={(e) => {
								(e.currentTarget as HTMLElement).style.color = 'var(--text-muted, rgba(0,0,0,0.5))';
							}}
							onMouseLeave={(e) => {
								(e.currentTarget as HTMLElement).style.color =
									'var(--text-ghost, rgba(0,0,0,0.28))';
							}}
						>
							<HugeiconsIcon icon={Github01Icon} size={10} />
							webpets by sankalpa
						</a>
					</div>
				</div>
			)}

			{/* Floating trigger when pet is hidden */}
			{preloaderDone && isNone && (
				<button
					type="button"
					onClick={() => setOpen((o) => !o)}
					className="fixed bottom-[16px] right-[16px] w-[32px] h-[32px] rounded-full border border-[var(--border,rgba(0,0,0,0.08))] bg-[var(--card,#fafafa)] cursor-pointer text-[14px] flex items-center justify-center z-[9999] shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-[var(--text-ghost,rgba(0,0,0,0.4))]"
					title="Choose pet"
				>
					<HugeiconsIcon icon={Add01Icon} size={14} />
				</button>
			)}
		</>
	);
}

function PetButton({
	isSelected,
	onClick,
	title,
	children,
}: {
	isSelected: boolean;
	onClick: () => void;
	title?: string;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			title={title}
			className={`flex flex-col items-center gap-[3px] px-[4px] pt-[6px] pb-[5px] rounded-[10px] border-none cursor-pointer transition-[background] duration-[120ms] outline-none ${isSelected ? 'bg-[var(--muted-bg,rgba(0,0,0,0.06))]' : 'bg-transparent'}`}
			onMouseEnter={(e) => {
				if (!isSelected)
					(e.currentTarget as HTMLElement).style.background = 'var(--muted-bg, rgba(0,0,0,0.04))';
			}}
			onMouseLeave={(e) => {
				if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent';
			}}
		>
			{children}
		</button>
	);
}

function labelStyle(isSelected: boolean): React.CSSProperties {
	return {
		fontSize: 9,
		color: isSelected
			? 'var(--text-primary, rgba(0,0,0,0.85))'
			: 'var(--text-ghost, rgba(0,0,0,0.4))',
		fontWeight: isSelected ? 500 : 400,
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		maxWidth: 44,
		lineHeight: 1.2,
	};
}
