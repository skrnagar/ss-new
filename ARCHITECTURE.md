# Safety Shaper - Project Architecture & Tech Stack

## 📋 Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Architecture Overview](#architecture-overview)
4. [Project Structure](#project-structure)
5. [Database Architecture](#database-architecture)
6. [Authentication & Authorization](#authentication--authorization)
7. [API Architecture](#api-architecture)
8. [Frontend Architecture](#frontend-architecture)
9. [State Management](#state-management)
10. [Styling & UI](#styling--ui)
11. [Deployment & Infrastructure](#deployment--infrastructure)

---

## Overview

**Safety Shaper** is a professional networking platform specifically designed for ESG (Environmental, Social, and Governance) and EHS (Environment, Health, and Safety) professionals. It provides features similar to LinkedIn but tailored for the safety and compliance industry.

### Key Features
- **Social Feed**: Post sharing, likes, comments, and engagement
- **Professional Profiles**: Comprehensive profiles with experience, education, and skills
- **Job Board**: Job postings, applications, and applicant management
- **Company Pages**: Company profiles and branding
- **Articles & Knowledge Base**: Content creation and knowledge sharing
- **Messaging & Chat**: Real-time messaging between users
- **Network & Connections**: Follow/following system, connections management
- **Events**: Event creation and management
- **Search**: Global search across users, companies, jobs, articles
- **Notifications**: Real-time notifications system
- **Compliance**: Compliance tracking and management

---

## Tech Stack

### Core Framework
- **Next.js 14.2.16** - React framework with App Router
  - Server Components & Server Actions
  - API Routes
  - Middleware for authentication
  - Image optimization
  - Dynamic imports for code splitting

### Language & Type Safety
- **TypeScript 5.x** - Type-safe JavaScript
- **Zod 3.24.1** - Schema validation

### Frontend Libraries
- **React 18** - UI library
- **React DOM 18** - React rendering
- **React Hook Form 7.54.1** - Form management
- **SWR 2.3.4** - Data fetching and caching

### UI Component Library
- **Radix UI** - Headless UI primitives
  - Dialog, Dropdown, Popover, Tabs, Toast, Tooltip, etc.
- **shadcn/ui** - Pre-built component system built on Radix UI
- **Lucide React 0.454.0** - Icon library

### Styling
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **tailwindcss-animate** - Animation utilities
- **CSS Variables** - Theme customization
- **next-themes 0.4.4** - Dark mode support

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Row Level Security (RLS)
  - Authentication (OAuth + Email/Password)
  - Real-time subscriptions
  - Storage buckets for files/images
  - Server-side client (`@supabase/supabase-js`)
  - Client-side helpers (`@supabase/auth-helpers-nextjs`)
  - SSR support (`@supabase/ssr`)

### Rich Text Editing
- **TipTap 2.11.5** - Rich text editor
  - Starter Kit
  - Image extension
  - Link extension
  - Placeholder extension

### File Processing
- **react-pdf 10.0.1** - PDF viewer
- **pdfjs-dist 5.3.93** - PDF.js library
- **mammoth 1.9.1** - DOCX to HTML conversion
- **browser-image-compression 2.0.2** - Image compression

### Data Visualization
- **Recharts 2.15.0** - Chart library for analytics

### Utilities
- **date-fns 3.6.0** - Date manipulation
- **lodash.debounce** - Debouncing utilities
- **clsx** - Conditional class names
- **tailwind-merge** - Merge Tailwind classes
- **class-variance-authority** - Component variants

### Code Quality
- **Biome 1.9.4** - Fast linter and formatter
  - Replaces ESLint + Prettier
  - TypeScript support

### Analytics & Monitoring
- **Vercel Analytics 1.5.0** - Web analytics

### Development Tools
- **PostCSS 8** - CSS processing
- **Node.js** - Runtime environment

---

## Architecture Overview

### Architecture Pattern
**Full-Stack Next.js Application** with:
- **Server-Side Rendering (SSR)** - Initial page loads
- **Static Site Generation (SSG)** - Pre-rendered pages where applicable
- **Client-Side Rendering (CSR)** - Interactive components
- **API Routes** - Backend endpoints
- **Server Actions** - Form submissions and mutations
- **Middleware** - Authentication and route protection

### Data Flow
```
User Request → Next.js Middleware → Route Handler/Page Component
                ↓
         Supabase Client (Server/Client)
                ↓
         PostgreSQL Database (with RLS)
                ↓
         Response → React Components → UI
```

### Key Architectural Decisions
1. **App Router** - Using Next.js 14 App Router for better performance
2. **Server Components** - Default to server components for better SEO and performance
3. **Client Components** - Only when interactivity is needed (marked with `"use client"`)
4. **Row Level Security** - Database-level security policies
5. **Middleware Authentication** - Route protection at the edge
6. **Context API** - Global state for auth and conversations
7. **SWR** - Client-side data fetching with caching
8. **Dynamic Imports** - Code splitting for better performance

---

## Project Structure

```
ss-new/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   └── link-metadata/        # Link preview metadata
│   ├── articles/                 # Articles feature
│   │   ├── [id]/                 # Dynamic article pages
│   │   └── create/               # Article creation
│   ├── auth/                     # Authentication pages
│   │   ├── callback/             # OAuth callback
│   │   ├── login/                # Login page
│   │   └── register/             # Registration page
│   ├── companies/                # Company pages
│   │   ├── [slug]/               # Dynamic company pages
│   │   └── create/               # Company creation
│   ├── components/               # App-specific components
│   ├── events/                   # Events feature
│   ├── feed/                     # Social feed
│   ├── jobs/                     # Job board
│   │   ├── [id]/                 # Job detail pages
│   │   ├── my-jobs/              # User's job listings
│   │   └── post/                 # Job posting
│   ├── knowledge/                # Knowledge base
│   ├── messages/                 # Messaging
│   ├── network/                  # Network/connections
│   ├── posts/                    # Post management
│   ├── profile/                  # User profiles
│   ├── search/                   # Global search
│   ├── globals.css               # Global styles
│   └── layout.tsx                # Root layout
│
├── components/                   # Reusable components
│   ├── ui/                       # shadcn/ui components
│   ├── chat/                     # Chat components
│   └── [feature-components]      # Feature-specific components
│
├── contexts/                     # React Context providers
│   ├── auth-context.tsx          # Authentication context
│   └── conversation-context.tsx  # Chat conversations context
│
├── hooks/                        # Custom React hooks
│   ├── use-api-cache.ts          # API caching
│   ├── use-avatar-cache.ts       # Avatar caching
│   ├── use-debounce.ts           # Debouncing
│   ├── use-mobile.tsx            # Mobile detection
│   └── [other-hooks]             # Other custom hooks
│
├── lib/                          # Utility libraries
│   ├── supabase.ts               # Client-side Supabase client
│   ├── supabase-server.ts        # Server-side Supabase client
│   ├── utils.ts                  # Utility functions
│   ├── analytics.ts              # Analytics utilities
│   ├── link-metadata.ts          # Link preview utilities
│   └── *.sql                     # Database schemas and migrations
│
├── types/                        # TypeScript type definitions
│   └── supabase.ts               # Generated Supabase types
│
├── public/                       # Static assets
│   ├── images/                   # Image assets
│   └── [other-assets]            # Other static files
│
├── middleware.ts                 # Next.js middleware
├── next.config.mjs               # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── biome.json                    # Biome linter/formatter config
└── package.json                  # Dependencies
```

---

## Database Architecture

### Database: PostgreSQL (via Supabase)

### Core Tables

#### **profiles**
- User profile information
- Linked to `auth.users` via UUID
- Fields: `id`, `username`, `full_name`, `headline`, `bio`, `avatar_url`, `company`, `position`, `location`

#### **posts**
- Social media posts/feed content
- Fields: `id`, `user_id`, `content`, `image_url`, `video_url`, `document_url`, `created_at`, `updated_at`

#### **comments**
- Comments on posts
- Fields: `id`, `post_id`, `user_id`, `content`, `created_at`

#### **likes**
- Post likes/reactions
- Fields: `id`, `post_id`, `user_id`, `created_at`

#### **follows**
- User follow/following relationships
- Fields: `id`, `follower_id`, `following_id`, `created_at`

#### **companies**
- Company profiles
- Fields: `id`, `name`, `slug`, `description`, `logo_url`, `website`, `industry`, `size`, `location`

#### **jobs**
- Job postings
- Fields: `id`, `company_id`, `title`, `description`, `location`, `type`, `salary_range`, `posted_by`, `created_at`

#### **job_applications**
- Job applications
- Fields: `id`, `job_id`, `user_id`, `status`, `cover_letter`, `resume_url`, `created_at`

#### **articles**
- Knowledge base articles
- Fields: `id`, `author_id`, `title`, `content`, `slug`, `published_at`, `created_at`

#### **events**
- Events/meetups
- Fields: `id`, `organizer_id`, `title`, `description`, `date`, `location`, `created_at`

#### **messages**
- Direct messages
- Fields: `id`, `sender_id`, `receiver_id`, `content`, `read_at`, `created_at`

#### **conversations**
- Chat conversations
- Fields: `id`, `participant1_id`, `participant2_id`, `last_message_at`, `created_at`

#### **notifications**
- User notifications
- Fields: `id`, `user_id`, `type`, `message`, `link`, `read_at`, `created_at`

#### **experience**
- User work experience
- Fields: `id`, `user_id`, `company`, `position`, `start_date`, `end_date`, `description`

#### **education**
- User education history
- Fields: `id`, `user_id`, `institution`, `degree`, `field`, `start_date`, `end_date`

### Row Level Security (RLS)
- All tables have RLS enabled
- Policies enforce:
  - Public read access where appropriate
  - User-specific write access
  - Owner-based permissions
  - Relationship-based access (e.g., conversation participants)

### Database Features
- **Triggers**: Auto-create profiles on user signup
- **Functions**: Custom PostgreSQL functions for complex queries
- **Indexes**: Optimized for common queries
- **Foreign Keys**: Referential integrity
- **Timestamps**: Auto-managed `created_at` and `updated_at`

---

## Authentication & Authorization

### Authentication Provider: Supabase Auth

### Authentication Methods
1. **Email/Password** - Traditional email-based authentication
2. **OAuth Providers** - Social login (Google, GitHub, LinkedIn)
3. **Magic Links** - Passwordless authentication

### Authentication Flow
```
User Login → Supabase Auth → JWT Token → Stored in Cookies
                ↓
         Middleware validates token
                ↓
         Access granted/denied
```

### Authorization Layers

#### 1. **Middleware Level** (`middleware.ts`)
- Route protection
- Profile completeness check
- Redirects for auth routes
- Session validation

#### 2. **Database Level (RLS)**
- Row-level security policies
- User-specific data access
- Relationship-based permissions

#### 3. **Component Level**
- Protected routes wrapper
- Auth context checks
- Conditional rendering based on auth state

### Auth Context (`contexts/auth-context.tsx`)
- Global authentication state
- Session management
- Profile data
- Auth state change listeners
- Profile refresh functionality

### Protected Routes
- `/feed`
- `/profile`
- `/jobs`
- `/groups`
- `/knowledge`
- `/messages`
- `/network`
- `/posts/create`
- `/articles/create`

---

## API Architecture

### API Routes (`app/api/`)

#### **Authentication**
- `POST /api/auth/signout` - User signout

#### **Link Metadata**
- `GET /api/link-metadata` - Fetch link preview metadata

### Server Actions
- Form submissions handled via Server Actions
- Direct database mutations
- File uploads
- Real-time updates

### Data Fetching Patterns

#### **Server Components**
- Direct Supabase queries in server components
- No client-side JavaScript for initial load
- Better SEO and performance

#### **Client Components**
- SWR for data fetching
- Real-time subscriptions
- Optimistic updates

#### **API Caching**
- SWR caching strategy
- Avatar caching (`use-avatar-cache.ts`)
- API response caching (`use-api-cache.ts`)

---

## Frontend Architecture

### Component Architecture

#### **Layout Components**
- `layout.tsx` - Root layout with providers
- `navbar.tsx` - Navigation bar
- `mobile-nav.tsx` - Mobile navigation
- `footer.tsx` - Footer component
- `conditional-footer.tsx` - Conditional footer rendering

#### **Feature Components**
- Organized by feature (posts, jobs, articles, etc.)
- Reusable across pages
- Composable design

#### **UI Components** (`components/ui/`)
- shadcn/ui components
- Radix UI primitives
- Accessible and customizable

### State Management

#### **React Context**
- `AuthContext` - Authentication state
- `ConversationContext` - Chat conversations

#### **Local State**
- React hooks (`useState`, `useReducer`)
- Form state (`react-hook-form`)

#### **Server State**
- SWR for server data
- Automatic caching and revalidation

### Routing
- **File-based routing** via Next.js App Router
- Dynamic routes: `[id]`, `[slug]`, `[username]`
- Route groups for organization
- Middleware for route protection

### Performance Optimizations
- **Code Splitting** - Dynamic imports
- **Image Optimization** - Next.js Image component
- **Lazy Loading** - Suspense boundaries
- **Server Components** - Reduced client bundle
- **Caching** - SWR and API caching

---

## State Management

### Global State
- **Auth Context** - User session and profile
- **Conversation Context** - Active chat conversations

### Server State
- **SWR** - Data fetching and caching
  - Automatic revalidation
  - Background updates
  - Error handling

### Form State
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **@hookform/resolvers** - Zod integration

### Local State
- React hooks for component-specific state
- No global state management library (Redux/Zustand)

---

## Styling & UI

### Styling Approach
- **Tailwind CSS** - Utility-first CSS
- **CSS Variables** - Theme customization
- **Dark Mode** - Via `next-themes`

### Design System
- **shadcn/ui** - Component library
- **Radix UI** - Accessible primitives
- **Lucide Icons** - Icon system

### Theme Configuration
- Custom color palette
- Typography (Poppins, Manrope fonts)
- Responsive design (mobile-first)
- Animation utilities

### Responsive Design
- Mobile-first approach
- Breakpoints: `sm`, `md`, `lg`, `xl`, `2xl`
- Mobile-specific components (`mobile-nav.tsx`, `mobile-chat.tsx`)

---

## Deployment & Infrastructure

### Hosting
- **Vercel** (implied by Vercel Analytics)
- Next.js optimized deployment
- Edge functions support

### Database
- **Supabase** - Managed PostgreSQL
- Automatic backups
- Real-time capabilities
- Storage buckets

### Environment Variables
- Supabase URL and keys
- OAuth provider credentials
- API keys

### CI/CD
- Git-based deployment
- Automatic builds on push
- Preview deployments

### Monitoring & Analytics
- **Vercel Analytics** - Web analytics
- Error tracking (via Next.js)
- Performance monitoring

### Security
- **HTTPS** - SSL/TLS encryption
- **Row Level Security** - Database-level security
- **Middleware** - Route protection
- **CORS** - Configured headers
- **CSRF Protection** - Next.js built-in

---

## Development Workflow

### Code Quality
- **Biome** - Linting and formatting
- **TypeScript** - Type checking
- **Strict Mode** - React strict mode enabled

### Scripts
```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # Lint code
npm run format   # Format code
npm run check    # Lint and format
```

### Git Workflow
- Feature branches
- Code review process
- Main branch protection

---

## Key Architectural Patterns

### 1. **Server-First Approach**
- Default to Server Components
- Client Components only when needed
- Better performance and SEO

### 2. **Progressive Enhancement**
- Works without JavaScript
- Enhanced with client-side features
- Accessible by default

### 3. **Component Composition**
- Small, reusable components
- Composable patterns
- Separation of concerns

### 4. **Type Safety**
- TypeScript throughout
- Generated types from Supabase
- Zod for runtime validation

### 5. **Security-First**
- RLS at database level
- Middleware protection
- Input validation
- XSS protection

---

## Future Considerations

### Scalability
- Database indexing optimization
- Caching strategies
- CDN for static assets
- Load balancing

### Performance
- Image optimization
- Code splitting
- Bundle size optimization
- Lazy loading

### Features
- Real-time notifications
- Advanced search
- Analytics dashboard
- Mobile app (React Native)

---

## Documentation Files

- `ARCHITECTURE.md` - This file
- `COMPLETE_FEATURE_SUMMARY.md` - Feature documentation
- `COMPANY_PAGES_FEATURE.md` - Company pages feature
- `SEARCH_FEATURES.md` - Search functionality
- `SEARCH_PERFORMANCE_IMPROVEMENTS.md` - Search optimizations
- `APPLICANTS_FIX_GUIDE.md` - Job applicants fix guide
- `lib/SUPABASE-SETUP.md` - Supabase setup guide

---

*Last Updated: 2024*
*Project: Safety Shaper - ESG & EHS Professional Network*

