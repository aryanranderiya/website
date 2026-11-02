'use client';

import { useState } from 'react';
import { BriefingFrame } from './BriefingFrame';
import { ContentControls } from './ContentControls';
import { DEMO_DRAFT, DEMO_LOOK } from './demo';
import { WEEKLY_FAMILY } from './edition';
import { LookControls } from './LookControls';
import type { Look, Template } from './types';

export default function BriefingConfigurator() {
	const [templates, setTemplates] = useState<Template[]>([]);
	const [look, setLook] = useState<Look>(DEMO_LOOK);
	const [draft, setDraft] = useState(DEMO_DRAFT);

	return (
		<div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
			<BriefingFrame draft={draft} look={look} onTemplates={setTemplates} />
			<aside className="flex flex-col gap-2">
				{templates.length > 0 && (
					<LookControls templates={templates} look={look} onChange={setLook} />
				)}
				<ContentControls draft={draft} onChange={setDraft} weekly={look.family === WEEKLY_FAMILY} />
			</aside>
		</div>
	);
}
