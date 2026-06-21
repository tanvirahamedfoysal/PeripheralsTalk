# PeripheralsTalk immutable backend contract

Base URL:

```text
https://peripheralstalk-106b064b.fastapicloud.dev/api/v1
```

## Authentication

- `POST /auth/validate-token` — Bearer token, no JSON body
- `POST /auth/request-registration-otp` — JSON `{ "email": string }`
- `POST /auth/register` — JSON `{ name, username, email, password, otp, image_url?, image_public_id? }`
- `POST /auth/login` — `application/x-www-form-urlencoded` fields `username` and `password`
- `POST /auth/request-reset-password` — JSON `{ "email": string }`
- `POST /auth/reset-password` — JSON `{ email, otp, new_password }`

## Categories

- `GET /category/`
- `GET /category/{id}`
- `POST /category/` — ADMIN
- `PUT /category/{id}` — ADMIN
- `DELETE /category/{id}` — ADMIN

## Articles

- `GET /article/{article_id}`
- `POST /article/` — EDITOR or ADMIN
- `PUT /article/{article_id}` — EDITOR or ADMIN
- `GET /article/{peripheral_id}/all-articles` — ADMIN
- `POST /article/{peripheral_id}/make-active/{article_id}` — ADMIN
- `DELETE /article/{article_id}` — ADMIN
- `POST /article/{article_id}/rate` — authenticated
- `POST /article/{article_id}/toggle-bookmark` — authenticated

## Comments

- `POST /comment/{article_id}`
- `GET /comment/{article_id}`
- `POST /comment/reply/{comment_id}`
- `PUT /comment/{comment_id}`
- `DELETE /comment/{comment_id}`
- `POST /comment/{comment_id}/up-vote`
- `POST /comment/{comment_id}/down-vote`
- `POST /comment/{comment_id}/report`

## Profile

- `GET /profile/profile-photo`
- `POST /profile/validate-username?username=value`
- `GET /profile/all` — ADMIN
- `GET /profile/me`
- `PUT /profile/me`
- `DELETE /profile/me`
- `POST /profile/request-for-editor-access`

## Admin

- `GET /admin/get-editor-request`
- `POST /admin/make-editor/{user_id}`
- `POST /admin/revoke-editor/{user_id}`
- `POST /admin/suspend-user/{user_id}`
- `POST /admin/unsuspend-user/{user_id}`
- `GET /admin/all-report`
- `POST /admin/resolve-report/{report_id}`
- `GET /admin/get-user-by-comment/{comment_id}`
- `POST /admin/reset-user-password/{user_id}`

## Utility

- `POST /utility/upload-image` — multipart field `file`

The method-and-path whitelist is implemented in `src/lib/api/allowed.ts`.
