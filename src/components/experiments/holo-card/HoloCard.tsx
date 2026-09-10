import type React from 'react';
import { type CSSProperties, type ReactNode, type RefObject, useId, useRef, useState } from 'react';
import Tilt from 'react-parallax-tilt';
import { BackCardContent, BackCardFooter } from './BackCardContent';
import { CardOverlay } from './CardOverlay';
import { CARD_CLASSES } from './constants';
import { FrontCardContent } from './FrontCardContent';
import { StyledHoloCard } from './holo-card.styles';
import { getHouseImage } from './houses';
import { LogoHeader } from './LogoHeader';
import { STAMP_NATURAL_HEIGHT, STAMP_NATURAL_WIDTH, STAMP_OUTER_PATH_D } from './stampShape';
import type { HoloCardProps } from './types';
import { calculateBackgroundPosition } from './utils';

const STAMP_BORDER_STYLE: CSSProperties = {
	position: 'absolute',
	inset: 22,
	border: '4px solid rgba(255, 255, 255, 0.92)',
	borderRadius: 0,
	pointerEvents: 'none',
	zIndex: 4,
	boxSizing: 'border-box',
};

function StampBorder() {
	return <div aria-hidden="true" style={STAMP_BORDER_STYLE} />;
}

function StampClipDef({ clipId, clipTransform }: { clipId: string; clipTransform: string }) {
	return (
		<svg aria-hidden="true" width="0" height="0" style={{ position: 'absolute', width: 0, height: 0 }}>
			<title>Stamp clip-path</title>
			<defs>
				<clipPath id={clipId} clipPathUnits="userSpaceOnUse">
					<path d={STAMP_OUTER_PATH_D} transform={clipTransform} />
				</clipPath>
			</defs>
		</svg>
	);
}

function getContainerStyle(forceSide: 'front' | 'back' | undefined): CSSProperties {
	return forceSide
		? { perspective: 'none', transform: 'none' }
		: { perspective: '1000px', cursor: 'pointer' };
}

function getInnerStyle(
	forceSide: 'front' | 'back' | undefined,
	effectiveFlipped: boolean,
	height: number,
	width: number
): CSSProperties {
	if (forceSide) {
		return { transform: 'none', position: 'relative', height: `${height}px`, width: `${width}px` };
	}
	return {
		transformStyle: 'preserve-3d',
		transform: effectiveFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
		height: `${height}px`,
		width: `${width}px`,
	};
}

function getFrontStyle(forceSide: 'front' | 'back' | undefined): CSSProperties {
	if (forceSide) {
		return {
			display: forceSide === 'front' ? 'block' : 'none',
			position: 'absolute',
			inset: 0,
		};
	}
	return {
		position: 'absolute',
		inset: 0,
		backfaceVisibility: 'hidden',
		WebkitBackfaceVisibility: 'hidden',
	};
}

function getBackStyle(forceSide: 'front' | 'back' | undefined): CSSProperties {
	if (forceSide) {
		return {
			display: forceSide === 'back' ? 'block' : 'none',
			position: 'absolute',
			inset: 0,
			transform: 'none',
		};
	}
	return {
		position: 'absolute',
		inset: 0,
		backfaceVisibility: 'hidden',
		WebkitBackfaceVisibility: 'hidden',
		transform: 'rotateY(180deg)',
	};
}

interface HoloFaceProps {
	forceSide?: 'front' | 'back';
	clipStyle: CSSProperties;
	overlayColor?: string;
	overlayOpacity: number;
	name: string;
	personalityPhrase: string;
	accountNumber: string | number;
	memberSince: string | number;
	houseImage: string;
	height: number;
	width: number;
	showSparkles: boolean;
	hover: boolean;
	animated: boolean;
	activeRotation: { y: number; x: number };
	activeBackgroundPosition: { tp: number; lp: number };
	cardRef: RefObject<HTMLInputElement | null>;
	onMouseMove: (event: React.MouseEvent<HTMLDivElement>) => void;
	onTouchMove: (event: React.TouchEvent<HTMLDivElement>) => void;
	onMouseOut: () => void;
	children?: ReactNode;
}

