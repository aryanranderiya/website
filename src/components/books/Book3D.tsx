'use client';

import { LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import BookCover, { useCoverAspect } from './BookCover';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

interface BookProps {
	title: string;
	author: string;
	cover?: string;
	onClick?: () => void;
	index?: number;
	/** Cover width in px; height + reflection scale from it. */
	width?: number;
}

export default function Book3D({ title, author, cover, onClick, index = 0, width = 90 }: BookProps) {
	// Height comes from the cover's REAL aspect ratio (measured on load) so the full
	// cover shows with no cropping — and because covers differ, heights vary naturally
	// like a real shelf.
	const aspect = useCoverAspect(cover);
	const bookH = Math.round(width * aspect);
	const reflectionH = Math.round(width * 0.18); // 90 → 16

	return (
		<LazyMotion features={loadFeatures}>
			<m.div
				initial={{ opacity: 0, y: 10 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ delay: Math.min(index, 8) * 0.04, duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
				className="relative flex shrink-0 flex-col"
				style={{ width }}
			>
				<button
					type="button"
					onClick={onClick}
					className="relative block cursor-pointer rounded-[3px] border-none bg-transparent p-0 transition-transform duration-200 ease-out hover:-translate-y-1"
					style={{ height: bookH }}
					aria-label={`${title} by ${author}`}
				>
					<BookCover title={title} author={author} cover={cover} className="absolute inset-0" />
				</button>
				{/* reflection — flipped cover, absolutely placed BELOW the book so it overlaps the
				    shelf's lit top surface (the book itself stays put). Fades out smoothly. */}
				<div
					className="absolute inset-x-0 top-full overflow-hidden opacity-50 [-webkit-mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.9),transparent_72%)] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.9),transparent_72%)]"
					style={{ height: reflectionH }}
					aria-hidden="true"
				>
					<div className="absolute inset-x-0 top-0 -scale-y-100" style={{ height: bookH }}>
						<BookCover title={title} author={author} cover={cover} className="absolute inset-0" />
					</div>
				</div>
			</m.div>
		</LazyMotion>
	);
}
