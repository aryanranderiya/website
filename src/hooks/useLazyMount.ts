import { useEffect, useRef, useState } from 'react';

export function useLazyMount(rootMargin = '300px') {
	const ref = useRef<HTMLDivElement>(null);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el || mounted) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setMounted(true);
					observer.disconnect();
				}
			},
			{ rootMargin }
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [mounted, rootMargin]);

	return { ref, mounted };
}
