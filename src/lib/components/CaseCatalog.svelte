<script lang="ts">
	import { motion } from 'framer-motion';
	import { Package, Star, Zap, Trophy, Info } from '@lucide/svelte';
	import type { Case, CaseItem } from '$lib/types';

	interface CaseCatalogProps {
		cases: Case[];
		onSelectCase: (caseData: { case: Case; items: CaseItem[] }) => void;
		loading?: boolean;
		class?: string;
	}

	let { cases, onSelectCase, loading = false, class: className }: CaseCatalogProps = $props();

	let selectedCase: Case | null = $state(null);
	let showCasePreview = $state(false);

	function handleCasePreview(caseData: Case) {
		selectedCase = caseData;
		// In a real app, you'd fetch case items here
		showCasePreview = true;
	}

	function getCaseTypeIcon(caseName: string): ComponentType {
		if (caseName.toLowerCase().includes('knife')) return Trophy;
		if (caseName.toLowerCase().includes('glove')) return Zap;
		if (caseName.toLowerCase().includes('weapon')) return Star;
		return Package;
	}

	function getCaseTypeColor(caseName: string): string {
		if (caseName.toLowerCase().includes('knife')) {
			return 'bg-accent/20 text-accent-foreground';
		}
		if (caseName.toLowerCase().includes('glove')) {
			return 'bg-warning/20 text-warning-foreground';
		}
		if (caseName.toLowerCase().includes('weapon')) {
			return 'bg-primary/15 text-primary';
		}
		return 'bg-surface-muted text-surface-muted-foreground';
	}
</script>

<div class="space-y-6 {className || ''}">
	<!-- Header -->
	<div class="space-y-2 text-center">
		<h2 class="text-3xl font-bold">CS2 Cases</h2>
		<p class="text-muted-foreground">Open exclusive cases with rare skins and valuable items</p>
	</div>

	<!-- Cases Grid -->
	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each cases as caseData (caseData.id)}
			{@const CaseIcon = getCaseTypeIcon(caseData.name)}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				class="group"
			>
				<div
					class="card border-border/60 bg-surface/70 shadow-marketplace-sm hover:shadow-marketplace-lg border transition-shadow duration-300"
				>
					<div class="card-body space-y-4">
						<!-- Case Header -->
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<div
									class="flex h-12 w-12 items-center justify-center rounded-lg {getCaseTypeColor(
										caseData.name
									)}"
								>
									<CaseIcon class="h-6 w-6" />
								</div>
								<div>
									<h3 class="text-lg font-semibold">{caseData.name}</h3>
									<p class="text-muted-foreground text-sm">{caseData.item_count} items</p>
								</div>
							</div>
							<div class="text-right">
								<div class="text-success text-2xl font-bold">${caseData.price}</div>
								<div class="text-muted-foreground text-xs">per case</div>
							</div>
						</div>

						<!-- Case Description -->
						{#if caseData.description}
							<p class="text-muted-foreground text-sm">{caseData.description}</p>
						{/if}

						<!-- Case Stats -->
						<div class="space-y-2">
							<div class="flex justify-between text-sm">
								<span class="text-muted-foreground">Total Openings</span>
								<span class="font-medium">1,247</span>
							</div>
							<div class="flex justify-between text-sm">
								<span class="text-muted-foreground">Avg Profit</span>
								<span class="text-success font-medium">+$12.45</span>
							</div>
						</div>

						<!-- Action Buttons -->
						<div class="space-y-2">
							<button
								class="btn btn-lg btn-primary w-full"
								onclick={() => onSelectCase({ case: caseData, items: [] })}
								disabled={loading}
							>
								<Package class="mr-2 h-4 w-4" />
								Open Case
							</button>

							<button
								class="btn btn-outline btn-sm w-full"
								onclick={() => handleCasePreview(caseData)}
							>
								<Info class="mr-2 h-4 w-4" />
								View Items
							</button>
						</div>
					</div>
				</div>
			</motion.div>
		{/each}
	</div>

	<!-- Case Preview Modal -->
	{#if showCasePreview && selectedCase}
		<div class="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4">
			<motion.div
				initial={{ scale: 0.9, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				class="w-full max-w-2xl"
			>
				<div class="card border-border/60 bg-surface/80 shadow-marketplace-lg border">
					<div class="card-body space-y-4">
						<div class="flex items-center justify-between">
							<h3 class="text-xl font-bold">{selectedCase.name}</h3>
							<button
								class="btn btn-ghost btn-sm"
								onclick={() => {
									showCasePreview = false;
									selectedCase = null;
								}}
							>
								✕
							</button>
						</div>

						{#if selectedCase.description}
							<p class="text-muted-foreground">{selectedCase.description}</p>
						{/if}

						<!-- Mock case items preview -->
						<div class="space-y-2">
							<h4 class="font-semibold">Possible Items:</h4>
							<div class="grid grid-cols-2 gap-2">
								{#each [{ name: 'AK-47 | Fire Serpent', rarity: 'Covert', value: 1200 }, { name: 'M4A4 | Howl', rarity: 'Contraband', value: 850 }, { name: 'AWP | Dragon Lore', rarity: 'Covert', value: 2450 }, { name: 'AK-47 | Case Hardened', rarity: 'Classified', value: 180 }] as item (item.name)}
									<div class="flex items-center gap-2 rounded-lg border p-2">
										<div class="bg-muted flex h-8 w-8 items-center justify-center rounded text-xs">
											{item.rarity[0]}
										</div>
										<div class="flex-1">
											<p class="truncate text-xs font-medium">{item.name}</p>
											<div class="badge badge-primary text-xs">
												{item.rarity}
											</div>
										</div>
										<div class="text-xs font-medium">${item.value}</div>
									</div>
								{/each}
							</div>
						</div>

						<div class="flex gap-2">
							<button
								class="btn btn-outline flex-1"
								onclick={() => {
									showCasePreview = false;
									selectedCase = null;
								}}
							>
								Close
							</button>
							<button
								class="btn btn-primary flex-1"
								onclick={() => {
									if (selectedCase) {
										onSelectCase({ case: selectedCase, items: [] });
									}
									showCasePreview = false;
									selectedCase = null;
								}}
							>
								Open This Case
							</button>
						</div>
					</div>
				</div>
			</motion.div>
		</div>
	{/if}
</div>
