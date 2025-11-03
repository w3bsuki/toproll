<script lang="ts">
	import {
		Button,
		Input,
		Label,
		Card,
		CardContent,
		CardHeader,
		CardTitle
	} from '$lib/components/ui';
	import { Coins, Users, AlertCircle, CheckCircle } from '@lucide/svelte';
	import type { Pot, PotEntry } from '$lib/types/index';

	export interface PotEntryModalProps {
		pot: Pot;
		userBalance: number;
		onSubmit: (ticketCount: number) => Promise<void>;
		onClose: () => void;
		isOpen: boolean;
		isLoading?: boolean;
	}

	let {
		pot,
		userBalance,
		onSubmit,
		onClose,
		isOpen,
		isLoading = false
	}: PotEntryModalProps = $props();

	let ticketCount = $state(1);
	let error = $state<string | null>(null);
	let success = $state(false);

	// Calculate derived values
	const totalCost = $derived(ticketCount * pot.entry_cost);
	const canAfford = $derived(userBalance >= totalCost);
	const availableTickets = $derived(pot.max_tickets - pot.total_tickets);
	const maxAffordableTickets = $derived(Math.floor(userBalance / pot.entry_cost));
	const maxTicketsAllowed = $derived(
		Math.min(availableTickets, pot.max_per_user, maxAffordableTickets)
	);

	// Preset ticket counts
	const presetCounts = $derived([1, 3, 5, 10].filter((count) => count <= maxTicketsAllowed));

	// Reset state when modal opens/closes
	$effect(() => {
		if (isOpen) {
			ticketCount = Math.min(1, maxTicketsAllowed);
			error = null;
			success = false;
		}
	});

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	};

	const handleSubmit = async () => {
		if (!canAfford) {
			error = 'Insufficient balance';
			return;
		}

		if (ticketCount > maxTicketsAllowed) {
			error = 'Exceeds maximum allowed tickets';
			return;
		}

		error = null;

		try {
			await onSubmit(ticketCount);
			success = true;

			// Close modal after successful submission
			setTimeout(() => {
				onClose();
			}, 1500);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to join pot';
		}
	};

	const handlePresetClick = (count: number) => {
		ticketCount = count;
		error = null;
	};

	const handleInputChange = (event: Event) => {
		const target = event.target as HTMLInputElement;
		const num = parseInt(target.value, 10);
		if (!isNaN(num) && num > 0) {
			ticketCount = Math.min(num, maxTicketsAllowed);
			error = null;
		}
	};

	// Keyboard shortcuts
	const handleKeydown = (event: KeyboardEvent) => {
		if (!isOpen) return;

		if (event.key === 'Escape') {
			onClose();
		} else if (event.key === 'Enter' && !isLoading && canAfford) {
			handleSubmit();
		}
	};

	// Add keyboard event listener
	$effect(() => {
		if (isOpen) {
			window.addEventListener('keydown', handleKeydown);
			return () => window.removeEventListener('keydown', handleKeydown);
		}
	});
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center">
		<!-- Backdrop -->
		<div
			class="absolute inset-0 bg-black/60 backdrop-blur-sm"
			role="button"
			tabindex="0"
			onclick={onClose}
			onkeydown={(e) => e.key === 'Enter' && onClose()}
		></div>

		<!-- Modal -->
		<div class="relative z-10 mx-4 w-full max-w-md">
			<Card class="shadow-2xl">
				<CardHeader class="text-center">
					<CardTitle
						class="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-2xl font-bold text-transparent"
					>
						Join Community Pot
					</CardTitle>
					<p class="text-muted-foreground mt-2">Enter for a chance to win the prize pool!</p>
				</CardHeader>

				<CardContent class="space-y-6">
					<!-- Pot Info -->
					<div class="bg-muted/50 space-y-2 rounded-lg p-4">
						<div class="flex items-center justify-between">
							<span class="text-muted-foreground text-sm">Prize Pool</span>
							<span class="text-lg font-bold">{formatCurrency(pot.total_value)}</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-muted-foreground text-sm">Entry Cost</span>
							<span class="font-semibold">{formatCurrency(pot.entry_cost)}</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-muted-foreground text-sm">Available Tickets</span>
							<span class="font-semibold">{availableTickets}</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-muted-foreground text-sm">Your Balance</span>
							<span class="flex items-center gap-1 font-semibold">
								<Coins class="h-4 w-4" />
								{formatCurrency(userBalance)}
							</span>
						</div>
					</div>

					{#if success}
						<!-- Success State -->
						<div class="py-4 text-center">
							<CheckCircle class="mx-auto mb-2 h-12 w-12 text-green-500" />
							<p class="text-lg font-semibold text-green-600">Successfully joined pot!</p>
							<p class="text-muted-foreground text-sm">You purchased {ticketCount} ticket(s)</p>
						</div>
					{:else}
						<!-- Ticket Selection -->
						<div class="space-y-4">
							<div>
								<Label for="ticket-count" class="text-sm font-medium">Number of Tickets</Label>
								<div class="mt-2">
									<Input
										id="ticket-count"
										type="number"
										min="1"
										max={maxTicketsAllowed}
										bind:value={ticketCount}
										oninput={handleInputChange}
										disabled={isLoading}
										class="text-center text-lg"
									/>
								</div>
								<p class="text-muted-foreground mt-1 text-xs">
									Max {maxTicketsAllowed} tickets per user
								</p>
							</div>

							<!-- Preset Buttons -->
							{#if presetCounts.length > 0}
								<div>
									<Label class="text-sm font-medium">Quick Select</Label>
									<div class="mt-2 flex gap-2">
										{#each presetCounts as count}
											<Button
												variant="outline"
												size="sm"
												onclick={() => handlePresetClick(count)}
												disabled={isLoading}
												class="flex-1"
											>
												{count}
											</Button>
										{/each}
									</div>
								</div>
							{/if}

							<!-- Cost Summary -->
							<div class="space-y-2 rounded-lg border p-3">
								<div class="flex items-center justify-between">
									<span class="text-sm">Tickets</span>
									<span class="font-semibold">{ticketCount}</span>
								</div>
								<div class="flex items-center justify-between">
									<span class="text-sm">Cost per ticket</span>
									<span class="font-semibold">{formatCurrency(pot.entry_cost)}</span>
								</div>
								<div class="bg-border my-2 h-px"></div>
								<div class="flex items-center justify-between">
									<span class="font-medium">Total Cost</span>
									<span class="text-lg font-bold {canAfford ? 'text-green-600' : 'text-red-600'}">
										{formatCurrency(totalCost)}
									</span>
								</div>
							</div>

							<!-- Error Message -->
							{#if error}
								<div class="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
									<AlertCircle class="h-4 w-4 text-red-500" />
									<span class="text-sm text-red-700">{error}</span>
								</div>
							{/if}

							<!-- Action Buttons -->
							<div class="flex gap-3">
								<Button variant="outline" onclick={onClose} disabled={isLoading} class="flex-1">
									Cancel
								</Button>
								<Button
									onclick={handleSubmit}
									disabled={isLoading || !canAfford || ticketCount === 0}
									class="flex-1"
								>
									{#if isLoading}
										Processing...
									{:else if !canAfford}
										Insufficient Balance
									{:else}
										Join Pot
									{/if}
								</Button>
							</div>
						</div>
					{/if}
				</CardContent>
			</Card>
		</div>
	</div>
{/if}
