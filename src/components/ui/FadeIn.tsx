'use client';
import { LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import type { ReactNode } from 'react';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

interface FadeInProps {
	children: ReactNode;
	delay?: number;
	y?: number;
	blur?: boolean;
	className?: string;
	once?: boolean;
	inView?: boolean;
}

export default function FadeIn({
	children,
	delay = 0,
	y = 6,
	blur = true,
	className,
	once = true,
	inView = false,
}: FadeInProps) {
	const initial = { opacity: 0, y, filter: blur ? 'blur(4px)' : 'blur(0px)' };
	const animate = { opacity: 1, y: 0, filter: 'blur(0px)' };
	const transition = {
		duration: 0.4,
		delay,
		ease: [0.19, 1, 0.22, 1] as [number, number, number, number],
	};

	if (inView) {
		return (
			<LazyMotion features={loadFeatures}>
				<m.div
					className={className}
					initial={initial}
					whileInView={animate}
					viewport={{ once }}
					transition={transition}
				>
					{children}
				</m.div>
			</LazyMotion>
		);
	}
	return (
		<LazyMotion features={loadFeatures}>
			<m.div className={className} initial={initial} animate={animate} transition={transition}>
				{children}
			</m.div>
		</LazyMotion>
	);
}
