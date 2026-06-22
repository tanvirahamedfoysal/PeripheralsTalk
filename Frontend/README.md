# PeripheralsTalk Frontend — Public Articles, Nested Discussions and Rich Editing

This is the complete Next.js frontend for the immutable deployed PeripheralsTalk
FastAPI backend.

## Current functionality

- Public category directory with live database categories.
- Compact category detail pages with expanded comparison specifications.
- Public article library assembled from the backend's published active articles.
- Direct article lookup by permanent database article ID.
- Nested comments and replies using `parent_comment_id`.
- Comment upvote/downvote toggles, editing, deletion and reporting.
- Role-aware article interactions: ratings and bookmarks require authentication.
- Editor and Admin article search by ID.
- Recent article management with rich-text editing in a modal.
- Rich-text titles, headings, bold, italic, underline, lists, tables and images.
- Admin publication controls and separate Admin article creation page.
- Database-assigned article IDs are displayed to Admins and Editors but hidden
  from ordinary public readers.

## Backend connection

The included environment files target:

```text
https://peripheralstalk-106b064b.fastapicloud.dev/api/v1
```

The browser communicates through the Next.js server proxy. The frontend never
connects directly to Neon PostgreSQL and contains no database credentials.

## Install

Copy the ZIP contents into your `Frontend` folder, then run:

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

## Validation commands

```powershell
pnpm format:check
pnpm typecheck
pnpm lint
pnpm build
```
