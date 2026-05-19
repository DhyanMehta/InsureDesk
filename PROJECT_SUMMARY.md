# InsureDesk

## One Line Summary

A multi-tenant insurance operations platform for managing clients, policies, documents, and reminders with Supabase-backed security and caching.

## Project Overview

InsureDesk is a production-oriented insurance CRM built for agents and small agencies that need to manage client records, policy lifecycles, supporting documents, and renewal reminders from one place. It solves the operational problem of scattered spreadsheets and manual follow-up by combining authenticated workflows, agent-isolated data access, fast list views, and document storage in a single web application.

## USP / What Makes This Project Unique

- Agent-scoped multi-tenant design with Supabase Auth, SSR session handling, and RLS-based data isolation.
- Dual-layer performance strategy: Redis caching when available, in-memory fallback when not, plus request deduplication and stale-while-revalidate behavior.
- Dashboard and list views are optimized to fetch only the data needed, using counts, limits, and parallel queries instead of full-table reads.
- Document workflow is production-friendly: Supabase Storage upload, agent-scoped storage paths, progress feedback, file validation, and instant view/download actions.
- Business logic is encoded in the UI where it matters, including autocomplete-driven forms and conditional policy fields for vehicle-based insurance categories.

### Short USP Line

Multi-tenant insurance CRM with Redis-cached dashboards and secure Supabase workflows.

## Core Features

- Authenticated landing, login, signup, callback, and protected app shell.
- KPI dashboard with total clients, active policies, expiring policies, documents, reminders, premium, and commission metrics.
- Client CRUD with searchable list views and fast navigation.
- Policy CRUD with master-data selection, client autocomplete, and conditional vehicle fields.
- Document management with upload progress, storage-backed files, and view/download support.
- Reminder tracking with due-state highlighting and status updates.
- Read-only master data settings for insurance companies, providers, and policy subcategories.
- Profile page with account details and logout.

## Tech Stack

Frontend

- Next.js 14 App Router
- React 18
- Tailwind CSS
- Bootstrap and React Bootstrap
- Bootstrap Icons and React Icons

Backend

- Next.js route handlers
- Next.js middleware for session refresh
- Supabase SSR clients for browser and server access
- Service-style API layer in `lib/api.ts`

Database

- Supabase PostgreSQL
- Row Level Security policies
- SQL migrations for indexes and schema/security setup
- Generated database types in `types/database.ts`

AI/ML

- Not used in this codebase

DevOps/Deployment

- Vercel configuration with cron jobs
- Netlify configuration and Next.js plugin support
- Production env validation and health endpoints
- Keep-alive routes to prevent Supabase free-tier sleep

Authentication

- Supabase Auth
- SSR session management
- Auto-profile creation for new users

APIs/Integrations

- Supabase Storage for document files
- Upstash Redis for caching
- CSV export flow for policy data
- Health and keep-alive endpoints for operational monitoring

## Architecture Overview

The app uses a Next.js App Router front end with protected routes wrapped in a server-side layout that checks the current Supabase user, redirects unauthenticated users, and ensures a profile row exists. Client pages use shared hooks such as `useSupabaseQuery` and `useSupabaseMutation` to centralize data fetching, caching, and cache invalidation. Data access goes through Supabase with `agent_id` scoping, while high-traffic screens like the dashboard, clients, policies, documents, and reminders are optimized with parallel queries, limited column selection, and cache TTLs. File uploads go directly to Supabase Storage, then persist a document record in PostgreSQL, and the dashboard/navbar/sidebar provide the main application shell.

## Key Technical Challenges

- Enforcing tenant isolation across all entities without leaking data between agents.
- Keeping dashboard and list pages responsive in a serverless environment with limited cold-start tolerance.
- Balancing fast reads with data freshness through Redis, memory fallback, and cache invalidation.
- Handling policy form complexity, including master-data lookups and conditional vehicle requirements.
- Implementing secure document storage with upload validation, scoped file paths, and reliable download/view behavior.

## Resume Ready Bullet Points

- Built a multi-tenant insurance management platform in Next.js 14 and Supabase with SSR auth, protected layouts, and agent-scoped data access.
- Implemented a Redis-backed caching layer with in-memory fallback, request deduplication, and stale-while-revalidate behavior to speed up dashboard and list views.
- Designed high-performance data screens that use selective column fetching, parallel queries, and capped initial loads to reduce database pressure.
- Delivered secure document workflows with Supabase Storage uploads, progress tracking, file validation, and instant view/download support.
- Added business-specific CRUD flows for clients, policies, and reminders, including autocomplete selection and conditional policy validation.
- Hardened the app for deployment with environment validation, health checks, cron keep-alives, and platform-specific config files.

## Interview Questions

- How is tenant isolation enforced?
  - Through Supabase Auth, `agent_id`-scoped queries, protected layouts, and database RLS policies.

- Why use both Redis and in-memory caching?
  - Redis gives shared serverless caching when available, while memory fallback keeps the app functional if Redis is unavailable.

- What makes the dashboard fast?
  - It uses parallel queries, count-only fetches where possible, limited row loads, and short-lived cache TTLs.

- How does document upload work end to end?
  - The UI validates file size, uploads to Supabase Storage, generates a public URL, and writes a document record to PostgreSQL.

- How do you handle policy form complexity?
  - Master data is loaded once, clients are selected with autocomplete, and vehicle fields appear only for subcategories that require them.

## Deployment & Setup

Local run: install dependencies with `npm install`, then start the app with `npm run dev` from the `insuredesk` folder. Required environment variables include `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; optional but important variables include `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`, and `CRON_SECRET` for keep-alive protection. The codebase is configured for Vercel deployment, includes Netlify support, and exposes `/api/health` plus keep-alive routes for operational checks.

## Final Technical Assessment

Complexity level: high for a portfolio project. The strongest engineering aspect is the combination of multi-tenant security, cached data access, and storage-backed document workflows in a single production-style app. What makes it stand out is that it is not just CRUD screens, but a security-aware insurance operations system with real deployment hardening and performance optimization.