function HoloFrontFace(props: HoloFaceProps) {
	const {
		forceSide,
		clipStyle,
		overlayColor,
		overlayOpacity,
		name,
		personalityPhrase,
		accountNumber,
		memberSince,
		houseImage,
		height,
		width,
		showSparkles,
		hover,
		animated,
		activeRotation,
		activeBackgroundPosition,
		cardRef,
		onMouseMove,
		onTouchMove,
		onMouseOut,
		children,
	} = props;
	if (forceSide) {
		return (
			<div className="relative h-full w-full" style={clipStyle}>
				<StampBorder />
				<CardOverlay overlayColor={overlayColor} overlayOpacity={overlayOpacity} />
				<div className={CARD_CLASSES.CONTENT_WRAPPER}>
					<LogoHeader variant="front" />
					<FrontCardContent
						name={name}
						personalityPhrase={personalityPhrase}
						accountNumber={accountNumber}
						memberSince={memberSince}
						isStatic
					/>
				</div>
				<StyledHoloCard
					$url={houseImage}
					ref={cardRef}
					$active={false}
					$animated={false}
					$activeRotation={activeRotation}
					$activeBackgroundPosition={activeBackgroundPosition}
					$height={height}
					$width={width}
					$showSparkles={showSparkles}
				>
					{children}
				</StyledHoloCard>
			</div>
		);
	}
	return (
		<Tilt className="relative h-full w-full p-0!" style={clipStyle}>
			<StampBorder />
			<CardOverlay overlayColor={overlayColor} overlayOpacity={overlayOpacity} />
			<div className={CARD_CLASSES.CONTENT_WRAPPER}>
				<LogoHeader variant="front" />
				<FrontCardContent
					name={name}
					personalityPhrase={personalityPhrase}
					accountNumber={accountNumber}
					memberSince={memberSince}
				/>
			</div>
			<StyledHoloCard
				$url={houseImage}
				ref={cardRef}
				$active={hover}
				$animated={animated}
				$activeRotation={activeRotation}
				$activeBackgroundPosition={activeBackgroundPosition}
				onMouseMove={onMouseMove}
				onTouchMove={onTouchMove}
				onMouseOut={onMouseOut}
				$height={height}
				$width={width}
				$showSparkles={showSparkles}
			>
				{children}
			</StyledHoloCard>
		</Tilt>
	);
}

interface HoloBackFaceProps extends HoloFaceProps {
	userBio: string;
}

function HoloBackFace(props: HoloBackFaceProps) {
	const {
		forceSide,
		clipStyle,
		overlayColor,
		overlayOpacity,
		name,
		personalityPhrase,
		userBio,
		accountNumber,
		memberSince,
		houseImage,
		height,
		width,
		showSparkles,
		hover,
		animated,
		activeRotation,
		activeBackgroundPosition,
		cardRef,
		onMouseMove,
		onTouchMove,
		onMouseOut,
		children,
	} = props;
	if (forceSide) {
		return (
			<div className="relative h-full w-full" style={clipStyle}>
				<StampBorder />
				<CardOverlay overlayColor={overlayColor} overlayOpacity={overlayOpacity} />
				<div className={CARD_CLASSES.CONTENT_WRAPPER_BACK}>
					<div className="flex min-h-0 w-full flex-1 flex-col gap-4">
						<BackCardContent
							name={name}
							personalityPhrase={personalityPhrase}
							userBio={userBio}
							accountNumber={accountNumber}
							memberSince={memberSince}
							isStatic
						/>
					</div>
					<BackCardFooter
						accountNumber={accountNumber}
						memberSince={memberSince}
						isStatic
					/>
				</div>
				<StyledHoloCard
					$url={houseImage}
					ref={cardRef}
					$active={false}
					$animated={false}
					$activeRotation={activeRotation}
					$activeBackgroundPosition={activeBackgroundPosition}
					$height={height}
					$width={width}
					$showSparkles={showSparkles}
				>
					{children}
				</StyledHoloCard>
			</div>
		);
	}
	return (
		<Tilt className="relative h-full w-full p-0!" style={clipStyle}>
			<StampBorder />
			<CardOverlay overlayColor={overlayColor} overlayOpacity={overlayOpacity} />
			<div className={CARD_CLASSES.CONTENT_WRAPPER_BACK}>
				<div className="flex min-h-0 w-full flex-1 flex-col gap-4">
					<BackCardContent
						name={name}
						personalityPhrase={personalityPhrase}
						userBio={userBio}
						accountNumber={accountNumber}
						memberSince={memberSince}
					/>
				</div>
				<BackCardFooter accountNumber={accountNumber} memberSince={memberSince} />
			</div>
			<StyledHoloCard
				$url={houseImage}
				ref={cardRef}
				$active={hover}
				$animated={animated}
				$activeRotation={activeRotation}
				$activeBackgroundPosition={activeBackgroundPosition}
				onMouseMove={onMouseMove}
				onTouchMove={onTouchMove}
				onMouseOut={onMouseOut}
				$height={height}
				$width={width}
				$showSparkles={showSparkles}
			>
				{children}
			</StyledHoloCard>
		</Tilt>
	);
}

