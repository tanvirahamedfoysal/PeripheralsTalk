# PeripheralsTalk Frontend

The frontend is a Next.js application that presents the PeripheralsTalk learning platform to users. It surfaces public content such as categories and articles, while also providing authenticated experiences for dashboard, editor, and admin workflows.

## Current capabilities

- Public home page with category discovery and featured content
- Category browsing and detail views with structured comparison content
- Article library and direct article lookup by ID
- Nested comments, replies, ratings, bookmarks, and report actions
- Rich-text article authoring and editing experiences
- Role-based dashboard routes for user, editor, and admin experiences

## Project structure

```text
Frontend/
├── src/app/               # App Router pages and route handlers
├── src/components/        # Reusable UI components
├── src/lib/               # API helpers, auth cookie utilities, and shared logic
├── src/proxy.ts           # Middleware that protects dashboard/editor/admin routes
├── package.json           # Frontend scripts and dependencies
└── next.config.ts        # Next.js configuration
```

## Runtime stack

- Next.js 16 with the App Router
- React 19 and TypeScript
- Server-side route handlers for backend communication
- Protected route middleware for authenticated areas

## Local development

### Prerequisites

- Node.js 22+
- pnpm

### Setup

```bash
cd Frontend
pnpm install
```

### Run the development server

```bash
pnpm dev
```

Open http://localhost:3000.

## Backend integration

The frontend does not call the backend directly from the browser. Instead, it uses Next.js route handlers and the server-side proxy layer to forward requests to the backend API. The default backend target is:

```text
https://peripheralstalk-f4aa79e9.fastapicloud.dev
```

Relevant integration points include:

- [src/app/api/backend/[...path]/route.ts](src/app/api/backend/[...path]/route.ts)
- [src/lib/api/server.ts](src/lib/api/server.ts)
- [src/proxy.ts](src/proxy.ts)

## Available validation commands

```bash
pnpm format:check
pnpm typecheck
pnpm lint
pnpm build
```

## Environment variables

Common variables used by the frontend include:

- FASTAPI_BASE_URL
- FASTAPI_API_PREFIX
- FASTAPI_REQUEST_TIMEOUT_MS
- AUTH_COOKIE_NAME
- AUTH_COOKIE_SECURE
- AUTH_COOKIE_MAX_AGE_SECONDS

## Development notes

- Keep protected dashboard routes behind the proxy and auth middleware
- Prefer updating the API routes and UI together when adding new features
- Use the backend API docs as the source of truth for request and response shapes
