// Utility functions for TopRoll app
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Snippet } from 'svelte';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Type utilities for shadcn-svelte components
export type WithElementRef<T, E = HTMLElement> = T & {
	ref?: E | null;
};

export type WithoutChildren<T, TArgs extends any[] = []> = Omit<T, 'children'> & {
        children?: Snippet<TArgs>;
};

export type WithoutChild<T, TArgs extends any[] = []> = Omit<T, 'children'> & {
        children?: Snippet<TArgs>;
};

export type WithoutChildrenOrChild<T, TArgs extends any[] = []> = Omit<T, 'children'> & {
        children?: Snippet<TArgs>;
};

// General utility functions can be added here as needed
