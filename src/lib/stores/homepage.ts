import { readable, writable } from 'svelte/store';

export type HeroPromotion = {
        id: string;
        title: string;
        subtitle: string;
        description: string;
        tag: string;
        highlight: string;
        background: string;
        ctas: { label: string; variant?: 'default' | 'secondary' | 'outline'; icon?: any }[];
        stats: { label: string; value: string }[];
};

export type MarketplaceItem = {
        id: string;
        name: string;
        image: string;
        price: string;
        rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
        volatility: string;
        playersOnline: number;
};

export type CommunityPot = {
        id: string;
        title: string;
        jackpot: string;
        expiresIn: string;
        participants: number;
        variant: 'primary' | 'secondary' | 'accent';
        streak?: string;
};

export type RainPot = {
        total: string;
        contributors: number;
        endsIn: string;
};

export type CommunityMessage = {
        id: string;
        username: string;
        message: string;
        timestamp: string;
        badge?: 'vip' | 'staff' | 'pro';
};

export const heroPromotions = readable<HeroPromotion[]>([
        {
                id: 'doppler-bundle',
                title: 'Neon Doppler Collection',
                subtitle: 'Premium featured drop',
                description:
                        'Spin exclusive Doppler knives with a boosted legendary multiplier and transparent odds audited live.',
                tag: 'Featured',
                highlight: '3.8x legendary hits',
                background: 'radial-gradient(circle at 20% 20%, rgba(124, 58, 237, 0.65), transparent 55%), radial-gradient(circle at 80% 30%, rgba(6, 182, 212, 0.45), transparent 50%), rgba(17, 25, 40, 0.92)',
                ctas: [
                        { label: 'Open featured case', variant: 'default' },
                        { label: 'Watch live drop', variant: 'outline' }
                ],
                stats: [
                        { label: 'Live openings', value: '128' },
                        { label: 'Top payout', value: '$14,920' },
                        { label: 'Volatility', value: 'High' }
                ]
        },
        {
                id: 'high-roller',
                title: 'High Roller Battles',
                subtitle: 'Risk-on series',
                description:
                        'Queue into curated battle lobbies featuring transparent rake, auto-withdraw, and battle analytics.',
                tag: 'Battles',
                highlight: '2v2 · 4 case rotation',
                background: 'radial-gradient(circle at 20% 20%, rgba(37, 99, 235, 0.55), transparent 55%), radial-gradient(circle at 70% 70%, rgba(59, 130, 246, 0.35), transparent 50%), rgba(17, 24, 39, 0.9)',
                ctas: [
                        { label: 'Join lobby', variant: 'default' },
                        { label: 'View battle stats', variant: 'outline' }
                ],
                stats: [
                        { label: 'Lobbies live', value: '42' },
                        { label: 'Average pot', value: '$3,280' },
                        { label: 'Players queued', value: '168' }
                ]
        },
        {
                id: 'flash-cases',
                title: 'Flash Drop Frenzy',
                subtitle: 'Turbo cases',
                description:
                        'Grab time-limited flash cases with transparent edge and auto-withdraw to your locker in under 5 minutes.',
                tag: 'Flash drop',
                highlight: 'Ends in 02:19',
                background: 'radial-gradient(circle at 15% 80%, rgba(253, 186, 116, 0.55), transparent 55%), radial-gradient(circle at 85% 20%, rgba(248, 113, 113, 0.45), transparent 50%), rgba(24, 24, 27, 0.92)',
                ctas: [
                        { label: 'Browse flash cases', variant: 'default' },
                        { label: 'Set alert', variant: 'outline' }
                ],
                stats: [
                        { label: 'Cases remaining', value: '312' },
                        { label: 'Boosted odds', value: '+12%' },
                        { label: 'Claimed today', value: '1,940' }
                ]
        }
]);

