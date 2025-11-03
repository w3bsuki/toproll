<script lang="ts">
	// Realtime Battle Demo is disabled and replaced with a minimal placeholder
	let { battleId, mode = 'participant' }: { battleId: string; mode?: 'participant' | 'spectator' } = $props();
	const disabled = true;
</script>
<svelte:head>
	<meta name="robots" content="noindex" />
</svelte:head>
{#if disabled}
	<p class="text-sm text-gray-500">Realtime Battle Demo disabled.</p>
{/if}
