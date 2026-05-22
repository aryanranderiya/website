'use client';

import { useState } from 'react';
import { StyleSheetManager } from 'styled-components';
import { HoloCard } from './holo-card/HoloCard';
import type { HoloCardProps } from './holo-card/types';

// Astro's view-transition router swaps the document <head> on client-side
// navigation. styled-components injects its rules into a <style> in the head,
// so after the first SPA navigation that stylesheet is detached and any styled
// component renders unstyled (the holo card's background image disappears, etc).
// styled-components won't re-inject because its module-level cache (which
// persists across SPA navs) thinks the rules are already present.
//
// Fix: scope styled-components to a target node INSIDE this island via
// StyleSheetManager. Each fresh island mount gets its own in-DOM <style>, so it
// always re-injects, and that style travels with (and is cleaned up alongside)
// the island on every swap. Wraps the exact GAIA HoloCard without modifying it.
export default function HoloCardIsland(props: HoloCardProps & { forceSide?: 'front' | 'back' }) {
	const [target, setTarget] = useState<HTMLElement | null>(null);
	return (
		<div ref={setTarget} className="contents">
			{target && (
				<StyleSheetManager target={target}>
					<HoloCard {...props} />
				</StyleSheetManager>
			)}
		</div>
	);
}
