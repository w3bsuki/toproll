<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { Separator } from '$lib/components/ui/separator';
	import { HeroBanner } from '$lib/features/home';
	import {
		Shield,
		CheckCircle,
		Copy,
		RefreshCw,
		Info,
		Key,
		Hash,
		Database,
		AlertCircle,
		ExternalLink
	} from '@lucide/svelte';
	import type { ServerSeed, ProvablyFairRoll, Case, CaseItem } from '$lib/types/index';

	// Reactive state with Svelte 5 runes
	let serverSeed = $state('');
	let clientSeed = $state('');
	let nonce = $state(0);
	let caseId = $state('');
	let isVerifying = $state(false);
	let verificationResult = $state<{
		success: boolean;
		item?: CaseItem;
		roll?: number;
		error?: string;
		details?: any;
	} | null>(null);
	let activeTab = $state('verify');

	// Mock case data for verification
	const mockCases: Case[] = [
		{
			id: 'case-1',
			name: 'Dreams & Nightmares',
			description: 'A mystical case with rare items',
			image_url: '/cases/dreams-nightmares.jpg',
			price: 5.0,
			item_count: 17,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		},
		{
			id: 'case-2',
			name: 'Fracture',
			description: 'A case with fractured dreams and nightmares',
			image_url: '/cases/fracture.jpg',
			price: 6.0,
			item_count: 17,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		}
	];

	// Mock verification history
	let verificationHistory = $state<ProvablyFairRoll[]>([
		{
			server_seed: 'abc123def456',
			client_seed: 'user-seed-789',
			nonce: 1,
			hash: 'hash-result-123',
			roll: 42,
			item_id: 'item-1'
		},
		{
			server_seed: 'xyz789uvw456',
			client_seed: 'user-seed-456',
			nonce: 2,
			hash: 'hash-result-456',
			roll: 15,
			item_id: 'item-2'
		}
	]);

	// Mock active seeds
	let activeSeeds = $state<ServerSeed[]>([
		{
			seed: 'pending-seed-123',
			seed_hash: 'hash-123abc',
			created_at: new Date().toISOString(),
			revealed_at: undefined,
			is_active: true
		},
		{
			seed: 'revealed-seed-456',
			seed_hash: 'hash-456def',
			created_at: new Date(Date.now() - 86400000).toISOString(),
			revealed_at: new Date(Date.now() - 3600000).toISOString(),
			is_active: false
		}
	]);

	// Generate random seeds for testing
	function generateRandomSeed(length: number = 32): string {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let result = '';
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}

	// Fill form with random test data
	function fillTestData() {
		serverSeed = generateRandomSeed();
		clientSeed = generateRandomSeed(16);
		nonce = Math.floor(Math.random() * 100);
		caseId = mockCases[Math.floor(Math.random() * mockCases.length)].id;
	}

	// Copy text to clipboard
	async function copyToClipboard(text: string) {
		try {
			await navigator.clipboard.writeText(text);
			// TODO: Show success toast
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}

	// Simulate verification process
	async function performVerification() {
		if (!serverSeed || !clientSeed || !caseId) {
			verificationResult = {
				success: false,
				error: 'Please fill in all required fields'
			};
			return;
		}

		isVerifying = true;
		verificationResult = null;

		// Simulate verification delay
		await new Promise((resolve) => setTimeout(resolve, 2000));

		try {
			// Simulate verification logic
			const mockRoll = Math.floor(Math.random() * 100);
			const mockItem: CaseItem = {
				id: 'item-' + mockRoll,
				case_id: caseId,
				name: 'AK-47 | Redline',
				market_name: 'AK-47 | Redline (Field-Tested)',
				image_url: '/items/ak47-redline.jpg',
				rarity: 'Epic',
				probability: 3.5,
				market_value: 25.5,
				created_at: new Date().toISOString()
			};

			verificationResult = {
				success: true,
				item: mockItem,
				roll: mockRoll,
				details: {
					server_seed: serverSeed,
					client_seed: clientSeed,
					nonce: nonce,
					computed_hash: 'hash-' + mockRoll,
					verification_timestamp: new Date().toISOString()
				}
			};
		} catch (error) {
			verificationResult = {
				success: false,
				error: error instanceof Error ? error.message : 'Verification failed'
			};
		} finally {
			isVerifying = false;
		}
	}

	// Format date for display
	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleString();
	}

	// Get rarity color
	function getRarityColor(rarity: CaseItem['rarity']) {
		const colors = {
			Common: 'bg-surface-muted text-surface-muted-foreground border-border/70',
			Uncommon: 'bg-secondary/20 text-secondary-foreground border-secondary/60',
			Rare: 'bg-primary/15 text-primary border-primary/50',
			Epic: 'bg-accent/20 text-accent-foreground border-accent/50',
			Legendary: 'bg-warning/20 text-warning-foreground border-warning/55',
			Contraband: 'bg-destructive/20 text-destructive-foreground border-destructive/60'
		};
		return colors[rarity] || colors.Common;
	}
