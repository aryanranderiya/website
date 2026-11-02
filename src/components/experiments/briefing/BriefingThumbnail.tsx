'use client';

import { BriefingFrame } from './BriefingFrame';
import { DEMO_DRAFT, DEMO_LOOK } from './demo';

/** The demo edition, static, for the experiments grid. */
export default function BriefingThumbnail() {
	return <BriefingFrame draft={DEMO_DRAFT} look={DEMO_LOOK} />;
}
