/**
 * Slug generation utility for URL-friendly strings
 * Based on the design specification from ui-ux-design-detailed.md
 */

/**
 * Generate a URL-friendly slug from a title or use quickAccessKey
 * @param title - The prompt title
 * @param quickAccessKey - Optional quick access key (takes precedence)
 * @returns URL-friendly slug
 */
export function generateSlug(title: string, quickAccessKey?: string): string {
  // Use quickAccessKey if provided (already URL-friendly)
  if (quickAccessKey) {
    return quickAccessKey;
  }

  // Convert title to slug
  return title
    ?.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .slice(0, 50) // Limit length
    .replace(/-+$/, '') // Remove trailing hyphens
    || 'untitled';
}

/**
 * Generate a unique slug by appending number if needed
 * @param baseSlug - Base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns Unique slug
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let uniqueSlug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}

/**
 * Validate if a string is a valid slug
 * @param slug - String to validate
 * @returns true if valid slug format
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length >= 1 && slug.length <= 50;
}

/**
 * Convert a slug back to a readable title (best effort)
 * @param slug - Slug to convert
 * @returns Readable title
 */
export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}