import type { StampForm } from '../types';

export interface FormBox {
	width: number;
	height: number;
	aspect: number;
}

const box = (width: number, height: number): FormBox => ({
	width,
	height,
	aspect: height / width,
});

export const FORM_BOX: Record<StampForm, FormBox> = {
	arrival: box(240, 150),
	oval: box(240, 160),
	round: box(160, 160),
	date: box(240, 100),
	permit: box(240, 140),
	transit: box(240, 120),
};

export const FORM_WIDTH: Record<StampForm, number> = {
	arrival: 42,
	oval: 35,
	round: 27,
	date: 31,
	permit: 39,
	transit: 34,
};
