// Custom Apple-style HTML5 video player with a FLIP "expand to lightbox"
// transition that matches the shared image lightbox (src/lib/flip-lightbox).
//
// Each `[data-demo-video]` on the page is upgraded with: a center play affordance,
// a frosted control bar (play/pause, a scrub slider, a mute toggle + volume
// slider, an expand button), and click-to-expand on the video surface — so a clip
// zooms open into a centred, blurred overlay exactly like the photos do, and the
// SAME <video> node is reparented into the overlay so playback never resets.

import { animate } from 'motion';

const EASE = [0.32, 0.72, 0, 1] as const; // smooth ease-out, no snap — matches flip-lightbox
const OPEN_DUR = 0.45;
const CLOSE_DUR = 0.4;

const reduceMotion = () =>
	typeof window !== 'undefined' &&
	window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function clamp01(n: number) {
	return Math.max(0, Math.min(1, n));
}

// ---- Singleton overlay (shared by every player; one expand at a time) --------

interface Overlay {
	root: HTMLElement;
	backdrop: HTMLElement;
	close: HTMLButtonElement;
}

let overlay: Overlay | null = null;
let expanded: DemoVideo | null = null;
let keyBound = false;

const OVERLAY_CSS = `
#dv-overlay {
	display: none;
	position: fixed;
	inset: 0;
	z-index: 9999;
	align-items: center;
	justify-content: center;
}
#dv-backdrop {
	position: absolute;
	inset: 0;
	opacity: 0;
	background: rgba(0, 0, 0, 0.55);
	backdrop-filter: blur(16px) brightness(0.7);
	-webkit-backdrop-filter: blur(16px) brightness(0.7);
	cursor: zoom-out;
}
#dv-close {
	position: absolute;
	top: 20px;
	right: 20px;
	z-index: 3;
	width: 36px;
	height: 36px;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.1);
	border: none;
	cursor: pointer;
	color: #fff;
	display: flex;
	align-items: center;
	justify-content: center;
	opacity: 0;
	transition: background 150ms ease, opacity 0.25s ease;
}
#dv-overlay.dv-on #dv-close { opacity: 1; }
#dv-close::before, #dv-close::after {
	content: '';
	position: absolute;
	width: 14px;
	height: 1.5px;
	background: currentColor;
	border-radius: 2px;
}
#dv-close::before { transform: rotate(45deg); }
#dv-close::after { transform: rotate(-45deg); }
#dv-close:hover { background: rgba(255, 255, 255, 0.2); }
`;

function injectOverlayCss() {
	if (document.getElementById('dv-overlay-style')) return;
	const el = document.createElement('style');
	el.id = 'dv-overlay-style';
	el.textContent = OVERLAY_CSS;
	document.head.appendChild(el);
}

function getOverlay(): Overlay {
	injectOverlayCss();
	if (overlay && document.body.contains(overlay.root)) return overlay;
	let root = document.getElementById('dv-overlay');
	if (!root) {
		root = document.createElement('div');
		root.id = 'dv-overlay';
		root.innerHTML = `
			<div id="dv-backdrop"></div>
			<button id="dv-close" type="button" aria-label="Close"></button>
		`;
		document.body.appendChild(root);
	}
	overlay = {
		root,
		backdrop: root.querySelector('#dv-backdrop') as HTMLElement,
		close: root.querySelector('#dv-close') as HTMLButtonElement,
	};
	overlay.backdrop.addEventListener('click', () => expanded?.collapse());
	overlay.close.addEventListener('click', () => expanded?.collapse());

	if (!keyBound) {
		keyBound = true;
		window.addEventListener('keydown', (e) => {
			if (!expanded) return;
			switch (e.key) {
				case 'Escape':
					expanded.collapse();
					break;
				case ' ':
				case 'k':
					e.preventDefault();
					expanded.toggle();
					break;
				case 'ArrowLeft':
					e.preventDefault();
					expanded.seekBy(-5);
					break;
				case 'ArrowRight':
					e.preventDefault();
					expanded.seekBy(5);
					break;
				case 'm':
					expanded.toggleMute();
					break;
			}
		});
		window.addEventListener(
			'resize',
			() => {
				if (expanded) expanded.layoutExpanded();
			},
			{ passive: true },
		);
	}
	return overlay;
}

function lockScroll(on: boolean) {
	document.documentElement.style.overflow = on ? 'hidden' : '';
	document.body.style.overflow = on ? 'hidden' : '';
}

// ---- Per-player controller ---------------------------------------------------

