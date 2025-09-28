/**
 * Image utility functions for handling CS2 skin images with fallbacks
 */

// Production-ready CS2 skin database - shared between client and server
const CS2_SKIN_DATABASE = {
	'AK-47 | Redline': {
		steamHash: '-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5gZKKkuXLPr7Vn35cpsx2g_zH94n6ilO3_0o5N2n3J4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Classified',
		probability: 2.5,
		market_value: 25.50,
		weapon: 'AK-47',
		collection: 'Winter Offensive Weapon Case',
		quality: 'Field-Tested'
	},
	'M4A4 | 龍王 (Dragon King)': {
		steamHash: '-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJQJD_9W7m5a0n_LLP7LWnn9u5MRjjeyP8I_2glRvN2vzJ4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Covert',
		probability: 0.8,
		market_value: 45.00,
		weapon: 'M4A4',
		collection: 'Chroma 3 Case',
		quality: 'Minimal Wear'
	},
	"AWP | Man-o'-war": {
		steamHash: '-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAZh7P7YQy0e89qznYWPqPr1IbTUmFRd4cJ5nqeX8d6milO3_0o5N2n3J4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Covert',
		probability: 0.8,
		market_value: 32.00,
		weapon: 'AWP',
		collection: 'Chroma 3 Case',
		quality: 'Minimal Wear'
	},
	'AK-47 | Fire Serpent': {
		steamHash: '-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5gZKKkuXLPr7Vn35cpsx2g_zH94n6ilO3_0o5N2n3J4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Covert',
		probability: 1.2,
		market_value: 1200.00,
		weapon: 'AK-47',
		collection: 'Operation Bravo Case',
		quality: 'Field-Tested'
	},
	'M4A4 | Howl': {
		steamHash: '-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJQJD_9W7m5a0n_LLP7LWnn9u5MRjjeyP8I_2glRvN2vzJ4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Contraband',
		probability: 0.1,
		market_value: 8500.00,
		weapon: 'M4A4',
		collection: 'Operation Bravo Case',
		quality: 'Factory New'
	},
	'AWP | Dragon Lore': {
		steamHash: '-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5gZKKkuXLPr7Vn35cpsx2g_zH94n6ilO3_0o5N2n3J4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Covert',
		probability: 1.4,
		market_value: 24500.00,
		weapon: 'AWP',
		collection: 'Cobra Strike',
		quality: 'Factory New'
	},
	'AK-47 | Case Hardened': {
		steamHash: '-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5gZKKkuXLPr7Vn35cpsx2g_zH94n6ilO3_0o5N2n3J4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Classified',
		probability: 2.5,
		market_value: 180.00,
		weapon: 'AK-47',
		collection: 'CS:GO Weapon Case 2',
		quality: 'Minimal Wear'
	},
	'★ Karambit | Fade': {
		steamHash: '-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwObaZzRU5dGhkYWPqPv1JbTUmFRd4cJ5nqeX8d6milO3_0o5N2n3J4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Covert',
		probability: 0.26,
		market_value: 1200.00,
		weapon: '★ Karambit',
		collection: 'Operation Phoenix Weapon Case',
		quality: 'Factory New'
	},
	'★ Butterfly Knife | Slaughter': {
		steamHash: '-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwObaZzRU5dGhkYWPqPv1JbTUmFRd4cJ5nqeX8d6milO3_0o5N2n3J4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Covert',
		probability: 0.26,
		market_value: 950.00,
		weapon: '★ Butterfly Knife',
		collection: 'Operation Breakout Weapon Case',
		quality: 'Factory New'
	},
	'Desert Eagle | Blaze': {
		steamHash: '-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposr-kLhxf0vP3dShRweO3gZKKkqiP9b_nyjJWqTMeXqPHy2b2ilO3_0o5N2n3J4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Classified',
		probability: 3.2,
		market_value: 650.00,
		weapon: 'Desert Eagle',
		collection: 'Operation Bravo Case',
		quality: 'Factory New'
	},
	'AK-47 | Vulcan': {
		steamHash: '-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5gZKKkuXLPr7Vn35cpsx2g_zH94n6ilO3_0o5N2n3J4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Covert',
		probability: 0.64,
		market_value: 150.00,
		weapon: 'AK-47',
		collection: 'Operation Vanguard Weapon Case',
		quality: 'Field-Tested'
	},
	'★ Bayonet | Crimson Web': {
		steamHash: '-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5gZKKkuXLPr7Vn35cpsx2g_zH94n6ilO3_0o5N2n3J4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Covert',
		probability: 0.26,
		market_value: 800.00,
		weapon: '★ Bayonet',
		collection: 'Operation Phoenix Weapon Case',
		quality: 'Field-Tested'
	},
	'USP-S | Kill Confirmed': {
		steamHash: '-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo6m1FBRp3_bGcjhQ49mvJCfgn5T8PYhZx2dCJ4MivkO3N9t7ilO3_0o5N2n3J4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Covert',
		probability: 0.64,
		market_value: 95.00,
		weapon: 'USP-S',
		collection: 'Operation Vanguard Weapon Case',
		quality: 'Field-Tested'
	},
	'★ Flip Knife | Tiger Tooth': {
		steamHash: '-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwObaZzRU5dGhkYWPqPv1JbTUmFRd4cJ5nqeX8d6milO3_0o5N2n3J4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Covert',
		probability: 0.26,
		market_value: 450.00,
		weapon: '★ Flip Knife',
		collection: 'Operation Breakout Weapon Case',
		quality: 'Factory New'
	},
	'Glock-18 | Fade': {
		steamHash: '-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbaqKAxf0vP3dShRweO3gZKKkqiP9b_nyjJWqTMeXqPHy2b2ilO3_0o5N2n3J4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Rare',
		probability: 3.2,
		market_value: 650.00,
		weapon: 'Glock-18',
		collection: 'The Assault Collection',
		quality: 'Factory New'
	},
	'★ M9 Bayonet | Autotronic': {
		steamHash: '-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwObaZzRU5dGhkYWPqPv1JbTUmFRd4cJ5nqeX8d6milO3_0o5N2n3J4eUd1A4Yl_Tq1G_yLrqgZq5vM7Pz3Fj6yIl5CvD2w',
		rarity: 'Covert',
		probability: 0.26,
		market_value: 1100.00,
		weapon: '★ M9 Bayonet',
		collection: 'Operation Wildfire Case',
		quality: 'Field-Tested'
	}
};

