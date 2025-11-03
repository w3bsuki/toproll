export type { AuthUser } from '$lib/server/services/auth';

export {
	getCurrentUser,
	requireAuth,
	getUserProfile,
	updateLastSeen,
	refreshSteamProfile,
	updateUserBalance,
	getUserBalance,
	signInUser,
	createSession
} from '$lib/server/services/auth';

export {
	getCurrentUserBrowser,
	isAuthenticated,
	logout,
	getUserProfileClient
} from './auth-client';
