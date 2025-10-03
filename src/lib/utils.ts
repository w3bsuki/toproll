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

export type WithoutChildren<T> = Omit<T, 'children'> & {
	children?: Snippet;
};

export type WithoutChild<T> = Omit<T, 'children'> & {
	children?: Snippet;
};

export type WithoutChildrenOrChild<T> = Omit<T, 'children'> & {
	children?: Snippet;
};

// General utility functions can be added here as needed
