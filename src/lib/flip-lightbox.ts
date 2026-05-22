// One reusable FLIP (First-Last-Invert-Play) image lightbox shared by every
// surface on the site: the Astro pages (blog, camera, project galleries) via
// `bindSelector`, and the React design gallery via `openGroup`. There is a
// single overlay on <body> and a single code path for the open/close zoom, so
// the "image grows from its on-page spot into the lightbox" transition is
// identical everywhere.
//
// Clicking a thumbnail animates the SAME (already-decoded) image from its grid
// position into a centred lightbox and back on close — reusing the thumbnail's
// `currentSrc` (already in the browser cache) so there is no re-fetch flash.

import { animate } from 'motion';

const EASE = [0.32, 0.72, 0, 1] as const; // smooth ease-out, no snap
const OPEN_DUR = 0.45;
const CLOSE_DUR = 0.4;

interface LbState {
	overlay: HTMLElement | null;
	img: HTMLImageElement | null;
	backdrop: HTMLElement | null;
	counter: HTMLElement | null;
	prev: HTMLButtonElement | null;
	next: HTMLButtonElement | null;
	close: HTMLButtonElement | null;
	group: HTMLElement[];
	index: number;
	isOpen: boolean;
	activeThumb: HTMLElement | null;
	keyBound: boolean;
}

// A "thumb" is either an <img> (Astro pages bind selectors of images) or a
// wrapper element whose box is the visible thumbnail (the design gallery passes
// its clipped wrappers so a hover-scaled inner image doesn't skew the FLIP).
// Either way we need the real <img> inside it for the cached source + aspect.
function sourceImg(el: HTMLElement): HTMLImageElement | null {
	if (el instanceof HTMLImageElement) return el;
	return (
		el.querySelector<HTMLImageElement>('img:not([aria-hidden="true"])') ||
		el.querySelector<HTMLImageElement>('img')
	);
}

// Match the lightbox image's corner radius to the card it opened from — the
// larger of the thumbnail's own radius and its wrapper's (e.g. a project hero
// is an <img> with radius 0 inside a `rounded-2xl` card; we want the card's).
function sourceRadius(thumb: HTMLElement): number {
	let max = 0;
	let el: HTMLElement | null = thumb;
	for (let i = 0; i < 2 && el; i++) {
		const r = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
		if (r > max) max = r;
		el = el.parentElement;
	}
	return Math.min(max, 40) || 12;
}

// State lives on window so duplicate module copies (one bundled into the Astro
// script graph, one into the React island graph) still share a single overlay.
function S(): LbState {
	const w = window as unknown as { __flipLb?: LbState };
	if (!w.__flipLb) {
		w.__flipLb = {
			overlay: null,
			img: null,
			backdrop: null,
			counter: null,
			prev: null,
			next: null,
			close: null,
			group: [],
			index: 0,
			isOpen: false,
			activeThumb: null,
			keyBound: false,
		};
	}
	return w.__flipLb;
}

