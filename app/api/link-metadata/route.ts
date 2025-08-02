import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    // Validate URL
    const urlObj = new URL(url);
    
    // Fetch the webpage with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    
    // Parse metadata from HTML
    const metadata = extractMetadataFromHTML(html, url);
    
    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error fetching link metadata:', error);
    
    // Return fallback metadata instead of error
    const fallbackMetadata = {
      title: `${new URL(url).hostname.replace('www.', '')} - Link`,
      description: `Visit ${new URL(url).hostname.replace('www.', '')} for more information`,
      image: '',
      url: url,
      domain: new URL(url).hostname.replace('www.', '')
    };
    
    return NextResponse.json(fallbackMetadata);
  }
}

function extractMetadataFromHTML(html: string, url: string) {
  const domain = new URL(url).hostname.replace('www.', '');
  
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : `${domain} - Link`;

  // Extract description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                   html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
  const description = descMatch ? descMatch[1].trim() : `Visit ${domain} for more information`;

  // Extract image
  const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i) ||
                    html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);
  
  let image = '';
  if (imageMatch) {
    image = imageMatch[1].trim();
    // Convert relative URLs to absolute
    if (image.startsWith('/')) {
      image = `${new URL(url).origin}${image}`;
    } else if (!image.startsWith('http')) {
      image = `${new URL(url).origin}/${image}`;
    }
  }

  return {
    title,
    description,
    image,
    url,
    domain
  };
} 