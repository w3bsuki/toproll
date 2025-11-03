export {};
		description?: string;
		image_url?: string;
		price: number;
		item_count: number;
		created_at: string;
		updated_at: string;
	};
	participants: BattleParticipant[];
}

// In-memory storage for mock battles data
let mockBattles: Battle[] = [];
let mockBattleParticipants: BattleParticipant[] = [];

// Mock services removed
function initializeMockBattles(): void {
	if (mockBattles.length > 0) return; // Already initialized

	mockBattles = [
		{
			id: 'battle_1',
			case_id: 'case_1',
			status: 'waiting',
			mode: 'standard',
			max_participants: 2,
			current_participants: 1,
			total_pot: 15.99,
			entry_fee: 15.99,
			rounds_count: 1,
			current_round: 0,
			created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
			created_by: MOCK_USERS[0].id,
			case: {
				...MOCK_CASES[0],
				updated_at: MOCK_CASES[0].created_at
			},
			participants: [],
			results: [],
			cases: [],
			rounds: []
		},
		{
			id: 'battle_2',
			case_id: 'case_2',
			status: 'in_progress',
			mode: 'crazy',
			max_participants: 4,
			current_participants: 4,
			total_pot: 51.96,
			entry_fee: 12.99,
			rounds_count: 1,
			current_round: 0,
			created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
			created_by: MOCK_USERS[1].id,
			case: {
				...MOCK_CASES[1],
				updated_at: MOCK_CASES[1].created_at
			},
			participants: [],
			results: [],
			cases: [],
			rounds: []
		},
		{
			id: 'battle_3',
			case_id: 'case_3',
			status: 'completed',
			mode: 'standard',
			max_participants: 2,
			current_participants: 2,
			total_pot: 37.98,
			entry_fee: 18.99,
			rounds_count: 1,
			current_round: 1,
			winner_id: MOCK_USERS[1].id,
			created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
			completed_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
			created_by: MOCK_USERS[0].id,
			case: {
				...MOCK_CASES[2],
				updated_at: MOCK_CASES[2].created_at
			},
			participants: [],
			results: [],
			cases: [],
			rounds: []
		},
		{
			id: 'battle_4',
			case_id: 'case_1',
			status: 'waiting',
			mode: 'standard',
			max_participants: 2,
			current_participants: 0,
			total_pot: 0,
			entry_fee: 15.99,
			rounds_count: 1,
			current_round: 0,
			created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
			created_by: MOCK_USERS[2].id,
			case: {
				...MOCK_CASES[0],
				updated_at: MOCK_CASES[0].created_at
			},
			participants: [],
			results: [],
			cases: [],
			rounds: []
		}
	];

	// Create mock battle participants
	mockBattleParticipants = [
		{
			id: 'participant_1',
			battle_id: 'battle_1',
			user_id: MOCK_USERS[0].id,
			position: 1,
			joined_at: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
			user: {
				id: MOCK_USERS[0].id,
				username: MOCK_USERS[0].username,
				avatar_url: MOCK_USERS[0].avatarUrl
			}
		},
		{
			id: 'participant_2',
			battle_id: 'battle_2',
			user_id: MOCK_USERS[1].id,
			position: 1,
			joined_at: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
			user: {
				id: MOCK_USERS[1].id,
				username: MOCK_USERS[1].username,
				avatar_url: MOCK_USERS[1].avatarUrl
			}
		},
		{
			id: 'participant_3',
			battle_id: 'battle_2',
			user_id: MOCK_USERS[2].id,
			position: 2,
			joined_at: new Date(Date.now() - 1000 * 60 * 13).toISOString(),
			user: {
				id: MOCK_USERS[2].id,
				username: MOCK_USERS[2].username,
				avatar_url: MOCK_USERS[2].avatarUrl
			}
		},
		{
			id: 'participant_4',
			battle_id: 'battle_2',
			user_id: MOCK_USERS[0].id,
			position: 3,
			joined_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
			user: {
				id: MOCK_USERS[0].id,
				username: MOCK_USERS[0].username,
				avatar_url: MOCK_USERS[0].avatarUrl
			}
		},
		{
			id: 'participant_5',
			battle_id: 'battle_2',
			user_id: MOCK_USERS[1].id,
			position: 4,
			joined_at: new Date(Date.now() - 1000 * 60 * 11).toISOString(),
			user: {
				id: MOCK_USERS[1].id,
				username: MOCK_USERS[1].username,
				avatar_url: MOCK_USERS[1].avatarUrl
			}
		},
		{
			id: 'participant_6',
			battle_id: 'battle_3',
			user_id: MOCK_USERS[0].id,
			position: 1,
			joined_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
			user: {
				id: MOCK_USERS[0].id,
				username: MOCK_USERS[0].username,
				avatar_url: MOCK_USERS[0].avatarUrl
			}
		},
		{
			id: 'participant_7',
			battle_id: 'battle_3',
			user_id: MOCK_USERS[1].id,
			position: 2,
			joined_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
			user: {
				id: MOCK_USERS[1].id,
				username: MOCK_USERS[1].username,
				avatar_url: MOCK_USERS[1].avatarUrl
			}
		}
	];
}

