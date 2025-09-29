import { getContext, setContext } from 'svelte';

export interface TabsContext {
	value: () => string;
	setValue: (value: string) => void;
}

const key = Symbol('tabs-context');

export function initTabsContext(context: TabsContext) {
	setContext(key, context);
}

export function useTabsContext() {
	const context = getContext<TabsContext>(key);
	if (!context) {
		throw new Error('Tabs components must be used within <Tabs>.');
	}
	return context;
}
