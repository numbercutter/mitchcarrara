# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Torpal** is a multi-company support dashboard built with Next.js 14, TypeScript, and Tailwind CSS. It helps manage multiple companies and their integrations with third-party services including Stripe payments, Discord analytics, and email campaigns.

## Development Commands

```bash
# Development server
bun run dev              # Start development server on localhost:3000
npm run dev              # Alternative with npm

# Build and deployment
bun run build           # Build for production
bun run start           # Start production server

# Code quality
bun run lint            # Run ESLint
bun run format          # Format code with Prettier
bun run format:check    # Check formatting without changes

# Stripe integration (when working with payments)
bun run stripe:login    # Login to Stripe CLI
bun run stripe:listen   # Listen for webhooks on localhost:3000/api/webhooks

# Utility scripts
bun run export-courses     # Export course data
bun run generate-course    # Generate new course
bun run cleanup-courses    # Clean up course data
```

## Architecture

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Runtime**: Bun (preferred) or Node.js
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **State Management**: React Query (@tanstack/react-query) + React Context
- **Styling**: Tailwind CSS with CSS variables for theming
- **Payments**: Stripe
- **UI Components**: Custom components with Radix UI primitives

### Project Structure

```
app/                    # Next.js App Router
├── api/               # API routes
│   ├── auth/          # Authentication endpoints
│   ├── discord/       # Discord API integration
│   └── payments/      # Stripe payment webhooks
├── dashboard/         # Protected dashboard pages
│   ├── discord/       # Discord analytics
│   ├── payments/      # Payment analytics
│   └── support/       # Support management
├── login/            # Authentication pages
├── components/       # Page-specific components
├── contexts/         # React Context providers
└── lib/             # Utilities and configurations

components/           # Reusable UI components
├── ui/              # Base UI components (Button, Card, etc.)
└── ChatWidget.tsx   # Global chat widget

lib/                 # Utilities and configurations
├── supabase/        # Supabase client configurations
└── utils.ts         # Utility functions

contexts/            # React Context providers
└── CompanyContext.tsx  # Multi-company state management

config/              # Configuration files
└── companies.ts     # Company configuration
```

### Key Architecture Patterns

**Multi-Company Architecture**: The app uses a CompanyContext to manage multiple company configurations. Each company has its own Stripe, Discord, and other service configurations defined in `config/companies.ts`.

**Data Fetching**: Uses React Query for server state management with Supabase as the backend. API routes in `app/api/` handle external service integrations.

**Authentication Flow**: Supabase Auth with middleware protection for dashboard routes. Auth check happens in `app/api/auth/check/route.ts`.

**Styling System**: Uses Tailwind with CSS variables for theming. Dark mode is implemented with class-based toggling. Custom color palette defined in `tailwind.config.js`.

**Component Architecture**: 
- Page components in `app/dashboard/`
- Reusable UI components in `components/ui/`
- Business logic components in `app/components/`

## Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Discord
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=

# Resend
RESEND_API_KEY=
```

## Development Guidelines

**Package Manager**: Prefer Bun over npm/yarn for faster installs and script execution.

**TypeScript Configuration**: Uses relaxed TypeScript settings (`strict: false`) for rapid development. Path aliases configured with `@/*` pointing to root.

**Code Formatting**: Prettier is configured with import sorting. Use `bun run format` before committing.

**Component Patterns**: 
- Use `'use client'` directive for client components
- Leverage React Query for data fetching
- Use CompanyContext for multi-company state
- Follow Tailwind utility-first approach

**API Integration**:
- External service integrations go in `app/api/`
- Use Supabase client in `lib/supabase/` for database operations
- Webhook handlers for Stripe payments in `app/api/payments/`

**Dark Mode**: Implemented with Tailwind's class-based dark mode. Toggle functionality in dashboard layout.