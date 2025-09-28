#!/usr/bin/env node

/**
 * Generate CS2 case placeholder images
 * Usage: node scripts/generate-case-images.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CASES_DIR = path.join(__dirname, '..', 'static', 'images', 'cases');

// Case designs with colors and themes
const CS2_CASES = {
	'Revolution Case': {
		filename: 'revolution-case.svg',
		color: '#ff4444',
		accent: '#cc2222',
		theme: 'Revolution'
	},
	'Dreams & Nightmares Case': {
		filename: 'dreams-nightmares-case.svg',
		color: '#6644ff',
		accent: '#4422cc',
		theme: 'Dreams'
	},
	'Fracture Case': {
		filename: 'fracture-case.svg',
		color: '#ff8844',
		accent: '#cc5522',
		theme: 'Fracture'
	},
	'Recoil Case': {
		filename: 'recoil-case.svg',
		color: '#44ff88',
		accent: '#22cc55',
		theme: 'Recoil'
	}
};

/**
 * Generate SVG case image
 */
function generateCaseImage(caseName, caseData) {
	const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="256" height="192" viewBox="0 0 256 192" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="256" height="192" fill="url(#background)" rx="12"/>

  <!-- Case Body -->
  <rect x="32" y="48" width="192" height="96" fill="${caseData.color}" rx="8" stroke="${caseData.accent}" stroke-width="2"/>

  <!-- Case Lock -->
  <rect x="112" y="32" width="32" height="16" fill="${caseData.accent}" rx="4"/>
  <rect x="120" y="40" width="16" height="8" fill="none" stroke="#333" stroke-width="2" rx="2"/>

  <!-- Case Handle -->
  <rect x="224" y="72" width="8" height="48" fill="${caseData.accent}" rx="4"/>

  <!-- Decorative Elements -->
  <circle cx="64" cy="80" r="12" fill="${caseData.accent}" opacity="0.7"/>
  <circle cx="192" cy="112" r="8" fill="${caseData.accent}" opacity="0.5"/>
  <rect x="80" y="120" width="96" height="2" fill="${caseData.accent}" opacity="0.8"/>

  <!-- Case Text -->
  <text x="128" y="100" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">
    ${caseData.theme}
  </text>
  <text x="128" y="116" text-anchor="middle" fill="#cccccc" font-family="Arial, sans-serif" font-size="10">
    CASE
  </text>

  <!-- CS2 Badge -->
  <rect x="200" y="160" width="48" height="16" fill="#333" rx="8"/>
  <text x="224" y="172" text-anchor="middle" fill="#fff" font-family="Arial, sans-serif" font-size="8">
    CS2
  </text>

  <!-- Gradient Definitions -->
  <defs>
    <linearGradient id="background" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e"/>
      <stop offset="100%" style="stop-color:#16213e"/>
    </linearGradient>
  </defs>
</svg>`;

	return svgContent;
}

/**
 * Main generation function
 */
async function generateAllCaseImages() {
	try {
		// Create cases directory if it doesn't exist
		if (!fs.existsSync(CASES_DIR)) {
			fs.mkdirSync(CASES_DIR, { recursive: true });
			console.log(`📁 Created directory: ${CASES_DIR}`);
		}

		console.log('🚀 Starting CS2 case image generation...\n');

		for (const [caseName, caseData] of Object.entries(CS2_CASES)) {
			const filePath = path.join(CASES_DIR, caseData.filename);
			const svgContent = generateCaseImage(caseName, caseData);

			fs.writeFileSync(filePath, svgContent);
			console.log(`✅ Generated ${caseData.filename}`);
		}

		console.log('\n🎉 Case image generation completed!');
		console.log(`📂 Images saved to: ${CASES_DIR}`);
		console.log(`✅ Generated: ${Object.keys(CS2_CASES).length} case images`);

		console.log('\n💡 Case images are now available at:');
		Object.values(CS2_CASES).forEach(caseData => {
			console.log(`   /images/cases/${caseData.filename}`);
		});

	} catch (error) {
		console.error('\n❌ Generation failed:', error.message);
		process.exit(1);
	}
}

// Run the generation
generateAllCaseImages();