<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { UserProfile } from '$lib/types';

	interface ProfileCardProps extends HTMLAttributes<HTMLDivElement> {
		user: UserProfile;
		status?: 'online' | 'offline' | 'away';
	}

	let { user, status = 'offline', class: className, ...restProps }: ProfileCardProps = $props();

	// Generate fallback initials from username
	const initials = $derived(
		user.username
			.split(' ')
			.map((name) => name.charAt(0).toUpperCase())
			.slice(0, 2)
			.join('')
	);

	const statusColor = $derived(() => {
		switch (status) {
			case 'online':
				return 'bg-success';
			case 'away':
				return 'bg-warning';
			default:
				return 'bg-muted';
		}
	});
</script>

<div class="card bg-base-100 shadow-xl {className || ''}" {...restProps}>
	<div class="card-body">
		<div class="flex flex-row items-center space-x-4">
			<div class="relative">
				<div class="avatar">
					<div class="w-12 rounded-full">
						{#if user.avatar_url}
							<img src={user.avatar_url} alt={user.username} />
						{:else}
							<div class="placeholder avatar">
								<div class="w-12 rounded-full bg-neutral text-neutral-content">
									<span class="text-xl">{initials}</span>
								</div>
							</div>
						{/if}
					</div>
				</div>
				<!-- Status indicator -->
				<div
					class="absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-base-100 {statusColor}"
				></div>
			</div>
			<div class="flex-1">
				<h3 class="card-title text-lg">{user.username}</h3>
				{#if user.steam_id}
					<p class="text-sm text-base-content/70">Steam ID: {user.steam_id}</p>
				{/if}
			</div>
		</div>
		<div class="mt-4 card-actions justify-end">
			<div class="badge {status === 'online' ? 'badge-success' : 'badge-neutral'}">
				{status.charAt(0).toUpperCase() + status.slice(1)}
			</div>
		</div>
	</div>
</div>
