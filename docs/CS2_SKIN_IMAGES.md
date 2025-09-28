# CS2 Skin Images Integration

This document explains how to use the new real CS2 skin image system powered by the ByMykel/CSGO-API.

## Overview

The system now fetches **real, high-quality CS2 skin images** from Valve's official sources via the ByMykel/CSGO-API. This replaces the previous placeholder system with authentic CS2 skins.

## Key Features

✅ **15,000+ Real CS2 Skins**: Access to the complete CS2 skin database
✅ **High-Quality Images**: Official CS2 skin images with transparent backgrounds
✅ **Automatic Metadata**: Weapon types, rarities, collections, and wear conditions
✅ **Smart Prioritization**: Popular weapons (AK-47, AWP, M4A4) downloaded first
✅ **Database Seeding**: Populate Supabase with real skin data for case opening
✅ **Batch Processing**: Efficient concurrent downloads with rate limiting

## Quick Start

### 1. Download Real CS2 Images

```bash
# Download 100 skins (default)
npm run download:images

# Download specific number of skins
npm run download:images 50

# Download more skins
node scripts/download-cs2-images.js 500
```

### 2. Seed Database with Real Skin Data

```bash
# Seed database with real CS2 skins (keeps existing data)
npm run seed:database

# Clear existing data and seed fresh
npm run seed:database:clear
```

### 3. Set Up Supabase Environment

Create `.env.local` with your Supabase credentials:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## How It Works

### Download Process

1. **Fetch API Data**: Downloads complete skin database from ByMykel/CSGO-API
2. **Smart Filtering**: Prioritizes popular weapons and higher rarities
3. **Image Download**: Downloads official Valve images in batches
4. **Metadata Generation**: Creates JSON file with all skin details
5. **Local Storage**: Saves images to `static/images/skins/`

### Database Seeding

1. **Real Skin Data**: Transforms API data to match your database schema
2. **Case Creation**: Creates popular CS2 cases (Revolution, Dreams & Nightmares, etc.)
3. **Item Assignment**: Assigns real skins to cases with proper probabilities
4. **Market Values**: Calculates realistic market values based on rarity

## File Structure

```
scripts/
├── download-cs2-images.js      # Downloads real CS2 skin images
├── seed-skins-database.js      # Seeds database with real skin data
└── generate-placeholders.js    # (Legacy) Generates SVG placeholders

static/images/skins/
├── ak-47-redline.png           # Real CS2 skin images
├── awp-dragon-lore.png
├── skins-metadata.json         # Complete skin metadata
└── ...

src/lib/types.ts                # Enhanced with CS2-specific types
```

## API Data Structure

The ByMykel/CSGO-API provides rich metadata for each skin:

```json
{
  "id": "skin-4c2e3face5fd_0",
  "name": "AK-47 | Searing Rage (Factory New)",
  "weapon": "AK-47",
  "category": "Rifles",
  "rarity": "Classified",
  "image": "https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/...",
  "collections": [...],
  "crates": [...]
}
```

## Enhanced TypeScript Support

New types for better CS2 skin handling:

```typescript
// Weapon types
type CS2WeaponType = 'AK-47' | 'AWP' | 'M4A4' | 'Karambit' | ...

// Wear conditions
type CS2WearCondition = 'Factory New' | 'Minimal Wear' | 'Field-Tested' | 'Well-Worn' | 'Battle-Scarred'

// Categories
type CS2Category = 'Rifles' | 'Pistols' | 'Knives' | 'Gloves' | ...

// Utility functions
CS2Utils.isKnife(weaponType)
CS2Utils.isGloves(weaponType)
CS2Utils.getCategory(weaponType)
CS2Utils.generateFilename(skinName)
```

## Advanced Configuration

### Download Script Options

```bash
# Download specific number of skins
node scripts/download-cs2-images.js 200

# The script automatically:
# - Prioritizes popular weapons (AK-47, AWP, M4A4)
# - Handles rate limiting with batched downloads
# - Retries failed downloads
# - Skips existing files
# - Generates metadata JSON
```

### Database Seeder Options

```bash
# Standard seeding (keeps existing data)
node scripts/seed-skins-database.js

# Clear all existing cases and items first
node scripts/seed-skins-database.js --clear

# The seeder creates:
# - 4 popular CS2 cases
# - ~15 items per case
# - Realistic probabilities by rarity
# - Market values based on rarity/weapon type
```

## Usage in Components

The images work seamlessly with your existing UI:

```svelte
<!-- CaseOpeningRoulette.svelte -->
<img src="/images/skins/{item.image_url}" alt={item.name} />

<!-- The image paths now point to real CS2 skins -->
```

## Troubleshooting

### Common Issues

1. **Missing Images**: Run `npm run download:images` first
2. **Database Errors**: Check Supabase environment variables
3. **Download Failures**: Network issues - script has automatic retry logic
4. **Large Downloads**: Use smaller limits for testing: `npm run download:images 10`

### Verification

Check downloaded images:

```bash
ls -la static/images/skins/
cat static/images/skins/skins-metadata.json
```

Check database seeding:

```bash
cat scripts/seed-summary.json
```

## Benefits

🎯 **Authentic Experience**: Real CS2 skins enhance user engagement
⚡ **Performance**: Optimized batch downloading and smart caching
🔧 **Maintainable**: Clean separation between image downloading and database seeding
📈 **Scalable**: Can easily download thousands of skins
🎨 **Quality**: High-resolution, transparent background images

## API Credits

This integration uses the excellent [ByMykel/CSGO-API](https://github.com/ByMykel/CSGO-API) which provides:

- Complete CS2 skin database
- Real-time updates
- Multiple languages
- Free usage
- No rate limits
- Official Valve image sources

## Next Steps

1. **Download Images**: `npm run download:images`
2. **Seed Database**: `npm run seed:database`
3. **Test Case Opening**: Verify real images appear in your case opening UI
4. **Scale Up**: Download more skins as needed for your case collections

Your case opening now features authentic CS2 skins with real market values and proper rarity distributions!