class DemoVideo {
	root: HTMLElement;
	stage: HTMLElement;
	video: HTMLVideoElement;
	bigplay: HTMLButtonElement;
	playpause: HTMLButtonElement;
	scrubber: HTMLElement;
	progress: HTMLElement;
	buffered: HTMLElement;
	mute: HTMLButtonElement;
	volSlider: HTMLElement;
	volFill: HTMLElement;

	isExpanded = false;
	scrubbing = false;
	hideTimer = 0;
	rafId = 0;
	// Saved layout for the FLIP return + reparent.
	placeholderH = 0;
	prevVolume = 1;

	constructor(root: HTMLElement) {
		this.root = root;
		const q = <T extends HTMLElement>(sel: string) => root.querySelector(sel) as T;
		this.stage = q('[data-dv-stage]');
		this.video = q<HTMLVideoElement>('[data-dv-video]');
		this.bigplay = q<HTMLButtonElement>('[data-dv-bigplay]');
		this.playpause = q<HTMLButtonElement>('[data-dv-playpause]');
		this.scrubber = q('[data-dv-scrubber]');
		this.progress = q('[data-dv-progress]');
		this.buffered = q('[data-dv-buffered]');
		this.mute = q<HTMLButtonElement>('[data-dv-mute]');
		this.volSlider = q('[data-dv-vol]');
		this.volFill = q('[data-dv-vol-fill]');

		this.bind();
		this.reflectVolume();
		this.setVolumeUI(this.video.muted ? 0 : this.video.volume);
		if (this.video.readyState >= 1) this.onMeta();
	}

	private bind() {
		const v = this.video;

		// Play affordances.
		this.bigplay.addEventListener('click', (e) => {
			e.stopPropagation();
			this.play();
		});
		this.playpause.addEventListener('click', (e) => {
			e.stopPropagation();
			this.toggle();
		});

		// Click the video surface: expand inline, toggle play once expanded —
		// ignoring clicks that land on the controls or the center play button.
		this.stage.addEventListener('click', (e) => {
			const t = e.target as HTMLElement;
			if (t.closest('[data-dv-controls]') || t.closest('[data-dv-bigplay]')) return;
			// Surface click toggles fullscreen: expand inline, collapse when open.
			if (this.isExpanded) this.collapse();
			else this.expand();
		});

		v.addEventListener('play', () => this.reflectState());
		v.addEventListener('pause', () => this.reflectState());
		v.addEventListener('ended', () => this.reflectState());
		v.addEventListener('loadedmetadata', () => this.onMeta());
		v.addEventListener('timeupdate', () => this.tick());
		v.addEventListener('progress', () => this.renderBuffered());
		v.addEventListener('volumechange', () => {
			this.reflectVolume();
			this.setVolumeUI(v.muted ? 0 : v.volume);
		});

		this.mute.addEventListener('click', (e) => {
			e.stopPropagation();
			this.toggleMute();
		});

		this.bindScrubber();
		this.bindVolume();

		// Keep controls alive while the pointer moves over an expanded player.
		this.stage.addEventListener('mousemove', () => {
			if (this.isExpanded) this.showControls();
		});
	}

	// ---- play state ----

	play() {
		this.video.play().catch(() => {});
	}
	pause() {
		this.video.pause();
	}
	toggle() {
		if (this.video.paused) this.play();
		else this.pause();
	}
	seekBy(sec: number) {
		const d = this.video.duration || 0;
		this.video.currentTime = Math.max(0, Math.min(d, this.video.currentTime + sec));
		this.tick();
	}

	private reflectState() {
		const playing = !this.video.paused && !this.video.ended;
		this.stage.dataset.state = playing ? 'playing' : 'paused';
		const label = playing ? 'Pause' : 'Play';
		this.playpause.setAttribute('aria-label', label);
		if (playing) {
			this.startRaf();
			if (this.isExpanded) this.scheduleHide();
		} else {
			this.stopRaf();
			this.showControls();
		}
	}

	// ---- mute / volume ----

	toggleMute() {
		const v = this.video;
		if (v.muted || v.volume === 0) {
			v.muted = false;
			if (v.volume === 0) v.volume = this.prevVolume || 1;
		} else {
			this.prevVolume = v.volume;
			v.muted = true;
		}
	}

	private reflectVolume() {
		const v = this.video;
		let level: 'high' | 'low' | 'mute';
		if (v.muted || v.volume === 0) level = 'mute';
		else if (v.volume <= 0.5) level = 'low';
		else level = 'high';
		this.stage.dataset.vol = level;
		this.mute.setAttribute('aria-label', level === 'mute' ? 'Unmute' : 'Mute');
	}

	private setVolumeUI(vol: number) {
		this.volFill.style.height = `${clamp01(vol) * 100}%`;
	}