const CSS = `
#lb-overlay {
	display: none;
	position: fixed;
	inset: 0;
	z-index: 9999;
	align-items: center;
	justify-content: center;
}
#lb-backdrop {
	position: absolute;
	inset: 0;
	opacity: 0;
	background: rgba(0, 0, 0, 0.55);
	backdrop-filter: blur(16px) brightness(0.7);
	-webkit-backdrop-filter: blur(16px) brightness(0.7);
	cursor: zoom-out;
}
/* The single animated image. Position + size are driven inline (px); the FLIP
   runs on transform only, so it stays buttery on the compositor. max-height
   leaves a gap at the bottom so the counter chip never overlaps the image. */
#lb-img {
	position: fixed;
	z-index: 1;
	max-width: none;
	max-height: 86vh;
	border-radius: 12px;
	object-fit: contain;
	cursor: zoom-out;
	user-select: none;
	-webkit-user-select: none;
	will-change: transform, opacity;
}
#lb-close, #lb-prev, #lb-next, #lb-counter {
	opacity: 0;
	transition: opacity 0.25s ease;
}
#lb-overlay.lb-on #lb-close,
#lb-overlay.lb-on #lb-prev,
#lb-overlay.lb-on #lb-next,
#lb-overlay.lb-on #lb-counter {
	opacity: 1;
}
#lb-close, #lb-prev, #lb-next {
	position: absolute;
	z-index: 2;
	background: rgba(255, 255, 255, 0.1);
	border: none;
	cursor: pointer;
	color: #fff;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: background 150ms ease, opacity 0.25s ease;
}
#lb-close {
	top: 20px;
	right: 20px;
	width: 36px;
	height: 36px;
	border-radius: 50%;
}
#lb-close::before, #lb-close::after {
	content: '';
	position: absolute;
	width: 14px;
	height: 1.5px;
	background: currentColor;
	border-radius: 2px;
}
#lb-close::before { transform: rotate(45deg); }
#lb-close::after { transform: rotate(-45deg); }
#lb-prev, #lb-next {
	top: 50%;
	transform: translateY(-50%);
	width: 40px;
	height: 40px;
	border-radius: 50%;
}
#lb-prev { left: 20px; }
#lb-next { right: 20px; }
#lb-prev::after, #lb-next::after {
	content: '';
	width: 8px;
	height: 8px;
	border-top: 1.5px solid currentColor;
	border-right: 1.5px solid currentColor;
	display: block;
}
#lb-prev::after { transform: rotate(-135deg) translateX(-1px); }
#lb-next::after { transform: rotate(45deg) translateX(-1px); }
#lb-close:hover, #lb-prev:hover, #lb-next:hover { background: rgba(255, 255, 255, 0.2); }
#lb-prev[hidden], #lb-next[hidden] { display: none; }
/* Counter rendered as a frosted chip, parked in the bottom gap. */
#lb-counter {
	position: absolute;
	bottom: 18px;
	left: 50%;
	transform: translateX(-50%);
	z-index: 2;
	font-size: 12px;
	color: rgba(255, 255, 255, 0.85);
	background: rgba(0, 0, 0, 0.45);
	-webkit-backdrop-filter: blur(10px);
	backdrop-filter: blur(10px);
	padding: 6px 13px;
	border-radius: 999px;
	letter-spacing: 0.04em;
	font-variant-numeric: tabular-nums;
	pointer-events: none;
}
#lb-counter:empty { display: none; }
@media (prefers-reduced-motion: reduce) {
	#lb-img { will-change: auto; }
}
`;

function injectCss() {
	if (document.getElementById('flip-lb-style')) return;
	const el = document.createElement('style');
	el.id = 'flip-lb-style';
	el.textContent = CSS;
	document.head.appendChild(el);
}

function build() {
	const s = S();
	let overlay = document.getElementById('lb-overlay');
	if (!overlay) {
		overlay = document.createElement('div');
		overlay.id = 'lb-overlay';
		overlay.innerHTML = `
			<div id="lb-backdrop"></div>
			<button id="lb-close" type="button" aria-label="Close"></button>
			<button id="lb-prev" type="button" aria-label="Previous"></button>
			<button id="lb-next" type="button" aria-label="Next"></button>
			<img id="lb-img" src="" alt="" draggable="false" />
			<div id="lb-counter"></div>
		`;
		document.body.appendChild(overlay);
		overlay.querySelector('#lb-close')?.addEventListener('click', close);
		overlay.querySelector('#lb-backdrop')?.addEventListener('click', close);
		overlay.querySelector('#lb-img')?.addEventListener('click', close);
		overlay.querySelector('#lb-prev')?.addEventListener('click', (e) => {
			e.stopPropagation();
			navigate(-1);
		});
		overlay.querySelector('#lb-next')?.addEventListener('click', (e) => {
			e.stopPropagation();
			navigate(1);
		});
	}
	s.overlay = overlay;
	s.img = overlay.querySelector('#lb-img');
	s.backdrop = overlay.querySelector('#lb-backdrop');
	s.counter = overlay.querySelector('#lb-counter');
	s.prev = overlay.querySelector('#lb-prev');
	s.next = overlay.querySelector('#lb-next');
	s.close = overlay.querySelector('#lb-close');

	if (!s.keyBound) {
		s.keyBound = true;
		window.addEventListener('keydown', (e) => {
			if (!S().isOpen) return;
			if (e.key === 'Escape') close();
			else if (e.key === 'ArrowLeft') navigate(-1);
			else if (e.key === 'ArrowRight') navigate(1);
		});
	}
}

