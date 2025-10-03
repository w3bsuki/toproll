// place files you want to import through the `$lib` alias in this folder.

// Enhanced UI Components
export { default as LoadingStates } from './components/LoadingStates.svelte';
export { default as MicroInteractions } from './components/MicroInteractions.svelte';
export { default as ToastNotifications } from './components/ToastNotifications.svelte';
export { toasts, addToast, removeToast } from './components/ToastNotifications.svelte';
export type { Toast } from './components/ToastNotifications.svelte';

// Enhanced AuthButton
export { default as AuthButton } from './components/AuthButton.svelte';

// Utility functions for micro-interactions
export const hapticFeedback = (intensity: 'light' | 'medium' | 'heavy' = 'light') => {
	if ('vibrate' in navigator) {
		const patterns = { light: 10, medium: 50, heavy: 100 };
		navigator.vibrate(patterns[intensity]);
	}
};
