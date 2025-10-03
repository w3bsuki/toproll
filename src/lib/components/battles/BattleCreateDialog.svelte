<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import {
		X,
		Trophy,
		Sparkles,
		Users,
		Currency,
		Plus,
		Minus,
		Info,
		CheckCircle,
		AlertCircle
	} from '@lucide/svelte';
	import type { Case, CreateBattleRequest } from '$lib/types';

	// Props using Svelte 5 syntax
	let {
		open = false,
		userBalance = 0,
		onOpenChange,
		onBattleCreated
	}: {
		open?: boolean;
		userBalance?: number;
		onOpenChange?: (open: boolean) => void;
		onBattleCreated?: (battle: any) => void;
	} = $props();

	// Reactive state
	let selectedMode = $state<'standard' | 'crazy'>('standard');
	let maxParticipants = $state<2 | 4>(2);
	let selectedCases = $state<Case[]>([]);
	let isCreating = $state(false);
	let createError = $state<string | null>(null);
	let activeTab = $state('configuration');

	// Mock available cases
	let availableCases = $state<Case[]>([
		{
			id: 'case-1',
			name: 'Dreams & Nightmares',
			description: 'Mystical case with rare items',
			image_url: '/cases/dreams-nightmares.jpg',
			price: 5.00,
			item_count: 17,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		},
		{
			id: 'case-2',
			name: 'Fracture',
			description: 'Fractured dreams and nightmares',
			image_url: '/cases/fracture.jpg',
			price: 6.00,
			item_count: 17,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		},
		{
			id: 'case-3',
			name: 'Recoil',
			description: 'High-impact case collection',
			image_url: '/cases/recoil.jpg',
			price: 7.75,
			item_count: 17,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		},
		{
			id: 'case-4',
			name: 'Prisma 2',
			description: 'Colorful weapon skins',
			image_url: '/cases/prisma2.jpg',
			price: 12.50,
			item_count: 17,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		}
	]);

	// Computed values
	const totalCost = $derived(
		selectedCases.reduce((sum, case_) => sum + case_.price, 0)
	);
	const totalPot = $derived(totalCost * maxParticipants);
	const roundsCount = $derived(Math.max(3, selectedCases.length));
	const canAfford = $derived(userBalance >= totalCost);
	const isValid = $derived(selectedCases.length > 0 && canAfford);

	// Handle dialog close
	function handleClose() {
		if (!isCreating) {
			onOpenChange?.(false);
			resetForm();
		}
	}

	// Reset form
	function resetForm() {
		selectedMode = 'standard';
		maxParticipants = 2;
		selectedCases = [];
		createError = null;
		activeTab = 'configuration';
	}

	// Add case to selection
	function addCase(case_: Case) {
		if (selectedCases.some(c => c.id === case_.id)) return;
		selectedCases = [...selectedCases, case_];
	}

	// Remove case from selection
	function removeCase(caseId: string) {
		selectedCases = selectedCases.filter(c => c.id !== caseId);
	}

	// Move case in selection
	function moveCase(caseId: string, direction: 'up' | 'down') {
		const index = selectedCases.findIndex(c => c.id === caseId);
		if (index === -1) return;

		const newCases = [...selectedCases];
		const targetIndex = direction === 'up' ? index - 1 : index + 1;

		if (targetIndex >= 0 && targetIndex < newCases.length) {
			[newCases[index], newCases[targetIndex]] = [newCases[targetIndex], newCases[index]];
			selectedCases = newCases;
		}
	}

	// Create battle
	async function handleCreateBattle() {
		if (!isValid || isCreating) return;

		isCreating = true;
		createError = null;

		try {
			const request: CreateBattleRequest = {
				case_ids: selectedCases.map(c => c.id),
				mode: selectedMode,
				max_participants: maxParticipants
			};

			// TODO: Replace with actual API call
			// const response = await fetch('/api/battles', {
			//   method: 'POST',
			//   headers: { 'Content-Type': 'application/json' },
			//   body: JSON.stringify(request)
			// });
			// const battle = await response.json();

			// Mock API call
			await new Promise(resolve => setTimeout(resolve, 2000));
			const mockBattle = {
				id: 'battle-' + Date.now(),
				...request,
				status: 'waiting',
				current_participants: 1,
				total_pot: totalPot,
				entry_fee: totalCost,
				rounds_count: roundsCount,
				current_round: 0,
				created_at: new Date().toISOString()
			};

			onBattleCreated?.(mockBattle);
			onOpenChange?.(false);
			resetForm();
		} catch (error) {
			createError = error instanceof Error ? error.message : 'Failed to create battle';
		} finally {
			isCreating = false;
		}
	}

	// Handle keyboard shortcuts
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleClose();
		}
	}

	// Format currency
	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount);
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- Backdrop -->
        <div
                class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                on:click={handleClose}
		role="dialog"
		aria-modal="true"
		aria-labelledby="dialog-title"
		aria-describedby="dialog-description"
	>
		<!-- Dialog Panel -->
                <div
                        class="bg-surface border border-border/40 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                        role="presentation"
                        on:click|stopPropagation
                >
			<!-- Header -->
			<header class="p-6 border-b border-border/40">
				<div class="flex items-center justify-between">
					<div>
						<h2 id="dialog-title" class="text-2xl font-bold text-foreground flex items-center gap-2">
							<Trophy class="h-6 w-6 text-primary" />
							Create Battle
						</h2>
						<p id="dialog-description" class="text-muted-foreground mt-1">
							Configure your battle settings and select cases
						</p>
					</div>
                                        <Button
                                                variant="ghost"
                                                size="icon"
                                                on:click={handleClose}
						class="h-8 w-8"
						aria-label="Close dialog"
					>
						<X class="h-4 w-4" />
					</Button>
				</div>
			</header>

			<!-- Content -->
			<div class="flex-1 overflow-y-auto">
				<Tabs bind:value={activeTab} class="w-full">
					<!-- Tab Navigation -->
					<div class="px-6 pt-4">
						<TabsList class="grid w-full grid-cols-3">
							<TabsTrigger value="configuration">Configuration</TabsTrigger>
							<TabsTrigger value="cases">Select Cases</TabsTrigger>
							<TabsTrigger value="summary">Summary</TabsTrigger>
						</TabsList>
					</div>

					<!-- Configuration Tab -->
					<TabsContent value="configuration" class="px-6 py-4 space-y-6">
						<div class="grid gap-6 md:grid-cols-2">
							<!-- Battle Mode -->
							<Card>
								<CardHeader>
									<CardTitle class="text-lg">Battle Mode</CardTitle>
									<CardDescription>
										Choose how winners are determined
									</CardDescription>
								</CardHeader>
								<CardContent class="space-y-4">
									<div class="grid gap-3">
										{#each [
											{ mode: 'standard' as const, icon: Trophy, title: 'Standard', description: 'Highest total value wins' },
											{ mode: 'crazy' as const, icon: Sparkles, title: 'Crazy', description: 'Lowest total value wins' }
										] as { mode, icon: Icon, title, description }}
											<button
												type="button"
												class="p-4 rounded-lg border-2 transition-all text-left {selectedMode === mode ? 'border-primary bg-primary/10' : 'border-border/40 hover:border-border/80'}"
												onclick={() => selectedMode = mode}
											>
												<div class="flex items-start gap-3">
													<Icon class="h-5 w-5 text-primary mt-0.5" />
													<div>
														<h3 class="font-semibold text-foreground">{title}</h3>
														<p class="text-sm text-muted-foreground mt-1">{description}</p>
													</div>
												</div>
												{#if selectedMode === mode}
													<CheckCircle class="h-4 w-4 text-primary ml-auto" />
												{/if}
											</button>
										{/each}
									</div>
								</CardContent>
							</Card>

							<!-- Participants -->
							<Card>
								<CardHeader>
									<CardTitle class="text-lg">Battle Size</CardTitle>
									<CardDescription>
										Maximum number of participants
									</CardDescription>
								</CardHeader>
								<CardContent class="space-y-4">
									<div class="grid gap-3">
										{#each [
											{ count: 2, label: '1v1 Battle', description: 'Head to head competition' },
											{ count: 4, label: '2v2 Battle', description: 'Team battle mode' }
										] as { count, label, description }}
											<button
												type="button"
												class="p-4 rounded-lg border-2 transition-all text-left {maxParticipants === count ? 'border-primary bg-primary/10' : 'border-border/40 hover:border-border/80'}"
												onclick={() => maxParticipants = count as 2 | 4}
											>
												<div class="flex items-start gap-3">
													<Users class="h-5 w-5 text-primary mt-0.5" />
													<div>
														<h3 class="font-semibold text-foreground">{label}</h3>
														<p class="text-sm text-muted-foreground mt-1">{description}</p>
													</div>
												</div>
												{#if maxParticipants === count}
													<CheckCircle class="h-4 w-4 text-primary ml-auto" />
												{/if}
											</button>
										{/each}
									</div>
								</CardContent>
							</Card>
						</div>

						<!-- Info Card -->
						<Card class="bg-primary/5 border-primary/20">
							<CardContent class="p-4">
								<div class="flex items-start gap-3">
									<Info class="h-5 w-5 text-primary mt-0.5" />
									<div class="text-sm">
										<h4 class="font-semibold text-foreground mb-1">Battle Rules</h4>
										<ul class="text-muted-foreground space-y-1">
											<li>• Each player opens the same cases in the same order</li>
											<li>• Total value is calculated after all rounds</li>
											<li>• Winner takes the entire pot (minus house rake)</li>
											<li>• All results are provably fair and verifiable</li>
										</ul>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<!-- Cases Tab -->
					<TabsContent value="cases" class="px-6 py-4 space-y-6">
						<div class="grid gap-6 lg:grid-cols-2">
							<!-- Available Cases -->
							<Card>
								<CardHeader>
									<CardTitle class="text-lg">Available Cases</CardTitle>
									<CardDescription>
										Select cases to include in the battle
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div class="space-y-3 max-h-96 overflow-y-auto">
										{#each availableCases as case_ (case_.id)}
											<div
												class="p-3 rounded-lg border border-border/40 hover:border-primary/50 transition-all cursor-pointer {selectedCases.some(c => c.id === case_.id) ? 'bg-primary/10 border-primary/50' : 'bg-surface'}"
												onclick={() => addCase(case_)}
											>
												<div class="flex items-center gap-3">
													{#if case_.image_url}
														<img
															src={case_.image_url}
															alt={case_.name}
															class="h-12 w-12 rounded-lg object-cover"
														/>
													{/if}
													<div class="flex-1">
														<h3 class="font-semibold text-foreground">{case_.name}</h3>
														<p class="text-sm text-muted-foreground">{case_.description}</p>
													</div>
													<div class="text-right">
														<p class="font-bold text-emerald-400">{formatCurrency(case_.price)}</p>
														{#if selectedCases.some(c => c.id === case_.id)}
															<Badge variant="secondary" class="text-xs">Selected</Badge>
														{:else}
															<Button size="sm" variant="outline" class="gap-1">
																<Plus class="h-3 w-3" />
																Add
															</Button>
														{/if}
													</div>
												</div>
											</div>
										{/each}
									</div>
								</CardContent>
							</Card>

							<!-- Selected Cases -->
							<Card>
								<CardHeader>
									<CardTitle class="text-lg">Selected Cases</CardTitle>
									<CardDescription>
										{selectedCases.length === 0 ? 'No cases selected' : `${selectedCases.length} case${selectedCases.length !== 1 ? 's' : ''} selected`}
									</CardDescription>
								</CardHeader>
								<CardContent>
									{#if selectedCases.length === 0}
										<div class="text-center py-8 text-muted-foreground">
											<div class="h-12 w-12 rounded-full bg-surface-muted flex items-center justify-center mx-auto mb-3">
												<Trophy class="h-6 w-6" />
											</div>
											<p>Select cases from the available list to get started</p>
										</div>
									{:else}
										<div class="space-y-3 max-h-96 overflow-y-auto">
											{#each selectedCases as case_ (case_.id)}
												<div class="p-3 rounded-lg bg-surface border border-border/40">
													<div class="flex items-center gap-3">
														<span class="text-sm font-bold text-muted-foreground">#{selectedCases.indexOf(case_) + 1}</span>
														{#if case_.image_url}
															<img
																src={case_.image_url}
																alt={case_.name}
																class="h-12 w-12 rounded-lg object-cover"
															/>
														{/if}
														<div class="flex-1">
															<h3 class="font-semibold text-foreground">{case_.name}</h3>
															<p class="text-sm text-muted-foreground">{case_.description}</p>
														</div>
														<div class="text-right">
															<p class="font-bold text-emerald-400">{formatCurrency(case_.price)}</p>
															<div class="flex gap-1 mt-1">
																<Button
																	size="sm"
																	variant="ghost"
																	class="h-6 w-6 p-0"
																	onclick={() => moveCase(case_.id, 'up')}
																	disabled={selectedCases.indexOf(case_) === 0}
																>
																	<span class="text-xs">↑</span>
																</Button>
																<Button
																	size="sm"
																	variant="ghost"
																	class="h-6 w-6 p-0"
																	onclick={() => moveCase(case_.id, 'down')}
																	disabled={selectedCases.indexOf(case_) === selectedCases.length - 1}
																>
																	<span class="text-xs">↓</span>
																</Button>
																<Button
																	size="sm"
																	variant="ghost"
																	class="h-6 w-6 p-0 text-destructive hover:text-destructive"
																	onclick={() => removeCase(case_.id)}
																>
																	<Minus class="h-3 w-3" />
																</Button>
															</div>
														</div>
													</div>
												</div>
											{/each}
										</div>
									{/if}
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<!-- Summary Tab -->
					<TabsContent value="summary" class="px-6 py-4 space-y-6">
						<!-- Battle Summary -->
						<Card>
							<CardHeader>
								<CardTitle class="text-lg">Battle Summary</CardTitle>
								<CardDescription>
									Review your battle configuration before creating
								</CardDescription>
							</CardHeader>
							<CardContent class="space-y-4">
								<div class="grid gap-4 md:grid-cols-2">
									<div>
										<h4 class="font-semibold text-foreground mb-2">Configuration</h4>
										<div class="space-y-2 text-sm">
											<div class="flex justify-between">
												<span class="text-muted-foreground">Mode:</span>
												<span class="capitalize text-foreground">{selectedMode}</span>
											</div>
											<div class="flex justify-between">
												<span class="text-muted-foreground">Max Players:</span>
												<span class="text-foreground">{maxParticipants}</span>
											</div>
											<div class="flex justify-between">
												<span class="text-muted-foreground">Rounds:</span>
												<span class="text-foreground">{roundsCount}</span>
											</div>
										</div>
									</div>
									<div>
										<h4 class="font-semibold text-foreground mb-2">Cost Breakdown</h4>
										<div class="space-y-2 text-sm">
											<div class="flex justify-between">
												<span class="text-muted-foreground">Entry Fee:</span>
												<span class="text-emerald-400">{formatCurrency(totalCost)}</span>
											</div>
											<div class="flex justify-between">
												<span class="text-muted-foreground">Total Pot:</span>
												<span class="font-bold text-emerald-400">{formatCurrency(totalPot)}</span>
											</div>
											<div class="flex justify-between">
												<span class="text-muted-foreground">Your Balance:</span>
												<span class={canAfford ? 'text-emerald-400' : 'text-destructive'}>
													{formatCurrency(userBalance)}
												</span>
											</div>
										</div>
									</div>
								</div>

								<Separator />

								<!-- Selected Cases List -->
								<div>
									<h4 class="font-semibold text-foreground mb-2">Cases ({selectedCases.length})</h4>
									<div class="flex flex-wrap gap-2">
										{#each selectedCases as case_ (case_.id)}
											<Badge variant="outline" class="gap-1">
												{case_.name} ({formatCurrency(case_.price)})
											</Badge>
										{/each}
									</div>
								</div>

								<!-- Validation Messages -->
								{#if !canAfford}
									<div class="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
										<AlertCircle class="h-5 w-5 text-destructive mt-0.5" />
										<div>
											<p class="text-sm font-medium text-destructive">Insufficient Balance</p>
											<p class="text-sm text-muted-foreground">
												You need {formatCurrency(totalCost - userBalance)} more to create this battle
											</p>
										</div>
									</div>
								{:else if selectedCases.length === 0}
									<div class="flex items-start gap-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
										<Info class="h-5 w-5 text-warning mt-0.5" />
										<div>
											<p class="text-sm font-medium text-warning">No Cases Selected</p>
											<p class="text-sm text-muted-foreground">
												Please select at least one case to create a battle
											</p>
										</div>
									</div>
								{:else}
									<div class="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
										<CheckCircle class="h-5 w-5 text-emerald-400 mt-0.5" />
										<div>
											<p class="text-sm font-medium text-emerald-400">Ready to Create</p>
											<p class="text-sm text-muted-foreground">
												Your battle is configured and ready to be created
											</p>
										</div>
									</div>
								{/if}

								<!-- Error Message -->
								{#if createError}
									<div class="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
										<AlertCircle class="h-5 w-5 text-destructive mt-0.5" />
										<div>
											<p class="text-sm font-medium text-destructive">Creation Failed</p>
											<p class="text-sm text-muted-foreground">{createError}</p>
										</div>
									</div>
								{/if}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>

			<!-- Footer -->
			<footer class="p-6 border-t border-border/40">
				<div class="flex items-center justify-between">
					<div class="text-sm text-muted-foreground">
						{#if isValid}
							<span class="text-emerald-400">Ready to create battle</span>
						{:else if selectedCases.length === 0}
							Select cases to continue
						{:else if !canAfford}
							Insufficient balance
						{:else}
							Configuration incomplete
						{/if}
					</div>
					<div class="flex gap-3">
						<Button
							variant="outline"
							onclick={handleClose}
							disabled={isCreating}
						>
							Cancel
						</Button>
						<Button
							onclick={handleCreateBattle}
							disabled={!isValid || isCreating}
							class="min-w-[120px]"
						>
							{#if isCreating}
								<div class="flex items-center gap-2">
									<div class="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
									Creating...
								</div>
							{:else}
								<div class="flex items-center gap-2">
									<Trophy class="h-4 w-4" />
									Create Battle
								</div>
							{/if}
						</Button>
					</div>
				</div>
			</footer>
		</div>
	</div>
{/if}


