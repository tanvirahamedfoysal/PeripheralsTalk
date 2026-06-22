# Frontend Update Notes

## Admin article version control

The version-management section now has its own category selector. Choosing a category loads all article versions for that category and shows which article ID is active. Admins can load a version for editing, activate an inactive version, or delete an unreferenced version.

## Table editor

The table toolbar button now opens a built-in dialog instead of using `window.prompt()`. The dialog accepts 1–20 rows and 1–10 columns. The first row is created as a heading row, and every cell can be edited directly in the article editor.

## Searchable article ID

The immutable FastAPI endpoint accepts only `peripheral_id` and `content` when creating an article. PostgreSQL assigns the article ID. Therefore, the frontend cannot safely allow an Editor to choose a custom database ID.

After a successful save, the interface now displays the assigned article ID, provides a Copy ID button, and provides a Preview link. That generated ID is the number used by the public article search page.
