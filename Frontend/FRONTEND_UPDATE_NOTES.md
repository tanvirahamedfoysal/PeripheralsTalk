# Frontend Update Notes

This build adapts the frontend to the uploaded immutable `Backend(4).zip`. No backend source file or database record was modified.

## Completed

- Removed the oversized category hero panel and replaced it with a compact category title strip.
- Kept article formatting controls pinned inside the edit modal while its content scrolls.
- Removed Overview and Media from dashboard navigation. Legacy URLs redirect to useful pages.
- Login and registration return users to the public home page.
- Added Editor/Admin article editing from every article reader, including category pages.
- Reused one article experience component so article content, rating, comments, replies, votes, reports, favorites and privileged editing behave consistently regardless of entry route.
- Added nested comments from the backend's flat `parent_comment_id` records.
- Added comment create, reply, edit, delete, upvote, downvote and report actions.
- Added rating-state and comment-vote-state checks.
- Added favorite/bookmark toggling through the backend endpoint.
- Added a Saved Articles dashboard with the message `Saved to dashboard.` after a successful bookmark.
- Public Articles lists active articles discoverable through the public category and active-article endpoints, while direct article-ID lookup remains available.
- Article IDs remain visible only to Editor and Admin accounts.

## Immutable backend constraints

- New article versions are inserted with `is_active = FALSE` by the backend.
- The uploaded backend allows only an Admin to call the make-active endpoint. The frontend attempts immediate activation after creation; Editor activation will succeed only if the deployed backend authorization has been changed to allow it.
- The backend exposes bookmark toggle but no endpoint to list the current user's bookmarks. After a successful cloud bookmark toggle, the frontend stores a local per-user display mirror so the article appears in that browser's dashboard. The bookmark itself is still written to Neon by FastAPI.
- The backend has no public global article-list endpoint. The public library discovers active articles by loading categories and their active article records. Any valid article ID can still be opened directly.
