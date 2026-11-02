'use client';

import { useState } from 'react';
import { BriefingFrame } from './BriefingFrame';
import { ContentControls } from './ContentControls';
import { GroupLabel } from './controls';
import { DEMO_DRAFT, DEMO_LOOK } from './demo';
import { EditionBar } from './EditionBar';
import { WEEKLY_FAMILY } from './edition';
import { LookControls } from './LookControls';
import type { Look, Template } from './types';

export default function BriefingConfigurator() {
	const [templates, setTemplates] = useState<Template[]>([]);
	const [look, setLook] = useState<Look>(DEMO_LOOK);
	const [draft, setDraft] = useState(DEMO_DRAFT);

	return (
		<div className="grid items-start gap-10 md:grid-cols-[minmax(0,1fr)_280px]">
			<div className="flex min-w-0 flex-col gap-4">
				{templates.length > 0 && (
					<EditionBar templates={templates} look={look} onChange={setLook} />
				)}
				<BriefingFrame draft={draft} look={look} onTemplates={setTemplates} />
			</div>
			<aside className="flex flex-col gap-2">
				<GroupLabel>Design</GroupLabel>
				{templates.length > 0 && (
					<LookControls templates={templates} look={look} onChange={setLook} />
				)}
				<GroupLabel>Content</GroupLabel>
				<ContentControls draft={draft} onChange={setDraft} weekly={look.family === WEEKLY_FAMILY} />
			</aside>
		</div>
	);
}
