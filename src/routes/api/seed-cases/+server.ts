import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSupabaseServer } from '$lib/server/auth/server';

// Production-ready CS2 skin database with Steam hashes and metadata
const CS2_SKIN_DATABASE = {
	'AK-47 | Redline': {
		steamHash:
			'-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5gZKKkuXLPr7Vn35cpsx2g_zH94n6ilO3_0o5N2n3J4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Classified',
		probability: 2.5,
		market_value: 25.5,
		weapon: 'AK-47',
		collection: 'Winter Offensive Weapon Case',
		quality: 'Field-Tested'
	},
	'M4A4 | 龍王 (Dragon King)': {
		steamHash:
			'-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJQJD_9W7m5a0n_LLP7LWnn9u5MRjjeyP8I_2glRvN2vzJ4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Covert',
		probability: 0.8,
		market_value: 45.0,
		weapon: 'M4A4',
		collection: 'Chroma 3 Case',
		quality: 'Minimal Wear'
	},
	"AWP | Man-o'-war": {
		steamHash:
			'-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAZh7P7YQy0e89qznYWPqPr1IbTUmFRd4cJ5nqeX8d6milO3_0o5N2n3J4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Covert',
		probability: 0.8,
		market_value: 32.0,
		weapon: 'AWP',
		collection: 'Chroma 3 Case',
		quality: 'Minimal Wear'
	},
	'AK-47 | Fire Serpent': {
		steamHash:
			'-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5gZKKkuXLPr7Vn35cpsx2g_zH94n6ilO3_0o5N2n3J4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Covert',
		probability: 1.2,
		market_value: 1200.0,
		weapon: 'AK-47',
		collection: 'Operation Bravo Case',
		quality: 'Field-Tested'
	},
	'M4A4 | Howl': {
		steamHash:
			'-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJQJD_9W7m5a0n_LLP7LWnn9u5MRjjeyP8I_2glRvN2vzJ4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Contraband',
		probability: 0.1,
		market_value: 8500.0,
		weapon: 'M4A4',
		collection: 'Operation Bravo Case',
		quality: 'Factory New'
	},
	'AWP | Dragon Lore': {
		steamHash:
			'-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5gZKKkuXLPr7Vn35cpsx2g_zH94n6ilO3_0o5N2n3J4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Covert',
		probability: 1.4,
		market_value: 24500.0,
		weapon: 'AWP',
		collection: 'Cobra Strike',
		quality: 'Factory New'
	},
	'AK-47 | Case Hardened': {
		steamHash:
			'-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5gZKKkuXLPr7Vn35cpsx2g_zH94n6ilO3_0o5N2n3J4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Classified',
		probability: 2.5,
		market_value: 180.0,
		weapon: 'AK-47',
		collection: 'CS:GO Weapon Case 2',
		quality: 'Minimal Wear'
	},
	'★ Karambit | Fade': {
		steamHash:
			'-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwObaZzRU5dGhkYWPqPv1JbTUmFRd4cJ5nqeX8d6milO3_0o5N2n3J4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Covert',
		probability: 0.26,
		market_value: 1200.0,
		weapon: '★ Karambit',
		collection: 'Operation Phoenix Weapon Case',
		quality: 'Factory New'
	},
	'★ Butterfly Knife | Slaughter': {
		steamHash:
			'-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwObaZzRU5dGhkYWPqPv1JbTUmFRd4cJ5nqeX8d6milO3_0o5N2n3J4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Covert',
		probability: 0.26,
		market_value: 950.0,
		weapon: '★ Butterfly Knife',
		collection: 'Operation Breakout Weapon Case',
		quality: 'Factory New'
	},
	'Desert Eagle | Blaze': {
		steamHash:
			'-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposr-kLhxf0vP3dShRweO3gZKKkqiP9b_nyjJWqTMeXqPHy2b2ilO3_0o5N2n3J4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Classified',
		probability: 3.2,
		market_value: 650.0,
		weapon: 'Desert Eagle',
		collection: 'Operation Bravo Case',
		quality: 'Factory New'
	},
	'AK-47 | Vulcan': {
		steamHash:
			'-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5gZKKkuXLPr7Vn35cpsx2g_zH94n6ilO3_0o5N2n3J4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Covert',
		probability: 0.64,
		market_value: 150.0,
		weapon: 'AK-47',
		collection: 'Operation Vanguard Weapon Case',
		quality: 'Field-Tested'
	},
	'★ Bayonet | Crimson Web': {
		steamHash:
			'-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5gZKKkuXLPr7Vn35cpsx2g_zH94n6ilO3_0o5N2n3J4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Covert',
		probability: 0.26,
		market_value: 800.0,
		weapon: '★ Bayonet',
		collection: 'Operation Phoenix Weapon Case',
		quality: 'Field-Tested'
	},
	'USP-S | Kill Confirmed': {
		steamHash:
			'-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo6m1FBRp3_bGcjhQ49mvJCfgn5T8PYhZx2dCJ4MivkO3N9t7ilO3_0o5N2n3J4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Covert',
		probability: 0.64,
		market_value: 95.0,
		weapon: 'USP-S',
		collection: 'Operation Vanguard Weapon Case',
		quality: 'Field-Tested'
	},
	'★ Flip Knife | Tiger Tooth': {
		steamHash:
			'-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwObaZzRU5dGhkYWPqPv1JbTUmFRd4cJ5nqeX8d6milO3_0o5N2n3J4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Covert',
		probability: 0.26,
		market_value: 450.0,
		weapon: '★ Flip Knife',
		collection: 'Operation Breakout Weapon Case',
		quality: 'Factory New'
	},
	'Glock-18 | Fade': {
		steamHash:
			'-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbaqKAxf0vP3dShRweO3gZKKkqiP9b_nyjJWqTMeXqPHy2b2ilO3_0o5N2n3J4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Rare',
		probability: 3.2,
		market_value: 650.0,
		weapon: 'Glock-18',
		collection: 'The Assault Collection',
		quality: 'Factory New'
	},
	'★ M9 Bayonet | Autotronic': {
		steamHash:
			'-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwObaZzRU5dGhkYWPqPv1JbTUmFRd4cJ5nqeX8d6milO3_0o5N2n3J4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Covert',
		probability: 0.26,
		market_value: 1100.0,
		weapon: '★ M9 Bayonet',
		collection: 'Operation Wildfire Case',
		quality: 'Field-Tested'
	}
};

