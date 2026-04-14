'use client';

import { Agentation } from 'agentation';

export default function AgentationOverlay() {
	if (import.meta.env.PROD) return null;
	return <Agentation />;
}
