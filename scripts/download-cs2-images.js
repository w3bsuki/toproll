#!/usr/bin/env node

/**
 * Production-ready CS2 skin image downloader using ByMykel/CSGO-API
 * Downloads real Steam images for all CS2 skins
 * Usage: node scripts/download-cs2-images.js [limit]
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API endpoint for CS2 skins
const CS2_API_URL = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins_not_grouped.json';

// Configuration
const DOWNLOAD_LIMIT = parseInt(process.argv[2]) || 100; // Default limit of 100 skins
const CONCURRENT_DOWNLOADS = 5; // Number of concurrent downloads
const IMAGES_DIR = path.join(__dirname, '..', 'static', 'images', 'skins');

/**
 * Fetch CS2 skins data from API
 */
async function fetchCS2Skins() {
	console.log('🔄 Fetching CS2 skins from API...');

	return new Promise((resolve, reject) => {
		https.get(CS2_API_URL, (response) => {
			if (response.statusCode !== 200) {
				reject(new Error(`Failed to fetch skins data: ${response.statusCode}`));
				return;
			}

			let data = '';
			response.on('data', (chunk) => {
				data += chunk;
			});

			response.on('end', () => {
				try {
					const skins = JSON.parse(data);
					console.log(`✅ Fetched ${skins.length} skins from API`);
					resolve(skins);
				} catch (error) {
					reject(new Error(`Failed to parse JSON: ${error.message}`));
				}
			});
		}).on('error', (error) => {
			reject(error);
		});
	});
}

/**
 * Generate safe filename from skin name
 */
function generateFilename(skinName) {
	return skinName
		.toLowerCase()
		.replace(/[★™]/g, '') // Remove special characters
		.replace(/[^a-z0-9-]/g, '-') // Replace non-alphanumeric with dash
		.replace(/-+/g, '-') // Replace multiple dashes with single
		.replace(/^-|-$/g, '') // Remove leading/trailing dashes
		+ '.png';
}

/**
 * Download a single image with retry logic
 */
function downloadImage(imageUrl, filename, retries = 3) {
	return new Promise((resolve, reject) => {
		const filePath = path.join(IMAGES_DIR, filename);

		// Check if file already exists
		if (fs.existsSync(filePath)) {
			console.log(`✓ ${filename} already exists`);
			resolve(filename);
			return;
		}

		console.log(`⬇️  Downloading ${filename}...`);

		const file = fs.createWriteStream(filePath);
		const downloadAttempt = (attempt) => {
			https
				.get(imageUrl, (response) => {
					if (response.statusCode === 404) {
						console.log(`⚠️  Image not found: ${filename} (404)`);
						resolve(null);
						return;
					}

					if (response.statusCode !== 200) {
						if (attempt < retries) {
							console.log(`⚠️  Retry ${attempt + 1}/${retries} for ${filename}`);
							setTimeout(() => downloadAttempt(attempt + 1), 1000);
							return;
						}
						reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
						return;
					}

					response.pipe(file);

					file.on('finish', () => {
						file.close();
						console.log(`✅ Downloaded ${filename}`);
						resolve(filename);
					});
				})
				.on('error', (err) => {
					fs.unlink(filePath, () => {}); // Delete partial file
					if (attempt < retries) {
						console.log(`⚠️  Retry ${attempt + 1}/${retries} for ${filename} (${err.message})`);
						setTimeout(() => downloadAttempt(attempt + 1), 1000);
					} else {
						reject(err);
					}
				});
		};

		downloadAttempt(0);
	});
}

/**
 * Process downloads in batches to prevent overwhelming the server
 */
async function downloadInBatches(downloadTasks) {
	const results = {
		successful: [],
		failed: [],
		skipped: []
	};

	for (let i = 0; i < downloadTasks.length; i += CONCURRENT_DOWNLOADS) {
		const batch = downloadTasks.slice(i, i + CONCURRENT_DOWNLOADS);
		console.log(`\n📦 Processing batch ${Math.floor(i / CONCURRENT_DOWNLOADS) + 1}/${Math.ceil(downloadTasks.length / CONCURRENT_DOWNLOADS)}...`);

		const batchPromises = batch.map(async (task) => {
			try {
				const result = await downloadImage(task.imageUrl, task.filename);
				if (result) {
					results.successful.push(result);
				} else {
					results.skipped.push(task.filename);
				}
			} catch (error) {
				console.error(`❌ Failed to download ${task.filename}: ${error.message}`);
				results.failed.push(task.filename);
			}
		});

		await Promise.all(batchPromises);

		// Small delay between batches to be respectful to the server
		if (i + CONCURRENT_DOWNLOADS < downloadTasks.length) {
			await new Promise(resolve => setTimeout(resolve, 500));
		}
	}

	return results;
}

