import { writable } from 'svelte/store';

export interface Toast {
	id: string;
	type: 'success' | 'error' | 'info' | 'warning';
	title: string;
	message?: string;
	duration?: number;
	action?: { label: string; onClick: () => void };
}

export const toasts = writable<Toast[]>([]);

export function addToast(toast: Omit<Toast, 'id'>) {
	const id = Math.random().toString(36).slice(2);
	const newToast: Toast = {
		id,
		duration: 5000,
		...toast
	};

	toasts.update((list) => [...list, newToast]);

	if (newToast.duration && newToast.duration > 0) {
		setTimeout(() => removeToast(id), newToast.duration);
	}

	return id;
}

export function removeToast(id: string) {
	toasts.update((list) => list.filter((toast) => toast.id !== id));
}

// Convenience functions for common toast types
export const toast = {
	success: (
		title: string,
		message?: string,
		options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>
	) => addToast({ type: 'success', title, message, ...options }),

	error: (
		title: string,
		message?: string,
		options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>
	) => addToast({ type: 'error', title, message, duration: 8000, ...options }),

	info: (
		title: string,
		message?: string,
		options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>
	) => addToast({ type: 'info', title, message, ...options }),

	warning: (
		title: string,
		message?: string,
		options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>
	) => addToast({ type: 'warning', title, message, duration: 6000, ...options }),

	// Battle-specific toasts
	battleCreated: (battleId: string) =>
		addToast({
			type: 'success',
			title: 'Battle Created',
			message: 'Your battle has been created successfully!',
			action: {
				label: 'View Battle',
				onClick: () => {
					window.location.href = `/battles/${battleId}`;
				}
			}
		}),

	battleJoined: () =>
		addToast({
			type: 'success',
			title: 'Joined Battle',
			message: 'You have successfully joined the battle!'
		}),

	battleError: (error: string) =>
		addToast({ type: 'error', title: 'Battle Error', message: error }),

	caseUnboxed: (itemName: string) =>
		addToast({ type: 'success', title: 'Item Unboxed!', message: `You got ${itemName}` }),

	insufficientFunds: () =>
		addToast({
			type: 'warning',
			title: 'Insufficient Funds',
			message: "You don't have enough balance for this action"
		}),

	networkError: (action: string) =>
		addToast({
			type: 'error',
			title: 'Network Error',
			message: `Failed to ${action}. Please check your connection and try again.`
		})
};

// Clear all toasts
export function clearAllToasts() {
	toasts.set([]);
}
