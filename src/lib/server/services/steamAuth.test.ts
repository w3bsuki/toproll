import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import {
	validateSteamCallback,
	createOrUpdateUserProfile,
	extractSteamId
} from '$lib/server/services/steamAuth';
import { getSupabaseServer } from '$lib/supabase/server';
import type { SteamUser } from '$lib/server/services/steamAuth';

// Mock external dependencies
vi.mock('$env/dynamic/private', () => ({
	env: {
		STEAM_API_KEY: 'test-steam-api-key'
	}
}));

vi.mock('$lib/supabase/server', () => ({
	getSupabaseServer: vi.fn()
}));

vi.mock('node:crypto', () => ({
	createHash: vi.fn(() => ({
		update: vi.fn().mockReturnThis(),
		digest: vi.fn().mockReturnValue('mock-hash')
	})),
	randomUUID: vi.fn().mockReturnValue('mock-uuid')
}));

// Mock fetch globally
global.fetch = vi.fn();

// Helper function to create mock Supabase query builder
function createMockSupabase() {
	const mockQueryBuilder = {
		select: vi.fn().mockReturnThis(),
		eq: vi.fn().mockReturnThis(),
		maybeSingle: vi.fn().mockReturnThis(),
		single: vi.fn().mockReturnThis(),
		insert: vi.fn().mockReturnThis(),
		update: vi.fn().mockReturnThis()
	};

	const mockSupabase = {
		auth: {
			admin: {
				updateUserById: vi.fn(),
				createUser: vi.fn(),
				deleteUser: vi.fn()
			}
		},
		from: vi.fn(() => mockQueryBuilder)
	};

	return { mockSupabase, mockQueryBuilder };
}

