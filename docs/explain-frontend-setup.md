# Explanation: Frontend Project Setup

## What was done and why
I set up the basic template structure for the frontend of the Convent Event Platform inside the `frontend/` directory:
1. **index.html**: This is the single HTML page of our application (Single Page Application). It has one root `div` (`<div id="app"></div>`) where JavaScript will dynamically inject all the different views.
2. **style.css**: A custom stylesheet defining a premium, modern dark mode using Outfit and Plus Jakarta Sans fonts. It includes glassmorphism navbars, smooth transitions, custom scrollbars, loading indicators, and styled toast notifications.
3. **app.js**: The brain of the frontend. It sets the live backend API URL, defines helpers for loading state and notifications, and sets up a hash-based router (`#dashboard`, `#events`, etc.) that dynamically loads view files on demand.

## Alternatives Considered
- **Alternative 1: Using React, Next.js, or Vite**
  - **Why rejected:** The project guidelines explicitly state that we should use a Vanilla JS SPA with no framework and no build steps. While React makes state management easier, a pure Vanilla JS approach runs instantly in the browser without any setup time or compilation, keeping it extremely lightweight and easy to learn.
- **Alternative 2: Loading all views inside index.html at once and toggling display (block/none)**
  - **Why rejected:** If the app grows, loading all views and their data at startup makes the initial load very slow. By using dynamic imports (`await import(...)`), the browser only downloads the JavaScript code for a specific page when the user actually navigates to it, saving bandwidth and memory.
- **Alternative 3: Using window.confirm() and window.alert()**
  - **Why rejected:** Browser alerts look cheap and interrupt the user. Instead, we built a custom HTML dialog modal overlay (`#modal-backdrop`) and CSS toast notifications for a premium, non-blocking user experience.
