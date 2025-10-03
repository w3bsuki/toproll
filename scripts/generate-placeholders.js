#!/usr/bin/env node

/**
 * Generate placeholder CS2 skin SVG images
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, '..', 'static', 'images', 'skins');

// Weapon templates with different colors for different rarities
const weaponTemplates = {
	// Rifles
	ak47: (color) => `<rect x="20" y="25" width="85" height="12" rx="6" fill="${color}"/>
<rect x="15" y="28" width="95" height="6" rx="3" fill="${color}AA"/>
<rect x="5" y="30" width="25" height="4" rx="2" fill="#2F4F4F"/>
<rect x="105" y="28" width="15" height="8" rx="4" fill="#1C1C1C"/>
<rect x="35" y="37" width="12" height="18" rx="2" fill="#2F4F4F"/>
<rect x="37" y="39" width="8" height="14" rx="1" fill="#1C1C1C"/>
<rect x="95" y="20" width="20" height="15" rx="3" fill="#654321"/>
<rect x="100" y="22" width="12" height="11" rx="2" fill="#8B4513"/>
<circle cx="55" cy="35" r="2" fill="#1C1C1C"/>`,

	m4a4: (color) => `<rect x="20" y="25" width="85" height="12" rx="6" fill="${color}"/>
<rect x="15" y="28" width="95" height="6" rx="3" fill="${color}AA"/>
<rect x="5" y="30" width="25" height="4" rx="2" fill="#2F4F4F"/>
<rect x="105" y="28" width="15" height="8" rx="4" fill="#1C1C1C"/>
<rect x="35" y="37" width="12" height="18" rx="2" fill="#2F4F4F"/>
<rect x="37" y="39" width="8" height="14" rx="1" fill="#1C1C1C"/>
<rect x="95" y="20" width="20" height="15" rx="3" fill="#654321"/>
<rect x="100" y="22" width="12" height="11" rx="2" fill="#8B4513"/>
<circle cx="55" cy="35" r="2" fill="#1C1C1C"/>`,

	awp: (color) => `<rect x="10" y="25" width="105" height="12" rx="6" fill="${color}"/>
<rect x="5" y="28" width="115" height="6" rx="3" fill="${color}AA"/>
<rect x="120" y="28" width="8" height="8" rx="4" fill="#1C1C1C"/>
<rect x="45" y="37" width="10" height="20" rx="2" fill="#2F4F4F"/>
<rect x="47" y="39" width="6" height="16" rx="1" fill="#1C1C1C"/>
<rect x="95" y="18" width="25" height="18" rx="3" fill="#654321"/>
<rect x="100" y="20" width="17" height="14" rx="2" fill="#8B4513"/>
<rect x="70" y="20" width="15" height="8" rx="4" fill="#2F4F4F"/>
<rect x="72" y="22" width="11" height="4" rx="2" fill="#1C1C1C"/>
<circle cx="65" cy="35" r="2" fill="#1C1C1C"/>`,

	// Pistols
	deagle: (color) => `<rect x="25" y="28" width="70" height="10" rx="5" fill="${color}"/>
<rect x="20" y="30" width="80" height="6" rx="3" fill="${color}AA"/>
<rect x="10" y="32" width="20" height="3" rx="1.5" fill="#2F4F4F"/>
<rect x="95" y="30" width="12" height="6" rx="3" fill="#1C1C1C"/>
<rect x="40" y="38" width="8" height="12" rx="2" fill="#2F4F4F"/>
<rect x="42" y="40" width="4" height="8" rx="1" fill="#1C1C1C"/>
<rect x="85" y="25" width="15" height="12" rx="3" fill="#654321"/>
<rect x="88" y="27" width="9" height="8" rx="2" fill="#8B4513"/>
<circle cx="50" cy="35" r="1.5" fill="#1C1C1C"/>`,

	usps: (color) => `<rect x="30" y="28" width="60" height="10" rx="5" fill="${color}"/>
<rect x="25" y="30" width="70" height="6" rx="3" fill="${color}AA"/>
<rect x="15" y="32" width="18" height="3" rx="1.5" fill="#2F4F4F"/>
<rect x="90" y="30" width="10" height="6" rx="3" fill="#1C1C1C"/>
<rect x="45" y="38" width="6" height="10" rx="2" fill="#2F4F4F"/>
<rect x="47" y="40" width="2" height="6" rx="1" fill="#1C1C1C"/>
<rect x="80" y="25" width="12" height="12" rx="3" fill="#654321"/>
<rect x="83" y="27" width="6" height="8" rx="2" fill="#8B4513"/>
<circle cx="52" cy="35" r="1.5" fill="#1C1C1C"/>`,

	glock: (color) => `<rect x="35" y="28" width="55" height="10" rx="5" fill="${color}"/>
<rect x="30" y="30" width="65" height="6" rx="3" fill="${color}AA"/>
<rect x="20" y="32" width="16" height="3" rx="1.5" fill="#2F4F4F"/>
<rect x="85" y="30" width="8" height="6" rx="3" fill="#1C1C1C"/>
<rect x="50" y="38" width="5" height="8" rx="2" fill="#2F4F4F"/>
<rect x="52" y="40" width="1" height="4" rx="0.5" fill="#1C1C1C"/>
<rect x="75" y="25" width="10" height="12" rx="3" fill="#654321"/>
<rect x="78" y="27" width="4" height="8" rx="2" fill="#8B4513"/>
<circle cx="57" cy="35" r="1.5" fill="#1C1C1C"/>`,

	// Knives
	knife: (color) => `<rect x="50" y="20" width="30" height="25" rx="3" fill="#8B4513"/>
<rect x="52" y="22" width="26" height="21" rx="2" fill="#A0522D"/>
<path d="M45 25 Q35 15 45 10 Q55 15 50 25 Q60 35 50 45 Q40 35 45 25" fill="${color}"/>
<path d="M45 25 Q35 15 45 10 Q55 15 50 25 Q60 35 50 45 Q40 35 45 25" stroke="#C0C0C0" stroke-width="0.5" fill="none"/>
<circle cx="65" cy="30" r="4" fill="#2F4F4F"/>
<circle cx="65" cy="30" r="2" fill="#1C1C1C"/>`
};

// Rarity colors
const rarityColors = {
	Common: '#808080',
	Uncommon: '#32CD32',
	Rare: '#4169E1',
	Epic: '#9932CC',
	Legendary: '#FF8C00',
	Contraband: '#DC143C',
	Covert: '#FF1493',
	Classified: '#FF69B4'
};

// Generate all skin images
function generateAllImages() {
	if (!fs.existsSync(IMAGES_DIR)) {
		fs.mkdirSync(IMAGES_DIR, { recursive: true });
		console.log(`📁 Created directory: ${IMAGES_DIR}`);
	}

	const skins = [
		{ name: 'ak47-redline.svg', weapon: 'ak47', color: rarityColors['Classified'] },
		{ name: 'm4a4-dragon-king.svg', weapon: 'm4a4', color: rarityColors['Covert'] },
		{ name: 'awp-manowar.svg', weapon: 'awp', color: rarityColors['Covert'] },
		{ name: 'ak47-fire-serpent.svg', weapon: 'ak47', color: rarityColors['Covert'] },
		{ name: 'm4a4-howl.svg', weapon: 'm4a4', color: rarityColors['Contraband'] },
		{ name: 'awp-dragon-lore.svg', weapon: 'awp', color: rarityColors['Covert'] },
		{ name: 'ak47-case-hardened.svg', weapon: 'ak47', color: rarityColors['Classified'] },
		{ name: 'karambit-fade.svg', weapon: 'knife', color: rarityColors['Covert'] },
		{ name: 'butterfly-knife-slaughter.svg', weapon: 'knife', color: rarityColors['Covert'] },
		{ name: 'deagle-blaze.svg', weapon: 'deagle', color: rarityColors['Classified'] },
		{ name: 'ak47-vulcan.svg', weapon: 'ak47', color: rarityColors['Covert'] },
		{ name: 'bayonet-crimson-web.svg', weapon: 'knife', color: rarityColors['Covert'] },
		{ name: 'usps-kill-confirmed.svg', weapon: 'usps', color: rarityColors['Covert'] },
		{ name: 'flip-knife-tiger-tooth.svg', weapon: 'knife', color: rarityColors['Covert'] },
		{ name: 'glock-fade.svg', weapon: 'glock', color: rarityColors['Rare'] },
		{ name: 'm9-bayonet-autotronic.svg', weapon: 'knife', color: rarityColors['Covert'] },

		// Common fillers
		{ name: 'p250-steel-disruption.svg', weapon: 'deagle', color: rarityColors['Common'] },
		{ name: 'mp9-storm.svg', weapon: 'ak47', color: rarityColors['Common'] },
		{ name: 'nova-tempest.svg', weapon: 'ak47', color: rarityColors['Common'] },
		{ name: 'ump45-corporal.svg', weapon: 'ak47', color: rarityColors['Common'] },
		{ name: 'pp-bizon-night-ops.svg', weapon: 'ak47', color: rarityColors['Common'] }
	];

	skins.forEach(({ name, weapon, color }) => {
		const template = weaponTemplates[weapon];
		if (!template) {
			console.log(`⚠️  No template for weapon type: ${weapon}, skipping ${name}`);
			return;
		}

		const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="128" height="64" viewBox="0 0 128 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  ${template(color)}
</svg>`;

		const filePath = path.join(IMAGES_DIR, name);
		fs.writeFileSync(filePath, svgContent);
		console.log(`✅ Generated ${name}`);
	});

	console.log('\n🎉 All placeholder images generated successfully!');
	console.log(`📂 Images saved to: ${IMAGES_DIR}`);
	console.log('\n💡 You can now see weapon placeholders in your case opening!');
}

generateAllImages();