// The fitted, centred box this image should occupy when fully open.
function targetBox(thumb: HTMLElement) {
	const vw = window.innerWidth;
	const vh = window.innerHeight;
	const r = thumb.getBoundingClientRect();
	const si = sourceImg(thumb);
	const nw = si?.naturalWidth || r.width;
	const nh = si?.naturalHeight || r.height;
	const aspect = nw / nh || 1;
	const maxW = vw * 0.94;
	const maxH = vh * 0.86; // leave room for the counter chip
	let tw = Math.min(nw, maxW);
	let th = tw / aspect;
	if (th > maxH) {
		th = maxH;
		tw = th * aspect;
	}
	return { tw, th, tl: (vw - tw) / 2, tt: (vh - th) / 2 };
}

function placeImg(box: { tl: number; tt: number; tw: number; th: number }) {
	const img = S().img;
	if (!img) return;
	img.style.left = `${box.tl}px`;
	img.style.top = `${box.tt}px`;
	img.style.width = `${box.tw}px`;
	img.style.height = `${box.th}px`;
}

function updateChrome() {
	const s = S();
	const multi = s.group.length > 1;
	if (s.counter) s.counter.textContent = multi ? `${s.index + 1} / ${s.group.length}` : '';
	if (s.prev) s.prev.hidden = !multi;
	if (s.next) s.next.hidden = !multi;
}

function lockScroll(on: boolean) {
	document.documentElement.style.overflow = on ? 'hidden' : '';
	document.body.style.overflow = on ? 'hidden' : '';
}

// The page's progressive bottom blur is a stack of backdrop-filter layers.
// Chromium does not recomposite a backdrop-filter smoothly when the
// backdrop-filter overlay above it is torn down, so on close it snaps into
// view. Drive its opacity directly: fade it out as the lightbox opens, fade it
// back in over the clean page once the overlay is gone — a transition, not a pop.
function fadeBlurStack(visible: boolean, dur: number) {
	const bs = document.getElementById('blur-stack');
	if (!bs) return;
	bs.style.transition = `opacity ${dur}s ease`;
	bs.style.opacity = visible ? '1' : '0';
}

function openAt(i: number) {
	const s = S();
	if (!s.group.length || !s.img || !s.overlay || !s.backdrop) return;
	s.index = (i + s.group.length) % s.group.length;
	const thumb = s.group[s.index];
	s.activeThumb = thumb;

	// FIRST: where the image lives on the page right now.
	const r = thumb.getBoundingClientRect();
	// LAST: where it lands when fully open.
	const box = targetBox(thumb);

	placeImg(box);
	s.img.style.transformOrigin = 'top left';
	// Reuse the exact source the browser already shows → cache hit, no fetch.
	const si = sourceImg(thumb);
	s.img.src = si?.currentSrc || si?.src || '';
	s.img.alt = si?.alt || '';
	s.img.style.opacity = '1';
	// Adopt the source card's corner radius so the open lightbox matches it.
	s.img.style.borderRadius = `${sourceRadius(thumb)}px`;

	// INVERT: transform that maps the LAST box back onto the FIRST rect.
	const scale = r.width / box.tw;
	const tx = r.left - box.tl;
	const ty = r.top - box.tt;
	// Commit the start frame inline so there is no centred flash before motion's
	// first animation tick.
	s.img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;

	s.overlay.style.display = 'flex';
	s.overlay.classList.add('lb-on');

	thumb.style.visibility = 'hidden';
	lockScroll(true);
	fadeBlurStack(false, OPEN_DUR);
	s.isOpen = true;
	updateChrome();

	// PLAY: invert → identity, blur fades in behind it.
	animate(s.backdrop, { opacity: 1 }, { duration: OPEN_DUR, ease: 'linear' });
	animate(
		s.img,
		{ x: [tx, 0], y: [ty, 0], scale: [scale, 1] },
		{ duration: OPEN_DUR, ease: EASE },
	);
}

