'use client';

import { LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { SOCIALS } from '@/data/socials';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

const EASE = [0.19, 1, 0.22, 1] as const;

export default function SocialsRow() {
	return (
		<LazyMotion features={loadFeatures}>
			<div>
				<div className="section-header">Online</div>
				<div className="flex flex-wrap gap-5">
					{SOCIALS.map((social, i) => (
						<m.a
							key={social.name}
							href={social.url}
							target="_blank"
							rel="noopener noreferrer"
							initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
							whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
							viewport={{ once: true }}
							transition={{ duration: 0.35, ease: EASE, delay: i * 0.04 }}
							whileHover={{ scale: 1.08, transition: { duration: 0.15, ease: 'easeOut' } }}
							className="inline-flex flex-col items-center gap-1.5 no-underline cursor-pointer"
						>
							<img
								src={social.icon}
								width={24}
								height={24}
								alt={social.name}
								className="block rounded-[6px] w-6 h-6 shrink-0"
							/>
							<span className="text-[10px] text-[var(--text-ghost)] tracking-[-0.01em] leading-none whitespace-nowrap">
								{social.name}
							</span>
						</m.a>
					))}
				</div>
			</div>
		</LazyMotion>
	);
}
