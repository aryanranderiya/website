'use client';

import { LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

const AREAS = [
	{ label: 'Hardware', description: 'Physical computing and embedded systems' },
	{ label: 'Robotics', description: 'Autonomous systems and motion planning' },
	{ label: 'Energy Infrastructure', description: 'Sustainable power systems and grid tech' },
	{ label: 'Personal Companions', description: 'AI-powered companions through GAIA' },
	{ label: 'Smart Wearables', description: 'Intelligent wearable devices via GAIA' },
	{ label: 'Low-level Programming', description: 'Systems programming, C, OS internals' },
];

export default function AreasToExplore() {
	return (
		<LazyMotion features={loadFeatures}>
			<section className="py-16">
				<ul className="list-none p-0 m-0">
					{AREAS.map((area, i) => (
						<m.li
							key={area.label}
							initial={{ opacity: 0, x: -8 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							transition={{ delay: i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
							className={`flex items-baseline justify-between py-3 group ${i < AREAS.length - 1 ? 'border-b border-[var(--border)]' : ''}`}
						>
							<span className="text-sm font-medium tracking-[-0.01em] text-[var(--foreground)] transition-colors duration-150">
								{area.label}
							</span>
							<span className="text-xs text-[var(--muted-foreground)] opacity-60 transition-opacity duration-150">
								{area.description}
							</span>
						</m.li>
					))}
				</ul>
			</section>
		</LazyMotion>
	);
}
