'use client';

import { ChevronDown, ChevronLeft, ChevronRight, HugeiconsIcon, ShuffleIcon } from '@icons';
import { useState } from 'react';
import { flatIconButton, flatSurface } from '@/components/ui/flat-button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { IconButton } from './controls';
import { displayName, shuffleLook } from './edition';
import manifest from './manifest.json';
import type { Look, Template } from './types';

/** Above the preview: which edition, step through them, or shuffle like GAIA does each morning. */
export function EditionBar({
	templates,
	look,
	onChange,
}: {
	templates: Template[];
	look: Look;
	onChange: (look: Look) => void;
}) {
	const [open, setOpen] = useState(false);
	const index = templates.findIndex((t) => t.id === look.family);
	const choose = (t: Template) => onChange({ ...look, family: t.id, skin: {} });
	const step = (delta: number) =>
		choose(templates[(index + delta + templates.length) % templates.length]);

	return (
		<div className="flex items-center justify-center gap-1.5">
			<IconButton label="Previous edition" onClick={() => step(-1)} className={flatIconButton}>
				<ChevronLeft size={16} />
			</IconButton>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger
					className={cn(
						flatSurface,
						'flex h-9 w-52 items-center justify-between gap-2 px-3.5 text-[14px] font-medium'
					)}
				>
					<span className="truncate">{displayName(templates[index])}</span>
					<ChevronDown size={14} className="shrink-0 text-[var(--text-secondary)]" />
				</PopoverTrigger>
				<PopoverContent className="max-h-[60vh] w-60 overflow-y-auto overscroll-contain">
					{templates.map((t) => (
						<button
							key={t.id}
							type="button"
							onClick={() => {
								choose(t);
								setOpen(false);
							}}
							className={cn(
								'flex w-full cursor-pointer items-center gap-3 rounded-[14px] p-1.5 pr-3 text-left text-[13px] transition-colors hover:bg-[var(--muted-bg-strong)]',
								t.id === look.family
									? 'bg-[var(--muted-bg)] font-medium text-[var(--foreground)]'
									: 'text-[var(--text-secondary)]'
							)}
						>
							<img
								src={`${manifest.base}/thumbs/${t.id}.webp`}
								alt=""
								loading="lazy"
								className="size-10 shrink-0 rounded-lg object-cover"
							/>
							{displayName(t)}
						</button>
					))}
				</PopoverContent>
			</Popover>
			<IconButton label="Next edition" onClick={() => step(1)} className={flatIconButton}>
				<ChevronRight size={16} />
			</IconButton>
			<IconButton
				label="Shuffle"
				onClick={() => onChange(shuffleLook(templates, look))}
				className={cn(flatIconButton, 'ml-1.5')}
			>
				<HugeiconsIcon icon={ShuffleIcon} size={15} />
			</IconButton>
		</div>
	);
}
