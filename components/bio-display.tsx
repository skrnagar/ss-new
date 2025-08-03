"use client";

import { formatTextWithLinks } from "@/lib/link-formatter";

interface BioDisplayProps {
  bio: string | null;
  isOwnProfile: boolean;
}

export function BioDisplay({ bio, isOwnProfile }: BioDisplayProps) {
  if (!bio) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="p-4 bg-gray-100 rounded-full mb-4">
          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <p className="text-gray-500 italic text-center">
          {isOwnProfile ? "Add a bio to tell others about yourself." : "No bio available."}
        </p>
      </div>
    );
  }

  return (
    <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
      {formatTextWithLinks(bio, (username) => {
        // Handle user mention click - could add analytics or notifications here
        console.log(`User mentioned: ${username}`);
      })}
    </p>
  );
} 