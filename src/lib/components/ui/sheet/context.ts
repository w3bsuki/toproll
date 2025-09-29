import { getContext, setContext } from 'svelte';

export interface SheetContext {
	open: () => boolean;
	close: () => void;
	openSheet: () => void;
}

const key = Symbol('sheet-context');

export function initSheetContext(context: SheetContext) {
	setContext(key, context);
}

export function useSheetContext() {
	const context = getContext<SheetContext>(key);
	if (!context) {
		throw new Error('Sheet components must be used within <Sheet>.');
	}
	return context;
}
