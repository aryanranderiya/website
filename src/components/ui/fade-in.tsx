'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { fadeInBlur, staggerContainer, staggerItem } from '@/lib/motion';

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
    <motion.div
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
    </motion.div>
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
    <motion.div
      className={className}
      variants={staggerContainer(stagger, delayChildren)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-20px' }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  ...props
}: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      variants={staggerItem}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
