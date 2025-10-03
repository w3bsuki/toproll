import type { Snippet } from 'svelte';

export type NavigationMenuProps = {
	class?: string;
	children?: Snippet;
};

export type NavigationMenuContentProps = {
	class?: string;
};

export type NavigationMenuItemProps = {
	class?: string;
};

export type NavigationMenuLinkProps = {
	class?: string;
	href?: string;
	active?: boolean;
};

export type NavigationMenuListProps = {
	class?: string;
};

export type NavigationMenuTriggerProps = {
	class?: string;
};

export type NavigationMenuViewportProps = {
	class?: string;
};
