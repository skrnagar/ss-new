export interface LinkMetadata {
  title: string;
  description: string;
  image: string;
  url: string;
  domain: string;
}

export async function fetchLinkMetadata(url: string): Promise<LinkMetadata | null> {
  try {
    // For client-side fetching, we'll use a proxy or direct fetch
    // Note: This might have CORS issues, so we'll need to handle that
    const response = await fetch(`/api/link-metadata?url=${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch metadata');
    }
    
    const data = await response.json();
    
    // Check if we got fallback data (no image and generic description)
    if (data && data.title && data.description) {
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching link metadata:', error);
    return null;
  }
}

// Fallback function for when API is not available
export function extractMetadataFromUrl(url: string): LinkMetadata {
  const domain = new URL(url).hostname.replace('www.', '');
  
  return {
    title: `${domain} - Link`,
    description: `Visit ${domain} for more information`,
    image: '', // No image available
    url: url,
    domain: domain
  };
} 