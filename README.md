# SNN+ (Streamline News Network)

AI-Powered News Content Platform for Multi-Platform Social Media

**🎯 Status:** Ready for Comprehensive Testing (84% Complete)  
**📅 Last Updated:** November 27, 2025

## 🎯 Overview

SNN+ transforms daily AI news into ready-to-share social media posts across LinkedIn, Twitter/X, Instagram, Facebook, and Threads. Built for content creators, marketers, and AI enthusiasts.

## 🏗️ Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components:** shadcn/ui + Radix UI
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Icons:** Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- Supabase account

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment variables:**
   - Copy `.env.local.example` to `.env.local`
   - Add your Supabase credentials
   - Add API keys as needed

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   - Navigate to http://localhost:3000

## 📁 Project Structure

```
snn-plus/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── auth/        # Authentication components
│   │   ├── dashboard/   # Dashboard components
│   │   ├── content/     # Content management
│   │   ├── landing/     # Landing page
│   │   └── shared/      # Shared components
│   ├── lib/             # Utilities and integrations
│   │   ├── supabase/   # Supabase client
│   │   ├── ai/         # AI providers
│   │   ├── news/       # News aggregation
│   │   └── social/     # Social media APIs
│   ├── hooks/          # Custom React hooks
│   ├── types/          # TypeScript types
│   └── store/          # Zustand stores
├── supabase/
│   ├── migrations/     # Database migrations
│   └── functions/      # Edge functions
└── docs/               # Documentation
```

## 🔑 Environment Variables

Required variables in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI APIs (add when implementing)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=

# News APIs (add when implementing)
SERPER_API_KEY=
NEWS_API_KEY=
MEDIASTACK_API_KEY=
GNEWS_API_KEY=

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📚 Documentation

- [Setup Complete Guide](./SETUP-COMPLETE.md)
- [Specification Documents](./.kiro/specs/snn-platform/)
- [Implementation Guide](./docs/IMPLEMENTATION-GUIDE.md)
- [API Inventory](./docs/API-INVENTORY.md)
- [Deployment Checklist](./docs/DEPLOYMENT-CHECKLIST.md)

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

## 🏗️ Building

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## 🤝 Contributing

This is a private project. See specification documents for development guidelines.

## 📄 License

Private - All Rights Reserved

## 🔗 Links

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Project Roadmap](./snn-roadmap.md)

---

**Status:** In Development  
**Version:** 0.1.0  
**Last Updated:** November 25, 2025
