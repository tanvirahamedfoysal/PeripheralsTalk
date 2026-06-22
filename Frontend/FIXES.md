# Completed Frontend Changes

- Added public published-article browsing for every category with an active article.
- Kept direct public article lookup by permanent database article ID.
- Corrected backend comment objects from `comment_id` into a stable nested tree.
- Added root comments, nested replies, edit, delete, report, upvote and downvote actions.
- Restricted write actions to authenticated users while keeping discussions public.
- Hid article IDs from ordinary readers and displayed them to Editors/Admins.
- Replaced the Editor/Admin edit screen with search, recent articles and Edit buttons.
- Added a rich-text editing modal preloaded with the current article document.
- Added a separate Admin article-creation route.
- Preserved database-assigned IDs as read-only values.
- Compact category hero replaces the oversized two-card header.
- Removed the redundant structured-fields summary card.
- Expanded the original fourteen categories to eight useful comparison specifications each.
- Added an article discussion link when the public active-article endpoint returns an ID.
- Raised the table chooser above the article-editing modal.
