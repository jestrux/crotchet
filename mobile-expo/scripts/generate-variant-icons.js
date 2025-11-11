/**
 * Icon Generation Script
 *
 * This script generates all icon variants (dev, staging, production) from source files.
 *
 * Source Files (required):
 * - icon-source.png (used for both app icon and splash icon)
 * - android-icon-foreground-source.png
 * - android-icon-monochrome-source.png
 *
 * Generated Files:
 * - icon.png, icon-dev.png, icon-staging.png
 * - splash-icon.png, splash-icon-dev.png, splash-icon-staging.png (generated from icon-source.png)
 * - android-icon-foreground.png, android-icon-foreground-dev.png, android-icon-foreground-staging.png
 * - android-icon-monochrome.png, android-icon-monochrome-dev.png, android-icon-monochrome-staging.png
 * - android-icon-background.png, android-icon-background-dev.png, android-icon-background-staging.png
 *
 * Dev and Staging variants get a badge overlay. Production variants are clean copies.
 *
 * Usage: npm run generate-icons
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const assetsPath = path.join(__dirname, '../assets/images');

// Badge configurations for each variant
const variants = {
  dev: {
    color: '#3E3215',
    text: 'DEV',
  },
  staging: {
    color: '#3E3215',
    text: 'STAGE',
  },
  production: {
    color: null, // No badge for production
    text: null,
  },
};

async function addBadgeToIcon(inputPath, outputPath, variant) {
  const { color, text } = variants[variant];

  // If no badge needed (production), just copy the file
  if (!color || !text) {
    await copyFile(inputPath, outputPath);
    return;
  }

  // Read the original icon
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const { width, height } = metadata;

  // Calculate badge size (20% of icon height)
  const badgeHeight = Math.floor(height * 0.2);
  const fontSize = Math.floor(badgeHeight * 0.5);

  // Create SVG badge overlay
  const badge = `
    <svg width="${width}" height="${height}">
      <rect x="0" y="${height - badgeHeight}" width="${width}" height="${badgeHeight}" fill="${color}" opacity="0.9"/>
      <text
        x="50%"
        y="${height - badgeHeight / 2}"
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="Arial, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="white"
      >${text}</text>
    </svg>
  `;

  // Composite badge onto icon
  await image
    .composite([
      {
        input: Buffer.from(badge),
        top: 0,
        left: 0,
      },
    ])
    .toFile(outputPath);

  console.log(`✓ Created ${path.basename(outputPath)}`);
}

async function copyFile(inputPath, outputPath) {
  await fs.promises.copyFile(inputPath, outputPath);
  console.log(`✓ Copied ${path.basename(outputPath)}`);
}

async function generateVariantIcons() {
  console.log('Generating variant icons...\n');

  // Icons that need processing (source files with -source suffix)
  const iconsToProcess = [
    { source: 'icon-source.png', base: 'icon' },
    { source: 'icon-source.png', base: 'splash-icon' }, // Use icon as splash source
    { source: 'android-icon-foreground-source.png', base: 'android-icon-foreground' },
    { source: 'android-icon-monochrome-source.png', base: 'android-icon-monochrome' },
  ];

  // Icons that should be copied without modification (backgrounds stay the same)
  const iconsWithoutBadges = [
    { input: 'android-icon-background.png', base: 'android-icon-background' },
  ];

  // Generate all variants (dev, staging, production) from source files
  for (const icon of iconsToProcess) {
    const sourcePath = path.join(assetsPath, icon.source);

    // Check if source file exists
    if (!fs.existsSync(sourcePath)) {
      console.log(`⚠ Skipping ${icon.source} - source file not found`);
      continue;
    }

    // Generate all variants including production
    for (const [variant, config] of Object.entries(variants)) {
      // Production uses base name without suffix, others use variant suffix
      const outputName = variant === 'production'
        ? `${icon.base}.png`
        : `${icon.base}-${variant}.png`;
      const outputPath = path.join(assetsPath, outputName);
      await addBadgeToIcon(sourcePath, outputPath, variant);
    }
  }

  // Copy background images for each variant (same across all variants)
  for (const icon of iconsWithoutBadges) {
    const inputPath = path.join(assetsPath, icon.input);

    // Check if file exists before processing
    if (!fs.existsSync(inputPath)) {
      console.log(`⚠ Skipping ${icon.input} - file not found`);
      continue;
    }

    for (const variant of Object.keys(variants)) {
      // Production uses base name without suffix, others use variant suffix
      const outputName = variant === 'production'
        ? `${icon.base}.png`
        : `${icon.base}-${variant}.png`;
      const outputPath = path.join(assetsPath, outputName);
      await copyFile(inputPath, outputPath);
    }
  }

  console.log('\n✓ All variant icons generated successfully!');
}

generateVariantIcons().catch(console.error);
