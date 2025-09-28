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
						class="skeleton from-base-300 to-base-200 h-12 w-12 rounded-full bg-gradient-to-br"
					></div>
					<div class="flex-1 space-y-2">
						<div
							class="skeleton {sizeClasses[
								size
							]} animate-shimmer from-base-300 via-base-200 to-base-300 rounded bg-gradient-to-r bg-[length:200%_100%]"
						></div>
						<div
							class="animate-shimmer skeleton from-base-300 via-base-200 to-base-300 h-4 w-3/4 rounded bg-gradient-to-r bg-[length:200%_100%]"
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
			<div class="border-primary/30 h-16 w-16 rounded-full border-4"></div>
			<div
				class="border-t-primary absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent"
			></div>
			<div
				class="animate-reverse border-t-accent absolute inset-2 h-12 w-12 animate-spin rounded-full border-4 border-transparent"
				style="animation-duration: 1.5s;"
			></div>
		</div>
	</div>
{:else if type === 'dots'}
	<!-- Gaming Loading Dots -->
	<div class="flex items-center justify-center gap-2 p-4">
		{#each Array(3) as _, i (i)}
			<div
				class="bg-primary h-3 w-3 animate-bounce rounded-full"
				style="animation-delay: {i * 0.2}s;"
			></div>
		{/each}
	</div>
{:else if type === 'card'}
	<!-- Enhanced Card Skeleton for Gaming -->
	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each Array(count) as _, i (i)}
			<div class="card border-base-300 bg-base-100 animate-pulse border shadow-xl">
				<figure
					class="animate-shimmer from-base-300 via-base-200 to-base-300 h-32 bg-gradient-to-br bg-[length:200%_100%]"
				></figure>
				<div class="card-body p-4">
					<div
						class="animate-shimmer skeleton from-base-300 via-base-200 to-base-300 mb-2 h-6 w-3/4 rounded bg-gradient-to-r bg-[length:200%_100%]"
					></div>
					<div
						class="animate-shimmer skeleton from-base-300 via-base-200 to-base-300 mb-1 h-4 w-full rounded bg-gradient-to-r bg-[length:200%_100%]"
					></div>
					<div
						class="animate-shimmer skeleton from-base-300 via-base-200 to-base-300 mb-4 h-4 w-2/3 rounded bg-gradient-to-r bg-[length:200%_100%]"
					></div>

					<div class="mb-4 flex items-center justify-between">
						<div
							class="animate-shimmer skeleton from-base-300 via-base-200 to-base-300 h-8 w-20 rounded bg-gradient-to-r bg-[length:200%_100%]"
						></div>
						<div
							class="animate-shimmer skeleton from-base-300 via-base-200 to-base-300 h-6 w-16 rounded bg-gradient-to-r bg-[length:200%_100%]"
						></div>
					</div>

					<div
						class="animate-shimmer skeleton from-base-300 via-base-200 to-base-300 h-12 w-full rounded bg-gradient-to-r bg-[length:200%_100%]"
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
				class="from-primary/20 to-accent/20 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br"
			>
				<div
					class="from-primary to-accent h-16 w-16 animate-spin rounded-xl bg-gradient-to-br"
				></div>
			</div>
			<div class="bg-primary/20 absolute -inset-4 animate-pulse rounded-full blur-xl"></div>
		</div>

		<!-- Loading Text with Gaming Flair -->
		<div class="space-y-2 text-center">
			<div
				class="from-primary to-accent bg-gradient-to-r bg-clip-text text-lg font-bold text-transparent"
			>
				Opening Case...
			</div>
			<div class="flex items-center gap-1">
				<span class="text-base-content/70 text-sm">Generating random outcome</span>
				<div class="flex gap-1">
					{#each Array(3) as _, i (i)}
						<div
							class="bg-primary h-1 w-1 animate-bounce rounded-full"
							style="animation-delay: {i * 0.3}s;"
						></div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Progress Bar -->
		<div class="bg-base-300 h-2 w-64 overflow-hidden rounded-full">
			<div
				class="from-primary via-accent to-secondary h-full animate-pulse rounded-full bg-gradient-to-r"
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