	// ---- metadata / progress ----

	private onMeta() {
		this.renderBuffered();
		this.tick();
	}

	private startRaf() {
		if (this.rafId) return;
		const loop = () => {
			this.renderProgress();
			this.rafId = requestAnimationFrame(loop);
		};
		this.rafId = requestAnimationFrame(loop);
	}
	private stopRaf() {
		if (this.rafId) cancelAnimationFrame(this.rafId);
		this.rafId = 0;
	}

	private tick() {
		if (!this.rafId) this.renderProgress();
	}

	private renderProgress() {
		const d = this.video.duration || 0;
		const ratio = d ? this.video.currentTime / d : 0;
		this.progress.style.width = `${ratio * 100}%`;
	}

	private renderBuffered() {
		const d = this.video.duration || 0;
		if (!d || !this.video.buffered.length) return;
		const end = this.video.buffered.end(this.video.buffered.length - 1);
		this.buffered.style.width = `${clamp01(end / d) * 100}%`;
	}

	// ---- scrubbing ----

	private seekToClientX(clientX: number) {
		const r = this.scrubber.getBoundingClientRect();
		const ratio = clamp01((clientX - r.left) / r.width);
		const d = this.video.duration || 0;
		if (d) {
			this.video.currentTime = ratio * d;
			this.progress.style.width = `${ratio * 100}%`;
		}
	}

	private bindScrubber() {
		const s = this.scrubber;
		s.addEventListener('pointerdown', (e) => {
			e.preventDefault();
			this.scrubbing = true;
			s.classList.add('dv-scrubbing');
			s.setPointerCapture(e.pointerId);
			this.seekToClientX(e.clientX);
		});
		s.addEventListener('pointermove', (e) => {
			if (this.scrubbing) this.seekToClientX(e.clientX);
		});
		const end = (e: PointerEvent) => {
			if (!this.scrubbing) return;
			this.scrubbing = false;
			s.classList.remove('dv-scrubbing');
			try {
				s.releasePointerCapture(e.pointerId);
			} catch {}
		};
		s.addEventListener('pointerup', end);
		s.addEventListener('pointercancel', end);
		s.addEventListener('keydown', (e) => {
			if (e.key === 'ArrowLeft') {
				e.preventDefault();
				this.seekBy(-5);
			} else if (e.key === 'ArrowRight') {
				e.preventDefault();
				this.seekBy(5);
			}
		});
	}

	private setVolumeFromClientY(clientY: number) {
		const r = this.volSlider.getBoundingClientRect();
		// Top of the track = full volume, bottom = muted.
		const vol = clamp01(1 - (clientY - r.top) / r.height);
		this.video.muted = vol === 0;
		this.video.volume = vol;
		if (vol > 0) this.prevVolume = vol;
		this.setVolumeUI(vol);
	}

	private bindVolume() {
		const s = this.volSlider;
		let dragging = false;
		s.addEventListener('pointerdown', (e) => {
			e.preventDefault();
			e.stopPropagation();
			dragging = true;
			s.setPointerCapture(e.pointerId);
			this.setVolumeFromClientY(e.clientY);
		});
		s.addEventListener('pointermove', (e) => {
			if (dragging) this.setVolumeFromClientY(e.clientY);
		});
		const end = (e: PointerEvent) => {
			dragging = false;
			try {
				s.releasePointerCapture(e.pointerId);
			} catch {}
		};
		s.addEventListener('pointerup', end);
		s.addEventListener('pointercancel', end);
	}

	// ---- controls visibility (expanded auto-hide) ----

	private showControls() {
		this.stage.classList.add('dv-show');
		window.clearTimeout(this.hideTimer);
		if (this.isExpanded && !this.video.paused) this.scheduleHide();
	}
	private scheduleHide() {
		window.clearTimeout(this.hideTimer);
		this.hideTimer = window.setTimeout(() => {
			if (!this.video.paused) this.stage.classList.remove('dv-show');
		}, 2600);
	}

	// ---- FLIP expand / collapse ----

	private targetBox() {
		const vw = window.innerWidth;
		const vh = window.innerHeight;
		const nw = this.video.videoWidth || this.stage.offsetWidth || 16;
		const nh = this.video.videoHeight || this.stage.offsetHeight || 9;
		const aspect = nw / nh || 16 / 9;
		const maxW = vw * 0.94;
		const maxH = vh * 0.9;
		let tw = Math.min(nw > maxW ? maxW : Math.max(nw, maxW * 0.5), maxW);
		let th = tw / aspect;
		if (th > maxH) {
			th = maxH;
			tw = th * aspect;
		}
		return { tw, th, tl: (vw - tw) / 2, tt: (vh - th) / 2 };
	}

