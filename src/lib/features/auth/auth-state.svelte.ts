import { getContext, setContext } from 'svelte';
import { getSupabaseClient } from '$lib/supabase/client';
import { getUserProfileClient } from '$lib/services/auth-client';
import type { User, Session } from '@supabase/supabase-js';
import type { UserProfile } from '$lib/types/index';

const AUTH_KEY = Symbol('auth');

interface AuthState {
	user: User | null;
	session: Session | null;
	profile: UserProfile | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	initialize: () => Promise<void>;
	signOut: () => Promise<void>;
	refreshProfile: () => Promise<void>;
}

/**
 * Creates the auth state using Svelte 5 runes
 * This replaces the old class-based AuthStore with context-based state
 */
export function createAuthState(initialUser: User | null = null): AuthState {
	let user = $state<User | null>(initialUser);
	let session = $state<Session | null>(null);
	let profile = $state<UserProfile | null>(null);
	let isLoading = $state(true);

	// Derived state for authentication status
	let isAuthenticated = $derived(!!user && !!session);

	/**
	 * Loads user profile from client or server
	 */
	async function loadUserProfile(userId: string) {
		try {
			// First try client-side profile loading
			profile = await getUserProfileClient(userId);

			// If client loading fails, try server-side profile endpoint
			if (!profile) {
				const response = await fetch('/api/auth/profile');
				if (response.ok) {
					const data = await response.json();
					profile = {
						...data.profile,
						user_id: data.user.id,
						steam_id: data.user.steamId
					};
				}
			}
		} catch (error) {
			console.error('Error loading user profile:', error);
			profile = null;
		}
	}

	/**
	 * Initialize auth state and set up listeners
	 */
	async function initialize() {
		const supabase = getSupabaseClient();

		// Set up auth state change listener FIRST
		supabase.auth.onAuthStateChange(async (event, newSession) => {
			console.log('Auth state changed:', event, !!newSession?.user);

			// Don't set loading during initial session
			if (event !== 'INITIAL_SESSION') {
				isLoading = true;
			}

			session = newSession;
			user = newSession?.user ?? null;

			if (user) {
				await loadUserProfile(user.id);
			} else {
				profile = null;
			}

			// Always set loading to false after processing
			isLoading = false;
		});

		try {
			// Get initial session
			const {
				data: { session: initialSession },
				error
			} = await supabase.auth.getSession();

			if (error) {
				console.error('Error getting initial session:', error);
				isLoading = false;
				return;
			}

			// Update state
			session = initialSession;
			user = initialSession?.user ?? null;

			// Load user profile if authenticated
			if (user) {
				await loadUserProfile(user.id);
			}
		} catch (error) {
			console.error('Error initializing auth:', error);
		} finally {
			// Always set loading to false after initialization
			isLoading = false;
		}
	}

	/**
	 * Sign out the current user
	 */
	async function signOut() {
		try {
			const supabase = getSupabaseClient();
			await supabase.auth.signOut();
			// State will be updated via onAuthStateChange listener
		} catch (error) {
			console.error('Error signing out:', error);
		}
	}

	/**
	 * Manually refresh the user profile
	 */
	async function refreshProfile() {
		if (user) {
			await loadUserProfile(user.id);
		}
	}

	return {
		get user() {
			return user;
		},
		get session() {
			return session;
		},
		get profile() {
			return profile;
		},
		get isLoading() {
			return isLoading;
		},
		get isAuthenticated() {
			return isAuthenticated;
		},
		initialize,
		signOut,
		refreshProfile
	};
}

/**
 * Sets auth state in context (call this in root +layout.svelte)
 */
export function setAuthState(initialUser: User | null = null): AuthState {
	return setContext(AUTH_KEY, createAuthState(initialUser));
}

/**
 * Gets auth state from context (call this in child components)
 */
export function getAuthState(): AuthState {
	const state = getContext<AuthState>(AUTH_KEY);
	if (!state) {
		throw new Error('Auth state not found. Did you forget to call setAuthState() in root layout?');
	}
	return state;
}
