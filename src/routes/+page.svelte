<script lang="ts">
        import { page } from '$app/stores';
        import HomeHero from '$lib/components/home/HomeHero.svelte';
        import LiveMarketplaceGrid from '$lib/components/home/LiveMarketplaceGrid.svelte';
        import CommunityPots from '$lib/components/home/CommunityPots.svelte';
        import { openChat } from '$lib/stores/ui';
        import {
                AlertCircle,
                Package,
                Users,
                TrendingUp,
                Zap,
                Shield,
                RefreshCw,
                MessageCircle,
                Crown,
                Sparkles
        } from 'lucide-svelte';
        import {
                Alert,
                Button,
                Card,
                CardContent,
                CardHeader,
                CardTitle,
                CardDescription,
                Badge
        } from '$lib/components/ui';

        interface Props {
                data: any;
        }

        let { data }: Props = $props();

        const error = $page.url.searchParams.get('error');

        const errorMessages: Record<string, { title: string; description: string; action?: string }> = {
                auth_required: {
                        title: 'Authentication Required',
                        description: 'Please sign in with Steam to access your profile and inventory.',
                        action: 'Sign In'
                },
                steam_auth_failed: {
                        title: 'Steam Authentication Failed',
                        description: 'There was a problem authenticating with Steam. Please try again.',
                        action: 'Try Again'
                },
                steam_profile_not_found: {
                        title: 'Steam Profile Not Found',
                        description: "We couldn't find your Steam profile. Please make sure your profile is public.",
                        action: 'Try Again'
                },
                config_error: {
                        title: 'Configuration Error',
                        description: "There's a temporary issue with our Steam integration. Please try again later.",
                        action: 'Try Later'
                },
                auth_failed: {
                        title: 'Authentication Failed',
                        description: 'Something went wrong during authentication. Please try signing in again.',
                        action: 'Try Again'
                }
        };

        const currentError = error ? errorMessages[error] : null;

        const marketPulse = [
                {
                        label: 'Cases opened today',
                        value: '1,247',
                        delta: '+6.2%',
                        icon: Package,
                        tone: 'text-primary'
                },
                {
                        label: 'Active traders',
                        value: '3,482',
                        delta: '+18%',
                        icon: Users,
                        tone: 'text-accent-foreground'
                },
                {
                        label: 'Total payouts 24h',
                        value: '$128,440',
                        delta: '+12%',
                        icon: TrendingUp,
                        tone: 'text-success'
                }
        ];

        const quickActions = [
                {
                        title: 'Start a case battle lobby',
                        description: 'Queue a 2v2 with curated case rotations and transparent rake.',
                        action: 'Create lobby',
                        icon: Crown
                },
                {
                        title: 'Chat with the floor',
                        description: 'Drop into the live chat to coordinate rain pot entries and flips.',
                        action: 'Open chat',
                        icon: MessageCircle,
                        handler: openChat
                }
        ];

        const flashUpdates = [
                {
                        title: 'Rain pot slots nearly full',
                        caption: '20 spots remain · $12.4k total'
                },
                {
                        title: 'Flash Drop Frenzy closes in 2m',
                        caption: 'Boosted odds still active'
                },
                {
                        title: 'VIP battle lobby spinning up',
                        caption: 'Average pot $3.2k · invite only'
                }
        ];
</script>

<svelte:head>
        <title>TopRoll - CS2 Marketplace</title>
</svelte:head>

