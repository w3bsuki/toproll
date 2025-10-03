<script lang="ts">
	import { Badge, Button } from '$lib/components/ui';
	import { Wallet, Plus, Minus, RefreshCw } from '@lucide/svelte';

	export interface SteamBalanceProps {
		balance: number;
		pendingBalance?: number;
		loading?: boolean;
		onRefresh?: () => void;
		onAddFunds?: () => void;
		onWithdraw?: () => void;
		compact?: boolean;
		showActions?: boolean;
		class?: string;
	}

	let {
		balance,
		pendingBalance = 0,
		loading = false,
		onRefresh,
		onAddFunds,
		onWithdraw,
		compact = false,
		showActions = true,
		class: className = ''
	}: SteamBalanceProps = $props();

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(amount);
	};

	const totalBalance = balance + pendingBalance;
</script>

<div class={className}>
	{#if compact}
		<!-- Compact version for header/sidebar -->
		<div class="bg-surface/60 border-border/40 flex items-center gap-2 rounded-xl border px-3 py-2">
			<Wallet class="text-primary h-4 w-4" />
			<div class="flex flex-col">
				<span class="text-muted-foreground text-xs">Balance</span>
				<span class="text-sm font-bold text-white">
					{formatCurrency(balance)}
				</span>
			</div>
			{#if pendingBalance > 0}
				<Badge class="bg-yellow-500/20 text-xs text-yellow-300">
					+{formatCurrency(pendingBalance)} pending
				</Badge>
			{/if}
		</div>
	{:else}
		<!-- Full version for profile/wallet pages -->
		<div class="bg-surface/50 border-border/40 space-y-6 rounded-3xl border-2 p-6">
			<!-- Header -->
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="bg-primary/20 text-primary rounded-2xl p-3">
						<Wallet class="h-6 w-6" />
					</div>
					<div>
						<h3 class="text-lg font-bold text-white">Wallet Balance</h3>
						<p class="text-muted-foreground text-sm">Available funds</p>
					</div>
				</div>
				{#if onRefresh}
					<Button variant="outline" size="sm" class="gap-2" onclick={onRefresh} disabled={loading}>
						<RefreshCw class="h-4 w-4 {loading ? 'animate-spin' : ''}" />
						Refresh
					</Button>
				{/if}
			</div>

			<!-- Balance Display -->
			<div class="space-y-3">
				<div class="bg-background/50 border-border/30 rounded-2xl border p-4">
					<div class="flex items-center justify-between">
						<span class="text-muted-foreground text-sm">Available Balance</span>
						<span class="text-3xl font-bold text-white">
							{formatCurrency(balance)}
						</span>
					</div>
				</div>

				{#if pendingBalance > 0}
					<div class="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<Badge class="bg-yellow-500/20 text-xs text-yellow-300">Pending</Badge>
								<span class="text-muted-foreground text-sm"> Funds being processed </span>
							</div>
							<span class="text-lg font-bold text-yellow-300">
								{formatCurrency(pendingBalance)}
							</span>
						</div>
					</div>
				{/if}

				{#if pendingBalance > 0}
					<div class="bg-surface/50 border-border/30 rounded-2xl border p-4">
						<div class="flex items-center justify-between">
							<span class="text-muted-foreground text-sm">Total Balance</span>
							<span class="text-primary text-2xl font-bold">
								{formatCurrency(totalBalance)}
							</span>
						</div>
					</div>
				{/if}
			</div>

			<!-- Action Buttons -->
			{#if showActions}
				<div class="flex flex-col gap-3 sm:flex-row">
					{#if onAddFunds}
						<Button class="bg-primary text-primary-foreground flex-1 gap-2">
							<Plus class="h-4 w-4" />
							Add Funds
						</Button>
					{/if}
					{#if onWithdraw}
						<Button variant="outline" class="flex-1 gap-2">
							<Minus class="h-4 w-4" />
							Withdraw
						</Button>
					{/if}
					<Button variant="outline" class="gap-2">Transaction History</Button>
				</div>
			{/if}

			<!-- Quick Stats -->
			<div class="border-border/30 grid grid-cols-2 gap-4 border-t pt-4 sm:grid-cols-4">
				<div class="text-center">
					<div class="text-lg font-bold text-white">$0.00</div>
					<div class="text-muted-foreground text-xs">Today</div>
				</div>
				<div class="text-center">
					<div class="text-lg font-bold text-white">$0.00</div>
					<div class="text-muted-foreground text-xs">This Week</div>
				</div>
				<div class="text-center">
					<div class="text-lg font-bold text-white">$0.00</div>
					<div class="text-muted-foreground text-xs">This Month</div>
				</div>
				<div class="text-center">
					<div class="text-lg font-bold text-white">$0.00</div>
					<div class="text-muted-foreground text-xs">Total</div>
				</div>
			</div>
		</div>
	{/if}
</div>
