import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { HTMLAttributes, SVGAttributes } from 'svelte/elements';

type ElementFromAttributes<T> = T extends HTMLAttributes<infer E>
	? E
	: T extends SVGAttributes<infer E>
		? E
		: Element;

type ExistingRef<T> = T extends { ref?: infer R } ? R : never;

type RefFor<T, Ref> = [ExistingRef<T>] extends [never] ? Ref : ExistingRef<T>;

type ResolveRef<T, Ref> = RefFor<T, Ref> extends never
	? ElementFromAttributes<T> | null
	: RefFor<T, Ref>;

export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(...inputs));
}

export type WithElementRef<T, Ref = ElementFromAttributes<T>> = Omit<T, 'ref'> & {
	ref?: ResolveRef<T, Ref> | null;
};

type PhantomSlot<Slot> = Slot extends never ? never : { readonly __slot?: Slot };

// Relax children typing for existing components, allow presence during migration
export type WithoutChildren<T, Slot = unknown> = T & PhantomSlot<Slot>;
export type WithoutChild<T, Slot = unknown> = T & PhantomSlot<Slot>;
export type WithoutChildrenOrChild<T, Slot = unknown> = T & PhantomSlot<Slot>;
