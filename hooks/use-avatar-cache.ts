import { useState, useEffect } from 'react';

interface AvatarCache {
  [userId: string]: {
    url: string;
    timestamp: number;
    initials: string;
  };
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const avatarCache: AvatarCache = {};

export function useAvatarCache(userId: string, avatarUrl?: string, fullName?: string) {
  const [cachedAvatar, setCachedAvatar] = useState<string>('');
  const [initials, setInitials] = useState<string>('');

  useEffect(() => {
    if (!userId) return;

    const now = Date.now();
    const cached = avatarCache[userId];

    // Check if we have a valid cached avatar
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      setCachedAvatar(cached.url);
      setInitials(cached.initials);
      return;
    }

    // If we have a new avatar URL, update the cache
    if (avatarUrl) {
      avatarCache[userId] = {
        url: avatarUrl,
        timestamp: now,
        initials: getInitials(fullName || '')
      };
      setCachedAvatar(avatarUrl);
      setInitials(getInitials(fullName || ''));
    } else if (cached) {
      // Use cached avatar even if expired, but update timestamp
      avatarCache[userId].timestamp = now;
      setCachedAvatar(cached.url);
      setInitials(cached.initials);
    } else {
      // No cache, use initials
      setCachedAvatar('');
      setInitials(getInitials(fullName || ''));
    }
  }, [userId, avatarUrl, fullName]);

  return { cachedAvatar, initials };
}

function getInitials(name: string): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((part) => part?.[0] || '')
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

// Function to clear avatar cache (useful for logout or manual refresh)
export function clearAvatarCache() {
  Object.keys(avatarCache).forEach(key => {
    delete avatarCache[key];
  });
}

// Function to update avatar cache for a specific user
export function updateAvatarCache(userId: string, avatarUrl: string, fullName?: string) {
  avatarCache[userId] = {
    url: avatarUrl,
    timestamp: Date.now(),
    initials: getInitials(fullName || '')
  };
} 