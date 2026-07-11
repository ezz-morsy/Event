# Explanation: Frontend View Bootstrap Fix

## What was done and why
I added the missing `frontend/views/` modules (`dashboard.js`, `events.js`, `detail.js`, `form.js`) so the router in `frontend/app.js` can successfully import views for all existing hash routes.

This was necessary because `app.js` already tries to dynamically import these files. Without them, the app fails on first load with "Failed to Load View" and the frontend shell cannot be used.

## Alternatives considered
- **Alternative 1: Change `app.js` to hardcode HTML in one file**
  - **Why rejected:** This would break the intended SPA modular structure and make future feature work harder.
- **Alternative 2: Keep missing views and show only an error fallback**
  - **Why rejected:** The app would remain broken by default and the PR would still ship a non-functional routing setup.
- **Alternative 3: Add placeholder-only files with no API calls**
  - **Why partially rejected:** I kept the files lightweight, but included basic fetch wiring for dashboard/events/detail so behavior aligns with the expected backend integration direction.