describe('steamAuth', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('extractSteamId', () => {
		it('should extract valid Steam ID from claimed ID', () => {
			const claimedId = 'https://steamcommunity.com/openid/id/76561198012345678';
			const result = extractSteamId(claimedId);
			expect(result).toBe('76561198012345678');
		});

		it('should throw error for invalid Steam ID format', () => {
			const invalidClaimedId = 'https://steamcommunity.com/openid/id/invalid';
			expect(() => extractSteamId(invalidClaimedId)).toThrow('Invalid Steam ID format');
		});

		it('should throw error when Steam ID is missing', () => {
			const noSteamId = 'https://steamcommunity.com/openid/id/';
			expect(() => extractSteamId(noSteamId)).toThrow('Invalid Steam ID format');
		});
	});

	describe('validateSteamCallback', () => {
		let mockFetch: Mock;

		beforeEach(() => {
			mockFetch = global.fetch as Mock;
		});

		it('should successfully validate Steam OpenID callback', async () => {
			// Mock OpenID verification response
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve('is_valid:true\nns:http://specs.openid.net/auth/2.0')
			});

			// Mock Steam API response
			const mockSteamUser: SteamUser = {
				steamid: '76561198012345678',
				personaname: 'TestUser',
				avatar: 'https://example.com/avatar.jpg',
				avatarmedium: 'https://example.com/avatar_medium.jpg',
				avatarfull: 'https://example.com/avatar_full.jpg',
				profileurl: 'https://steamcommunity.com/profiles/76561198012345678/',
				communityvisibilitystate: 3
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () =>
					Promise.resolve({
						response: {
							players: [mockSteamUser]
						}
					})
			});

			const params = new URLSearchParams({
				'openid.mode': 'id_res',
				'openid.claimed_id': 'https://steamcommunity.com/openid/id/76561198012345678',
				'openid.ns': 'http://specs.openid.net/auth/2.0',
				'openid.sig': 'mock-signature'
			});

			const result = await validateSteamCallback(params);

			expect(result).toEqual(mockSteamUser);
			expect(mockFetch).toHaveBeenCalledTimes(2);
		});

		it('should throw error for invalid OpenID mode', async () => {
			const params = new URLSearchParams({
				'openid.mode': 'invalid_mode'
			});

			await expect(validateSteamCallback(params)).rejects.toThrow('Invalid OpenID mode');
		});

		it('should throw error when OpenID verification fails', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve('is_valid:false')
			});

			const params = new URLSearchParams({
				'openid.mode': 'id_res',
				'openid.claimed_id': 'https://steamcommunity.com/openid/id/76561198012345678'
			});

			await expect(validateSteamCallback(params)).rejects.toThrow('Invalid OpenID signature');
		});

		it('should throw error when Steam API request fails', async () => {
			// Mock successful OpenID verification
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve('is_valid:true')
			});

			// Mock failed Steam API response
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 500
			});

			const params = new URLSearchParams({
				'openid.mode': 'id_res',
				'openid.claimed_id': 'https://steamcommunity.com/openid/id/76561198012345678'
			});

			await expect(validateSteamCallback(params)).rejects.toThrow('Failed to fetch Steam profile');
		});

		it('should throw error when Steam profile not found', async () => {
			// Mock successful OpenID verification
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve('is_valid:true')
			});

			// Mock Steam API response with no players
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () =>
					Promise.resolve({
						response: {
							players: []
						}
					})
			});

			const params = new URLSearchParams({
				'openid.mode': 'id_res',
				'openid.claimed_id': 'https://steamcommunity.com/openid/id/76561198012345678'
			});

			await expect(validateSteamCallback(params)).rejects.toThrow('Steam profile not found');
		});
	});

	describe('createOrUpdateUserProfile', () => {
		let mockSupabase: any;
		let mockQueryBuilder: any;

		beforeEach(() => {
			const mock = createMockSupabase();
			mockSupabase = mock.mockSupabase;
			mockQueryBuilder = mock.mockQueryBuilder;
			(getSupabaseServer as Mock).mockReturnValue(mockSupabase);
		});

		it('should create new user profile for first-time Steam user', async () => {
			const mockSteamUser: SteamUser = {
				steamid: '76561198012345678',
				personaname: 'NewUser',
				avatar: 'https://example.com/avatar.jpg',
				avatarmedium: 'https://example.com/avatar_medium.jpg',
				avatarfull: 'https://example.com/avatar_full.jpg',
				profileurl: 'https://steamcommunity.com/profiles/76561198012345678/',
				communityvisibilitystate: 3
			};

			// Mock no existing profile
			const mockQueryBuilder = mockSupabase.from('user_profiles');
			mockQueryBuilder.maybeSingle.mockResolvedValueOnce({
				data: null,
				error: null
			});

			// Mock successful auth user creation
			const mockAuthUser = {
				user: { id: 'new-user-id' }
			};
			mockSupabase.auth.admin.createUser.mockResolvedValueOnce({
				data: mockAuthUser,
				error: null
			});

			// Mock successful profile creation
			const mockNewProfile = {
				user_id: 'new-user-id',
				steam_id: '76561198012345678'
			};
			mockQueryBuilder.single.mockResolvedValueOnce({
				data: mockNewProfile,
				error: null
			});

			const result = await createOrUpdateUserProfile(mockSteamUser);

			expect(result).toEqual({
				user: mockSteamUser,
				supabaseUserId: 'new-user-id',
				sessionToken: 'mock-uuid',
				sessionExpiresAt: expect.any(String)
			});

			expect(mockSupabase.auth.admin.createUser).toHaveBeenCalledWith(
				expect.objectContaining({
					user_metadata: expect.objectContaining({
						steam_id: mockSteamUser.steamid,
						username: mockSteamUser.personaname
					}),
					email: '76561198012345678@steam.toproll.gg',
					email_confirm: true
				})
			);
		});

		it('should update existing user profile', async () => {
			const mockSteamUser: SteamUser = {
				steamid: '76561198012345678',
				personaname: 'UpdatedUser',
				avatar: 'https://example.com/new_avatar.jpg',
				avatarmedium: 'https://example.com/new_avatar_medium.jpg',
				avatarfull: 'https://example.com/new_avatar_full.jpg',
				profileurl: 'https://steamcommunity.com/profiles/76561198012345678/',
				communityvisibilitystate: 3
			};

			// Mock existing profile
			const mockExistingProfile = {
				user_id: 'existing-user-id',
				steam_id: '76561198012345678'
			};
			mockQueryBuilder.maybeSingle.mockResolvedValueOnce({
				data: mockExistingProfile,
				error: null
			});

			// Mock successful auth user update
			mockSupabase.auth.admin.updateUserById.mockResolvedValueOnce({
				data: { user: { id: 'existing-user-id' } },
				error: null
			});

			// Mock successful profile update
			const mockUpdatedProfile = {
				user_id: 'existing-user-id',
				steam_id: '76561198012345678',
				username: 'UpdatedUser'
			};
			mockQueryBuilder.single.mockResolvedValueOnce({
				data: mockUpdatedProfile,
				error: null
			});

			const result = await createOrUpdateUserProfile(mockSteamUser);

			expect(result).toEqual({
				user: mockSteamUser,
				supabaseUserId: 'existing-user-id',
				sessionToken: 'mock-uuid',
				sessionExpiresAt: expect.any(String)
			});

			expect(mockSupabase.auth.admin.updateUserById).toHaveBeenCalledWith(
				'existing-user-id',
				expect.objectContaining({
					user_metadata: expect.objectContaining({
						steam_id: mockSteamUser.steamid,
						username: mockSteamUser.personaname
					})
				})
			);
		});

		it('should throw error when profile lookup fails', async () => {
			const mockSteamUser: SteamUser = {
				steamid: '76561198012345678',
				personaname: 'TestUser',
				avatar: 'https://example.com/avatar.jpg',
				avatarmedium: 'https://example.com/avatar_medium.jpg',
				avatarfull: 'https://example.com/avatar_full.jpg',
				profileurl: 'https://steamcommunity.com/profiles/76561198012345678/',
				communityvisibilitystate: 3
			};

			// Mock database error
			mockSupabase.from.mockReturnValue({
				select: vi.fn().mockReturnValue({
					eq: vi.fn().mockReturnValue({
						maybeSingle: vi.fn().mockResolvedValue({
							data: null,
							error: { message: 'Database connection failed' }
						})
					})
				})
			});

			await expect(createOrUpdateUserProfile(mockSteamUser)).rejects.toThrow(
				'Failed to check existing profile: Database connection failed'
			);
		});

		it('should clean up auth user if profile creation fails', async () => {
			const mockSteamUser: SteamUser = {
				steamid: '76561198012345678',
				personaname: 'NewUser',
				avatar: 'https://example.com/avatar.jpg',
				avatarmedium: 'https://example.com/avatar_medium.jpg',
				avatarfull: 'https://example.com/avatar_full.jpg',
				profileurl: 'https://steamcommunity.com/profiles/76561198012345678/',
				communityvisibilitystate: 3
			};

			// Mock no existing profile
			mockQueryBuilder.maybeSingle.mockResolvedValueOnce({
				data: null,
				error: null
			});

			// Mock successful auth user creation
			const mockAuthUser = {
				user: { id: 'new-user-id' }
			};
			mockSupabase.auth.admin.createUser.mockResolvedValueOnce({
				data: mockAuthUser,
				error: null
			});

			// Mock failed profile creation
			mockQueryBuilder.single.mockResolvedValueOnce({
				data: null,
				error: { message: 'Profile creation failed' }
			});

			await expect(createOrUpdateUserProfile(mockSteamUser)).rejects.toThrow(
				'Failed to create profile: Profile creation failed'
			);

			// Verify cleanup was called
			expect(mockSupabase.auth.admin.deleteUser).toHaveBeenCalledWith('new-user-id');
		});
	});
});
