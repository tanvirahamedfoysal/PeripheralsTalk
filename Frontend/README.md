# PeripheralsTalk Frontend — Study Image, Palette and Write-API Fix

This package is the complete Next.js frontend for the immutable PeripheralsTalk
FastAPI backend.

## Required image

Add your learning image here before starting the frontend:

```text
public/study.jpg
```

The home hero and all authentication/recovery pages use this image. The CSS
contains a graceful color fallback, so the app still renders if the image has
not been copied yet.

## Current palette

- Deep evergreen: `#07332C`
- Academic green: `#485B46`
- Soft sage: `#AFB7AC`
- Warm gold: `#BCA879`
- Cloud gray: `#E0DEDD`

## Main fixes

- Replaced the striped/flag-style illustrations with `public/study.jpg`.
- Applied a clean modern sans-serif typography system.
- Added a 1.5-second delayed close to the profile dropdown.
- Smoothed the 14-category sidebar expansion and collapse.
- Preserved trailing slashes for FastAPI collection write routes.
- Fixed category creation and article-version creation proxy forwarding.
- Increased normal backend request timeout to 60 seconds.
- Kept JWT forwarding through the secure server-side proxy.
- Preserved all existing role-based dashboards and authentication flows.

## Install

Copy everything into your existing `Frontend` directory, then run:

```powershell
cd D:\PROJ\PeripheralsTalk\Frontend

Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
pnpm install
pnpm run dev
```

Open:

```text
http://localhost:3000
```

## Environment

The included `.env.local` points to:

```text
https://peripheralstalk-106b064b.fastapicloud.dev/api/v1
```

The browser does not connect directly to Neon. Requests go through the Next.js
server proxy, which attaches the HttpOnly JWT cookie to protected FastAPI
requests.

## Quality commands

```powershell
pnpm format:check
pnpm typecheck
pnpm lint
pnpm build
```
