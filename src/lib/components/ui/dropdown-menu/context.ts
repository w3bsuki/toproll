import { getContext, setContext } from 'svelte';
import type { Writable } from 'svelte/store';

export interface DropdownContext {
	open: Writable<boolean>;
	setOpen: (open: boolean) => void;
}

const key = Symbol('dropdown-menu');

export function initDropdownContext(context: DropdownContext) {
	setContext(key, context);
}

export function useDropdownContext() {
	const context = getContext<DropdownContext>(key);
	if (!context) {
		throw new Error('DropdownMenu components must be used within <DropdownMenu>.');
	}
	return context;
}
