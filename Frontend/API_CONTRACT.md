# API contract used by this frontend

Only the routes found in the supplied `api.zip` are permitted by `src/lib/api/allowed.ts`.

## Authentication

- POST `/api/v1/auth/register`
- POST `/api/v1/auth/login`
- POST `/api/v1/auth/validate-token`
- POST `/api/v1/auth/request-reset-password`
- POST `/api/v1/auth/reset-password`

## Categories

- GET `/api/v1/category/`
- GET `/api/v1/category/{id}`
- POST `/api/v1/category/`
- PUT `/api/v1/category/{id}`
- DELETE `/api/v1/category/{id}`

## Articles

- GET `/api/v1/article/{article_id}`
- POST `/api/v1/article/{article_id}`
- GET `/api/v1/article/{category_id}/all-articles`
- POST `/api/v1/article/{category_id}/make-active/{article_id}`
- DELETE `/api/v1/article/{article_id}`
- POST `/api/v1/article/{article_id}/vote`
- POST `/api/v1/article/toggle_favourite/{article_id}`

## Comments

- GET/POST `/api/v1/comment/{id}`
- PUT/DELETE `/api/v1/comment/{comment_id}`
- POST `/api/v1/comment/{comment_id}/up-vote`
- POST `/api/v1/comment/{comment_id}/down-vote`
- POST `/api/v1/comment/{comment_id}/report`

## Profile

- GET `/api/v1/profile/profile-photo`
- GET `/api/v1/profile/all`
- GET/PUT/DELETE `/api/v1/profile/me`
- POST `/api/v1/profile/request-for-editor-access`

## Admin

- GET `/api/v1/admin/get-editor-request`
- POST `/api/v1/admin/make-editor/{user_id}`
- POST `/api/v1/admin/revoke-editor/{user_id}`
- POST `/api/v1/admin/suspend-user/{user_id}`
- POST `/api/v1/admin/unsuspend-user/{user_id}`
- GET `/api/v1/admin/all-report`
- POST `/api/v1/admin/resolve-report/{report_id}`
- GET `/api/v1/admin/get-user-by-comment/{comment_id}`
- POST `/api/v1/admin/reset-user-password/{user_id}`

## Utility

- POST `/api/v1/utility/upload-image`
