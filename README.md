# PeripheralsTalk

PeripheralsTalk is a full-stack knowledge platform for understanding computer peripherals through structured category guides, versioned articles, comparisons, and community discussion. The repository is organized as a monorepo with a FastAPI backend and a Next.js frontend.

## Live links

- Frontend: https://peripherals-talk-frontend.vercel.app/
- Backend API docs: https://peripheralstalk-f4aa79e9.fastapicloud.dev/docs#/

## What the project includes

- A public learning experience for browsing categories and reading published articles
- A role-aware authoring workflow for editors and administrators
- Nested comment threads, ratings, bookmarks, reports, and rich-text article editing
- A backend API that serves public content and protected management operations
- A frontend proxy layer that forwards browser requests to the backend securely

## Repository structure

```text
.
├── Backend/               # FastAPI application and API routers
├── Frontend/              # Next.js application and UI components
├── package.json           # Minimal workspace-level package metadata
├── pnpm-lock.yaml         # Root workspace lockfile
├── pnpm-workspace.yaml    # Workspace configuration for Frontend
└── README.md              # This overview document
```

## Architecture at a glance

- Backend: FastAPI, SQLAlchemy async, Pydantic, JWT-based auth, Cloudinary and Brevo integrations
- Frontend: Next.js 16, React 19, TypeScript, Tailwind-style UI system, server-side route proxying
- Data flow: the browser talks to Next.js route handlers, which forward requests to the backend API

## Quick start

### 1. Backend

```bash
cd Backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

Create a local .env file for backend settings such as the database URL, secret key, and Cloudinary/Brevo credentials, then start the API:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend

```bash
cd Frontend
pnpm install
pnpm dev
```

The frontend will be available at http://localhost:3000 and the backend docs at http://localhost:8000/docs.

## Documentation map

- Backend guide: [Backend/README.md](Backend/README.md)
- Frontend guide: [Frontend/README.md](Frontend/README.md)

## Notes for contributors

- Keep the backend and frontend environment variables isolated and documented
- Prefer updating the API contract and UI together when adding features
- Use the backend docs and the frontend proxy layer as the integration boundary
