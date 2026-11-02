'use client';

import { ChevronDown, ChevronLeft, ChevronRight, HugeiconsIcon, ShuffleIcon } from '@icons';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { IconButton } from './controls';
import { displayName, shuffleLook } from './edition';
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
		<div className="flex items-center justify-center gap-1">
			<IconButton label="Previous edition" onClick={() => step(-1)}>
				<ChevronLeft size={16} />
			</IconButton>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[14px] font-medium transition-colors hover:bg-[var(--muted-bg)]">
					{displayName(templates[index])}
					<ChevronDown size={14} className="text-[var(--text-ghost)]" />
				</PopoverTrigger>
				<PopoverContent className="max-h-[60vh] w-56 overflow-y-auto overscroll-contain">
					{templates.map((t) => (
						<button
							key={t.id}
							type="button"
							onClick={() => {
								choose(t);
								setOpen(false);
							}}
							className={cn(
								'block w-full rounded-[14px] px-3 py-1.5 text-left text-[13px] transition-colors hover:bg-[var(--muted-bg-strong)]',
								t.id === look.family
									? 'font-medium text-[var(--foreground)]'
									: 'text-[var(--text-secondary)]'
							)}
						>
							{displayName(t)}
						</button>
					))}
				</PopoverContent>
			</Popover>
			<IconButton label="Next edition" onClick={() => step(1)}>
				<ChevronRight size={16} />
			</IconButton>
			<IconButton label="Shuffle" onClick={() => onChange(shuffleLook(templates, look))}>
				<HugeiconsIcon icon={ShuffleIcon} size={15} />
			</IconButton>
		</div>
	);
}
