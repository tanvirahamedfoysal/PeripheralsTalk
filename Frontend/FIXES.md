# Fixes in this release

## Visual design

- Replaced the old striped/flag-style home illustration with `public/study.jpg`.
- Replaced the same visual treatment on Login, Register, Forgot Password,
  Reset Password, and Change Password pages.
- Applied the new five-color evergreen/sage/gold/cloud palette.
- Replaced the serif-heavy typography with modern display and body sans-serif
  stacks.

## Interaction

- The profile dropdown remains open for 1.5 seconds after the pointer leaves the
  profile button.
- Entering the dropdown cancels the pending close timer.
- Keyboard focus continues to keep the dropdown open.
- Sidebar width, page offset, labels and links now animate with a longer,
  smoother easing curve.

## Category and article writes

FastAPI defines collection writes at routes ending in `/`:

```text
POST /api/v1/category/
POST /api/v1/article/
```

Next.js catch-all route parameters remove a final slash. The previous proxy
therefore forwarded the write requests to slashless routes, which could trigger
an HTTP redirect while replaying the POST body and surface as a temporary
service-unavailable error.

The proxy now restores the required trailing slash for the Category and Article
collection routes before forwarding the request. It also explicitly includes
same-origin credentials and allows up to 60 seconds for normal cloud requests.

No backend code was changed.
