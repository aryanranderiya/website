'use client';

import { type HTMLMotionProps, LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { staggerContainer, staggerItem } from '@/lib/motion';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

interface FadeInProps extends HTMLMotionProps<'div'> {
	delay?: number;
	duration?: number;
	blur?: boolean;
	once?: boolean;
}

export function FadeIn({
	children,
	delay = 0,
	duration = 0.4,
	blur = true,
	once = true,
	...props
}: FadeInProps) {
	return (
		<LazyMotion features={loadFeatures}>
			<m.div
				initial={{ opacity: 0, y: 8, filter: blur ? 'blur(6px)' : 'none' }}
				whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
				viewport={{ once, margin: '-20px' }}
				transition={{
					duration,
					delay,
					ease: [0.25, 0.46, 0.45, 0.94],
				}}
				{...props}
			>
				{children}
			</m.div>
		</LazyMotion>
	);
}

interface StaggerListProps {
	children: React.ReactNode;
	className?: string;
	stagger?: number;
	delayChildren?: number;
	once?: boolean;
}

export function StaggerList({
	children,
	className,
	stagger = 0.07,
	delayChildren = 0,
	once = true,
}: StaggerListProps) {
	return (
		<LazyMotion features={loadFeatures}>
			<m.div
				className={className}
				variants={staggerContainer(stagger, delayChildren)}
				initial="hidden"
				whileInView="visible"
				viewport={{ once, margin: '-20px' }}
			>
				{children}
			</m.div>
		</LazyMotion>
	);
}

export function StaggerItem({ children, className, ...props }: HTMLMotionProps<'div'>) {
	return (
		<LazyMotion features={loadFeatures}>
			<m.div variants={staggerItem} className={className} {...props}>
				{children}
			</m.div>
		</LazyMotion>
	);
}
