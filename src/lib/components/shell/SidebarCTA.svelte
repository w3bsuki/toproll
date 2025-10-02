<script lang="ts">
  import { cn } from '$lib/utils';
  import {
    Button,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
  } from '$lib/components/ui';

  let { class: className = '' } = $props<{ class?: string }>();
</script>

<Card class={cn('border-border/60 bg-surface-subdued text-foreground shadow-elevated-sm', className)}>
  <CardHeader>
    <CardTitle class="text-sm font-semibold">VIP Tournament</CardTitle>
    <CardDescription class="text-muted-foreground text-xs">Starting in 15 minutes</CardDescription>
  </CardHeader>
  <CardContent class="space-y-2 text-sm">
    <div class="flex items-center justify-between">
      <span class="text-muted-foreground">Prize Pool</span>
      <span class="font-semibold">$2,500</span>
    </div>
    <div class="flex items-center justify-between">
      <span class="text-muted-foreground">Players</span>
      <span class="font-semibold">24/32</span>
    </div>
  </CardContent>
  <CardFooter>
    <Button class="w-full">Join Tournament</Button>
  </CardFooter>
</Card>