/**
 * Filter and prioritize skins for download
 */
function prioritizeSkins(skins) {
	// Filter out skins without images
	const skinsWithImages = skins.filter(skin => skin.image);

	// Prioritize popular weapons and higher rarities
	const weaponPriority = ['AK-47', 'AWP', 'M4A4', 'M4A1-S', 'Glock-18', 'USP-S', 'Desert Eagle'];
	const rarityPriority = ['Covert', 'Classified', 'Restricted', 'Mil-Spec', 'Industrial Grade', 'Consumer Grade'];

	return skinsWithImages
		.sort((a, b) => {
			// Sort by weapon priority first
			const aWeaponIndex = weaponPriority.indexOf(a.weapon?.name || '');
			const bWeaponIndex = weaponPriority.indexOf(b.weapon?.name || '');
			if (aWeaponIndex !== -1 && bWeaponIndex !== -1) {
				return aWeaponIndex - bWeaponIndex;
			}
			if (aWeaponIndex !== -1) return -1;
			if (bWeaponIndex !== -1) return 1;

			// Then by rarity
			const aRarityIndex = rarityPriority.indexOf(a.rarity?.name || '');
			const bRarityIndex = rarityPriority.indexOf(b.rarity?.name || '');
			if (aRarityIndex !== -1 && bRarityIndex !== -1) {
				return aRarityIndex - bRarityIndex;
			}
			if (aRarityIndex !== -1) return -1;
			if (bRarityIndex !== -1) return 1;

			return 0;
		})
		.slice(0, DOWNLOAD_LIMIT);
}

/**
 * Save skins metadata to JSON file for later use
 */
function saveSkinMetadata(skins) {
	const metadataPath = path.join(IMAGES_DIR, 'skins-metadata.json');
	const metadata = skins.map(skin => ({
		id: skin.id,
		name: skin.name,
		weapon: skin.weapon?.name || 'Unknown',
		category: skin.category?.name || 'Unknown',
		rarity: skin.rarity?.name || 'Unknown',
		collection: skin.crates?.[0]?.name || skin.collections?.[0]?.name || 'Unknown',
		image_url: skin.image,
		filename: generateFilename(skin.name)
	}));

	fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
	console.log(`💾 Saved metadata for ${metadata.length} skins to skins-metadata.json`);
	return metadata;
}

/**
 * Main download function
 */
async function downloadAllImages() {
	try {
		// Create images directory if it doesn't exist
		if (!fs.existsSync(IMAGES_DIR)) {
			fs.mkdirSync(IMAGES_DIR, { recursive: true });
			console.log(`📁 Created directory: ${IMAGES_DIR}`);
		}

		console.log('🚀 Starting CS2 skin image download...\n');
		console.log(`📊 Limit: ${DOWNLOAD_LIMIT} skins`);
		console.log(`⚡ Concurrent downloads: ${CONCURRENT_DOWNLOADS}\n`);

		// Fetch all skins from API
		const allSkins = await fetchCS2Skins();

		// Filter and prioritize skins
		const selectedSkins = prioritizeSkins(allSkins);
		console.log(`🎯 Selected ${selectedSkins.length} skins for download\n`);

		// Save metadata
		const metadata = saveSkinMetadata(selectedSkins);

		// Prepare download tasks
		const downloadTasks = selectedSkins.map(skin => ({
			imageUrl: skin.image,
			filename: generateFilename(skin.name),
			skinName: skin.name
		}));

		// Download images in batches
		const results = await downloadInBatches(downloadTasks);

		// Print final results
		console.log('\n🎉 Download completed!');
		console.log(`📂 Images saved to: ${IMAGES_DIR}`);
		console.log(`✅ Successful: ${results.successful.length}`);
		console.log(`⚠️  Skipped (404): ${results.skipped.length}`);
		console.log(`❌ Failed: ${results.failed.length}`);

		if (results.failed.length > 0) {
			console.log('\n❌ Failed downloads:');
			results.failed.forEach(filename => console.log(`   - ${filename}`));
		}

		console.log('\n💡 You can now use these images in your case opening!');
		console.log('   Example: /images/skins/ak-47-redline.png');
		console.log('   Metadata: /images/skins/skins-metadata.json');

	} catch (error) {
		console.error('\n❌ Download failed:', error.message);
		process.exit(1);
	}
}

// Run the download
downloadAllImages();