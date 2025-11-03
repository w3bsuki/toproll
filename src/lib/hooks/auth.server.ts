import { redirect, type Cookies } from '@sveltejs/kit';
import { getCurrentUser, type AuthUser } from '$lib/server/services/auth';

/**
 * Authentication hook for protected routes
 */
export async function requireAuthGuard(cookies: Cookies): Promise<void> {
	const user = await getCurrentUser(cookies);

	if (!user) {
		throw redirect(302, '/?error=auth_required');
	}
}

/**
 * Authentication hook for optional authentication (guest pages)
 */
export async function optionalAuthGuard(cookies: Cookies): Promise<{ user: AuthUser | null }> {
	const user = await getCurrentUser(cookies);
	return { user };
}

/**
 * Protected routes that require authentication
 */
export const protectedRoutes = ['/profile', '/inventory', '/cases'];

/**
 * Public routes that don't require authentication
 */
export const publicRoutes = ['/'];

/**
 * Check if a route is protected
 */
export function isProtectedRoute(pathname: string): boolean {
	return protectedRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Check if a route is public
 */
export function isPublicRoute(pathname: string): boolean {
	return publicRoutes.some((route) => pathname === route);
}
