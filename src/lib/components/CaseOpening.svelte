<script lang="ts">
	import { motion } from 'framer-motion';
	import { Package, Zap, RefreshCw, AlertCircle, ExternalLink } from '@lucide/svelte';
	import type { Case, CaseItem } from '$lib/types';
	import { createImageProps } from '$lib/utils/images';

	interface OpeningResult {
		item: CaseItem;
		isWin: boolean;
		case: Case;
		profit: number;
	}

	interface CaseOpeningProps {
		caseData: { case: Case; items: CaseItem[] };
		onOpenCase: (caseId: string) => Promise<OpeningResult>;
		class?: string;
	}

	let { caseData, onOpenCase, class: className }: CaseOpeningProps = $props();

	let isOpening = $state(false);
	let revealedItem: CaseItem | null = $state(null);
	let result: OpeningResult | null = $state(null);
	let showAnimation = $state(false);
	let error: string | null = $state(null);

	function getRarityBadgeColor(rarity: string): string {
		const colors: Record<string, string> = {
			Common: 'neutral',
			Uncommon: 'success',
			Rare: 'info',
			Epic: 'secondary',
			Legendary: 'warning',
			Contraband: 'error'
		};
		return colors[rarity] || 'neutral';
	}

	async function openCase() {
		if (isOpening) return;

		try {
			isOpening = true;
			error = null;

			// Start spinning animation
			showAnimation = true;

			// Get actual result from server
			const openingResult = await onOpenCase(caseData.case.id);

			// Update with real result
			revealedItem = openingResult.item;
			result = openingResult;
		} catch (err) {
			console.error('Case opening error:', err);
			error = err instanceof Error ? err.message : 'Failed to open case';
			isOpening = false;
		} finally {
			showAnimation = false;
		}
	}
</script>

<motion.div
	initial={{ scale: 0.9, opacity: 0 }}
	animate={{ scale: 1, opacity: 1 }}
	transition={{ duration: 0.3 }}
>
	<div class="card bg-base-100 shadow-xl {className}">
		<div class="card-body space-y-4">
			<!-- Case Header -->
			<div class="flex items-center gap-3">
				<div class="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
					<Package class="text-primary h-6 w-6" />
				</div>
				<div>
					<h3 class="text-lg font-semibold">{caseData.case.name}</h3>
					<p class="text-muted-foreground text-sm">{caseData.case.item_count} items possible</p>
				</div>
			</div>

			{#if error}
				<div class="alert alert-error">
					<AlertCircle class="h-4 w-4" />
					<span>{error}</span>
				</div>
			{/if}

			<!-- Opening Animation -->
			{#if showAnimation}
				<div
					class="from-primary/20 to-accent/20 relative h-48 overflow-hidden rounded-lg bg-gradient-to-br"
				>
					<div class="absolute inset-0 flex items-center justify-center">
						<motion.div
							animate={{ rotate: 360 }}
							transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
						>
							<Zap class="text-primary h-16 w-16" />
						</motion.div>
					</div>
					<div class="absolute bottom-4 left-1/2 -translate-x-1/2">
						<p class="text-sm font-medium">Opening case...</p>
					</div>
				</div>
			{/if}

			<!-- Revealed Item -->
			{#if revealedItem && !showAnimation}
				<div class="space-y-3">
					<div class="text-center">
						<h4 class="text-lg font-semibold {result?.isWin ? 'text-success' : 'text-destructive'}">
							{result?.isWin ? 'Congratulations!' : 'Better luck next time!'}
						</h4>
						<p class="text-muted-foreground text-sm">You unboxed:</p>
					</div>

					<motion.div
						initial={{ scale: 0, rotate: -180 }}
						animate={{ scale: 1, rotate: 0 }}
						transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
						class="inline-block"
					>
						<div
							class="card bg-base-100 border-4 shadow-xl {result?.isWin
								? 'border-success'
								: 'border-error'}"
						>
							<div class="card-body">
								<div class="flex items-center gap-4">
									<img
										{...createImageProps(revealedItem.image_url, revealedItem.name, 'medium')}
										class="h-16 w-16 rounded"
										alt={revealedItem.name}
									/>
									<div class="flex-1">
										<h5 class="font-semibold">{revealedItem.name}</h5>
										<p class="text-muted-foreground text-sm">{revealedItem.market_name}</p>
										<div class="mt-2 flex items-center gap-2">
											<div class="badge badge-{getRarityBadgeColor(revealedItem.rarity)}">
												{revealedItem.rarity}
											</div>
											<span class="text-success text-sm font-medium">
												${revealedItem.market_value.toFixed(2)}
											</span>
										</div>
										<div class="mt-1 flex items-center gap-4 text-sm">
											<div>
												<span class="text-muted-foreground">Cost: </span>
												<span class="font-medium">-${result?.case.price}</span>
											</div>
											<div>
												<span class="text-muted-foreground">Profit: </span>
												<span
													class="font-medium {result?.isWin ? 'text-success' : 'text-destructive'}"
												>
													{result?.isWin ? '+' : ''}${Math.abs(result?.profit || 0).toFixed(2)}
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</motion.div>

					<!-- Market Link -->
					<a
						href={`https://steamcommunity.com/market/listings/730/${encodeURIComponent(revealedItem.market_name)}`}
						target="_blank"
						rel="noopener noreferrer"
						class="ring-offset-background focus-visible:ring-ring border-input bg-background hover:text-accent-foreground hover:bg-accent inline-flex h-9 w-full items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
					>
						<ExternalLink class="mr-2 h-4 w-4" />
						View on Steam Market
					</a>
				</div>
			{/if}

			<!-- Open Button -->
			{#if !showAnimation && !revealedItem}
				<button onclick={openCase} disabled={isOpening} class="btn btn-lg btn-primary w-full">
					{#if isOpening}
						<RefreshCw class="mr-2 h-4 w-4 animate-spin" />
						Opening...
					{:else}
						<Package class="mr-2 h-4 w-4" />
						Open Case - ${caseData.case.price}
					{/if}
				</button>
			{/if}

			<!-- Case Preview -->
			{#if !showAnimation && !revealedItem}
				<div class="space-y-2">
					<h4 class="text-sm font-medium">Possible Items:</h4>
					<div class="grid grid-cols-2 gap-2">
						{#each caseData.items.slice(0, 4) as item (item.id)}
							<div class="flex items-center gap-2 rounded-lg border p-2">
								<img
									{...createImageProps(item.image_url, item.name, 'small')}
									class="h-8 w-8 rounded"
									alt={item.name}
								/>
								<div class="min-w-0 flex-1">
									<p class="truncate text-xs font-medium">{item.name}</p>
									<p class="text-muted-foreground text-xs">${item.market_value.toFixed(2)}</p>
								</div>
							</div>
						{/each}
					</div>
					{#if caseData.items.length > 4}
						<p class="text-muted-foreground text-xs">+{caseData.items.length - 4} more items...</p>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</motion.div>
