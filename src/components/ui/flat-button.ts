// Flat controls: a solid muted surface at rest so they read as buttons, darker on hover.
export const flatSurface =
	'cursor-pointer rounded-xl bg-[var(--muted-bg)] transition-colors hover:bg-[var(--muted-bg-strong)]';

export const flatIconButton = `${flatSurface} flex size-9 shrink-0 items-center justify-center text-[var(--foreground)]`;
