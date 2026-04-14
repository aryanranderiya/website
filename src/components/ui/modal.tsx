'use client';

import { Cancel01Icon, HugeiconsIcon } from '@icons';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface ModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	children: React.ReactNode;
	title?: string;
	description?: string;
	size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizes = {
	sm: 'max-w-sm',
	md: 'max-w-md',
	lg: 'max-w-2xl',
	xl: 'max-w-4xl',
	full: 'max-w-[90vw]',
};

export function Modal({
	open,
	onOpenChange,
	children,
	title,
	description,
	size = 'md',
}: ModalProps) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<AnimatePresence>
				{open && (
					<Dialog.Portal forceMount>
						<Dialog.Overlay asChild>
							<motion.div
								className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[4px]"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.2 }}
							/>
						</Dialog.Overlay>
						<Dialog.Content asChild>
							<motion.div
								className={cn(
									'fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2',
									'rounded-2xl overflow-hidden bg-[var(--card)]',
									sizes[size]
								)}
								initial={{ opacity: 0, scale: 0.95, y: 8 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95, y: 8 }}
								transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
							>
								{title && <Dialog.Title className="sr-only">{title}</Dialog.Title>}
								{description && (
									<Dialog.Description className="sr-only">{description}</Dialog.Description>
								)}
								<Dialog.Close
									className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70 text-[var(--muted-foreground)]"
									aria-label="Close"
								>
									<HugeiconsIcon icon={Cancel01Icon} size={16} />
								</Dialog.Close>
								{children}
							</motion.div>
						</Dialog.Content>
					</Dialog.Portal>
				)}
			</AnimatePresence>
		</Dialog.Root>
	);
}

export { Dialog };