	private placeStage(box: { tl: number; tt: number; tw: number; th: number }) {
		const s = this.stage.style;
		s.left = `${box.tl}px`;
		s.top = `${box.tt}px`;
		s.width = `${box.tw}px`;
		s.height = `${box.th}px`;
	}

	// Recompute the resting expanded box (used on resize while open).
	layoutExpanded() {
		if (!this.isExpanded) return;
		const box = this.targetBox();
		this.stage.style.transform = 'none';
		this.placeStage(box);
	}

	expand() {
		if (this.isExpanded || expanded) return;
		const o = getOverlay();
		expanded = this;
		this.isExpanded = true;

		// FIRST: where the stage sits in the article right now.
		const first = this.stage.getBoundingClientRect();
		// Reserve the vacated space so the article doesn't jump while it's lifted.
		this.placeholderH = first.height;
		this.root.style.height = `${first.height}px`;

		// Reparent the live <video> (keeps currentTime + playback intact).
		const t = this.video.currentTime;
		const wasPlaying = !this.video.paused;
		o.root.appendChild(this.stage);
		this.stage.classList.add('dv-expanded', 'dv-show');
		this.stage.style.position = 'fixed';
		this.stage.style.zIndex = '2';
		this.video.currentTime = t;
		if (wasPlaying) this.play();

		// LAST + INVERT: lay it in the centred box, then map back onto FIRST.
		const box = this.targetBox();
		this.placeStage(box);
		this.stage.style.transformOrigin = 'top left';
		const scale = first.width / box.tw;
		const tx = first.left - box.tl;
		const ty = first.top - box.tt;
		this.stage.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;

		o.root.style.display = 'flex';
		o.root.classList.add('dv-on');
		lockScroll(true);

		// PLAY: invert → identity with the blurred backdrop fading in behind.
		if (reduceMotion()) {
			this.stage.style.transform = 'none';
			o.backdrop.style.opacity = '1';
		} else {
			animate(o.backdrop, { opacity: 1 }, { duration: OPEN_DUR, ease: 'linear' });
			animate(
				this.stage,
				{ x: [tx, 0], y: [ty, 0], scale: [scale, 1] },
				{ duration: OPEN_DUR, ease: EASE },
			);
		}
		this.showControls();
	}

	collapse() {
		if (!this.isExpanded) return;
		const o = getOverlay();
		this.isExpanded = false;
		o.root.classList.remove('dv-on');

		// Fly back onto the reserved slot in the article.
		const back = this.root.getBoundingClientRect();
		const inView = back.bottom > 0 && back.top < window.innerHeight && back.width > 0;

		const finish = () => {
			// Drop the fixed-position styling and re-home the node in the article.
			const s = this.stage.style;
			s.position = '';
			s.left = s.top = s.width = s.height = '';
			s.transform = s.transformOrigin = '';
			s.zIndex = '';
			this.stage.classList.remove('dv-expanded');
			this.root.appendChild(this.stage);
			this.root.style.height = '';
			o.root.style.display = 'none';
			lockScroll(false);
			if (expanded === this) expanded = null;
		};

		if (reduceMotion()) {
			o.backdrop.style.opacity = '0';
			finish();
			return;
		}

		animate(o.backdrop, { opacity: 0 }, { duration: CLOSE_DUR, ease: 'linear' });

		if (inView) {
			const curLeft = parseFloat(this.stage.style.left);
			const curTop = parseFloat(this.stage.style.top);
			const curW = parseFloat(this.stage.style.width);
			const scale = back.width / curW;
			const tx = back.left - curLeft;
			const ty = back.top - curTop;
			animate(this.stage, { x: tx, y: ty, scale }, { duration: CLOSE_DUR, ease: EASE })
				.finished.then(finish)
				.catch(finish);
		} else {
			// Reserved slot scrolled away — fade out rather than fly off-screen.
			animate(this.stage, { opacity: 0 }, { duration: CLOSE_DUR, ease: 'linear' })
				.finished.then(() => {
					this.stage.style.opacity = '';
					finish();
				})
				.catch(finish);
		}
	}
}

/**
 * Upgrade every `[data-demo-video]` on the page. Idempotent — safe to call on the
 * initial load and after each Astro view transition.
 */
export function initDemoVideos() {
	document.querySelectorAll<HTMLElement>('[data-demo-video]').forEach((el) => {
		if (el.dataset.dvInit) return;
		el.dataset.dvInit = '1';
		new DemoVideo(el);
	});
}