export const marketplaceItems = readable<MarketplaceItem[]>([
        {
                id: 'emerald-web',
                name: '★ Karambit | Emerald Web',
                image: 'radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.6), transparent 60%), radial-gradient(circle at 80% 80%, rgba(45, 212, 191, 0.4), transparent 55%), rgba(15, 23, 42, 0.9)',
                price: '$7,820.00',
                rarity: 'Legendary',
                volatility: 'Ultra',
                playersOnline: 38
        },
        {
                id: 'dragon-lore',
                name: 'AWP | Dragon Lore',
                image: 'radial-gradient(circle at 30% 30%, rgba(245, 158, 11, 0.6), transparent 60%), radial-gradient(circle at 80% 60%, rgba(251, 191, 36, 0.45), transparent 55%), rgba(30, 41, 59, 0.92)',
                price: '$4,510.00',
                rarity: 'Legendary',
                volatility: 'High',
                playersOnline: 62
        },
        {
                id: 'case-hard',
                name: 'AK-47 | Case Hardened',
                image: 'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.55), transparent 60%), radial-gradient(circle at 75% 75%, rgba(14, 165, 233, 0.45), transparent 55%), rgba(15, 23, 42, 0.9)',
                price: '$850.90',
                rarity: 'Epic',
                volatility: 'Medium',
                playersOnline: 104
        },
        {
                id: 'printstream',
                name: 'Desert Eagle | Printstream',
                image: 'radial-gradient(circle at 20% 80%, rgba(244, 63, 94, 0.5), transparent 60%), radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.45), transparent 55%), rgba(24, 24, 27, 0.92)',
                price: '$315.00',
                rarity: 'Epic',
                volatility: 'Medium',
                playersOnline: 91
        },
        {
                id: 'case-spectrum',
                name: 'Spectrum 2 Case',
                image: 'radial-gradient(circle at 25% 25%, rgba(34, 197, 94, 0.5), transparent 60%), radial-gradient(circle at 70% 70%, rgba(74, 222, 128, 0.4), transparent 55%), rgba(17, 24, 39, 0.92)',
                price: '$3.18',
                rarity: 'Rare',
                volatility: 'Low',
                playersOnline: 402
        },
        {
                id: 'recoil-case',
                name: 'Recoil Case',
                image: 'radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.5), transparent 60%), radial-gradient(circle at 75% 65%, rgba(165, 180, 252, 0.4), transparent 55%), rgba(30, 41, 59, 0.92)',
                price: '$1.92',
                rarity: 'Rare',
                volatility: 'Stable',
                playersOnline: 356
        },
        {
                id: 'stiletto',
                name: '★ Stiletto Knife | Doppler',
                image: 'radial-gradient(circle at 25% 25%, rgba(236, 72, 153, 0.55), transparent 60%), radial-gradient(circle at 75% 75%, rgba(129, 140, 248, 0.45), transparent 55%), rgba(24, 24, 27, 0.92)',
                price: '$2,740.00',
                rarity: 'Legendary',
                volatility: 'Ultra',
                playersOnline: 21
        },
        {
                id: 'glove-case',
                name: 'Clutch Case',
                image: 'radial-gradient(circle at 25% 20%, rgba(248, 113, 113, 0.5), transparent 60%), radial-gradient(circle at 70% 75%, rgba(251, 146, 60, 0.4), transparent 55%), rgba(38, 38, 38, 0.9)',
                price: '$2.45',
                rarity: 'Common',
                volatility: 'Low',
                playersOnline: 518
        }
]);
export const communityPots = readable<CommunityPot[]>([
        {
                id: 'midnight-royale',
                title: 'Midnight Royale',
                jackpot: '$18,420',
                expiresIn: '05:12',
                participants: 186,
                variant: 'primary',
                streak: 'Hot streak 4x'
        },
        {
                id: 'rainmaker',
                title: 'Rainmaker',
                jackpot: '$6,280',
                expiresIn: '02:47',
                participants: 94,
                variant: 'accent'
        },
        {
                id: 'phoenix-high',
                title: 'Phoenix High Roll',
                jackpot: '$42,960',
                expiresIn: '14:58',
                participants: 58,
                variant: 'secondary',
                streak: 'VIP access'
        }
]);

export const rainPot = readable<RainPot>({
        total: '$12,400',
        contributors: 312,
        endsIn: '08:19'
});

const initialMessages: CommunityMessage[] = [
        {
                id: 'msg-01',
                username: 'cypher',
                message: 'Pulled a ★ Karambit | Doppler from Neon Doppler case!',
                timestamp: 'just now',
                badge: 'vip'
        },
        {
                id: 'msg-02',
                username: 'luna',
                message: 'Anyone joining the Midnight Royale battle lobby?',
                timestamp: '1m ago'
        },
        {
                id: 'msg-03',
                username: 'specter',
                message: 'Rain pot is filling fast—20 slots left!',
                timestamp: '3m ago',
                badge: 'staff'
        },
        {
                id: 'msg-04',
                username: 'nova',
                message: 'Sold Printstream instantly. Liquidity feels good today.',
                timestamp: '5m ago'
        }
];

export const communityMessages = writable<CommunityMessage[]>(initialMessages);

export function pushCommunityMessage(message: Omit<CommunityMessage, 'id' | 'timestamp'>) {
        const now = new Date();
        communityMessages.update((messages) => [
                ...messages,
                {
                        id: crypto.randomUUID(),
                        timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        ...message
                }
        ]);
}
