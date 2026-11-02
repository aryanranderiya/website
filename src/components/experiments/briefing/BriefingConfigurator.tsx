'use client';

import { ArrowLeft01Icon, ArrowRight01Icon, HugeiconsIcon, ShuffleIcon } from '@icons';
import { useState } from 'react';
import { BriefingFrame } from './BriefingFrame';
import { ContentPanel } from './ContentPanel';
import { IconButton, Segmented } from './controls';
import { DesignPanel } from './DesignPanel';
import { DEMO_DRAFT, DEMO_LOOK } from './demo';
import { displayName, shuffleLook, WEEKLY_FAMILY } from './edition';
import type { Look, Template } from './types';

type Tab = 'design' | 'content';
const TABS: { id: Tab; label: string }[] = [
	{ id: 'design', label: 'Design' },
	{ id: 'content', label: 'Content' },
];

export default function BriefingConfigurator() {
	const [templates, setTemplates] = useState<Template[]>([]);
	const [look, setLook] = useState<Look>(DEMO_LOOK);
	const [draft, setDraft] = useState(DEMO_DRAFT);
	const [tab, setTab] = useState<Tab>('design');

	const index = templates.findIndex((t) => t.id === look.family);
	const template = templates[index];
	const step = (delta: number) => {
		const next = templates[(index + delta + templates.length) % templates.length];
		setLook({ ...look, family: next.id, skin: {} });
	};

	return (
		<div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
			<div className="flex min-w-0 flex-col gap-3 lg:sticky lg:top-20">
				<div className="flex items-center justify-between gap-2 rounded-2xl bg-[var(--muted-bg)] p-1.5">
					<IconButton label="Previous edition" onClick={() => step(-1)} disabled={!template}>
						<HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
					</IconButton>
					<div className="min-w-0 text-center text-[13px]">
						<span className="font-medium">{template ? displayName(template) : 'Loading'}</span>
						{template && (
							<span className="ml-2 text-[var(--text-ghost)] tabular-nums">
								{index + 1} / {templates.length}
							</span>
						)}
					</div>
					<div className="flex">
						<IconButton
							label="Shuffle, like GAIA does each morning"
							onClick={() => setLook(shuffleLook(templates, look))}
							disabled={!template}
						>
							<HugeiconsIcon icon={ShuffleIcon} size={16} />
						</IconButton>
						<IconButton label="Next edition" onClick={() => step(1)} disabled={!template}>
							<HugeiconsIcon icon={ArrowRight01Icon} size={16} />
						</IconButton>
					</div>
				</div>
				<div className="rounded-2xl bg-[var(--muted-bg)] px-4 py-8 sm:px-8">
					<BriefingFrame draft={draft} look={look} onTemplates={setTemplates} />
				</div>
			</div>

			<aside className="flex flex-col gap-6 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1">
				<Segmented options={TABS} value={tab} onChange={setTab} label="Panel" />
				{template &&
					(tab === 'design' ? (
						<DesignPanel templates={templates} template={template} look={look} onChange={setLook} />
					) : (
						<ContentPanel
							draft={draft}
							onChange={setDraft}
							weekly={template.id === WEEKLY_FAMILY}
						/>
					))}
			</aside>
		</div>
	);
}
