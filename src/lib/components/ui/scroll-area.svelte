<script lang="ts">
	import { cn } from '$lib/utils';

	type Props = {
		class?: string;
		viewportClass?: string;
	};

	const props = $props<Props>();
	const className = $derived(props.class ?? '');
	const viewportClass = $derived(props.viewportClass ?? '');
</script>

<div class={cn('relative', className)}>
	<div class={cn('scrollbar-elevated max-h-full overflow-y-auto', viewportClass)}>
		<slot />
	</div>
</div>
