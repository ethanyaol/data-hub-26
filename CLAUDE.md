# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Start dev server (port 8080)
npm run dev

# Build for production
npm run build

# Lint
npm run lint

# Run tests (single run)
npm test

# Run tests in watch mode
npm run test:watch
```

## Architecture

**Tech stack:** React 18 + TypeScript + Vite (SWC) + Tailwind CSS + shadcn/ui

**Path alias:** `@/` maps to `src/`

**Dev server:** Always runs on port 8080 (configured in `vite.config.ts`)

### Routing ([src/App.tsx](src/App.tsx))

- `/` → Login page
- `/dashboard` → `DashboardLayout` (sidebar + header shell)
  - `/dashboard/` → Dashboard home
  - `/dashboard/user-management` → User list
  - `/dashboard/user-management/create` → 2-step create wizard
  - `/dashboard/user-management/edit/:id` → 2-step edit wizard
  - `/dashboard/user-management/detail/:id` → Read-only detail view
  - `/dashboard/tasks`, `/dashboard/mobile-users` → ComingSoon placeholders

Session auth state is stored in `localStorage` (`auth_token`, `auth_user`, `user_role`).

### Data Layer

All data is currently **mock/hardcoded** — no real API calls exist. Mock patterns used:

- Static arrays in component files (e.g. `mockUsers` in `UserManagement.tsx`)
- `setTimeout` to simulate async loading in `UserDetail.tsx` and `EditUser.tsx`
- TanStack React Query (`@tanstack/react-query`) is wired up at the root but not yet used for any queries

When integrating a real API, the pattern should use React Query hooks with a service layer.

### UI Components

All base UI components live in [src/components/ui/](src/components/ui/) — these are shadcn/ui components and should not be edited directly. Custom application components are in [src/components/](src/components/).

Styling uses Tailwind utility classes. Custom admin-specific styles (table rows, sidebar menu items, step indicators) are defined in [src/index.css](src/index.css). The design system uses CSS HSL variables for theming; dark mode is supported via the `class` strategy.

### Forms

Forms use React Hook Form + Zod validation. The 2-step user wizard in `CreateUser.tsx` and `EditUser.tsx` uses local `useState` to track the current step and form data across steps.

### Mock credentials (Login)

- Username: `liangyao3`
- Password: `DataHub123！`

These are hardcoded in [src/pages/Login.tsx](src/pages/Login.tsx).
