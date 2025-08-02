import * as React from "react";

/**
 * Detects URLs, user mentions, bold text, and hashtags in text and converts them to formatted elements
 * @param text - The text content to process
 * @param onUserMention - Optional callback for user mention clicks
 * @returns JSX elements with formatted content
 */
export function formatTextWithLinks(text: string, onUserMention?: (username: string) => void): React.ReactNode[] {
  if (!text) return [];
  
  // URL regex pattern that matches http/https URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  // User mention regex pattern that matches @username
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  // Bold text regex pattern that matches **text**
  const boldRegex = /\*\*([^*]+)\*\*/g;
  // Hashtag regex pattern that matches #hashtag
  const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
  
  // First split by URLs
  let parts = text.split(urlRegex);
  
  // Then process each part for mentions, bold, and hashtags
  const result: React.ReactNode[] = [];
  
  parts.forEach((part, index) => {
    if (urlRegex.test(part)) {
      // This is a URL
      result.push(
        <a
          key={`url-${index}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline break-all"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {part}
        </a>
      );
    } else {
      // This is text, process for mentions, bold, and hashtags
      let processedPart = part;
      
      // Process bold text
      processedPart = processedPart.replace(boldRegex, (match, content) => {
        return `__BOLD__${content}__BOLD__`;
      });
      
      // Process hashtags
      processedPart = processedPart.replace(hashtagRegex, (match, content) => {
        return `__HASHTAG__${content}__HASHTAG__`;
      });
      
      // Process mentions
      const mentionParts = processedPart.split(mentionRegex);
      mentionParts.forEach((mentionPart, mentionIndex) => {
        if (mentionIndex % 2 === 1) {
          // This is a username (odd indices in split result)
          const username = mentionPart;
          result.push(
            <a
              key={`mention-${index}-${mentionIndex}`}
              href={`/profile/${username}`}
              className="text-blue-600 hover:text-blue-800 font-medium underline"
              onClick={(e) => {
                e.stopPropagation();
                if (onUserMention) {
                  onUserMention(username);
                }
              }}
            >
              @{username}
            </a>
          );
        } else {
          // This is regular text, check for bold and hashtag markers
          const boldParts = mentionPart.split('__BOLD__');
          boldParts.forEach((boldPart, boldIndex) => {
            if (boldIndex % 2 === 1) {
              // This is bold text
              result.push(
                <strong key={`bold-${index}-${mentionIndex}-${boldIndex}`}>
                  {boldPart}
                </strong>
              );
            } else {
              // This is regular text, check for hashtags
              const hashtagParts = boldPart.split('__HASHTAG__');
              hashtagParts.forEach((hashtagPart, hashtagIndex) => {
                if (hashtagIndex % 2 === 1) {
                  // This is a hashtag
                  result.push(
                    <span key={`hashtag-${index}-${mentionIndex}-${boldIndex}-${hashtagIndex}`} className="text-blue-600 font-medium">
                      #{hashtagPart}
                    </span>
                  );
                } else {
                  // This is regular text
                  result.push(hashtagPart);
                }
              });
            }
          });
        }
      });
    }
  });
  
  return result;
} 