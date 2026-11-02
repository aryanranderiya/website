'use client';

import { BriefingFrame } from './BriefingFrame';
import { DEMO_DRAFT, DEMO_LOOK } from './demo';

// Light-paper editions side by side: the grid card shows the range, not one style.
const CARD_FAMILIES = ['playfair', 'gradient', 'weekly'];

export default function BriefingThumbnail() {
	return (
		<div className="grid grid-cols-3 gap-4">
			{CARD_FAMILIES.map((family) => (
				<BriefingFrame key={family} draft={DEMO_DRAFT} look={{ ...DEMO_LOOK, family }} />
			))}
		</div>
	);
}
