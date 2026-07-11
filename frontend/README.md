# Convene — Event Management Platform Frontend

Convene is a high-performance, single-page application (SPA) frontend for the Convene Event Platform. It is built entirely using vanilla web technologies: HTML5, CSS3, and JavaScript (ES6 Modules).

## Features

- **Single Page Application (SPA) Router:** A custom hash-based router in `app.js` that dynamically imports and loads views without full page reloads.
- **Vibrant & Glassmorphic UI:** Modern dark-theme aesthetic featuring smooth CSS transitions, glowing filters, and a layout that is fully responsive across Mobile, Tablet, and Desktop.
- **Fixed Navigation:** Sticky navigation bar at the top of the viewport with active-state styling highlighting the current route.
- **Dual-State Toasts:** Client-facing notification system styled green for successes and red for errors.
- **Modal Confirmation System:** Intercepts destructive actions (like deleting an event or cancellation) using custom glassmorphic warning modals.
- **Rich Form Validation:** In-depth front-end validation check on event and registration forms, featuring inline field-level red error alerts placed directly below invalid inputs.

## Setup & Running Locally

Because Convene is a pure client-side application using standard ES6 Modules, it must be run within a local web server (running modules directly from a `file://` URI will result in CORS restrictions).

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Run a local development server. We recommend **Live Server** (VS Code extension) or any lightweight CLI HTTP server:
   ```bash
   # Option A: Using node's http-server (if installed globally)
   npx http-server -p 5500
   
   # Option B: Python 3 one-liner
   python -m http.server 5500
   ```

3. Open your browser and navigate to:
   ```text
   http://localhost:5500
   ```
   *(Note: Ensure your backend `.env` configuration has `CLIENT_ORIGIN=http://localhost:5500` set to allow local CORS requests)*

---

## Directory Structure

```text
frontend/
├── app.js          # Core routing system, global toast, loading spinner, and modal infrastructure
├── index.html      # Main app entry shell
├── style.css       # Clean layout tokens, glassmorphic card classes, responsive breakpoints, and animations
└── views/          # Dynamically loaded view modules
    ├── dashboard.js  # Main landing dashboard displaying platform statistics & most popular event spotlight
    ├── events.js     # Event browser with search query filtering (title, category, location, date)
    ├── detail.js     # Detailed information, registration form, and attendee list
    └── form.js       # Dynamic form for creating and editing events (automatic edit-mode detection)
```

---

## Configuration

The frontend API endpoint base URL is configured at the top of `app.js`:

```javascript
const API = "http://localhost:5000"; // Point this to your live Render backend URL for production
```
