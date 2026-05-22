import type React from 'react';

import { CARD_IMAGES } from './constants';

interface LogoHeaderProps {
	variant?: 'front' | 'back';
}

export const LogoHeader: React.FC<LogoHeaderProps> = ({ variant = 'front' }) => {
	const iconSize = variant === 'front' ? 28 : 24;
	const textSize = variant === 'front' ? 'text-2xl' : 'text-xl';

	return (
		<div className="absolute top-8 left-0 flex w-full items-center px-8">
			<div className="flex items-center gap-2 rounded-full bg-black/20 py-1.5 pr-4 pl-2 backdrop-blur-md">
				<img
					src={CARD_IMAGES.LOGO_WHITE}
					alt="GAIA"
					width={iconSize}
					height={iconSize}
					className="object-contain"
				/>
				<span
					className={`${textSize} text-white tracking-wide`}
					style={{
						fontFamily: 'var(--font-aeonik), system-ui, sans-serif',
						fontWeight: 700,
					}}
				>
					GAIA
				</span>
			</div>
		</div>
	);
};
