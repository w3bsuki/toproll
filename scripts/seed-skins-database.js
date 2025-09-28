#!/usr/bin/env node

/**
 * CS2 Skins Database Seeder using ByMykel/CSGO-API
 * Populates Supabase with real CS2 skin data for case opening
 * Usage: node scripts/seed-skins-database.js
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API endpoints
const CS2_SKINS_API = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins_not_grouped.json';
const CS2_CRATES_API = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/crates.json';

// Supabase configuration (hardcoded from your provided credentials)
const supabaseUrl = 'https://pqbomlvoborxfxdglkrt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxYm9tbHZvYm9yeGZ4ZGdsa3J0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODM5MzI3NSwiZXhwIjoyMDczOTY5Mjc1fQ.qA0Ti46p3VHQ-1MTUB-OhBElglVShpQZK9LKNvG9l0I';

const supabase = createClient(supabaseUrl, supabaseKey);

// Rarity mapping from API to your database schema
const RARITY_MAPPING = {
	'Covert': 'Legendary',
	'Classified': 'Epic',
	'Restricted': 'Rare',
	'Mil-Spec Grade': 'Uncommon',
	'Mil-Spec': 'Uncommon',
	'Industrial Grade': 'Common',
	'Consumer Grade': 'Common',
	'Contraband': 'Contraband'
};

// Probability distribution for rarities (matches your RARITY_PROBABILITIES)
const RARITY_PROBABILITIES = {
	'Common': 60.0,
	'Uncommon': 25.0,
	'Rare': 10.0,
	'Epic': 3.5,
	'Legendary': 1.4,
	'Contraband': 0.1
};

/**
 * Fetch data from API
 */
async function fetchFromAPI(url) {
	return new Promise((resolve, reject) => {
		https.get(url, (response) => {
			if (response.statusCode !== 200) {
				reject(new Error(`Failed to fetch data: ${response.statusCode}`));
				return;
			}

			let data = '';
			response.on('data', (chunk) => {
				data += chunk;
			});

			response.on('end', () => {
				try {
					resolve(JSON.parse(data));
				} catch (error) {
					reject(new Error(`Failed to parse JSON: ${error.message}`));
				}
			});
		}).on('error', reject);
	});
}

/**
 * Generate safe filename from skin name
 */
function generateFilename(skinName) {
	return skinName
		.toLowerCase()
		.replace(/[★™]/g, '')
		.replace(/[^a-z0-9-]/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '')
		+ '.png';
}

/**
 * Calculate market value based on rarity (mock values for now)
 */
function calculateMarketValue(rarity, weaponType) {
	const baseValues = {
		'Common': { min: 0.03, max: 0.5 },
		'Uncommon': { min: 0.5, max: 3 },
		'Rare': { min: 3, max: 15 },
		'Epic': { min: 15, max: 100 },
		'Legendary': { min: 100, max: 500 },
		'Contraband': { min: 500, max: 5000 }
	};

	// Knives and gloves are more expensive
	const multiplier = (weaponType?.includes('Knife') || weaponType?.includes('Gloves')) ? 10 : 1;

	const range = baseValues[rarity] || baseValues['Common'];
	const randomValue = Math.random() * (range.max - range.min) + range.min;

	return Math.round(randomValue * multiplier * 100) / 100;
}

/**
 * Create popular CS2 cases with items
 */
