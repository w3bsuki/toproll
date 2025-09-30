<script lang="ts">
        import { createEventDispatcher } from 'svelte';
        import { Search, SlidersHorizontal } from 'lucide-svelte';
        import type { Snippet } from 'svelte';

        type FilterChip = {
                id: string;
                label: string;
                icon?: Snippet;
        };

        const dispatch = createEventDispatcher<{ search: string; filter: string }>();

        let { chips, activeId, placeholder = 'Search', class: className = '' }: {
                chips: FilterChip[];
                activeId: string;
                placeholder?: string;
                class?: string;
        } = $props();

        let query = $state('');

        const handleSearchInput = (event: Event) => {
                const target = event.target as HTMLInputElement;
                query = target.value;
                dispatch('search', query);
        };

        const handleSubmit = (event: Event) => {
                event.preventDefault();
                dispatch('search', query);
        };

        const selectChip = (id: string) => {
                if (id === activeId) return;
                dispatch('filter', id);
        };
</script>

<section class={`space-y-4 ${className}`}>
        <form
                class="border-border/60 bg-surface/80 flex flex-col gap-3 rounded-[28px] border p-4 shadow-[0_18px_60px_rgba(15,23,42,0.4)] sm:flex-row sm:items-center sm:p-6"
                role="search"
                onsubmit={handleSubmit}
        >
                <label class="text-muted-foreground/80 focus-within:ring-ring/60 focus-within:ring-offset-background flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm transition focus-within:ring-2 focus-within:ring-offset-2 focus-within:outline-none">
                        <Search class="h-4 w-4" aria-hidden="true" />
                        <span class="sr-only">Search marketplace</span>
                        <input
                                class="placeholder:text-muted-foreground/60 w-full bg-transparent text-base font-medium tracking-tight text-foreground focus:outline-none"
                                type="search"
                                name="marketplace-search"
                                autocomplete="off"
                                spellcheck={false}
                                placeholder={placeholder}
                                value={query}
                                oninput={handleSearchInput}
                        />
                </label>
                <button
                        type="button"
                        class="border-border/50 text-muted-foreground hover:text-foreground focus-visible:ring-ring/60 focus-visible:ring-offset-background flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                        aria-label="Open filters"
                >
                        <SlidersHorizontal class="h-4 w-4" aria-hidden="true" />
                        Filters
                </button>
        </form>

        <div class="marketplace-scrollbar -mx-4 overflow-x-auto px-4">
                <div class="flex gap-2">
                        {#each chips as chip}
                                <button
                                        type="button"
                                        class={`focus-visible:ring-ring/60 focus-visible:ring-offset-background flex min-w-[140px] items-center justify-center rounded-2xl border px-5 py-2 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
                                                chip.id === activeId
                                                        ? 'border-primary/70 bg-primary/20 text-foreground shadow-marketplace-sm'
                                                        : 'border-border/50 bg-surface-muted/60 text-muted-foreground hover:text-foreground'
                                        }`}
                                        role="tab"
                                        aria-selected={chip.id === activeId}
                                        onclick={() => selectChip(chip.id)}
                                >
                                        {#if chip.icon}
                                                {@render chip.icon?.({})}
                                        {/if}
                                        <span>{chip.label}</span>
                                </button>
                        {/each}
                </div>
        </div>
</section>
