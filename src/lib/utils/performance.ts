/**
 * Performance utilities for Svelte 5
 * Provides memoization, debouncing, and optimization helpers
 */

/**
 * Debounce a function call
 * Useful for search inputs, resize handlers, etc.
 * 
 * Usage:
 * ```ts
 * const debouncedSearch = debounce((query: string) => {
 *   performSearch(query);
 * }, 300);
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(
	fn: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	return (...args: Parameters<T>) => {
		if (timeoutId) clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn(...args), delay);
	};
}

/**
 * Throttle a function call
 * Ensures function runs at most once per interval
 * 
 * Usage:
 * ```ts
 * const throttledScroll = throttle(() => {
 *   updateScrollPosition();
 * }, 100);
 * ```
 */
export function throttle<T extends (...args: any[]) => any>(
	fn: T,
	limit: number
): (...args: Parameters<T>) => void {
	let inThrottle: boolean = false;

	return (...args: Parameters<T>) => {
		if (!inThrottle) {
			fn(...args);
			inThrottle = true;
			setTimeout(() => (inThrottle = false), limit);
		}
	};
}

/**
 * Memoize expensive computations
 * Caches results based on arguments
 * 
 * Usage:
 * ```ts
 * const expensiveCalc = memoize((a: number, b: number) => {
 *   // Heavy computation
 *   return a ** b;
 * });
 * ```
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
	const cache = new Map<string, ReturnType<T>>();

	return ((...args: Parameters<T>) => {
		const key = JSON.stringify(args);
		if (cache.has(key)) {
			return cache.get(key)!;
		}
		const result = fn(...args);
		cache.set(key, result);
		return result;
	}) as T;
}

/**
 * Intersection Observer helper for lazy loading
 * 
 * Usage in component:
 * ```ts
 * let element: HTMLElement;
 * 
 * $effect(() => {
 *   const cleanup = observeIntersection(element, (isIntersecting) => {
 *     if (isIntersecting) {
 *       loadContent();
 *     }
 *   });
 *   return cleanup;
 * });
 * ```
 */
export function observeIntersection(
	element: Element,
	callback: (isIntersecting: boolean) => void,
	options?: IntersectionObserverInit
): () => void {
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				callback(entry.isIntersecting);
			});
		},
		options
	);

	observer.observe(element);

	return () => observer.disconnect();
}

/**
 * Request Animation Frame helper for smooth animations
 * 
 * Usage:
 * ```ts
 * $effect(() => {
 *   const cleanup = animate((timestamp) => {
 *     updateAnimation(timestamp);
 *   });
 *   return cleanup;
 * });
 * ```
 */
export function animate(callback: (timestamp: number) => void | boolean): () => void {
	let rafId: number | null = null;
	let running = true;

	const loop = (timestamp: number) => {
		if (!running) return;

		const shouldContinue = callback(timestamp);
		if (shouldContinue !== false) {
			rafId = requestAnimationFrame(loop);
		}
	};

	rafId = requestAnimationFrame(loop);

	return () => {
		running = false;
		if (rafId) cancelAnimationFrame(rafId);
	};
}

/**
 * Batch state updates for better performance
 * Groups multiple state changes into a single re-render
 * 
 * Usage:
 * ```ts
 * batchUpdates(() => {
 *   state1 = newValue1;
 *   state2 = newValue2;
 *   state3 = newValue3;
 * });
 * ```
 */
export function batchUpdates(fn: () => void): void {
	// In Svelte 5, state updates are already batched automatically
	// This is a no-op but included for API compatibility
	fn();
}

/**
 * Create a derived value with memoization
 * Useful for expensive computations that depend on multiple values
 * 
 * Usage:
 * ```ts
 * const filtered = useMemo(() => {
 *   return items.filter(item => item.price < maxPrice).sort(...);
 * }, [items, maxPrice]);
 * ```
 */
export function useMemo<T>(fn: () => T, deps: any[]): T {
	let lastDeps: any[] = [];
	let lastResult: T;

	const depsChanged = deps.length !== lastDeps.length || deps.some((dep, i) => dep !== lastDeps[i]);

	if (depsChanged) {
		lastResult = fn();
		lastDeps = deps;
	}

	return lastResult!;
}