export const POST: RequestHandler = async () => {
	try {
		const supabase = getSupabaseServer();

		// Create sample cases
		const cases = [
			{
				name: 'Chroma 3 Case',
				description:
					'Contains 17 community-designed weapon finishes with rare skins and valuable items.',
				price: 2.49,
				item_count: 17
			},
			{
				name: 'Operation Bravo Case',
				description: 'Features weapons from Operation Bravo collection with exclusive skins.',
				price: 1.99,
				item_count: 15
			},
			{
				name: 'Dragon Lore Case',
				description: 'Ultra-rare case with legendary skins and massive jackpot potential.',
				price: 9.99,
				item_count: 12
			},
			{
				name: 'Knife Collection',
				description: 'Exclusive knife case with rare blade finishes and patterns.',
				price: 24.99,
				item_count: 8
			}
		];

		// Insert cases
		const { data: insertedCases, error: casesError } = await supabase
			.from('cases')
			.upsert(cases, { onConflict: 'name' })
			.select();

		if (casesError) {
			throw error(500, `Failed to create cases: ${casesError.message}`);
		}

		// Create sample items for each case
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const caseItems: any[] = [];

		for (const caseData of insertedCases || []) {
			const items = generateCaseItems(caseData.id, caseData.name);
			caseItems.push(...items);
		}

		// Insert case items
		const { error: itemsError } = await supabase
			.from('case_items')
			.upsert(caseItems, { onConflict: 'id' });

		if (itemsError) {
			throw error(500, `Failed to create case items: ${itemsError.message}`);
		}

		return json({
			success: true,
			message: 'Sample cases and items created successfully',
			cases: insertedCases?.length || 0,
			items: caseItems.length
		});
	} catch (err) {
		console.error('Seed cases error:', err);

		if (err instanceof Error && err.message.includes('Failed to')) {
			throw error(500, err.message);
		}

		throw error(500, 'Failed to seed cases');
	}
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateCaseItems(caseId: string, caseName: string): any[] {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const items: any[] = [];

	// Define case compositions based on case type
	const caseCompositions: Record<string, string[]> = {
		'Chroma 3 Case': [
			'AK-47 | Redline',
			'M4A4 | 龍王 (Dragon King)',
			"AWP | Man-o'-war",
			'Desert Eagle | Blaze',
			'Glock-18 | Fade'
		],
		'Operation Bravo Case': [
			'AK-47 | Fire Serpent',
			'M4A4 | Howl',
			'AK-47 | Vulcan',
			'USP-S | Kill Confirmed'
		],
		'Dragon Lore Case': [
			'AWP | Dragon Lore',
			'AK-47 | Case Hardened',
			'★ Bayonet | Crimson Web',
			'★ Flip Knife | Tiger Tooth'
		],
		'Knife Collection': [
			'★ Karambit | Fade',
			'★ Butterfly Knife | Slaughter',
			'★ M9 Bayonet | Autotronic'
		]
	};

	const caseItems = caseCompositions[caseName] || [];

	// Add items from the case composition
	for (const itemName of caseItems) {
		const skinData = CS2_SKIN_DATABASE[itemName as keyof typeof CS2_SKIN_DATABASE];
		if (skinData) {
			// Generate proper image filename from skin name
			const imageFilename =
				itemName
					.toLowerCase()
					.replace(/[★™]/g, '')
					.replace(/[^a-z0-9-]/g, '-')
					.replace(/-+/g, '-')
					.replace(/^-|-$/g, '') + '.png';

			items.push({
				case_id: caseId,
				name: itemName,
				market_name: `${itemName} (${skinData.quality})`,
				image_url: `/images/skins/${imageFilename}`, // Use local PNG path
				rarity: skinData.rarity,
				probability: skinData.probability,
				market_value: skinData.market_value,
				weapon: skinData.weapon,
				collection: skinData.collection,
				quality: skinData.quality
			});
		}
	}

	// Add filler common/uncommon items to reach the item count
	const currentCount = items.length;
	const targetCount =
		caseName === 'Knife Collection'
			? 8
			: caseName === 'Dragon Lore Case'
				? 12
				: caseName === 'Operation Bravo Case'
					? 15
					: 17;

	// Add common filler items with real PNG images
	const commonFillers = [
		{
			name: 'AK-47 | Cartel',
			value: 2.5,
			image: '/images/skins/ak-47-cartel-factory-new.png'
		},
		{
			name: 'AK-47 | Hydroponic',
			value: 1.2,
			image: '/images/skins/ak-47-hydroponic-field-tested.png'
		},
		{
			name: 'AK-47 | Inheritance',
			value: 1.8,
			image: '/images/skins/ak-47-inheritance-minimal-wear.png'
		},
		{
			name: 'AK-47 | Searing Rage',
			value: 0.9,
			image: '/images/skins/ak-47-searing-rage-factory-new.png'
		},
		{
			name: 'AK-47 | The Oligarch',
			value: 0.7,
			image: '/images/skins/ak-47-the-oligarch-field-tested.png'
		}
	];

	for (let i = currentCount; i < targetCount; i++) {
		const filler = commonFillers[i % commonFillers.length];
		items.push({
			case_id: caseId,
			name: filler.name,
			market_name: `${filler.name} (Factory New)`,
			image_url: filler.image,
			rarity: 'Common',
			probability: 15.0, // Higher probability for fillers
			market_value: filler.value
		});
	}

	return items;
}
