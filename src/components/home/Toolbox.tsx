'use client';

import SectionLink from '@/components/ui/SectionLink';
import { LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

const TOOLS = [
	{ name: 'Arc', icon: '/icons/favicons/arc-net.png' },
	{ name: 'VS Code', icon: '/icons/favicons/code-visualstudio-com.png' },
	{ name: 'Linear', icon: '/icons/favicons/linear-app.png' },
	{ name: 'Mymind', icon: '/icons/favicons/mymind-com.png' },
	{ name: 'Ghostty', icon: '/icons/favicons/ghostty-org.png' },
	{ name: 'Claude', icon: '/icons/favicons/claude-ai.png' },
	{ name: 'Figma', icon: '/icons/favicons/figma-com.png' },
	{ name: 'Notion', icon: '/icons/favicons/notion-so.png' },
];

const EASE = [0.19, 1, 0.22, 1] as const;

export default function Toolbox() {
	return (
		<LazyMotion features={loadFeatures}>
			<div>
				<div className="section-header flex items-center justify-between">
					<span>Toolbox</span>
					<SectionLink href="/tools" label="See all" variant="ghost" />
				</div>
				<div className="flex flex-wrap gap-5">
					{TOOLS.map((tool, i) => (
						<m.div
							key={tool.name}
							initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
							whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
							viewport={{ once: true }}
							transition={{ duration: 0.35, ease: EASE, delay: i * 0.04 }}
							whileHover={{ scale: 1.08 }}
							className="group inline-flex flex-col items-center gap-1.5 cursor-default relative"
						>
							<img
								src={tool.icon}
								width={24}
								height={24}
								alt={tool.name}
								className="block rounded-[6px] w-6 h-6 shrink-0"
							/>
							<span className="absolute -bottom-[18px] left-1/2 -translate-x-1/2 text-[10px] text-[var(--text-ghost)] tracking-[-0.01em] leading-none whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
								{tool.name}
							</span>
						</m.div>
					))}
				</div>
			</div>
		</LazyMotion>
	);
}
