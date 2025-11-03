<script lang="ts">
	import type { LayoutProps } from './$types';
	import type { Snippet } from 'svelte';

	let { data, children }: LayoutProps = $props();
</script>

<!--
	(app) Layout Group
	- All routes here require authentication (enforced in +layout.server.ts)
	- Inherits root layout (shell, sidebars, etc.)
	- Just passes through children
-->
{@render children()}
