<script lang="ts">
	import ProfileCard from '$lib/components/ProfileCard.svelte';
	import { Trophy, Target, TrendingUp, DollarSign } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Profile - TopRoll</title>
</svelte:head>

<div class="container mx-auto py-8">
	<h1 class="mb-6 text-3xl font-bold">Your Profile</h1>

	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		<!-- Profile Card -->
		<div class="md:col-span-1">
			<ProfileCard user={data.profile} status="online" />
		</div>

		<!-- Stats Cards -->
		<div class="md:col-span-1 lg:col-span-2">
			<div class="grid gap-4 md:grid-cols-2">
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body">
						<h3 class="card-title flex items-center gap-2 text-sm font-medium">
							<DollarSign class="h-4 w-4" />
							Total Wagered
						</h3>
						<p class="text-2xl font-bold">
							${data.profile?.total_wagered?.toLocaleString() || '0'}
						</p>
					</div>
				</div>

				<div class="card bg-base-100 shadow-xl">
					<div class="card-body">
						<h3 class="card-title flex items-center gap-2 text-sm font-medium">
							<TrendingUp class="h-4 w-4" />
							Total Profit
						</h3>
						<p
							class="text-2xl font-bold {data.profile?.total_profit &&
							data.profile.total_profit >= 0
								? 'text-success'
								: 'text-error'}"
						>
							${data.profile?.total_profit?.toLocaleString() || '0'}
						</p>
					</div>
				</div>

				<div class="card bg-base-100 shadow-xl">
					<div class="card-body">
						<h3 class="card-title flex items-center gap-2 text-sm font-medium">
							<Target class="h-4 w-4" />
							Win Rate
						</h3>
						<p class="text-2xl font-bold">{data.profile?.win_rate || 0}%</p>
					</div>
				</div>

				<div class="card bg-base-100 shadow-xl">
					<div class="card-body">
						<h3 class="card-title flex items-center gap-2 text-sm font-medium">
							<Trophy class="h-4 w-4" />
							Biggest Win
						</h3>
						<p class="text-2xl font-bold">${data.profile?.biggest_win?.toLocaleString() || '0'}</p>
					</div>
				</div>

				<div class="card bg-base-100 shadow-xl md:col-span-2">
					<div class="card-body">
						<h3 class="card-title flex items-center gap-2 text-sm font-medium">
							<Trophy class="h-4 w-4" />
							Case Battle Wins
						</h3>
						<p class="text-2xl font-bold">{data.profile?.case_battle_wins || 0}</p>
						<p class="mt-1 text-sm text-base-content/70">Victories in case battles</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
