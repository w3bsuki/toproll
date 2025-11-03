import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { randomBytes } from 'node:crypto';
import type { RequestHandler } from './$types';
import { setNonce } from '$lib/server/auth/nonceStore';

// Steam OpenID configuration
const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login';

// Generate a nonce for CSRF protection
function generateNonce(): string {
	return randomBytes(16).toString('hex');
}

export const GET: RequestHandler = async ({ url, cookies }) => {
	const returnUrl = url.searchParams.get('returnUrl') || '/profile';
	const nonce = generateNonce();

	// Store nonce with timestamp in shared store
	setNonce(nonce, {
		timestamp: Date.now(),
		returnUrl
	});

	// Store nonce in a cookie for verification in callback
	cookies.set('steam_auth_nonce', nonce, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: 300 // 5 minutes in seconds
	});

	// Build Steam OpenID auth URL parameters
	const realm = env.STEAM_OPENID_REALM || url.origin;
	const returnToUrl = new URL(
		env.STEAM_OPENID_RETURN_TO || `${url.origin}/api/auth/steam/callback`
	);
	returnToUrl.searchParams.set('nonce', nonce);

	const authParams = new URLSearchParams({
		'openid.ns': 'http://specs.openid.net/auth/2.0',
		'openid.mode': 'checkid_setup',
		'openid.return_to': returnToUrl.toString(),
		'openid.realm': realm,
		'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
		'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select'
	});

	const steamAuthUrl = `${STEAM_OPENID_URL}?${authParams.toString()}`;

	// Redirect to Steam for authentication
	throw redirect(302, steamAuthUrl);
};

// Keep POST for backward compatibility
export const POST: RequestHandler = async ({ url, cookies }) => {
	const realm = env.STEAM_OPENID_REALM || url.origin;
	const nonce = generateNonce();

	// Store nonce with timestamp in shared store (no returnUrl handling for POST)
	setNonce(nonce, { timestamp: Date.now(), returnUrl: '/' });

	// Store nonce in a cookie for verification in callback
	cookies.set('steam_auth_nonce', nonce, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: 300
	});

	const returnToUrl = new URL(
		env.STEAM_OPENID_RETURN_TO || `${url.origin}/api/auth/steam/callback`
	);
	returnToUrl.searchParams.set('nonce', nonce);

	const steamOpenIdUrl = new URL('https://steamcommunity.com/openid/login');
	steamOpenIdUrl.searchParams.set('openid.ns', 'http://specs.openid.net/auth/2.0');
	steamOpenIdUrl.searchParams.set('openid.mode', 'checkid_setup');
	steamOpenIdUrl.searchParams.set('openid.return_to', returnToUrl.toString());
	steamOpenIdUrl.searchParams.set('openid.realm', realm);
	steamOpenIdUrl.searchParams.set(
		'openid.identity',
		'http://specs.openid.net/auth/2.0/identifier_select'
	);
	steamOpenIdUrl.searchParams.set(
		'openid.claimed_id',
		'http://specs.openid.net/auth/2.0/identifier_select'
	);

	throw redirect(302, steamOpenIdUrl.toString());
};
