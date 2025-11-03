<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<!--
	(auth) Layout Group
	- Login/register routes
	- No shell/sidebars - just centered auth forms
	- Breaks out of root layout using @.svelte suffix
-->
<div class="bg-background flex min-h-screen items-center justify-center px-4">
	<div class="w-full max-w-md">
		{@render children()}
	</div>
</div>