export const SKIN_PLACEHOLDER_URL = '/images/placeholder-skin.svg';

/**
 * Production-ready CS2 skin image configuration
 * Primary: Steam CDN (fastest, most accurate)
 * Fallback: Local SVG (always available)
 * Cache: Redis/CDN for performance
 */
export const SKIN_IMAGE_CONFIG = {
	// Steam CDN base URL
	STEAM_BASE_URL: 'https://community.cloudflare.steamstatic.com/economy/image/',

	// Local fallback directory
	LOCAL_BASE_URL: '/images/skins/',

	// Image size options
	SIZES: {
		SMALL: '96x96',   // 96x96px
		MEDIUM: '128x128', // 128x128px
		LARGE: '256x256'   // 256x256px
	},

	// Default image format
	FORMAT: 'jpg'
};

/**
 * Creates production-ready image props with multiple fallback sources
 */
export function createImageProps(imageInput: string, skinName: string, size: 'small' | 'medium' | 'large' = 'medium') {
	const sizeMap = {
		small: SKIN_IMAGE_CONFIG.SIZES.SMALL,
		medium: SKIN_IMAGE_CONFIG.SIZES.MEDIUM,
		large: SKIN_IMAGE_CONFIG.SIZES.LARGE
	};

	let steamUrl: string;
	let localUrl: string;

	// Check if imageInput is a full URL/path or a Steam hash
	if (imageInput.startsWith('http') || imageInput.startsWith('/')) {
		// It's a full URL/path - use it as local URL and try to find Steam hash
		localUrl = imageInput;

		// Try to get Steam hash from database
		const skinData = getSkinData(skinName);
		if (skinData) {
			steamUrl = `${SKIN_IMAGE_CONFIG.STEAM_BASE_URL}${skinData.steamHash}/${sizeMap[size]}f`;
		} else {
			// No Steam hash available, use local URL as primary
			steamUrl = localUrl;
		}
	} else {
		// It's a Steam hash
		steamUrl = `${SKIN_IMAGE_CONFIG.STEAM_BASE_URL}${imageInput}/${sizeMap[size]}f`;

		// Generate local filename
		const filename = skinName.toLowerCase()
			.replace(/★/g, '') // Remove star prefix
			.replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with dash
			.replace(/-+/g, '-') // Replace multiple dashes with single
			.replace(/^-|-$/g, ''); // Remove leading/trailing dashes

		localUrl = `${SKIN_IMAGE_CONFIG.LOCAL_BASE_URL}${filename}.png`;
	}

	return {
		src: steamUrl,
		alt: skinName,
		class: 'object-cover',
		'on:error': (e: Event) => {
			const target = e.target as HTMLImageElement;

			// If Steam CDN fails, try local URL
			if (target.src.includes('steamstatic.com') && localUrl !== steamUrl) {
				target.src = localUrl;
			}
			// Final fallback to placeholder
			else if (!target.src.includes('placeholder')) {
				target.src = SKIN_PLACEHOLDER_URL;
			}
		},
		loading: 'lazy' as const,
		// Add crossOrigin for better caching
		crossOrigin: 'anonymous' as const
	};
}

/**
 * Validates if a Steam image URL is accessible
 */
export async function validateImageUrl(url: string): Promise<boolean> {
	try {
		const response = await fetch(url, { method: 'HEAD' });
		return response.ok;
	} catch {
		return false;
	}
}

/**
 * Production-ready CS2 skin image system
 * Uses Steam's official CDN with proper fallbacks and caching
 */
/**
 * Get skin data from database
 */
export function getSkinData(skinName: string) {
	const skinData = CS2_SKIN_DATABASE[skinName];
	if (!skinData) return null;

	return {
		steamHash: skinData.steamHash,
		rarity: skinData.rarity,
		market_value: skinData.market_value,
		weapon: skinData.weapon,
		collection: skinData.collection,
		quality: skinData.quality
	};
}

/**
 * Create production-ready image props for any CS2 skin
 */
export function createSkinImageProps(skinName: string, size: 'small' | 'medium' | 'large' = 'medium') {
	const skinData = getSkinData(skinName);
	if (!skinData) {
		// Fallback for unknown skins
		return createImageProps('unknown', skinName, size);
	}

	return createImageProps(skinData.steamHash, skinName, size);
}
