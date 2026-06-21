# Changes in this build

## Authentication

- Corrected login to send `application/x-www-form-urlencoded` data to FastAPI.
- Sends the identifier through the exact OAuth2 field named `username`.
- Increased authentication request timeout to 90 seconds for cloud cold starts, password hashing and SMTP delivery.
- Removed the unnecessary session re-fetch before redirecting after successful login or registration.
- Uses the session returned by the frontend route immediately after authentication.
- Preserves and displays exact FastAPI error details.
- Added same-origin credential handling for the HttpOnly session cookie.
- Added username validation before registration.
- Added a two-minute registration OTP countdown.
- Added OTP expiration handling and a resend button.
- Added the same countdown and resend behavior to forgot/reset/change-password pages.

## Visual design

- Replaced the old red/aqua/teal palette with `#405539`, `#5F7052`, `#B6A281`, and `#77594E`.
- Added a professional learning-platform font hierarchy.
- Increased navbar font size, spacing and button dimensions.
- Improved heading/body weight contrast.
- Updated authentication artwork and status components to the new palette.

## Sidebar

- The 14-category sidebar expands on hover or keyboard focus.
- It collapses automatically when the pointer or focus leaves.
- Removed the need to click an expand/collapse button on desktop.
- Preserved the responsive bottom rail on mobile.

## Build and setup

- Kept pnpm 11 build approvals for `sharp` and `unrs-resolver`.
- Kept `verifyDepsBeforeRun: false` to prevent the earlier automatic-install failure.
- No `.next` or `node_modules` directories are included in the delivered ZIP.