<div class="space-y-12">
        {#if currentError}
                <Alert variant="destructive" class="items-start">
                        <AlertCircle class="h-5 w-5" />
                        <div class="space-y-2">
                                <p class="text-sm font-semibold">{currentError.title}</p>
                                <p class="text-muted-foreground text-sm">{currentError.description}</p>
                                {#if currentError.action === 'Sign In'}
                                        <form method="POST" action="/api/auth/steam/login">
                                                <Button type="submit" size="sm" class="mt-1">
                                                        <Shield class="h-4 w-4" />
                                                        Sign in with Steam
                                                </Button>
                                        </form>
                                {:else if currentError.action === 'Try Again'}
                                        <form method="POST" action="/api/auth/steam/login">
                                                <Button type="submit" variant="outline" size="sm" class="mt-1">
                                                        <RefreshCw class="h-4 w-4" />
                                                        Retry authentication
                                                </Button>
                                        </form>
                                {/if}
                        </div>
                </Alert>
        {/if}

        <HomeHero />

        <section class="grid gap-6 xl:grid-cols-[1.35fr,1fr]">
                <Card class="border-border/70 bg-surface/70 border">
                        <CardHeader class="flex flex-col gap-2 border-b border-border/60 pb-6">
                                <Badge variant="outline" class="w-fit">Marketplace pulse</Badge>
                                <CardTitle class="text-2xl font-semibold">Live performance snapshot</CardTitle>
                                <CardDescription>
                                        Transparent metrics refreshed every 30 seconds to keep you ahead of the market.
                                </CardDescription>
                        </CardHeader>
                        <CardContent class="grid gap-4 pt-6 sm:grid-cols-3">
                                {#each marketPulse as pulse}
                                        <div class="border-border/60 bg-surface-muted/40 rounded-2xl border p-5">
                                                <div class="flex items-center gap-3">
                                                        <span class={`border-border/60 bg-surface-muted/60 flex h-10 w-10 items-center justify-center rounded-xl border ${pulse.tone}`}>
                                                                <pulse.icon class="h-5 w-5" />
                                                        </span>
                                                        <div>
                                                                <p class="text-xs uppercase tracking-[0.3em] text-muted-foreground">{pulse.label}</p>
                                                                <p class="text-lg font-semibold text-foreground">{pulse.value}</p>
                                                        </div>
                                                </div>
                                                <p class="text-success mt-4 text-xs font-semibold uppercase tracking-[0.3em]">
                                                        {pulse.delta}
                                                </p>
                                        </div>
                                {/each}
                        </CardContent>
                </Card>

                <Card class="border-border/70 bg-surface/70 flex flex-col gap-5 border p-6">
                        <div>
                                <CardTitle class="text-xl font-semibold">Quick actions</CardTitle>
                                <CardDescription>Jump straight into the most used flows on the platform.</CardDescription>
                        </div>
                        <div class="space-y-3">
                                {#each quickActions as action}
                                        <div class="border-border/60 bg-surface-muted/40 rounded-2xl border p-4">
                                                <div class="flex items-start justify-between gap-3">
                                                        <div class="flex items-center gap-3">
                                                                <span class="border-border/60 bg-surface-muted/60 flex h-10 w-10 items-center justify-center rounded-xl border">
                                                                        <action.icon class="h-4 w-4" />
                                                                </span>
                                                                <div>
                                                                        <p class="text-sm font-semibold">{action.title}</p>
                                                                        <p class="text-muted-foreground text-xs leading-relaxed">{action.description}</p>
                                                                </div>
                                                        </div>
                                                        <Button size="sm" variant="outline" onclick={action.handler ?? (() => {})}>
                                                                {action.action}
                                                        </Button>
                                                </div>
                                        </div>
                                {/each}
                        </div>

                        <div class="border-border/60 bg-surface-muted/30 rounded-2xl border p-4">
                                <div class="flex items-center gap-3">
                                        <span class="border-border/60 bg-surface-muted/60 flex h-10 w-10 items-center justify-center rounded-xl border">
                                                <Sparkles class="h-4 w-4" />
                                        </span>
                                        <div>
                                                <p class="text-sm font-semibold">Weekly VIP rewards</p>
                                                <p class="text-muted-foreground text-xs">Boosted rakeback cycles and private drop rooms.</p>
                                        </div>
                                </div>
                        </div>
                </Card>
        </section>

        <LiveMarketplaceGrid />

        <section class="grid gap-8 xl:grid-cols-[1.4fr,1fr]">
                <CommunityPots />
                <Card class="border-border/70 bg-surface/70 flex flex-col border p-6">
                        <CardHeader class="border-0 px-0 pt-0">
                                <Badge variant="outline" class="w-fit">Live alerts</Badge>
                                <CardTitle class="text-xl font-semibold">Trading floor updates</CardTitle>
                                <CardDescription>Stay reactive with flash announcements from the operations desk.</CardDescription>
                        </CardHeader>
                        <CardContent class="space-y-4 px-0">
                                {#each flashUpdates as update}
                                        <div class="border-border/60 bg-surface-muted/40 rounded-2xl border p-4">
                                                <p class="text-sm font-semibold">{update.title}</p>
                                                <p class="text-muted-foreground text-xs">{update.caption}</p>
                                        </div>
                                {/each}
                                <Button variant="outline" class="mt-2 gap-2" onclick={openChat}>
                                        Join community chat
                                        <MessageCircle class="h-4 w-4" />
                                </Button>
                        </CardContent>
                </Card>
        </section>

        <Card class="border-border/70 bg-surface/70 border p-6">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                                <CardTitle class="text-xl font-semibold">Provably fair & transparent</CardTitle>
                                <CardDescription>
                                        Every spin is verifiable with on-chain seeds, independent audits, and instant withdrawal coverage.
                                </CardDescription>
                        </div>
                        <Badge variant="outline" class="gap-2 text-xs uppercase tracking-[0.3em]">
                                <Zap class="h-4 w-4" />
                                Certified fair play
                        </Badge>
                </div>
        </Card>
</div>
