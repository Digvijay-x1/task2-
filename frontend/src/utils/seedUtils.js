// Frontend Assignment Seed
export const ASSIGNMENT_SEED = 'FRONT25-058';

/**
 * Extract num value from assignment seed
 */
export function extractSeedNumber(seed = ASSIGNMENT_SEED) {
  const match = seed.match(/(\d+)$/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Generate color palette from assignment seed
 * Creates a consistent color theme based on the seed
 */
export function generateSeedColorPalette(seed = ASSIGNMENT_SEED) {
  // Create a hash from the seed
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Generate HSL values from hash
  const hue = Math.abs(hash) % 360;
  const saturation = 65 + (Math.abs(hash >> 8) % 20); // 65-85%
  const lightness = 45 + (Math.abs(hash >> 16) % 15); // 45-60%

  // Generate color palette
  const colors = {
    50: `hsl(${hue}, ${saturation - 20}%, 95%)`,
    100: `hsl(${hue}, ${saturation - 15}%, 90%)`,
    200: `hsl(${hue}, ${saturation - 10}%, 80%)`,
    300: `hsl(${hue}, ${saturation - 5}%, 70%)`,
    400: `hsl(${hue}, ${saturation}%, 60%)`,
    500: `hsl(${hue}, ${saturation}%, ${lightness}%)`, // Main color
    600: `hsl(${hue}, ${saturation + 5}%, ${lightness - 10}%)`,
    700: `hsl(${hue}, ${saturation + 10}%, ${lightness - 20}%)`,
    800: `hsl(${hue}, ${saturation + 15}%, ${lightness - 30}%)`,
    900: `hsl(${hue}, ${saturation + 20}%, ${lightness - 40}%)`,
  };

  // Generate accent color (complementary)
  const accentHue = (hue + 180) % 360;
  const accentColors = {
    50: `hsl(${accentHue}, ${saturation - 20}%, 95%)`,
    100: `hsl(${accentHue}, ${saturation - 15}%, 90%)`,
    200: `hsl(${accentHue}, ${saturation - 10}%, 80%)`,
    300: `hsl(${accentHue}, ${saturation - 5}%, 70%)`,
    400: `hsl(${accentHue}, ${saturation}%, 60%)`,
    500: `hsl(${accentHue}, ${saturation}%, ${lightness}%)`,
    600: `hsl(${accentHue}, ${saturation + 5}%, ${lightness - 10}%)`,
    700: `hsl(${accentHue}, ${saturation + 10}%, ${lightness - 20}%)`,
    800: `hsl(${accentHue}, ${saturation + 15}%, ${lightness - 30}%)`,
    900: `hsl(${accentHue}, ${saturation + 20}%, ${lightness - 40}%)`,
  };

  return {
    primary: colors,
    accent: accentColors,
    hue,
    saturation,
    lightness
  };
}

/**
 * Apply seed-based color theme to CSS variables
 */
export function applySeedTheme(seed = ASSIGNMENT_SEED) {
  const palette = generateSeedColorPalette(seed);
  const root = document.documentElement;

  // Apply primary colors
  Object.entries(palette.primary).forEach(([shade, color]) => {
    root.style.setProperty(`--color-primary-${shade}`, color);
  });

  // Apply accent colors
  Object.entries(palette.accent).forEach(([shade, color]) => {
    root.style.setProperty(`--color-accent-${shade}`, color);
  });

  return palette;
}

/**
 * Calculate platform fee for frontend display
 * Formula: (seed_number % 10)% of subtotal
 */
export function calculatePlatformFee(subtotal, seed = ASSIGNMENT_SEED) {
  const seedNumber = extractSeedNumber(seed);
  const feePercentage = (seedNumber % 10) / 100; // Convert to percentage
  return subtotal * feePercentage;
}

/**
 * Generate checksum digit for product ID display
 * Uses seed to create consistent checksum
 */
export function generateProductChecksum(productId, seed = ASSIGNMENT_SEED) {
  const combined = `${productId}-${seed}`;
  let hash = 0;
  
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash) % 10; // Single digit checksum
}

/**
 * Format product ID with checksum for display
 */
export function formatProductIdWithChecksum(productId, seed = ASSIGNMENT_SEED) {
  const checksum = generateProductChecksum(productId, seed);
  return `${productId}-${checksum}`;
}

/**
 * Get seed information for display
 */
export function getSeedInfo(seed = ASSIGNMENT_SEED) {
  const seedNumber = extractSeedNumber(seed);
  const palette = generateSeedColorPalette(seed);
  
  return {
    seed,
    seedNumber,
    platformFeePercentage: seedNumber % 10,
    primaryColor: palette.primary[500],
    accentColor: palette.accent[500],
    hue: palette.hue,
    saturation: palette.saturation,
    lightness: palette.lightness
  };
}

/**
 * Initialize seed-based theme on app startup
 */
export function initializeSeedTheme() {
  try {
    const palette = applySeedTheme();
    console.log('🎨 Seed-based theme applied:', {
      seed: ASSIGNMENT_SEED,
      primaryColor: palette.primary[500],
      accentColor: palette.accent[500]
    });
    return palette;
  } catch (error) {
    console.error('❌ Failed to apply seed theme:', error);
    // Graceful fallback - use default colors
    return null;
  }
}
