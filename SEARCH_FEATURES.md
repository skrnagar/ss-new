# Global Search System

A modern, LinkedIn-style global search system with advanced features and responsive design.

## Features

### 🔍 **Real-time Search**
- Debounced search with 300ms delay to optimize performance
- Instant results as you type
- Search across multiple content types: profiles, articles, posts, events, companies

### 📱 **Responsive Design**
- **Desktop**: Dropdown-style search with keyboard shortcuts
- **Mobile**: Full-screen modal search optimized for touch interactions
- Adaptive layout that works on all screen sizes

### ⌨️ **Keyboard Navigation**
- **Cmd+K / Ctrl+K**: Quick search activation
- **Arrow Keys**: Navigate through results
- **Enter**: Select highlighted result
- **Escape**: Close search
- Full keyboard accessibility support

### 🎯 **Smart Search Features**
- **Recent Searches**: Automatically saves and displays recent search terms
- **Trending Suggestions**: Curated search suggestions for popular topics
- **Search History**: Persistent across browser sessions using localStorage
- **Type-specific Results**: Different result types with appropriate icons and badges

### 🎨 **Modern UI/UX**
- **Glass Morphism**: Backdrop blur effects and transparency
- **Smooth Animations**: Hover effects and transitions
- **Loading States**: Spinner animations during search
- **Empty States**: Helpful messages when no results found
- **Rich Results**: Avatars, metadata, and contextual information

## Components

### `GlobalSearch` (Desktop)
- Popover-based dropdown search
- Command palette interface
- Keyboard shortcuts support
- Responsive width adjustments

### `MobileSearch` (Mobile)
- Full-screen modal interface
- Touch-optimized interactions
- Back button navigation
- Mobile-specific layout

### `SearchPage` (Full Results)
- Dedicated search results page
- Advanced filtering and sorting
- Comprehensive result display
- URL-based search queries

## Search Capabilities

### Content Types
1. **Profiles**: Search by name, username, headline, company
2. **Articles**: Search by title, excerpt, author
3. **Posts**: Search by content, author
4. **Events**: Search by title, description, location
5. **Companies**: Search by name, industry

### Search Logic
- **Fuzzy Matching**: Uses PostgreSQL ILIKE for flexible text matching
- **Multi-field Search**: Searches across multiple fields simultaneously
- **Relevance Scoring**: Results ordered by relevance
- **Result Limits**: Optimized result counts for performance

## Technical Implementation

### Hooks Used
- `useDebounce`: Prevents excessive API calls
- `useClickAway`: Closes search when clicking outside
- `useKeyboardShortcuts`: Global keyboard event handling

### Database Queries
```sql
-- Profile search
SELECT id, full_name, username, headline, company, location, avatar_url
FROM profiles
WHERE full_name ILIKE '%query%' 
   OR username ILIKE '%query%'
   OR headline ILIKE '%query%'
   OR company ILIKE '%query%'

-- Article search
SELECT id, title, excerpt, views, created_at, author
FROM articles
WHERE title ILIKE '%query%' OR excerpt ILIKE '%query%'
AND published = true

-- Post search
SELECT id, content, created_at, author
FROM posts
WHERE content ILIKE '%query%'
```

### Performance Optimizations
- **Debounced Input**: 300ms delay before search execution
- **Result Limits**: Maximum 5-20 results per type
- **Caching**: Recent searches stored in localStorage
- **Lazy Loading**: Results loaded on demand

## Usage Examples

### Basic Search
```tsx
import { GlobalSearch } from "@/components/global-search";

function Header() {
  return (
    <header>
      <GlobalSearch />
    </header>
  );
}
```

### Mobile Search
```tsx
import { MobileSearch } from "@/components/mobile-search";

function MobileHeader() {
  return (
    <header>
      <MobileSearch />
    </header>
  );
}
```

### Search Results Page
```tsx
// Navigate to search results
router.push(`/search?q=${encodeURIComponent(query)}`);
```

## Styling

### Tailwind Classes Used
- `line-clamp-2`: Text truncation with ellipsis
- `backdrop-blur-sm`: Glass morphism effects
- `animate-spin`: Loading animations
- `hover:bg-accent`: Interactive hover states

### Custom CSS
- Responsive breakpoints for mobile/desktop
- Smooth transitions and animations
- Accessibility-focused design

## Accessibility Features

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Proper focus handling
- **Color Contrast**: WCAG compliant color schemes
- **Screen Reader Support**: Semantic HTML structure

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Browsers**: iOS Safari, Chrome Mobile
- **Progressive Enhancement**: Graceful degradation for older browsers

## Future Enhancements

- **Search Analytics**: Track popular searches
- **Advanced Filters**: Date ranges, content types
- **Search Suggestions**: AI-powered suggestions
- **Voice Search**: Speech-to-text integration
- **Search History**: Detailed search analytics
- **Saved Searches**: User-defined search queries 