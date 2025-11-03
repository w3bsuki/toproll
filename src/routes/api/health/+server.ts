import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
	const started = Date.now();
	const body = {
		status: 'ok',
		timestamp: new Date().toISOString(),
		uptimeSec: Math.floor(process.uptime()),
		version: process.env.npm_package_version || '0.0.0'
	};

	// Attach correlation ID if present
	const headers = new Headers({ 'content-type': 'application/json' });
	if (locals.requestId) headers.set('x-request-id', locals.requestId);
	headers.set('x-response-time', String(Date.now() - started));

	return new Response(JSON.stringify(body), { status: 200, headers });
};
