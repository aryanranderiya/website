'use client';

import { LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

const EASE = [0.19, 1, 0.22, 1] as const;

const SOCIALS = [
	{
		name: 'GitHub',
		url: 'https://github.com/aryanranderiya',
		icon: '/icons/favicons/github-com.png',
	},
	{
		name: 'LinkedIn',
		url: 'https://linkedin.com/in/aryanranderiya',
		icon: '/icons/favicons/linkedin-com.png',
	},
	{
		name: 'Twitter',
		url: 'https://twitter.com/aryanranderiya',
		icon: '/icons/favicons/twitter-com.png',
	},
	{
		name: 'Instagram',
		url: 'https://instagram.com/aryanranderiya',
		icon: '/icons/favicons/instagram-com.png',
	},
	{
		name: 'Behance',
		url: 'https://behance.net/aryanranderiya',
		icon: '/icons/favicons/behance-net.png',
	},
	{
		name: 'Stack Overflow',
		url: 'https://stackoverflow.com/users/21615084/aryan',
		icon: '/icons/favicons/stackoverflow-com.png',
	},
	{
		name: 'Monkeytype',
		url: 'https://monkeytype.com/profile/aryanranderiya',
		icon: '/icons/favicons/monkeytype-com.png',
	},
	{
		name: 'Discord',
		url: 'https://discord.com/users/521279231284609032',
		icon: '/icons/favicons/discord-com.png',
	},
];

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