</script>

<svelte:head>
	<title>Provably Fair Verifier - TopRoll</title>
	<meta name="description" content="Verify the fairness of your case openings and battles" />
</svelte:head>

<!-- Hero Banner -->
<HeroBanner />

<!-- Main Content -->
<section class="container mx-auto max-w-6xl px-4 py-6">
	<!-- Header -->
	<header class="mb-8 text-center">
		<div class="mb-4 flex items-center justify-center gap-3">
			<Shield class="text-primary h-8 w-8" />
			<h1 class="text-foreground text-3xl font-bold">Provably Fair Verifier</h1>
		</div>
		<p class="text-muted-foreground mx-auto max-w-2xl text-lg">
			Verify the fairness of every case opening and battle. Our system uses cryptographic hashes to
			ensure transparent and tamper-proof results.
		</p>
	</header>

	<!-- Verification Tabs -->
	<Tabs bind:value={activeTab} class="mb-8">
		<TabsList class="mx-auto grid w-full max-w-md grid-cols-3">
			<TabsTrigger value="verify" class="gap-2">
				<CheckCircle class="h-4 w-4" />
				Verify
			</TabsTrigger>
			<TabsTrigger value="seeds" class="gap-2">
				<Key class="h-4 w-4" />
				Seeds
			</TabsTrigger>
			<TabsTrigger value="history" class="gap-2">
				<Database class="h-4 w-4" />
				History
			</TabsTrigger>
		</TabsList>

		<!-- Verify Tab -->
		<TabsContent value="verify" class="space-y-6">
			<div class="grid gap-6 lg:grid-cols-2">
				<!-- Verification Form -->
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							<Shield class="h-5 w-5" />
							Verification Details
						</CardTitle>
						<CardDescription>
							Enter the verification details from your case opening or battle
						</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="space-y-2">
							<label for="server-seed" class="text-foreground text-sm font-medium">
								Server Seed (Revealed)
							</label>
							<div class="relative">
								<Input
									id="server-seed"
									bind:value={serverSeed}
									placeholder="Enter the revealed server seed"
									class="pr-10"
								/>
								<Button
									variant="ghost"
									size="icon"
									class="absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2"
									onclick={() => copyToClipboard(serverSeed)}
								>
									<Copy class="h-3 w-3" />
								</Button>
							</div>
						</div>

						<div class="space-y-2">
							<label for="client-seed" class="text-foreground text-sm font-medium">
								Client Seed
							</label>
							<div class="relative">
								<Input
									id="client-seed"
									bind:value={clientSeed}
									placeholder="Enter your client seed"
									class="pr-10"
								/>
								<Button
									variant="ghost"
									size="icon"
									class="absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2"
									onclick={() => copyToClipboard(clientSeed)}
								>
									<Copy class="h-3 w-3" />
								</Button>
							</div>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<label for="nonce" class="text-foreground text-sm font-medium"> Nonce </label>
								<Input id="nonce" type="number" bind:value={nonce} placeholder="0" min="0" />
							</div>
							<div class="space-y-2">
								<label for="case-id" class="text-foreground text-sm font-medium"> Case ID </label>
								<Input id="case-id" bind:value={caseId} placeholder="case-id" />
							</div>
						</div>

						<div class="flex gap-2 pt-2">
							<Button onclick={performVerification} disabled={isVerifying} class="flex-1">
								{#if isVerifying}
									<RefreshCw class="mr-2 h-4 w-4 animate-spin" />
									Verifying...
								{:else}
									<CheckCircle class="mr-2 h-4 w-4" />
									Verify Result
								{/if}
							</Button>
							<Button variant="outline" onclick={fillTestData} class="gap-2">
								<RefreshCw class="h-4 w-4" />
								Test Data
							</Button>
						</div>
					</CardContent>
				</Card>

				<!-- Verification Result -->
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							<CheckCircle class="h-5 w-5" />
							Verification Result
						</CardTitle>
						<CardDescription>The result of your verification</CardDescription>
					</CardHeader>
					<CardContent>
						{#if verificationResult === null}
							<div class="py-8 text-center">
								<Info class="text-muted-foreground mx-auto mb-4 h-12 w-12" />
								<p class="text-muted-foreground">
									Enter verification details and click "Verify Result" to see the outcome
								</p>
							</div>
						{:else if verificationResult.success && verificationResult.item}
							<div class="space-y-4">
								<!-- Success Message -->
								<div class="flex items-center gap-2 text-emerald-400">
									<CheckCircle class="h-5 w-5" />
									<span class="font-medium">Verification Successful</span>
								</div>

								<!-- Item Result -->
								<div
									class="bg-surface border-border/40 flex items-center gap-4 rounded-lg border p-4"
								>
									{#if verificationResult.item.image_url}
										<img
											src={verificationResult.item.image_url}
											alt={verificationResult.item.name}
											class="h-16 w-16 rounded-lg object-cover"
										/>
									{/if}
									<div class="flex-1">
										<h3 class="text-foreground font-semibold">
											{verificationResult.item.name}
										</h3>
										<div class="mt-1 flex items-center gap-2">
											<Badge
												variant="outline"
												class={getRarityColor(verificationResult.item.rarity)}
											>
												{verificationResult.item.rarity}
											</Badge>
											<span class="text-muted-foreground text-sm">
												Roll: #{verificationResult.roll}
											</span>
										</div>
									</div>
									<div class="text-right">
										<p class="font-bold text-emerald-400">
											${verificationResult.item.market_value.toFixed(2)}
										</p>
									</div>
								</div>

								<!-- Verification Details -->
								<details class="text-sm">
									<summary class="text-foreground mb-2 cursor-pointer font-medium">
										Verification Details
									</summary>
									<div
										class="text-muted-foreground bg-surface/50 mt-2 space-y-2 rounded p-3 font-mono text-xs"
									>
										<div>Server Seed: {verificationResult.details?.server_seed}</div>
										<div>Client Seed: {verificationResult.details?.client_seed}</div>
										<div>Nonce: {verificationResult.details?.nonce}</div>
										<div>Hash: {verificationResult.details?.computed_hash}</div>
										<div>
											Verified: {formatDate(
												verificationResult.details?.verification_timestamp || ''
											)}
										</div>
									</div>
								</details>
							</div>
						{:else}
							<!-- Error State -->
							<div class="py-8 text-center">
								<AlertCircle class="text-destructive mx-auto mb-4 h-12 w-12" />
								<p class="text-destructive mb-2 font-medium">Verification Failed</p>
								<p class="text-muted-foreground text-sm">
									{verificationResult.error || 'An unknown error occurred'}
								</p>
							</div>
						{/if}
					</CardContent>
				</Card>
			</div>

			<!-- How It Works -->
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<Info class="h-5 w-5" />
						How Provably Fair Works
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="grid gap-6 md:grid-cols-3">
						<div class="text-center">
							<div
								class="bg-primary/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
							>
								<Key class="text-primary h-6 w-6" />
							</div>
							<h3 class="text-foreground mb-2 font-semibold">1. Server Seed Hash</h3>
							<p class="text-muted-foreground text-sm">
								Before each game, we generate a random server seed and show you its hash
							</p>
						</div>
						<div class="text-center">
							<div
								class="bg-primary/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
							>
								<Hash class="text-primary h-6 w-6" />
							</div>
							<h3 class="text-foreground mb-2 font-semibold">2. Combined with Client Seed</h3>
							<p class="text-muted-foreground text-sm">
								Your client seed is combined with the server seed to determine the outcome
							</p>
						</div>
						<div class="text-center">
							<div
								class="bg-primary/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
							>
								<CheckCircle class="text-primary h-6 w-6" />
							</div>
							<h3 class="text-foreground mb-2 font-semibold">3. Verifiable Results</h3>
							<p class="text-muted-foreground text-sm">
								After the game, we reveal the server seed so you can verify the result was fair
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</TabsContent>

		<!-- Seeds Tab -->
		<TabsContent value="seeds" class="space-y-6">
			<div class="grid gap-6">
				<!-- Active Seeds -->
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							<Key class="h-5 w-5" />
							Active Server Seeds
						</CardTitle>
						<CardDescription>Current and recent server seeds used in games</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-4">
							{#each activeSeeds as seed (seed.seed_hash)}
								<div
									class="bg-surface border-border/40 flex items-center justify-between rounded-lg border p-4"
								>
									<div class="flex items-center gap-4">
										<div class="text-right">
											<p class="text-muted-foreground text-sm">Seed Hash</p>
											<p
												class="text-foreground bg-surface-muted rounded px-2 py-1 font-mono text-xs"
											>
												{seed.seed_hash}
											</p>
										</div>
										<Separator orientation="vertical" class="h-8" />
										<div>
											<p class="text-muted-foreground text-sm">Created</p>
											<p class="text-foreground text-sm">{formatDate(seed.created_at)}</p>
										</div>
										{#if seed.revealed_at}
											<div>
												<p class="text-muted-foreground text-sm">Revealed</p>
												<p class="text-foreground text-sm">{formatDate(seed.revealed_at)}</p>
											</div>
										{/if}
									</div>
									<div class="flex items-center gap-2">
										<Badge variant={seed.is_active ? 'default' : 'outline'}>
											{seed.is_active ? 'Active' : 'Revealed'}
										</Badge>
										{#if !seed.is_active && seed.seed}
											<Button
												variant="outline"
												size="sm"
												class="gap-1"
												onclick={() => copyToClipboard(seed.seed!)}
											>
												<Copy class="h-3 w-3" />
												Copy Seed
											</Button>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</CardContent>
				</Card>

				<!-- Seed Generation Info -->
				<Card>
					<CardHeader>
						<CardTitle>Seed Generation Process</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="prose prose-invert max-w-none">
							<p class="text-muted-foreground">
								Our server seeds are generated using cryptographically secure random number
								generators (CSPRNG) to ensure unpredictability and fairness. Each seed is used for
								multiple games before being revealed and replaced with a new one.
							</p>
							<div class="bg-surface/50 border-border/40 mt-4 rounded-lg border p-4">
								<h4 class="text-foreground mb-2 font-semibold">Technical Details:</h4>
								<ul class="text-muted-foreground space-y-1 text-sm">
									<li>• Seed generation uses Node.js crypto.randomBytes()</li>
									<li>• Seeds are 32 bytes (256 bits) of entropy</li>
									<li>• Hashes use SHA-256 algorithm</li>
									<li>• Each seed handles approximately 1000 games</li>
									<li>• Seeds are rotated automatically for security</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</TabsContent>

		<!-- History Tab -->
		<TabsContent value="history" class="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<Database class="h-5 w-5" />
						Verification History
					</CardTitle>
					<CardDescription>Recent verifications and their results</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="space-y-4">
						{#each verificationHistory as roll (roll.hash)}
							<div
								class="bg-surface border-border/40 flex items-center justify-between rounded-lg border p-4"
							>
								<div class="flex items-center gap-4">
									<div class="text-center">
										<p class="text-primary text-2xl font-bold">#{roll.roll}</p>
										<p class="text-muted-foreground text-xs">Roll</p>
									</div>
									<Separator orientation="vertical" class="h-8" />
									<div>
										<p class="text-muted-foreground text-sm">Server Seed Hash</p>
										<p class="text-foreground bg-surface-muted rounded px-2 py-1 font-mono text-xs">
											{roll.server_seed.slice(0, 8)}...
										</p>
									</div>
									<div>
										<p class="text-muted-foreground text-sm">Client Seed</p>
										<p class="text-foreground bg-surface-muted rounded px-2 py-1 font-mono text-xs">
											{roll.client_seed.slice(0, 8)}...
										</p>
									</div>
									<div>
										<p class="text-muted-foreground text-sm">Nonce</p>
										<p class="text-foreground font-mono text-sm">{roll.nonce}</p>
									</div>
								</div>
								<div class="flex items-center gap-2">
									<Badge variant="outline" class="border-emerald-400/30 text-emerald-400">
										Verified
									</Badge>
									<Button variant="ghost" size="sm" class="gap-1">
										<ExternalLink class="h-3 w-3" />
										View Details
									</Button>
								</div>
							</div>
						{/each}
					</div>
				</CardContent>
			</Card>
		</TabsContent>
	</Tabs>
</section>
