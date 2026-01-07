# Safety Shaper - Tech Stack Quick Reference

## 🚀 Core Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | Next.js | 14.2.16 | React framework with App Router |
| **Language** | TypeScript | 5.x | Type-safe JavaScript |
| **Runtime** | Node.js | Latest | Server runtime |
| **UI Library** | React | 18 | Component library |
| **Database** | PostgreSQL | (via Supabase) | Relational database |
| **Backend** | Supabase | Latest | BaaS platform |

## 📦 Key Dependencies

### Frontend Core
```json
{
  "next": "14.2.16",
  "react": "^18",
  "react-dom": "^18",
  "typescript": "^5"
}
```

### UI & Styling
```json
{
  "tailwindcss": "^3.4.17",
  "tailwindcss-animate": "^1.0.7",
  "@radix-ui/react-*": "^1.x - ^2.x",
  "lucide-react": "^0.454.0",
  "next-themes": "^0.4.4"
}
```

### Backend & Database
```json
{
  "@supabase/supabase-js": "^2.49.1",
  "@supabase/auth-helpers-nextjs": "^0.9.0",
  "@supabase/ssr": "^0.1.0"
}
```

### Forms & Validation
```json
{
  "react-hook-form": "^7.54.1",
  "@hookform/resolvers": "^3.3.4",
  "zod": "^3.24.1"
}
```

### Data Fetching
```json
{
  "swr": "^2.3.4"
}
```

### Rich Text Editing
```json
{
  "@tiptap/react": "^2.11.5",
  "@tiptap/starter-kit": "^2.11.5",
  "@tiptap/extension-image": "^2.11.5",
  "@tiptap/extension-link": "^2.11.5"
}
```

### File Processing
```json
{
  "react-pdf": "^10.0.1",
  "pdfjs-dist": "^5.3.93",
  "mammoth": "^1.9.1",
  "browser-image-compression": "^2.0.2"
}
```

### Utilities
```json
{
  "date-fns": "^3.6.0",
  "lodash.debounce": "^4.0.8",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.5.5",
  "class-variance-authority": "^0.7.0"
}
```

### Analytics & Monitoring
```json
{
  "@vercel/analytics": "^1.5.0"
}
```

### Code Quality
```json
{
  "@biomejs/biome": "^1.9.4"
}
```

## 🏗️ Architecture Stack

### Frontend Architecture
- **Pattern**: Server Components First
- **Routing**: File-based (App Router)
- **State**: Context API + SWR
- **Styling**: Tailwind CSS + CSS Variables
- **Components**: shadcn/ui + Radix UI

### Backend Architecture
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth (OAuth + Email)
- **Security**: Row Level Security (RLS)
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime

### Deployment
- **Hosting**: Vercel
- **CDN**: Vercel Edge Network
- **Database**: Supabase Cloud
- **Monitoring**: Vercel Analytics

## 📊 Stack Breakdown

### Frontend: 60%
- Next.js App Router
- React Server Components
- Tailwind CSS
- shadcn/ui Components

### Backend: 30%
- Supabase (PostgreSQL)
- Next.js API Routes
- Server Actions
- Middleware

### Infrastructure: 10%
- Vercel Hosting
- Supabase Cloud
- Edge Functions

## 🔧 Development Tools

| Tool | Purpose |
|------|---------|
| Biome | Linting & Formatting |
| TypeScript | Type Checking |
| PostCSS | CSS Processing |
| Next.js Dev Server | Development |

## 📱 Platform Support

- ✅ Web (Desktop)
- ✅ Web (Mobile/Tablet)
- ✅ Responsive Design
- ⏳ Mobile App (Future)

## 🔐 Security Stack

- **Authentication**: Supabase Auth
- **Authorization**: RLS Policies
- **Encryption**: HTTPS/TLS
- **Validation**: Zod schemas
- **CSRF**: Next.js built-in
- **XSS**: React escaping

## 📈 Performance Stack

- **SSR**: Next.js Server Components
- **Caching**: SWR + API Cache
- **Code Splitting**: Dynamic Imports
- **Image Optimization**: Next.js Image
- **Bundle Optimization**: Tree Shaking

## 🎨 Design System

- **Components**: shadcn/ui
- **Icons**: Lucide React
- **Typography**: Poppins, Manrope
- **Colors**: Custom palette (Blue #2A5CAA, Green #4CAF50)
- **Theme**: Dark mode support

---

*For detailed architecture information, see [ARCHITECTURE.md](./ARCHITECTURE.md)*

