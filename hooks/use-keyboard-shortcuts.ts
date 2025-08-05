import { useEffect } from 'react';

interface KeyboardShortcutsOptions {
  onSearch?: () => void;
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        options.onSearch?.();
      }
      
      // Escape key
      if (event.key === 'Escape') {
        options.onEscape?.();
      }
      
      // Enter key
      if (event.key === 'Enter') {
        options.onEnter?.();
      }
      
      // Arrow keys
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        options.onArrowUp?.();
      }
      
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        options.onArrowDown?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [options]);
} 