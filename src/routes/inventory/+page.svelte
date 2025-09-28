<script lang="ts">
	import InventoryGrid from '$lib/components/InventoryGrid.svelte';
	import { ExternalLink, RefreshCw, Shield } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Inventory - TopRoll</title>
</svelte:head>

<div class="container mx-auto py-8">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Your Inventory</h1>
		<div class="flex items-center gap-2">
			{#if data.inventoryPublic}
				<div class="badge badge-success">
					<Shield class="mr-1 h-3 w-3" />
					Public
				</div>
			{:else}
				<div class="badge badge-error">
					<Shield class="mr-1 h-3 w-3" />
					Private
				</div>
			{/if}
			<button class="btn btn-outline btn-sm">
				<RefreshCw class="mr-2 h-4 w-4" />
				Refresh
			</button>
		</div>
	</div>

	{#if !data.inventoryPublic}
		<!-- Private Inventory Message -->
		<div class="mb-6 alert alert-warning">
			<Shield class="h-4 w-4" />
			<div>
				Your CS2 inventory is currently set to private. To view your items on TopRoll, please make
				your inventory public in Steam.
				<a
					href="https://help.steampowered.com/en/faqs/view/2A12-9D79-DA21-31"
					target="_blank"
					rel="noopener noreferrer"
					class="ml-2 inline-flex items-center text-blue-600 hover:text-blue-800"
				>
					How to make inventory public
					<ExternalLink class="ml-1 h-3 w-3" />
				</a>
			</div>
		</div>

		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">Make Your Inventory Public</h2>
				<p class="text-base-content/70">
					Follow these steps to make your Steam inventory visible to TopRoll and other third-party
					sites:
				</p>
				<div class="space-y-4">
					<div class="flex items-start gap-3">
						<div
							class="text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm font-semibold"
						>
							1
						</div>
						<div>
							<p class="font-medium">Open Steam in your browser</p>
							<p class="text-muted-foreground text-sm">
								Go to steamcommunity.com and log in to your account
							</p>
						</div>
					</div>
					<div class="flex items-start gap-3">
						<div
							class="text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm font-semibold"
						>
							2
						</div>
						<div>
							<p class="font-medium">Go to your Profile</p>
							<p class="text-muted-foreground text-sm">
								Click on your profile name at the top right
							</p>
						</div>
					</div>
					<div class="flex items-start gap-3">
						<div
							class="text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm font-semibold"
						>
							3
						</div>
						<div>
							<p class="font-medium">Edit Profile</p>
							<p class="text-muted-foreground text-sm">Click "Edit Profile" on your profile page</p>
						</div>
					</div>
					<div class="flex items-start gap-3">
						<div
							class="text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm font-semibold"
						>
							4
						</div>
						<div>
							<p class="font-medium">Privacy Settings</p>
							<p class="text-muted-foreground text-sm">
								In the "Privacy Settings" tab, find "My Inventory" and set it to "Public"
							</p>
						</div>
					</div>
					<div class="flex items-start gap-3">
						<div
							class="text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm font-semibold"
						>
							5
						</div>
						<div>
							<p class="font-medium">Save Changes</p>
							<p class="text-muted-foreground text-sm">
								Click "Save Changes" and refresh this page
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<!-- Public Inventory -->
		{#if data.items && data.items.length > 0}
			<div class="mb-4">
				<p class="text-muted-foreground">
					Showing {data.items.length} items from your Steam inventory
				</p>
			</div>
			<InventoryGrid items={data.items} loading={false} selectable={true} />
		{:else}
			<div class="card bg-base-100 shadow-xl">
				<div class="card-body">
					<h2 class="card-title">No Items Found</h2>
					<p class="text-base-content/70">
						Your inventory appears to be empty or we couldn't load your items.
					</p>
					<div class="card-actions">
						<button class="btn btn-outline">
							<RefreshCw class="mr-2 h-4 w-4" />
							Try Again
						</button>
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div>
