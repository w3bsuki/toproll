<script lang="ts">
	import { cn } from '$lib/utils';

	export interface ScrollableTab {
		id: string;
		label: string;
		badge?: string;
	}

	interface ScrollableTabsProps {
		tabs: ScrollableTab[];
		activeId: string;
		class?: string;
		onChange?: (id: string) => void;
	}

	let { tabs, activeId, class: className = '', onChange }: ScrollableTabsProps = $props();

	function selectTab(id: string) {
		if (id === activeId) return;
		onChange?.(id);
	}
</script>

<div class={cn('relative', className)}>
	<div
		class="from-background via-background/60 pointer-events-none absolute inset-y-0 left-0 hidden w-8 bg-gradient-to-r to-transparent xl:block"
	></div>
	<div
		class="from-background via-background/60 pointer-events-none absolute inset-y-0 right-0 hidden w-8 bg-gradient-to-l to-transparent xl:block"
	></div>
	<div class="marketplace-scrollbar -mx-4 overflow-x-auto px-4 pb-2">
		<div class="flex gap-2">
			{#each tabs as tab}
				<button
					type="button"
					class={cn(
						'group focus-visible:ring-ring/70 focus-visible:ring-offset-background inline-flex h-11 min-w-[120px] items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
						tab.id === activeId
							? 'border-primary/60 bg-primary/15 text-foreground shadow-marketplace-sm'
							: 'border-border/40 bg-surface-muted/40 text-muted-foreground hover:text-foreground'
					)}
					role="tab"
					aria-selected={tab.id === activeId}
					onclick={() => selectTab(tab.id)}
				>
					<span>{tab.label}</span>
					{#if tab.badge}
						<span
							class="bg-primary/20 text-primary rounded-full px-2 py-0.5 text-[10px] font-medium tracking-[0.3em] uppercase"
						>
							{tab.badge}
						</span>
					{/if}
				</button>
			{/each}
		</div>
	</div>
</div>
