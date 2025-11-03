import { getContext, setContext } from 'svelte';

const UI_KEY = Symbol('ui');

interface UIState {
	chatOpen: boolean;
	sidebarOpen: boolean;
	activeModal: string | null;
	toggleChat: () => void;
	openChat: () => void;
	closeChat: () => void;
	toggleSidebar: () => void;
	openSidebar: () => void;
	closeSidebar: () => void;
	openModal: (id: string) => void;
	closeModal: () => void;
}

/**
 * Creates the UI state using Svelte 5 runes
 * This replaces the old writable store with context-based state
 */
export function createUIState(): UIState {
	let chatOpen = $state(false);
	let sidebarOpen = $state(true); // Open by default
	let activeModal = $state<string | null>(null);

	function toggleChat() {
		chatOpen = !chatOpen;
	}

	function openChat() {
		chatOpen = true;
	}

	function closeChat() {
		chatOpen = false;
	}

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	function openSidebar() {
		sidebarOpen = true;
	}

	function closeSidebar() {
		sidebarOpen = false;
	}

	function openModal(id: string) {
		activeModal = id;
	}

	function closeModal() {
		activeModal = null;
	}

	return {
		get chatOpen() {
			return chatOpen;
		},
		get sidebarOpen() {
			return sidebarOpen;
		},
		get activeModal() {
			return activeModal;
		},
		toggleChat,
		openChat,
		closeChat,
		toggleSidebar,
		openSidebar,
		closeSidebar,
		openModal,
		closeModal
	};
}

/**
 * Sets UI state in context (call this in root +layout.svelte)
 */
export function setUIState(): UIState {
	return setContext(UI_KEY, createUIState());
}

/**
 * Gets UI state from context (call this in child components)
 */
export function getUIState(): UIState {
	const state = getContext<UIState>(UI_KEY);
	if (!state) {
		throw new Error('UI state not found. Did you forget to call setUIState() in root layout?');
	}
	return state;
}
