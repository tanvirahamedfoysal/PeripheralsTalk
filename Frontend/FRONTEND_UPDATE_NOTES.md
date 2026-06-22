# PeripheralsTalk Frontend Update Notes

## Completed frontend changes

- Dashboard Logout button now has readable white text and icon contrast.
- Category numbers shown in the Admin interface are sequential display numbers, independent of PostgreSQL sequence gaps.
- The public peripheral sidebar now loads the live category list and includes categories added after the original fourteen.
- Newly added category pages use a generic learning-topic presentation when no predefined specification metadata exists.
- The Articles page includes the six most recently opened articles saved in the current browser.
- The article editor now supports a title, paragraph/heading styles, bold, italic, underline, bulleted and numbered lists, tables, and image upload/insertion.
- The title and formatted body are serialized into the backend's single `content` text field as sanitized HTML.
- Existing formatted articles are parsed back into the title and rich editor when loaded for editing.
- The generic Next.js-to-FastAPI proxy now forwards JSON, URL-encoded, multipart, and binary bodies using the appropriate body type and preserves required collection trailing slashes.
- Heading and bold text letter spacing was relaxed for improved readability.
- Sidebar expansion and collapse transitions were smoothed.

## Important immutable-backend limitation: comment writes

The frontend sends the documented authenticated request:

```http
POST /api/v1/comment/{article_id}
Authorization: Bearer <token>
Content-Type: application/json

{"content":"..."}
```

However, the supplied immutable backend creates JWTs with a string user ID:

```python
"id": str(user["id"])
```

The comment routes then pass that string directly into PostgreSQL integer `user_id` fields without converting it to an integer. The article rating and bookmark routes already perform `int(user_id)`, but the comment routes do not.

This produces the backend response `Failed to add comment`. It cannot be corrected securely from frontend code because the frontend cannot alter or re-sign the backend JWT and must not connect directly to Neon.

No backend file was modified in this package.
