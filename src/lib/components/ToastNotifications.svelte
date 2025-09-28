<script context="module" lang="ts">
	export interface Toast {
		id: string;
		type: 'success' | 'error' | 'info' | 'warning';
		title: string;
		message?: string;
		duration?: number;
		action?: { label: string; onClick: () => void };
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { CheckCircle, AlertCircle, Info, X } from 'lucide-svelte';

	export const toasts = writable<Toast[]>([]);

	export function addToast(toast: Omit<Toast, 'id'>) {
		const id = Math.random().toString(36).substr(2, 9);
		const newToast: Toast = {
			id,
			duration: 5000,
			...toast
		};

		toasts.update((list) => [...list, newToast]);

		// Auto remove toast after duration
		if (newToast.duration && newToast.duration > 0) {
			setTimeout(() => removeToast(id), newToast.duration);
		}

		return id;
	}

	export function removeToast(id: string) {
		toasts.update((list) => list.filter((t) => t.id !== id));
	}

	const iconMap = {
		success: CheckCircle,
		error: AlertCircle,
		info: Info,
		warning: AlertCircle
	};

	const colorMap = {
		success: 'alert-success',
		error: 'alert-error',
		info: 'alert-info',
		warning: 'alert-warning'
	};

	let toastList: Toast[] = [];
	toasts.subscribe((value) => (toastList = value));
</script>

<!-- Toast Container -->
<div class="toast-top toast-end toast z-[100]">
	{#each toastList as toast (toast.id)}
		<div
			class="alert {colorMap[
				toast.type
			]} animate-in slide-in-from-right-full border border-base-300 shadow-lg duration-300"
			role="alert"
		>
			<svelte:component this={iconMap[toast.type]} class="h-5 w-5 flex-shrink-0" />

			<div class="min-w-0 flex-1">
				<div class="text-sm font-semibold">{toast.title}</div>
				{#if toast.message}
					<div class="mt-1 text-xs opacity-80">{toast.message}</div>
				{/if}
			</div>

			{#if toast.action}
				<button class="btn btn-ghost btn-sm" onclick={toast.action.onClick}>
					{toast.action.label}
				</button>
			{/if}

			<button
				class="btn btn-circle btn-ghost btn-sm"
				onclick={() => removeToast(toast.id)}
				aria-label="Close notification"
			>
				<X class="h-4 w-4" />
			</button>
		</div>
	{/each}
</div>

<style>
	.animate-in {
		animation-fill-mode: both;
	}

	@keyframes slide-in-from-right-full {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.slide-in-from-right-full {
		animation-name: slide-in-from-right-full;
	}

	/* Gaming-themed toast enhancements */
	.toast .alert {
		backdrop-filter: blur(8px);
		border-radius: 0.75rem;
	}

	.alert-success {
		background: linear-gradient(
			135deg,
			rgb(from var(--color-success) r g b / 0.9) 0%,
			rgb(from var(--color-success) r g b / 0.7) 100%
		);
	}

	.alert-error {
		background: linear-gradient(
			135deg,
			rgb(from var(--color-error) r g b / 0.9) 0%,
			rgb(from var(--color-error) r g b / 0.7) 100%
		);
	}

	.alert-info {
		background: linear-gradient(
			135deg,
			rgb(from var(--color-info) r g b / 0.9) 0%,
			rgb(from var(--color-info) r g b / 0.7) 100%
		);
	}

	.alert-warning {
		background: linear-gradient(
			135deg,
			rgb(from var(--color-warning) r g b / 0.9) 0%,
			rgb(from var(--color-warning) r g b / 0.7) 100%
		);
	}
</style>
