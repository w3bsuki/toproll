import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export { default as NavigationMenu } from './navigation-menu.svelte';
export { default as NavigationMenuContent } from './navigation-menu-content.svelte';
export { default as NavigationMenuItem } from './navigation-menu-item.svelte';
export { default as NavigationMenuLink } from './navigation-menu-link.svelte';
export { default as NavigationMenuList } from './navigation-menu-list.svelte';
export { default as NavigationMenuTrigger } from './navigation-menu-trigger.svelte';
export { default as NavigationMenuViewport } from './navigation-menu-viewport.svelte';
export * from './types';