import { getContext, setContext } from 'svelte';

export interface DropdownContext {
	open: () => boolean;
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