async function createCasesAndItems(skins, crates) {
	console.log('🎯 Creating cases and items...');

	// Define popular cases to create
	const popularCases = [
		{
			name: 'Revolution Case',
			description: 'The Revolution Case contains some of the most iconic CS2 skins',
			price: 2.49,
			weaponTypes: ['AK-47', 'AWP', 'M4A4', 'M4A1-S', 'Glock-18']
		},
		{
			name: 'Dreams & Nightmares Case',
			description: 'Community-designed skins featuring dreams and nightmares',
			price: 2.49,
			weaponTypes: ['USP-S', 'Desert Eagle', 'MP9', 'FAMAS', 'G3SG1']
		},
		{
			name: 'Fracture Case',
			description: 'Featuring striking fractured designs and patterns',
			price: 2.49,
			weaponTypes: ['AK-47', 'Glock-18', 'M4A1-S', 'SSG 08', 'Five-SeveN']
		},
		{
			name: 'Recoil Case',
			description: 'High-impact skins with aggressive designs',
			price: 2.49,
			weaponTypes: ['AWP', 'USP-S', 'M4A4', 'Dual Berettas', 'UMP-45']
		}
	];

	const createdCases = [];

	for (const caseConfig of popularCases) {
		console.log(`📦 Creating case: ${caseConfig.name}`);

		// Filter skins for this case based on weapon types
		const caseSkins = skins.filter(skin =>
			caseConfig.weaponTypes.includes(skin.weapon?.name) &&
			skin.image &&
			skin.rarity?.name
		).slice(0, 15); // Limit to 15 items per case

		if (caseSkins.length === 0) {
			console.log(`⚠️  No skins found for ${caseConfig.name}, skipping...`);
			continue;
		}

		// Create the case
		const { data: caseData, error: caseError } = await supabase
			.from('cases')
			.insert({
				name: caseConfig.name,
				description: caseConfig.description,
				price: caseConfig.price,
				item_count: caseSkins.length
			})
			.select()
			.single();

		if (caseError) {
			console.error(`❌ Failed to create case ${caseConfig.name}:`, caseError);
			continue;
		}

		console.log(`✅ Created case: ${caseData.name} (${caseData.id})`);

		// Create items for this case
		const caseItems = caseSkins.map(skin => {
			const mappedRarity = RARITY_MAPPING[skin.rarity.name] || 'Common';
			const probability = RARITY_PROBABILITIES[mappedRarity] || 10.0;
			const marketValue = calculateMarketValue(mappedRarity, skin.weapon?.name);

			return {
				case_id: caseData.id,
				name: skin.name,
				market_name: skin.name,
				image_url: `/images/skins/${generateFilename(skin.name)}`,
				rarity: mappedRarity,
				probability: probability,
				market_value: marketValue
			};
		});

		// Insert items in batch
		const { data: itemsData, error: itemsError } = await supabase
			.from('case_items')
			.insert(caseItems)
			.select();

		if (itemsError) {
			console.error(`❌ Failed to create items for ${caseConfig.name}:`, itemsError);
		} else {
			console.log(`✅ Created ${itemsData.length} items for ${caseConfig.name}`);
		}

		createdCases.push({
			case: caseData,
			items: itemsData || []
		});
	}

	return createdCases;
}

/**
 * Clear existing data (optional)
 */
async function clearExistingData() {
	console.log('🧹 Clearing existing case data...');

	// Delete in correct order (items first, then cases)
	const { error: itemsError } = await supabase
		.from('case_items')
		.delete()
		.neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

	if (itemsError) {
		console.warn('⚠️  Warning clearing items:', itemsError);
	}

	const { error: casesError } = await supabase
		.from('cases')
		.delete()
		.neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

	if (casesError) {
		console.warn('⚠️  Warning clearing cases:', casesError);
	}

	console.log('✅ Cleared existing data');
}

/**
 * Test database connection
 */
async function testConnection() {
	console.log('🔌 Testing Supabase connection...');

	const { data, error } = await supabase
		.from('cases')
		.select('count', { count: 'exact', head: true });

	if (error) {
		throw new Error(`Database connection failed: ${error.message}`);
	}

	console.log('✅ Database connection successful');
}

/**
 * Main seeding function
 */
async function seedDatabase() {
	try {
		console.log('🚀 Starting CS2 database seeding...\n');

		// Test connection
		await testConnection();

		// Ask user if they want to clear existing data
		const shouldClear = process.argv.includes('--clear');
		if (shouldClear) {
			await clearExistingData();
		}

		console.log('📥 Fetching CS2 data from API...');

		// Fetch data from API
		const [skins, crates] = await Promise.all([
			fetchFromAPI(CS2_SKINS_API),
			fetchFromAPI(CS2_CRATES_API)
		]);

		console.log(`✅ Fetched ${skins.length} skins and ${crates.length} crates`);

		// Create cases and items
		const createdCases = await createCasesAndItems(skins, crates);

		// Summary
		console.log('\n🎉 Database seeding completed!');
		console.log(`📦 Cases created: ${createdCases.length}`);

		const totalItems = createdCases.reduce((sum, caseData) => sum + caseData.items.length, 0);
		console.log(`🎯 Items created: ${totalItems}`);

		console.log('\n💡 Your case opening is now ready with real CS2 skins!');
		console.log('   Make sure to run the image download script:');
		console.log('   npm run download:images');

		// Save summary for reference
		const summary = {
			timestamp: new Date().toISOString(),
			cases: createdCases.map(({ case: caseData, items }) => ({
				id: caseData.id,
				name: caseData.name,
				itemCount: items.length
			})),
			totalCases: createdCases.length,
			totalItems: totalItems
		};

		fs.writeFileSync(
			path.join(__dirname, 'seed-summary.json'),
			JSON.stringify(summary, null, 2)
		);

		console.log('\n📄 Seed summary saved to scripts/seed-summary.json');

	} catch (error) {
		console.error('\n❌ Seeding failed:', error.message);
		process.exit(1);
	}
}

// Run the seeder
seedDatabase();