"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchLinkMetadata, extractMetadataFromUrl, type LinkMetadata } from "@/lib/link-metadata";

interface LinkPreviewProps {
  url: string;
  onClose: () => void;
  onRemove?: () => void;
  onData?: (data: LinkMetadata) => void;
}

export function LinkPreview({ url, onClose, onRemove, onData }: LinkPreviewProps) {
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        setError(false);
        
        // Try to fetch real metadata from the website
        const metadata = await fetchLinkMetadata(url);
        
        if (metadata) {
          setMetadata(metadata);
          if (onData) {
            onData(metadata);
          }
        } else {
          // Fallback to basic metadata extraction
          const fallbackMetadata = extractMetadataFromUrl(url);
          setMetadata(fallbackMetadata);
          if (onData) {
            onData(fallbackMetadata);
          }
        }
      } catch (err) {
        console.error('LinkPreview: Error fetching metadata:', err);
        // Use fallback metadata on error
        const fallbackMetadata = extractMetadataFromUrl(url);
        setMetadata(fallbackMetadata);
        if (onData) {
          onData(fallbackMetadata);
        }
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchMetadata();
    }
  }, [url]);

  if (loading) {
    return (
      <div className="relative border border-gray-200 rounded-lg p-4 bg-gray-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-gray-200"
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-3">
          <div className="w-16 h-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !metadata) {
    return (
      <div className="relative border border-gray-200 rounded-lg p-4 bg-gray-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-gray-200"
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="text-sm text-gray-500">
          Unable to load link preview
        </div>
      </div>
    );
  }

  return (
    <div className="relative border-2 border-blue-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow">
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-gray-200 z-10"
      >
        <X className="h-4 w-4" />
      </Button>
      
      <div className="flex">
        {metadata.image && (
          <div className="w-24 h-24 flex-shrink-0">
            <img
              src={metadata.image}
              alt={metadata.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}
        
        <div className="flex-1 p-3 min-w-0">
          <div className="text-xs text-gray-500 mb-1">{metadata.domain}</div>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
            {metadata.title}
          </h3>
          {metadata.description && (
            <p className="text-xs text-gray-600 line-clamp-2">
              {metadata.description}
            </p>
          )}

        </div>
      </div>
    </div>
  );
} 