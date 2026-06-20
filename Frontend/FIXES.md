# Fixed authentication pages

- Removed the stale authentication-route wrapper that caused home-page content to appear above Login and Register.
- Added a clean `src/app/(auth)/layout.tsx` that renders only the selected authentication page.
- Added a visible Home button to Login, Register, Forgot Password, Reset Password, and Change Password pages.
- Added Forgot Password, Reset Password, and Change Password pages.
- Added a Forgot Password link to the Login form.
- Password pages call only the existing authentication endpoints supplied in `api.zip`.
