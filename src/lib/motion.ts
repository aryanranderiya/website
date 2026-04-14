// Shared Framer Motion animation variants
// Import and use these across components for consistency

export const fadeInBlur = {
	hidden: { opacity: 0, filter: 'blur(8px)', y: 8 },
	visible: {
		opacity: 1,
		filter: 'blur(0px)',
		y: 0,
		transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
	},
};

export const fadeIn = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { duration: 0.35, ease: 'easeOut' },
	},
};

export const slideUp = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
	},
};

export const slideRight = {
	hidden: { opacity: 0, x: -20 },
	visible: {
		opacity: 1,
		x: 0,
		transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
	},
};

export const scaleIn = {
	hidden: { opacity: 0, scale: 0.95 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
	},
};

// Stagger container: apply to parent
export const staggerContainer = (staggerChildren = 0.08, delayChildren = 0) => ({
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren,
			delayChildren,
		},
	},
});

// Use with staggerContainer
export const staggerItem = {
	hidden: { opacity: 0, y: 16 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
	},
};

// Spring config for cursor/drag
export const springConfig = {
	type: 'spring' as const,
	stiffness: 300,
	damping: 30,
	mass: 0.5,
};

// Page transition
export const pageTransition = {
	initial: { opacity: 0, y: 8, filter: 'blur(4px)' },
	animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
	exit: { opacity: 0, y: -8, filter: 'blur(4px)' },
	transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
};

// Accordion
export const accordionContent = {
	hidden: { height: 0, opacity: 0 },
	visible: {
		height: 'auto',
		opacity: 1,
		transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
	},
};

// Modal
export const modalOverlay = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { duration: 0.2 } },
};

export const modalContent = {
	hidden: { opacity: 0, scale: 0.96, y: 8 },
	visible: {
		opacity: 1,
		scale: 1,
		y: 0,
		transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
	},
};