function close() {
	const s = S();
	if (!s.isOpen || !s.img || !s.overlay || !s.backdrop) return;
	s.isOpen = false;
	s.overlay.classList.remove('lb-on');

	const img = s.img;
	const overlay = s.overlay;
	const thumb = s.activeThumb;
	const r = thumb ? thumb.getBoundingClientRect() : null;
	const inView = !!r && r.bottom > 0 && r.top < window.innerHeight && r.width > 0;

	const cleanup = () => {
		overlay.style.display = 'none';
		img.style.transform = '';
		img.style.opacity = '1';
		if (thumb) thumb.style.visibility = '';
		lockScroll(false);
		fadeBlurStack(true, 0.35);
	};

	animate(s.backdrop, { opacity: 0 }, { duration: CLOSE_DUR, ease: 'linear' });

	if (inView && r) {
		// Animate from wherever the image currently is (handles closing mid-open)
		// back onto the live thumbnail rect.
		const tl = parseFloat(img.style.left);
		const tt = parseFloat(img.style.top);
		const tw = parseFloat(img.style.width);
		const scale = r.width / tw;
		const tx = r.left - tl;
		const ty = r.top - tt;
		animate(img, { x: tx, y: ty, scale }, { duration: CLOSE_DUR, ease: EASE })
			.finished.then(cleanup)
			.catch(cleanup);
	} else {
		// Thumbnail scrolled out of view — fade out instead of flying off.
		animate(img, { opacity: 0 }, { duration: CLOSE_DUR, ease: 'linear' })
			.finished.then(cleanup)
			.catch(cleanup);
	}
}

function navigate(dir: number) {
	const s = S();
	if (!s.isOpen || s.group.length < 2 || !s.img) return;
	s.index = (s.index + dir + s.group.length) % s.group.length;
	if (s.activeThumb) s.activeThumb.style.visibility = '';
	const thumb = s.group[s.index];
	s.activeThumb = thumb;
	thumb.style.visibility = 'hidden';

	const img = s.img;
	const box = targetBox(thumb);
	const si = sourceImg(thumb);
	animate(img, { opacity: 0 }, { duration: 0.14, ease: 'linear' })
		.finished.then(() => {
			img.src = si?.currentSrc || si?.src || '';
			img.alt = si?.alt || '';
			img.style.transform = 'translate(0px, 0px) scale(1)';
			placeImg(box);
			animate(img, { opacity: 1 }, { duration: 0.22, ease: 'linear' });
		})
		.catch(() => {});
	updateChrome();
}

/**
 * Open the lightbox on a group of <img> elements (imperative — for React).
 * `elements` are the actual on-page images; `i` is the one that was clicked.
 */
export function openGroup(elements: HTMLElement[], i: number) {
	injectCss();
	build();
	S().group = elements;
	openAt(i);
}

/**
 * Bind every <img> matching `selector` so clicking it opens the lightbox with
 * the full matched set as the navigable group (declarative — for Astro pages).
 * Idempotent: safe to call on every `astro:page-load`.
 */
export function bindSelector(selector: string) {
	injectCss();
	const matches = () => Array.from(document.querySelectorAll<HTMLImageElement>(selector));
	matches().forEach((img) => {
		if (img.dataset.lbBound) return;
		img.dataset.lbBound = '1';
		img.style.cursor = 'zoom-in';
		img.addEventListener('click', (e) => {
			e.preventDefault();
			const list = matches();
			const idx = list.indexOf(img);
			openGroup(list, idx < 0 ? 0 : idx);
		});
	});
}
