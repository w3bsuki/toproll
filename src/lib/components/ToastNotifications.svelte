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
	import { writable } from 'svelte/store';
	import { CheckCircle, AlertCircle, Info, X } from 'lucide-svelte';
	import { Button, Card, CardContent } from '$lib/components/ui';

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
		toasts.update((list) => list.filter((t) => t.id !== id));
	}

	const iconMap = {
		success: CheckCircle,
		error: AlertCircle,
		info: Info,
		warning: AlertCircle
	} satisfies Record<Toast['type'], typeof CheckCircle>;

	const toneClass: Record<Toast['type'], string> = {
		success: 'border-success/40 bg-success/10 text-success',
		error: 'border-destructive/40 bg-destructive/10 text-destructive',
		info: 'border-info/40 bg-info/10 text-info',
		warning: 'border-warning/40 bg-warning/10 text-warning-foreground'
	};

	let toastList: Toast[] = [];
	toasts.subscribe((value) => (toastList = value));
</script>

<div
	class="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-end gap-3 px-4 sm:top-6 sm:px-6"
>
	{#each toastList as toast (toast.id)}
		<Card
			class={`shadow-marketplace-md pointer-events-auto w-full max-w-sm border backdrop-blur ${toneClass[toast.type]}`}
		>
			<CardContent class="flex items-start gap-3 p-4">
				<div class="mt-1">
					<svelte:component this={iconMap[toast.type]} class="h-5 w-5" />
				</div>
				<div class="min-w-0 flex-1">
					<div class="text-foreground text-sm font-semibold">{toast.title}</div>
					{#if toast.message}
						<div class="text-muted-foreground mt-1 text-xs">{toast.message}</div>
					{/if}
                                        {#if toast.action}
                                                <Button variant="outline" size="sm" class="mt-3 gap-2" onclick={toast.action.onClick}>
                                                        {toast.action.label}
                                                </Button>
                                        {/if}
				</div>
				<Button
					variant="ghost"
					size="icon"
					class="h-8 w-8"
                                        onclick={() => removeToast(toast.id)}
					aria-label="Close notification"
				>
					<X class="h-4 w-4" />
				</Button>
			</CardContent>
		</Card>
	{/each}
</div>
