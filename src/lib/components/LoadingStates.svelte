<script lang="ts">

	interface Props {
		type?: 'skeleton' | 'spinner' | 'dots' | 'card' | 'case';
		size?: 'sm' | 'md' | 'lg';
		count?: number;
	}

	let { type = 'skeleton', size = 'md', count = 3 }: Props = $props();

	const sizeClasses = {
		sm: 'h-4',
		md: 'h-6',
		lg: 'h-8'
	};
</script>

{#if type === 'skeleton'}
	<!-- Enhanced Skeleton Loading with Gaming Theme -->
	<div class="space-y-4">
		{#each Array(count) as _, i (i)}
			<div class="animate-pulse">
				<div class="flex items-center gap-4">
					<div
						class="h-12 w-12 skeleton rounded-full bg-gradient-to-br from-base-300 to-base-200"
					></div>
					<div class="flex-1 space-y-2">
						<div
							class="skeleton {sizeClasses[
								size
							]} animate-shimmer rounded bg-gradient-to-r from-base-300 via-base-200 to-base-300 bg-[length:200%_100%]"
						></div>
						<div
							class="animate-shimmer h-4 w-3/4 skeleton rounded bg-gradient-to-r from-base-300 via-base-200 to-base-300 bg-[length:200%_100%]"
						></div>
					</div>
				</div>
			</div>
		{/each}
	</div>
{:else if type === 'spinner'}
	<!-- Gaming-Themed Spinner -->
	<div class="flex items-center justify-center p-8">
		<div class="relative">
			<div class="h-16 w-16 rounded-full border-4 border-primary/30"></div>
			<div
				class="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-primary"
			></div>
			<div
				class="animate-reverse absolute inset-2 h-12 w-12 animate-spin rounded-full border-4 border-transparent border-t-accent"
				style="animation-duration: 1.5s;"
			></div>
		</div>
	</div>
{:else if type === 'dots'}
	<!-- Gaming Loading Dots -->
	<div class="flex items-center justify-center gap-2 p-4">
		{#each Array(3) as _, i (i)}
			<div
				class="h-3 w-3 animate-bounce rounded-full bg-primary"
				style="animation-delay: {i * 0.2}s;"
			></div>
		{/each}
	</div>
{:else if type === 'card'}
	<!-- Enhanced Card Skeleton for Gaming -->
	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each Array(count) as _, i (i)}
			<div class="card animate-pulse border border-base-300 bg-base-100 shadow-xl">
				<figure
					class="animate-shimmer h-32 bg-gradient-to-br from-base-300 via-base-200 to-base-300 bg-[length:200%_100%]"
				></figure>
				<div class="card-body p-4">
					<div
						class="animate-shimmer mb-2 h-6 w-3/4 skeleton rounded bg-gradient-to-r from-base-300 via-base-200 to-base-300 bg-[length:200%_100%]"
					></div>
					<div
						class="animate-shimmer mb-1 h-4 w-full skeleton rounded bg-gradient-to-r from-base-300 via-base-200 to-base-300 bg-[length:200%_100%]"
					></div>
					<div
						class="animate-shimmer mb-4 h-4 w-2/3 skeleton rounded bg-gradient-to-r from-base-300 via-base-200 to-base-300 bg-[length:200%_100%]"
					></div>

					<div class="mb-4 flex items-center justify-between">
						<div
							class="animate-shimmer h-8 w-20 skeleton rounded bg-gradient-to-r from-base-300 via-base-200 to-base-300 bg-[length:200%_100%]"
						></div>
						<div
							class="animate-shimmer h-6 w-16 skeleton rounded bg-gradient-to-r from-base-300 via-base-200 to-base-300 bg-[length:200%_100%]"
						></div>
					</div>

					<div
						class="animate-shimmer h-12 w-full skeleton rounded bg-gradient-to-r from-base-300 via-base-200 to-base-300 bg-[length:200%_100%]"
					></div>
				</div>
			</div>
		{/each}
	</div>
{:else if type === 'case'}
	<!-- Specialized Case Opening Loading -->
	<div class="flex flex-col items-center justify-center space-y-6 p-8">
		<!-- Spinning Case Icon -->
		<div class="relative">
			<div
				class="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20"
			>
				<div
					class="h-16 w-16 animate-spin rounded-xl bg-gradient-to-br from-primary to-accent"
				></div>
			</div>
			<div class="absolute -inset-4 animate-pulse rounded-full bg-primary/20 blur-xl"></div>
		</div>

		<!-- Loading Text with Gaming Flair -->
		<div class="space-y-2 text-center">
			<div
				class="bg-gradient-to-r from-primary to-accent bg-clip-text text-lg font-bold text-transparent"
			>
				Opening Case...
			</div>
			<div class="flex items-center gap-1">
				<span class="text-sm text-base-content/70">Generating random outcome</span>
				<div class="flex gap-1">
					{#each Array(3) as _, i (i)}
						<div
							class="h-1 w-1 animate-bounce rounded-full bg-primary"
							style="animation-delay: {i * 0.3}s;"
						></div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Progress Bar -->
		<div class="h-2 w-64 overflow-hidden rounded-full bg-base-300">
			<div
				class="h-full animate-pulse rounded-full bg-gradient-to-r from-primary via-accent to-secondary"
			></div>
		</div>
	</div>
{/if}

<style>
	@keyframes shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}

	@keyframes reverse {
		from {
			transform: rotate(360deg);
		}
		to {
			transform: rotate(0deg);
		}
	}

	.animate-shimmer {
		animation: shimmer 2s infinite;
	}

	.animate-reverse {
		animation: reverse 2s infinite linear;
	}

	/* Skeleton loading improvements */
	.skeleton {
		border-radius: 0.5rem;
		position: relative;
		overflow: hidden;
	}

	.skeleton::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
		transform: translateX(-100%);
		animation: skeleton-loading 2s infinite;
	}

	@keyframes skeleton-loading {
		100% {
			transform: translateX(100%);
		}
	}
</style>
