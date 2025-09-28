import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const roomId = url.searchParams.get('room_id') || 'fdadf252-a169-4ae1-8a1d-a7e50e07aaed'; // default global room
	const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

	// TODO: Fetch messages from Supabase
	// SELECT * FROM chat_messages WHERE room_id = $1 ORDER BY created_at DESC LIMIT $2

	// Mock data for now
	const messages = [
		{
			id: 'msg_1',
			room_id: roomId,
			user_id: null,
			user_name: 'Guest123',
			message: 'Hello everyone!',
			created_at: new Date().toISOString()
		}
	];

	return json({ messages });
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	const { message, room_id = 'fdadf252-a169-4ae1-8a1d-a7e50e07aaed' } = await request.json();

	if (!message || message.length > 2000) {
		throw error(400, 'Invalid message');
	}

	// Get user info (for now from cookie, later from Supabase session)
	const steamId = cookies.get('steam_id');
	const userName = steamId ? `User_${steamId.slice(-4)}` : 'Guest';

	// TODO: Insert message into Supabase
	// INSERT INTO chat_messages (room_id, user_id, user_name, message) VALUES ($1, $2, $3, $4)

	const newMessage = {
		id: `msg_${Date.now()}`,
		room_id,
		user_id: steamId || null,
		user_name: userName,
		message,
		created_at: new Date().toISOString()
	};

	return json({ message: newMessage });
};
