import { writable } from 'svelte/store';

interface UIState {
	chatOpen: boolean;
	sidebarOpen: boolean;
}

const initialState: UIState = {
	chatOpen: false,
	sidebarOpen: true
};

export const uiStore = writable<UIState>(initialState);

export function toggleChat() {
	uiStore.update((state) => ({ ...state, chatOpen: !state.chatOpen }));
}

export function toggleSidebar() {
	uiStore.update((state) => ({ ...state, sidebarOpen: !state.sidebarOpen }));
}

export function openChat() {
	uiStore.update((state) => ({ ...state, chatOpen: true }));
}

export function closeChat() {
	uiStore.update((state) => ({ ...state, chatOpen: false }));
}
