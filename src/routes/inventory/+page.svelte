<script lang="ts">
	import InventoryGrid from '$lib/components/InventoryGrid.svelte';
	import { ExternalLink, RefreshCw, Shield } from 'lucide-svelte';
	import type { PageData } from './$types';
	import {
		Button,
		Card,
		CardHeader,
		CardContent,
		CardTitle,
		CardDescription,
		Badge,
		Alert
	} from '$lib/components/ui';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Inventory - TopRoll</title>
</svelte:head>

<div class="space-y-8">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="text-foreground text-3xl font-semibold">Portfolio holdings</h1>
			<p class="text-muted-foreground text-sm">
				Monitor your CS2 skins, mark-to-market valuations, and liquidation status.
			</p>
		</div>
		<div class="flex flex-wrap items-center gap-3">
			<Badge variant={data.inventoryPublic ? 'success' : 'destructive'} class="gap-1">
				<Shield class="h-3.5 w-3.5" />
				{data.inventoryPublic ? 'Public' : 'Private'}
			</Badge>
			<Button variant="outline" size="sm" class="gap-2">
				<RefreshCw class="h-4 w-4" />
				Refresh
			</Button>
		</div>
	</div>

	{#if !data.inventoryPublic}
		<Alert variant="warning" class="items-start gap-3">
			<Shield class="h-5 w-5" />
			<div class="space-y-2 text-sm">
				<p class="text-foreground font-medium">Your Steam inventory is private</p>
				<p class="text-muted-foreground">
					Set your inventory to public so TopRoll can value and display your skins. This change only
					affects your Steam privacy settings.
				</p>
				<a
					href="https://help.steampowered.com/en/faqs/view/2A12-9D79-DA21-31"
					target="_blank"
					rel="noopener noreferrer"
					class="text-primary duration-subtle ease-market-ease hover:text-primary/80 focus-visible:ring-primary/60 focus-visible:ring-offset-background inline-flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
				>
					How to update privacy
					<ExternalLink class="h-3.5 w-3.5" />
				</a>
			</div>
		</Alert>

		<Card class="border-border/60 bg-surface/70 border">
			<CardHeader class="border-0 pb-4">
				<CardTitle>Make your inventory visible</CardTitle>
				<CardDescription>Quick steps to update your Steam privacy controls.</CardDescription>
			</CardHeader>
			<CardContent class="text-muted-foreground space-y-4 text-sm">
				<div class="flex items-start gap-3">
					<span
						class="border-primary/50 bg-primary/15 text-primary flex h-7 w-7 items-center justify-center rounded-md border text-sm font-semibold"
						>1</span
					>
					<div>
						<p class="text-foreground font-medium">Open Steam in a browser</p>
						<p>Log in at steamcommunity.com</p>
					</div>
				</div>
				<div class="flex items-start gap-3">
					<span
						class="border-primary/50 bg-primary/15 text-primary flex h-7 w-7 items-center justify-center rounded-md border text-sm font-semibold"
						>2</span
					>
					<div>
						<p class="text-foreground font-medium">Navigate to your profile</p>
						<p>Click your username in the top-right corner</p>
					</div>
				</div>
				<div class="flex items-start gap-3">
					<span
						class="border-primary/50 bg-primary/15 text-primary flex h-7 w-7 items-center justify-center rounded-md border text-sm font-semibold"
						>3</span
					>
					<div>
						<p class="text-foreground font-medium">Edit profile & privacy</p>
						<p>Choose “Edit Profile” then open the “Privacy Settings” tab</p>
					</div>
				</div>
				<div class="flex items-start gap-3">
					<span
						class="border-primary/50 bg-primary/15 text-primary flex h-7 w-7 items-center justify-center rounded-md border text-sm font-semibold"
						>4</span
					>
					<div>
						<p class="text-foreground font-medium">Set inventory to public</p>
						<p>Locate “My Inventory” and change the dropdown to Public</p>
					</div>
				</div>
				<div class="flex items-start gap-3">
					<span
						class="border-primary/50 bg-primary/15 text-primary flex h-7 w-7 items-center justify-center rounded-md border text-sm font-semibold"
						>5</span
					>
					<div>
						<p class="text-foreground font-medium">Save and refresh</p>
						<p>Save your changes, then refresh this page to sync</p>
					</div>
				</div>
			</CardContent>
		</Card>
	{:else if data.items && data.items.length > 0}
		<div class="space-y-4">
			<Card class="border-border/60 bg-surface/70 border">
				<CardContent class="text-muted-foreground flex items-center justify-between p-5 text-sm">
					<span>Displaying {data.items.length} items from Steam</span>
					<span>Valuations updated every 15 minutes</span>
				</CardContent>
			</Card>
			<div class="border-border/60 bg-surface/60 rounded-xl border p-4">
				<InventoryGrid items={data.items} loading={false} selectable={true} />
			</div>
		</div>
	{:else}
		<Card class="border-border/60 bg-surface/70 border">
			<CardHeader class="border-0 pb-2">
				<CardTitle>No items found</CardTitle>
				<CardDescription
					>We could not detect any tradable skins in your Steam inventory.</CardDescription
				>
			</CardHeader>
			<CardContent class="flex items-center justify-between p-4">
				<p class="text-muted-foreground text-sm">
					Refresh after depositing or ensure your inventory API is accessible.
				</p>
				<Button variant="outline" class="gap-2">
					<RefreshCw class="h-4 w-4" />
					Try again
				</Button>
			</CardContent>
		</Card>
	{/if}
</div>