export const HoloCard = ({
	data,
	height = 446,
	width = 320,
	showSparkles = true,
	forceSide,
	children,
}: HoloCardProps & { forceSide?: 'front' | 'back' }) => {
	const [hover, setHover] = useState(false);
	const [animated, setAnimated] = useState(true);
	const [isFlipped, setIsFlipped] = useState(false);
	const [activeBackgroundPosition, setActiveBackgroundPosition] = useState({
		tp: 0,
		lp: 0,
	});
	const [activeRotation, setActiveRotation] = useState({
		y: 0,
		x: 0,
	});
	const ref = useRef<HTMLInputElement>(null);

	const {
		house,
		name,
		personality_phrase,
		user_bio,
		account_number,
		member_since,
		overlay_color,
		overlay_opacity = 40,
	} = data;

	const houseImage = getHouseImage(house);

	const handleCardClick = () => {
		if (!forceSide) {
			setIsFlipped((prev) => !prev);
		}
	};

	const handleOnMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
		setAnimated(false);
		setHover(true);

		const card = ref.current;
		if (!card) return;

		const offsetX = event.nativeEvent.offsetX;
		const offsetY = event.nativeEvent.offsetY;
		const { clientWidth, clientHeight } = card;

		const position = calculateBackgroundPosition(offsetX, offsetY, clientWidth, clientHeight);
		setActiveBackgroundPosition(position);
	};

	const handleOnTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
		setAnimated(false);
		setHover(true);

		const card = ref.current;
		if (!card) return;

		const touch = event.touches[0];
		const rect = card.getBoundingClientRect();
		const offsetX = touch.clientX - rect.left;
		const offsetY = touch.clientY - rect.top;
		const { clientWidth, clientHeight } = card;

		const position = calculateBackgroundPosition(offsetX, offsetY, clientWidth, clientHeight);
		setActiveBackgroundPosition(position);
	};

	const handleOnMouseOut = () => {
		setHover(false);
		setAnimated(true);
		setActiveRotation({ x: 0, y: 0 });
	};

	const effectiveFlipped = forceSide ? forceSide === 'back' : isFlipped;

	const containerStyle = getContainerStyle(forceSide);
	const innerStyle = getInnerStyle(forceSide, effectiveFlipped, height, width);
	const frontStyle = getFrontStyle(forceSide);
	const backStyle = getBackStyle(forceSide);

	// Stamp die-cut clip-path. The source path is landscape 1877.8125×1409.0625;
	// we rotate it 90° CW and stretch into the card's portrait W×H inside the
	// <clipPath> transform so the same path data works at any card size. The
	// clipPath ID is unique per HoloCard instance so multiple cards on the same
	// page don't collide. Clip-path is applied in local coords before the
	// element's CSS transform, so the silhouette tilts and flips with the card.
	const clipId = useId();
	const clipUrl = `url(#${clipId})`;
	const clipTransform = `scale(${width / STAMP_NATURAL_HEIGHT} ${height / STAMP_NATURAL_WIDTH}) translate(${STAMP_NATURAL_HEIGHT} 0) rotate(90)`;
	const clipStyle = {
		clipPath: clipUrl,
		WebkitClipPath: clipUrl,
	};

	const faceProps = {
		forceSide,
		clipStyle,
		overlayColor: overlay_color,
		overlayOpacity: overlay_opacity,
		name,
		personalityPhrase: personality_phrase,
		accountNumber: account_number,
		memberSince: member_since,
		houseImage,
		height,
		width,
		showSparkles,
		hover,
		animated,
		activeRotation,
		activeBackgroundPosition,
		cardRef: ref,
		onMouseMove: handleOnMouseMove,
		onTouchMove: handleOnTouchMove,
		onMouseOut: handleOnMouseOut,
		children,
	};

	const cardInner = (
		<>
			<StampClipDef clipId={clipId} clipTransform={clipTransform} />
			<div
				className={forceSide ? 'relative' : 'relative transition-transform duration-700'}
				style={innerStyle}
			>
				<div style={frontStyle}>
					<HoloFrontFace {...faceProps} />
				</div>
				<div style={backStyle}>
					<HoloBackFace {...faceProps} userBio={user_bio} />
				</div>
			</div>
		</>
	);

	// Static export mode renders a plain wrapper (no interaction).
	if (forceSide) {
		return (
			<div className="" style={containerStyle}>
				{cardInner}
			</div>
		);
	}

	// Interactive mode uses a native button so keyboard users get Enter/Space
	// activation and screen readers get the button role for free.
	return (
		<button
			type="button"
			onClick={handleCardClick}
			aria-pressed={effectiveFlipped}
			aria-label={`Flip card for ${name}`}
			className="perspective-1000 block cursor-pointer border-0 bg-transparent p-0 text-left"
			style={containerStyle}
		>
			{cardInner}
		</button>
	);
};
