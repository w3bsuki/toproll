import { writable } from 'svelte/store';

export interface UIState {
	chatOpen: boolean;
	sidebarOpen: boolean;
}

const initialState: UIState = {
	chatOpen: false,
	sidebarOpen: false
};

export const uiStore = writable<UIState>(initialState);

export function toggleChat() {
	uiStore.update((state) => ({ ...state, chatOpen: !state.chatOpen }));
}

export function openChat() {
	uiStore.update((state) => ({ ...state, chatOpen: true }));
}

export function closeChat() {
	uiStore.update((state) => ({ ...state, chatOpen: false }));
}

export function toggleSidebar() {
	uiStore.update((state) => ({ ...state, sidebarOpen: !state.sidebarOpen }));
}

export function openSidebar() {
	uiStore.update((state) => ({ ...state, sidebarOpen: true }));
}

export function closeSidebar() {
	uiStore.update((state) => ({ ...state, sidebarOpen: false }));
}
