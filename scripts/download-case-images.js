#!/usr/bin/env node

/**
 * Download real CS2 case images
 * Usage: node scripts/download-case-images.js
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CASES_DIR = path.join(__dirname, '..', 'static', 'images', 'cases');

// Real CS2 case images from Steam/community sources
const CS2_CASE_IMAGES = {
	'Revolution Case':
		'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXA5QeNxQSNHRNz5vCj0FQ-jL_Ag2kFKwNrBEcS',
	'Dreams & Nightmares Case':
		'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXA5QeNxQSNHRNz5vCj0FQ-jL_Ag2kFKwNrCEUQ',
	'Fracture Case':
		'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXA5QeNxQSNHRNz5vCj0FQ-jL_Ag2kFKwNrCUUS',
	'Recoil Case':
		'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXA5QeNxQSNHRNz5vCj0FQ-jL_Ag2kFKwNrC0wT'
};

/**
 * Generate safe filename from case name
 */
function generateFilename(caseName) {
	return (
		caseName
			.toLowerCase()
			.replace(/[^a-z0-9-]/g, '-')
			.replace(/-+/g, '-')
			.replace(/^-|-$/g, '') + '.png'
	);
}

/**
 * Download a single case image
 */
function downloadCaseImage(imageUrl, filename) {
	return new Promise((resolve, reject) => {
		const filePath = path.join(CASES_DIR, filename);

		// Check if file already exists
		if (fs.existsSync(filePath)) {
			console.log(`✓ ${filename} already exists`);
			resolve(filename);
			return;
		}

		console.log(`⬇️  Downloading ${filename}...`);

		const file = fs.createWriteStream(filePath);

		https
			.get(imageUrl, (response) => {
				if (response.statusCode !== 200) {
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
				reject(err);
			});
	});
}

/**
 * Main download function
 */
async function downloadAllCaseImages() {
	try {
		// Create cases directory if it doesn't exist
		if (!fs.existsSync(CASES_DIR)) {
			fs.mkdirSync(CASES_DIR, { recursive: true });
			console.log(`📁 Created directory: ${CASES_DIR}`);
		}

		console.log('🚀 Starting CS2 case image download...\n');

		const downloads = Object.entries(CS2_CASE_IMAGES).map(([caseName, imageUrl]) =>
			downloadCaseImage(imageUrl, generateFilename(caseName)).catch((err) => {
				console.error(`❌ Failed to download ${caseName}: ${err.message}`);
				return null;
			})
		);

		const results = await Promise.all(downloads);
		const successful = results.filter((result) => result !== null);

		console.log('\n🎉 Case image download completed!');
		console.log(`📂 Images saved to: ${CASES_DIR}`);
		console.log(`✅ Successful: ${successful.length}/${Object.keys(CS2_CASE_IMAGES).length}`);

		console.log('\n💡 Case images are now available at:');
		Object.keys(CS2_CASE_IMAGES).forEach((caseName) => {
			console.log(`   /images/cases/${generateFilename(caseName)}`);
		});
	} catch (error) {
		console.error('\n❌ Download failed:', error.message);
		process.exit(1);
	}
}

// Run the download
downloadAllCaseImages();
