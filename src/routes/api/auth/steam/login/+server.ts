import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ url }) => {
	const realm = process.env.STEAM_OPENID_REALM || url.origin;
	const returnTo = process.env.STEAM_OPENID_RETURN_TO || `${url.origin}/api/auth/steam/callback`;

	const steamOpenIdUrl = new URL('https://steamcommunity.com/openid/login');
	steamOpenIdUrl.searchParams.set('openid.ns', 'http://specs.openid.net/auth/2.0');
	steamOpenIdUrl.searchParams.set('openid.mode', 'checkid_setup');
	steamOpenIdUrl.searchParams.set('openid.return_to', returnTo);
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
