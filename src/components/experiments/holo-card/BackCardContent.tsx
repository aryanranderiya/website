import type React from 'react';

import { CARD_CLASSES } from './constants';

interface BackCardContentProps {
	name: string;
	personalityPhrase?: string;
	userBio?: string;
	accountNumber: string | number;
	memberSince: string | number;
	isStatic?: boolean;
}

export const BackCardContent: React.FC<BackCardContentProps> = ({
	name,
	personalityPhrase,
	userBio,
	isStatic = false,
}) => {
	return (
		<div className="flex min-h-0 w-full flex-1 flex-col gap-4">
			<div className={CARD_CLASSES.INFO_BOX_BACK}>
				<div
					className={
						isStatic
							? 'mb-2 font-normal font-serif text-2xl text-white'
							: 'mb-0 font-normal font-serif text-2xl text-white'
					}
				>
					{name}
				</div>
				<div
					className={
						isStatic
							? 'mb-4 font-light text-sm text-white/80 italic'
							: 'mb-2 font-light text-sm text-white/80 italic'
					}
				>
					{personalityPhrase}
				</div>
				<p className="scrollbar-faint pointer-events-auto min-h-0 flex-1 overflow-y-auto overscroll-contain text-sm text-white/80">
					{userBio}
				</p>
			</div>
		</div>
	);
};

interface BackCardFooterProps {
	accountNumber: string | number;
	memberSince: string | number;
	isStatic?: boolean;
}

export const BackCardFooter: React.FC<BackCardFooterProps> = ({
	accountNumber,
	memberSince,
	isStatic = false,
}) => {
	return (
		<div className={CARD_CLASSES.FOOTER_BOX}>
			<div className="flex flex-col gap-1">
				<span
					className={
						isStatic
							? 'font-mono! text-white/50 text-xs uppercase'
							: 'font-mono text-white/50 text-xs uppercase'
					}
				>
					Member Since
				</span>
				<span className="font-medium font-mono text-sm text-white/80 uppercase">{memberSince}</span>
			</div>
			<div className="flex flex-col items-end gap-1">
				<span className="font-mono text-white/50 text-xs uppercase">User ID</span>
				<span
					className={
						isStatic
							? 'font-medium font-mono text-sm text-white/80 uppercase'
							: 'font-medium text-sm text-white/80'
					}
				>
					{accountNumber}
				</span>
			</div>
		</div>
	);
};
