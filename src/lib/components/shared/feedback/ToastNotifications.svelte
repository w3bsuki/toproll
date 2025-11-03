<script lang="ts">
	import { CheckCircle, AlertCircle, Info, X } from '@lucide/svelte';
	import { Button, Card, CardContent } from '$lib/components/ui';
	// ✅ NEW: Get toasts from context
	import { getToastsState, type Toast } from '$lib/features/shared/toasts-state.svelte';

	const toasts = getToastsState();

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
</script>

<div
	class="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-end gap-3 px-4 sm:top-6 sm:px-6"
>
	{#each toasts.items as toast (toast.id)}
		{@const Icon = iconMap[toast.type]}
		<Card
			class={`shadow-marketplace-md pointer-events-auto w-full max-w-sm border backdrop-blur ${toneClass[toast.type]}`}
		>
			<CardContent class="flex items-start gap-3 p-4">
				<div class="mt-1">
					<Icon class="h-5 w-5" />
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
					onclick={() => toasts.remove(toast.id)}
					aria-label="Close notification"
				>
					<X class="h-4 w-4" />
				</Button>
			</CardContent>
		</Card>
	{/each}
</div>
