# PeripheralsTalk Frontend — Fixed Build

A formatted and responsive Next.js 16 frontend for PeripheralsTalk, using the
project palette:

- Signal red: `#DB1A1A`
- Blush white: `#FFF6F6`
- Soft aqua: `#8CC7C4`
- Deep teal: `#2C687B`

## What was fixed

- Reformatted every TypeScript, TSX, CSS, JSON and configuration file.
- Fixed the empty PostCSS configuration that caused the white 500 page.
- Fixed the collapsed peripheral sidebar so only centered icons are visible.
- Added a clean expanded sidebar with full category names.
- Improved the desktop, tablet and mobile layouts.
- Refined category detail pages and dashboard surfaces.
- Added a mobile navigation menu.
- Added `allowedDevOrigins` for `192.168.0.100` during development.
- Restricted the backend proxy by both HTTP method and endpoint.
- Kept the frontend limited to the endpoints present in the supplied `api.zip`.

## Install

Place these files inside your existing `Frontend` directory, then run from the
project root:

```powershell
cd D:\PROJ\PeripheralsTalk
pnpm install
pnpm --filter peripheralstalk-frontend dev
```

Or from the frontend directory:

```powershell
cd D:\PROJ\PeripheralsTalk\Frontend
pnpm install
pnpm dev
```

Open:

```text
http://localhost:3000
```

The development network address is also allowed:

```text
http://192.168.0.100:3000
```

## Environment

Copy `.env.example` to `.env.local`:

```powershell
Copy-Item .env.example .env.local
```

Start FastAPI separately at:

```text
http://127.0.0.1:8000
```

## Quality commands

```powershell
pnpm format
pnpm typecheck
pnpm lint
pnpm build
```

## API boundary

The exact method-and-path whitelist is located at:

```text
src/lib/api/allowed.ts
```

No search, trending, analytics, contact submission, site-content or other
undocumented API endpoint is called.
