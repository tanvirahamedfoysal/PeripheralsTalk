# PeripheralsTalk Frontend API Contract

Base URL:

```text
https://peripheralstalk-106b064b.fastapicloud.dev/api/v1
```

## Articles

- `GET /article/{article_id}` — public article detail.
- `GET /article/active-article/{peripheral_id}` — public active article ID and
  content for one peripheral.
- `POST /article/` — Editor/Admin create; backend assigns article ID and creates
  an inactive version.
- `PUT /article/{article_id}` — Editor/Admin update current content in place.
- `GET /article/{peripheral_id}/all-articles` — Admin-only version list.
- `POST /article/{peripheral_id}/make-active/{article_id}` — Admin-only publish.
- `POST /article/{article_id}/rate` — authenticated rating.
- `POST /article/{article_id}/toggle-bookmark` — authenticated bookmark toggle.

## Comments

- `GET /comment/{article_id}` — public flat comment array. Each item uses
  `comment_id` and `parent_comment_id`.
- `POST /comment/{article_id}` — authenticated root comment.
- `POST /comment/reply/{comment_id}` — authenticated nested reply.
- `PUT /comment/{comment_id}` — owner update.
- `DELETE /comment/{comment_id}` — owner soft-delete.
- `POST /comment/{comment_id}/up-vote` — authenticated toggle.
- `POST /comment/{comment_id}/down-vote` — authenticated toggle.
- `POST /comment/{comment_id}/report` — authenticated report.

The frontend sends protected operations through the Next.js proxy, which reads
the HttpOnly session cookie and forwards the JWT as a Bearer token.
