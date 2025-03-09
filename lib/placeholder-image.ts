// Helper function to generate placeholder images from various free sources

/**
 * Generate a placeholder image URL with specified dimensions and customization
 * @param width Image width in pixels
 * @param height Image height in pixels
 * @param text Optional text to display on the image
 * @param bgColor Optional background color (hex without #)
 * @param textColor Optional text color (hex without #)
 * @returns URL string for the placeholder image
 */
export function getPlaceholderImage(
  width = 400,
  height = 300,
  text?: string,
  bgColor = "1f2937",
  textColor = "ffffff"
): string {
  // Use placehold.co service for simple placeholders
  const baseUrl = `https://placehold.co/${width}x${height}/${bgColor}/${textColor}`;

  // Add custom text if provided
  if (text) {
    return `${baseUrl}?text=${encodeURIComponent(text)}`;
  }

  return baseUrl;
}

/**
 * Generate a placeholder avatar for user profiles
 * @param size Size of the square avatar
 * @param name Optional name to generate initials
 * @returns URL string for the avatar placeholder
 */
export function getPlaceholderAvatar(size = 200, name?: string): string {
  // For avatars, we can use either UI Avatars or DiceBear

  // Option 1: UI Avatars for initial-based avatars
  if (name) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=random`;
  }

  // Option 2: DiceBear for more stylized avatars
  return `https://api.dicebear.com/7.x/shapes/svg?size=${size}`;
}

/**
 * Generate a placeholder company logo
 * @param width Width of the logo
 * @param height Height of the logo
 * @param name Company name for text
 * @returns URL string for the logo placeholder
 */
export function getPlaceholderLogo(width = 300, height = 150, name?: string): string {
  // For logos, we'll use placehold.co with specific colors
  const baseUrl = `https://placehold.co/${width}x${height}/0f172a/60a5fa`;

  if (name) {
    return `${baseUrl}?text=${encodeURIComponent(name)}`;
  }

  return `${baseUrl}?text=Company+Logo`;
}
