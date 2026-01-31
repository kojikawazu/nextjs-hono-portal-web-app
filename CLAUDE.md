# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A personal portal web application built with Next.js 16 (App Router) and Hono backend API. The site is deployed on Google Cloud Run with Cloudflare for CDN/security.

**Requirements**: Node.js >= 20.9.0

Live site: https://smartportalcom.com/

## Common Commands

```bash
# Development
npm run dev              # Start development server

# Build & Production
npm run build            # Production build
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run format:check     # Check formatting without writing

# Unit Tests (Jest)
npm test                 # Run all unit tests
npm run test:watch       # Watch mode
npm run test:coverage    # Generate coverage report
npm test -- __tests__/api/gcs.test.ts              # Run single test file
npm test -- --testNamePattern="GET /api/gcs/common" # Run tests matching name

# E2E Tests (Playwright)
npm run test:e2e         # Run e2e tests
npm run test:e2e:ui      # Interactive Playwright UI
npm run test:e2e:headed  # Run with visible browser
npx playwright test e2e/tests/pages/home.spec.ts   # Run single e2e test
```

## Architecture

### Tech Stack
- **Frontend**: Next.js 16, React 18, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend API**: Hono (in Next.js API routes)
- **Form Handling**: React Hook Form + Zod validation
- **Testing**: Jest (unit), Playwright (e2e)
- **Infrastructure**: Docker, Cloud Run, Cloud Storage, Terraform

### Directory Structure

```
src/app/
├── api/                    # Hono-based API routes
│   ├── [[...route]]/       # Main API handler with CORS
│   ├── gcs/                # Google Cloud Storage operations
│   └── mail/               # Email sending via Resend
├── components/             # Page-specific React components
├── contexts/               # React contexts (CommonContext)
├── contact/                # Contact form flow (form → confirm → success)
├── personaldev/            # Personal development section
├── sampledev/              # Sample development section
├── hooks/                  # Custom React hooks
├── schema/                 # Zod validation schemas
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions

__tests__/                  # Jest unit tests
e2e/tests/                  # Playwright e2e tests
terraform/                  # Infrastructure as Code
```

### API Structure
- Base path: `/api`
- CORS configured via `ALLOWED_ORIGIN` environment variable
- Routes: `/api/hello` (health check), `/api/gcs/*` (storage), `/api/mail/*` (email)

### Key Configuration
- TypeScript path alias: `@/*` → `./src/*`
- Prettier: 4-space indent, single quotes, trailing commas, 100 char line width
- Jest: Uses `node` test environment, ignores `/e2e/` directory (Playwright handles e2e tests)
- E2E tests require `.env.test` for environment configuration

## Environment Variables

Required variables are documented in `manuals/environments.md`. Key variables:
- `ALLOWED_ORIGIN` - CORS origin for API requests
- `BACKEND_API_URL` - Backend API endpoint
- `GCS_PRIVATE_BUCKET_NAME`, `GCS_COMMON_DATA_PATH`, `GCS_PERSONAL_DATA_PATH`, `GCS_SAMPLE_DATA_PATH` - Google Cloud Storage configuration
- `RESEND_API_KEY`, `RESEND_SEND_DOMAIN`, `MY_MAIL_ADDRESS` - Email service via Resend
- `NEXT_PUBLIC_API_TOKEN` - Client-side API token for authentication

## CI/CD

GitHub Actions workflows:
1. **Test** (`.github/workflows/test.yml`): Runs Jest + Playwright on workflow_call
2. **Deploy** (`.github/workflows/deploy-to-googlecloud.yml`): Builds Docker image, pushes to Artifact Registry, deploys to Cloud Run
3. Deployment triggers on push to `main` branch

## Infrastructure

Terraform files in `terraform/` manage:
- Cloud Run service
- Artifact Registry
- Cloud Storage buckets
- Cloud DNS
- IAM roles

Architecture diagram available at `architecture/architecture.drawio.png`.
