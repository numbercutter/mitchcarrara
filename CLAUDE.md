# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**mitchcarrara** is a personal portfolio dashboard built with Next.js 14, TypeScript, and Tailwind CSS. It manages multiple companies and their integrations with third-party services including Stripe payments, Discord analytics, and email campaigns.

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
bun run remove-unused   # Remove unused imports

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
- **State Management**: React Query (@tanstack/react-query) + Zustand + React Context
- **Styling**: Tailwind CSS with CSS variables for theming
- **Payments**: Stripe
- **UI Components**: Custom components with Radix UI primitives
- **Charts**: Recharts
- **Animations**: Motion (Framer Motion)

### Project Structure

```
app/                    # Next.js App Router
├── api/               # API routes
│   ├── auth/          # Authentication endpoints
│   ├── discord/       # Discord API integration
│   └── payments/      # Stripe payment webhooks
├── dashboard/         # Protected dashboard pages
│   ├── companies/     # Company management pages
│   ├── personal/      # Personal management (analytics, contacts, health)
│   ├── tasks/         # Task management system
│   └── vision/        # Vision/goals page
├── login/            # Authentication pages
├── components/       # Page-specific components
├── contexts/         # React Context providers
└── lib/             # Utilities and configurations

components/           # Reusable UI components
├── ui/              # Base UI components (Button, Card, Progress, etc.)
└── ChatWidget.tsx   # Global chat widget

lib/                 # Utilities and configurations
├── supabase/        # Supabase client configurations (client, server, middleware)
└── utils.ts         # Utility functions

contexts/            # React Context providers
└── CompanyContext.tsx  # Multi-company state management

config/              # Configuration files
└── companies.ts     # Company configuration with 8 companies
```

### Key Architecture Patterns

**Multi-Company Architecture**: The app uses a CompanyContext to manage 8 different company configurations (RTHMN, SeconDisc, Reality Designers, Protocoding, Best2DayEv3r, Ozaiq, A Forest Running Faster, Paint Thief). Each company has its own Supabase, Stripe, Discord, and WebSocket configurations defined in `config/companies.ts`.

**Data Fetching**: Uses React Query for server state management with Supabase as the backend. API routes in `app/api/` handle external service integrations.

**Authentication Flow**: Supabase Auth with middleware protection for dashboard routes. Auth check happens in `app/api/auth/check/route.ts`.

**Styling System**: Uses Tailwind with CSS variables for theming. Dark mode is implemented with class-based toggling (`darkMode: ["class"]`). Custom color palette with HSL-based design tokens.

**Component Architecture**:
- Page components in `app/dashboard/`
- Reusable UI components in `components/ui/`
- Business logic components in `app/components/`

## Environment Variables Required

Each company requires its own set of environment variables prefixed with the company name:

```env
# For each company (replace [COMPANY] with RTHMN, SECONDISC, REALITYDESIGNERS, etc.)
NEXT_PUBLIC_[COMPANY]_SUPABASE_URL=
NEXT_PUBLIC_[COMPANY]_SUPABASE_ANON_KEY=
[COMPANY]_SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_[COMPANY]_STRIPE_PUBLISHABLE_KEY=
[COMPANY]_STRIPE_SECRET_KEY=
[COMPANY]_STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_[COMPANY]_SERVER_URL=
NEXT_PUBLIC_[COMPANY]_WS_URL=

# Discord (optional for companies)
NEXT_PUBLIC_[COMPANY]_DISCORD_CLIENT_ID=
[COMPANY]_DISCORD_CLIENT_SECRET=
[COMPANY]_DISCORD_BOT_TOKEN=
[COMPANY]_DISCORD_GUILD_ID=
[COMPANY]_DISCORD_PAID_ROLE_ID=
[COMPANY]_DISCORD_UNPAID_ROLE_ID=
NEXT_PUBLIC_[COMPANY]_DISCORD_REDIRECT_URI=
```

## Development Guidelines

**Package Manager**: Prefer Bun over npm/yarn for faster installs and script execution. Husky is configured with lint-staged to run `bun format` on all staged files.

**TypeScript Configuration**: Uses relaxed TypeScript settings (`strict: false`, `noImplicitAny: false`) for rapid development. Path aliases configured with `@/*` pointing to root.

**Code Formatting**: Prettier is configured with Tailwind plugin, 4-space tabs, 180 character line width, and import sorting via `@ianvs/prettier-plugin-sort-imports`. Use `bun run format` before committing.

**Component Patterns**:
- Use `'use client'` directive for client components
- Leverage React Query for data fetching
- Use CompanyContext for multi-company state
- Follow Tailwind utility-first approach
- Use Zustand for complex client-side state management

**API Integration**:
- External service integrations go in `app/api/`
- Use company-specific Supabase clients from `lib/supabase/`
- Webhook handlers for Stripe payments in `app/api/payments/`
- Discord API integrations in `app/api/discord/`

**Multi-Company Pattern**: When working with company-specific functionality, always use the CompanyContext to get the selected company configuration and create appropriate client instances.