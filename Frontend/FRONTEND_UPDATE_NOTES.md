# Frontend Update Notes

## API contract updates implemented

- Added public active-article lookup:
  `GET /api/v1/article/active-article/{peripheral_id}`.
- Corrected comment response mapping from backend `comment_id` to the frontend
  comment-tree `id`.
- Implemented top-level comments through
  `POST /api/v1/comment/{article_id}`.
- Implemented nested replies through
  `POST /api/v1/comment/reply/{comment_id}`.
- Implemented vote toggles through `up-vote` and `down-vote` routes.
- Preserved update, soft-delete and report actions exactly as exposed by the
  immutable backend.

## Public article library

The Articles page now requests all categories and resolves the active published
article for each category. When an older deployment cannot resolve the active
article route, it falls back to the public category article response so the
published learning content remains browsable.

Inactive versions cannot be globally listed to anonymous users because the only
version-list endpoint is Admin-protected. Direct lookup by a known article ID
remains public, matching the backend.

## Editor and Admin article management

- The Articles dashboard page is now an article manager rather than a permanent
  editor form.
- Search by article ID appears first.
- Recent articles appear with permanent IDs and Edit buttons.
- Edit opens a modal containing the current title and rich HTML content.
- Updates use the Editor-compatible `PUT /article/{article_id}` endpoint.
- Admins can publish inactive records and create articles on a separate page.
- Editors can update any known article ID without Admin permission.

## Immutable-backend publication rule

The uploaded backend creates new article versions with `is_active = FALSE` and
allows only Admins to call `make-active`. The frontend therefore auto-publishes a
new Admin-created article, but an Editor-created article still requires Admin
publication. This rule cannot be bypassed without changing the backend.