/**
 * Mock battles provider
 */
export const battles = {
	/**
	 * List battles with optional filters
	 */
	async list(filters?: {
		status?: string;
		mode?: string;
		limit?: number;
		offset?: number;
	}): Promise<BattleSummary[]> {
		return withMockLatency(async () => {
			logApiCall('GET', '/battles', filters);

			initializeMockBattles();

			let filteredBattles = mockBattles.map((battle) => {
				const participants = mockBattleParticipants.filter((p) => p.battle_id === battle.id);
				return {
					...battle,
					participants
				};
			});

			// Apply status filter
			if (filters?.status && filters.status !== 'all') {
				filteredBattles = filteredBattles.filter((battle) => battle.status === filters.status);
			}

			// Apply mode filter
			if (filters?.mode && filters.mode !== 'all') {
				filteredBattles = filteredBattles.filter((battle) => battle.mode === filters.mode);
			}

			// Apply pagination
			if (filters?.offset !== undefined) {
				filteredBattles = filteredBattles.slice(filters.offset);
			}

			if (filters?.limit !== undefined) {
				filteredBattles = filteredBattles.slice(0, filters.limit);
			}

			// Sort by created_at (newest first)
			filteredBattles.sort(
				(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
			);

			return filteredBattles as unknown as BattleSummary[];
		});
	},

	/**
	 * Get detailed battle information
	 */
	async get(id: string): Promise<BattleDetails> {
		return withMockLatency(async () => {
			logApiCall('GET', `/battles/${id}`);

			initializeMockBattles();

			const battle = mockBattles.find((b) => b.id === id);
			if (!battle) {
				throw new Error('Battle not found');
			}

			const participants = mockBattleParticipants.filter((p) => p.battle_id === id);

			return {
				battle,
				participants
			};
		});
	},

	/**
	 * Create a new battle
	 */
	async create(config: CreateBattleRequest): Promise<BattleDetails> {
		return withMockLatency(async () => {
			logApiCall('POST', '/battles', config);

			initializeMockBattles();

			const selectedCase = MOCK_CASES.find((c) => c.id === config.case_ids[0]);
			if (!selectedCase) {
				throw new Error('Case not found');
			}

			const totalEntryFee = selectedCase.price * config.case_ids.length;

			const newBattle: Battle = {
				id: `battle_${Date.now()}_${globalPRNG.next()}`,
				case_id: config.case_ids[0],
				status: 'waiting',
				mode: config.mode,
				max_participants: config.max_participants,
				current_participants: 0,
				total_pot: 0,
				entry_fee: totalEntryFee,
				rounds_count: config.case_ids.length,
				current_round: 0,
				created_at: new Date().toISOString(),
				created_by: MOCK_USERS[0].id,
				case: {
					...selectedCase,
					updated_at: selectedCase.created_at
				},
				participants: [],
				results: [],
				cases: [],
				rounds: []
			};

			mockBattles.push(newBattle);

			// Auto-join creator as first participant
			const participant: BattleParticipant = {
				id: `participant_${Date.now()}`,
				battle_id: newBattle.id,
				user_id: MOCK_USERS[0].id,
				position: 1,
				joined_at: new Date().toISOString(),
				user: {
					id: MOCK_USERS[0].id,
					username: MOCK_USERS[0].username,
					avatar_url: MOCK_USERS[0].avatarUrl
				}
			};

			mockBattleParticipants.push(participant);

			// Update battle
			newBattle.current_participants = 1;
			newBattle.total_pot = totalEntryFee;

			return {
				battle: newBattle,
				participants: [participant]
			};
		});
	},

	/**
	 * Join an existing battle
	 */
	async join(id: string): Promise<BattleDetails> {
		return withMockLatency(async () => {
			logApiCall('POST', `/battles/${id}/join`);

			initializeMockBattles();

			const battle = mockBattles.find((b) => b.id === id);
			if (!battle) {
				throw new Error('Battle not found');
			}

			if (battle.status !== 'waiting') {
				throw new Error('Battle is not accepting participants');
			}

			if (battle.current_participants >= battle.max_participants) {
				throw new Error('Battle is full');
			}

			// Check if user already joined
			const existingParticipant = mockBattleParticipants.find(
				(p) => p.battle_id === id && p.user_id === MOCK_USERS[0].id
			);

			if (existingParticipant) {
				throw new Error('Already joined this battle');
			}

			// Add participant
			const participant: BattleParticipant = {
				id: `participant_${Date.now()}_${globalPRNG.next()}`,
				battle_id: id,
				user_id: MOCK_USERS[0].id,
				position: battle.current_participants + 1,
				joined_at: new Date().toISOString(),
				user: {
					id: MOCK_USERS[0].id,
					username: MOCK_USERS[0].username,
					avatar_url: MOCK_USERS[0].avatarUrl
				}
			};

			mockBattleParticipants.push(participant);

			// Update battle
			battle.current_participants += 1;
			battle.total_pot += battle.entry_fee;

			// Check if battle should start
			if (battle.current_participants >= battle.max_participants) {
				battle.status = 'in_progress';
			}

			const participants = mockBattleParticipants.filter((p) => p.battle_id === id);

			return {
				battle,
				participants
			};
		});
	},

	/**
	 * Simulate battle results
	 */
	async simulate(id: string): Promise<BattleDetails> {
		return withMockLatency(async () => {
			logApiCall('POST', `/battles/${id}/simulate`);

			initializeMockBattles();

			const battle = mockBattles.find((b) => b.id === id);
			if (!battle) {
				throw new Error('Battle not found');
			}

			if (battle.status !== 'in_progress') {
				throw new Error('Battle is not in progress');
			}

			const participants = mockBattleParticipants.filter((p) => p.battle_id === id);

			// Simulate battle results
			const results: BattleResult[] = participants.map((participant) => {
				const randomSkin = globalPRNG.nextChoice(MOCK_CS2_SKINS);
				const caseItem: CaseItem = {
					id: randomSkin.assetid,
					case_id: battle.case_id,
					name: randomSkin.name,
					market_name: randomSkin.market_name,
					image_url: randomSkin.icon_url,
					rarity: randomSkin.rarity as
						| 'Common'
						| 'Uncommon'
						| 'Rare'
						| 'Epic'
						| 'Legendary'
						| 'Contraband',
					probability: 0.1, // Mock probability
					market_value: randomSkin.market_value,
					created_at: new Date().toISOString()
				};

				return {
					id: `result_${participant.id}`,
					battle_id: id,
					participant_id: participant.id,
					item_id: randomSkin.assetid,
					total_value: randomSkin.market_value,
					is_winner: false,
					created_at: new Date().toISOString(),
					participant,
					item: caseItem
				};
			});

			// Determine winner based on mode
			let winner;
			if (battle.mode === 'standard') {
				// Highest value wins
				winner = results.reduce((prev, current) =>
					prev.total_value > current.total_value ? prev : current
				);
			} else {
				// Lowest value wins (crazy mode)
				winner = results.reduce((prev, current) =>
					prev.total_value < current.total_value ? prev : current
				);
			}

			winner.is_winner = true;

			// Update battle
			battle.status = 'completed';
			battle.winner_id = winner.participant?.user_id;
			battle.current_round = battle.rounds_count;
			battle.completed_at = new Date().toISOString();
			battle.results = results;

			return {
				battle,
				participants,
				results
			};
		});
	}
};
