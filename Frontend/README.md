# PeripheralsTalk Frontend — Cloud Backend Build

A production-ready Next.js 16 frontend for the immutable PeripheralsTalk FastAPI backend.

## Architecture

```text
Browser
  -> Next.js route handlers and protected pages
  -> https://peripheralstalk-106b064b.fastapicloud.dev/api/v1
  -> FastAPI / SQLAlchemy
  -> Neon PostgreSQL
```

The browser does not receive the Neon connection string and never connects to the database directly.

## Visual system

The interface uses the supplied palette:

- Forest: `#405539`
- Sage: `#5F7052`
- Sand: `#B6A281`
- Clay: `#77594E`

The typography uses a professional educational hierarchy:

- Editorial serif headings using system-installed Charter/Palatino/Georgia fallbacks
- Clean Aptos/Segoe UI sans-serif body and navigation text
- Larger, clearer navigation with deliberate bold and regular weights

## Authentication implemented

- OAuth2 form-encoded login using the backend's `username` field
- Login by either email or username
- JWT stored in an HttpOnly cookie
- Bearer-token validation through the backend
- Registration OTP request
- Registration with name, username, email, password and OTP
- Two-minute OTP countdown
- OTP expiry detection and resend action
- Password-reset OTP countdown and resend action
- Role redirects for `ADMIN`, `EDITOR` and `USER`
- Suspended-account handling

## Sidebar behavior

On desktop, the 14-category rail:

- remains collapsed while idle
- expands automatically when hovered or keyboard-focused
- collapses automatically after the pointer or focus leaves
- remains a horizontal mobile category rail on small screens

## Environment

The included `.env.local` and `.env.example` use:

```env
FASTAPI_BASE_URL=https://peripheralstalk-106b064b.fastapicloud.dev
FASTAPI_API_PREFIX=/api/v1
FASTAPI_REQUEST_TIMEOUT_MS=30000
FASTAPI_AUTH_TIMEOUT_MS=90000

AUTH_COOKIE_NAME=peripheralstalk_session
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_MAX_AGE_SECONDS=3600
```

`AUTH_COOKIE_SECURE` is automatically treated as secure by the code when running a production build.

## Install and run

Copy the ZIP contents directly into your existing `Frontend` directory. Then run:

```powershell
cd D:\PROJ\PeripheralsTalk\Frontend

Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

pnpm install
pnpm run dev
```

Open:

```text
http://localhost:3000
```

## Verification commands

```powershell
pnpm typecheck
pnpm lint
pnpm build
```

## Important backend boundary

The frontend only calls routes implemented by the uploaded backend. It does not invent search, trending, public feed, analytics, contact submission, refresh-token or backend logout endpoints.

If the backend returns `Failed to send OTP email`, the frontend now displays that exact server response. That specific failure must be resolved in the deployed FastAPI/Brevo configuration because a browser interface cannot send the backend's OTP email itself.
