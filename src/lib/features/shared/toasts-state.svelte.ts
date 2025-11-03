import { getContext, setContext } from 'svelte';

const TOASTS_KEY = Symbol('toasts');

export interface Toast {
	id: string;
	type: 'success' | 'error' | 'info' | 'warning';
	title: string;
	message?: string;
	duration?: number;
	action?: { label: string; onClick: () => void };
}

interface ToastsState {
	items: Toast[];
	add: (toast: Omit<Toast, 'id'>) => string;
	remove: (id: string) => void;
	success: (
		title: string,
		message?: string,
		options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>
	) => string;
	error: (
		title: string,
		message?: string,
		options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>
	) => string;
	info: (
		title: string,
		message?: string,
		options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>
	) => string;
	warning: (
		title: string,
		message?: string,
		options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>
	) => string;
	// Battle-specific toasts
	battleCreated: (battleId: string) => string;
	battleJoined: () => string;
	battleError: (error: string) => string;
	caseUnboxed: (itemName: string) => string;
	insufficientFunds: () => string;
	networkError: (action: string) => string;
}

/**
 * Creates the toasts state using Svelte 5 runes
 * This replaces the old writable store with context-based state
 */
export function createToastsState(): ToastsState {
	let items = $state<Toast[]>([]);

	function add(toast: Omit<Toast, 'id'>) {
		const id = crypto.randomUUID();
		const newToast: Toast = {
			id,
			duration: 5000,
			...toast
		};

		items = [...items, newToast];

		if (newToast.duration && newToast.duration > 0) {
			setTimeout(() => remove(id), newToast.duration);
		}

		return id;
	}

	function remove(id: string) {
		items = items.filter((toast) => toast.id !== id);
	}

	// Convenience functions for common toast types
	function success(
		title: string,
		message?: string,
		options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>
	) {
		return add({ type: 'success', title, message, ...options });
	}

	function error(
		title: string,
		message?: string,
		options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>
	) {
		return add({ type: 'error', title, message, duration: 8000, ...options });
	}

	function info(
		title: string,
		message?: string,
		options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>
	) {
		return add({ type: 'info', title, message, ...options });
	}

	function warning(
		title: string,
		message?: string,
		options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>
	) {
		return add({ type: 'warning', title, message, duration: 6000, ...options });
	}

	// Battle-specific toasts
	function battleCreated(battleId: string) {
		return add({
			type: 'success',
			title: 'Battle Created',
			message: 'Your battle has been created successfully!',
			action: {
				label: 'View Battle',
				onClick: () => {
					window.location.href = `/battles/${battleId}`;
				}
			}
		});
	}

	function battleJoined() {
		return add({
			type: 'success',
			title: 'Joined Battle',
			message: 'You have successfully joined the battle!'
		});
	}

	function battleError(errorMsg: string) {
		return add({ type: 'error', title: 'Battle Error', message: errorMsg });
	}

	function caseUnboxed(itemName: string) {
		return add({ type: 'success', title: 'Item Unboxed!', message: `You got ${itemName}` });
	}

	function insufficientFunds() {
		return add({
			type: 'warning',
			title: 'Insufficient Funds',
			message: "You don't have enough balance for this action"
		});
	}

	function networkError(action: string) {
		return add({
			type: 'error',
			title: 'Network Error',
			message: `Failed to ${action}. Please check your connection and try again.`
		});
	}

	return {
		get items() {
			return items;
		},
		add,
		remove,
		success,
		error,
		info,
		warning,
		battleCreated,
		battleJoined,
		battleError,
		caseUnboxed,
		insufficientFunds,
		networkError
	};
}

/**
 * Sets toasts state in context (call this in root +layout.svelte)
 */
export function setToastsState(): ToastsState {
	return setContext(TOASTS_KEY, createToastsState());
}

/**
 * Gets toasts state from context (call this in child components)
 */
export function getToastsState(): ToastsState {
	const state = getContext<ToastsState>(TOASTS_KEY);
	if (!state) {
		throw new Error(
			'Toasts state not found. Did you forget to call setToastsState() in root layout?'
		);
	}
	return state;
}
