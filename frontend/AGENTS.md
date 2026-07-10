# AGENTS.md — Frontend

> Instructions for any AI agent working on the **Convene** frontend.
> Read this file fully before touching any code.

---

## Quick-Start: First Thing To Do

1. Read `PLAN.md` at the repo root to understand the full scope and who owns what.
2. Check which branch you should be on (always use `dev` as your base branch):
   ```
   git checkout dev
   git pull origin dev
   ```
3. Create your feature branch from `dev`:
   ```
   git checkout -b feature/<your-task-name>
   ```
   Examples: `feature/frontend-setup`, `feature/frontend-detail-form`
4. Make sure the backend is running on port 5000 before testing any frontend:
   ```
   cd ../backend && node server.js
   ```
5. Open `index.html` directly in a browser or use a simple local server:
   ```
   npx serve .
   ```

---

## Project Architecture

The frontend is a **Vanilla JS Single Page Application**. No framework. No build step.

```
frontend/
├── index.html      → Single HTML file, one root div, navigation
├── style.css       → All styles
├── app.js          → API base URL constant + hash router + view loader
└── views/
    ├── dashboard.js → Dashboard view logic
    ├── events.js    → Events list view logic
    ├── detail.js    → Event detail + registration view logic
    └── form.js      → Create / Edit event form logic
```

### Rules per file

**`app.js`**
- Must define `const API = "http://localhost:5000"` at the top. Every fetch in every view uses this.
- Contains the router: listen to `window.location.hash`, load the correct view function.
- Contains the global `showToast(message, type)` function used by all views.
- Does not contain any view-specific rendering logic.

**`views/*.js`**
- Each view file exports one function (or a module pattern) that renders into `document.getElementById("app")`.
- Fetches its own data on load.
- Uses `API` from `app.js` — never hardcode `localhost:5000` inside a view file.
- Handles its own loading state and error state.

**`index.html`**
- One `<div id="app"></div>` as the root render target.
- Nav links use hash-based hrefs: `href="#dashboard"`, `href="#events"`, `href="#new-event"`.
- All `<script>` tags at the bottom.

---

## Routing — Hash-Based

Navigation uses URL hashes. No `pushState`. No server config needed.

| Hash | View |
|---|---|
| `#dashboard` | Dashboard stats |
| `#events` | Events list |
| `#new-event` | Create event form |
| `#event/:id` | Event detail (parse id from hash) |
| `#edit-event/:id` | Edit event form (parse id from hash) |

Router listens to `hashchange` and `DOMContentLoaded`.

---

## API Base URL

At the top of `app.js`:
```js
const API = "http://localhost:5000";
```

Every fetch call must use this. Example:
```js
const res = await fetch(`${API}/api/events`);
```

Never hardcode the full URL anywhere else.

---

## Fetch Pattern — Use This Shape

Every API call should follow this pattern:

```js
async function loadEvents() {
  try {
    showLoading();
    const res = await fetch(`${API}/api/events`);
    const json = await res.json();
    if (!json.success) {
      showToast(json.message || "Something went wrong", "error");
      return;
    }
    renderEvents(json.data);
  } catch (err) {
    showToast("Failed to connect to server", "error");
  } finally {
    hideLoading();
  }
}
```

Always:
- Check `json.success` before rendering
- Show an error toast on failure
- Show a loading state while fetching

---

## Toast Notifications

One global `showToast(message, type)` function defined in `app.js`. Used everywhere.

- `type` is either `"success"` or `"error"`
- Toast should auto-dismiss after ~3 seconds
- Never use `alert()` or `confirm()` — use a modal for confirmations instead

---

## Confirmation Modal

Delete actions must show a confirmation modal before calling the API. No browser `confirm()`.

Build one reusable `showModal(message, onConfirm)` in `app.js`.

---

## Forms and Validation

- Show server-returned validation errors inline, under each field.
- Errors come as: `[{ field: "title", message: "Title is required" }]`
- Match each error to its input by `field` name and display below it.
- Clear previous errors before each new submission.

---

## Coding Style

- Keep code readable and clean.
- Naming: be consistent within your own file. No strict camelCase requirement — pick one style per file and use it throughout.
- No magic strings — API paths and hash names should be easy to find.
- No commented-out dead code.
- Only comment non-obvious logic.
- Keep functions focused — one job per function.

---

## Git Workflow — GitHub CLI

### Start a task (always from `dev` branch)
```
git checkout dev
git pull origin dev
git checkout -b feature/<task-name>
```

### Commit often with descriptive messages
```
git add .
git commit -m "add events list view with search and filter"
```

### Push and open a PR (targeting `dev` branch)
```
git push origin feature/<task-name>
gh pr create --base dev --title "<short description>" --body "<what views/features you added and how you tested them>"
```

PR description must include: what views were added/changed and how you verified them in the browser.

---

## Verification Before Pushing (Required)

Before opening a PR, manually verify in the browser:

- [ ] The view renders without console errors
- [ ] All fetch calls return data and display correctly
- [ ] Error states show a toast (test by stopping the backend)
- [ ] Loading state appears while fetching
- [ ] Navigation between views works without page reload
- [ ] Responsive layout works on a narrow window (mobile simulation)

---

## Explanation Doc Requirement (Required)

For **every** task/feature you implement, you **must** create a markdown file inside a `docs/` folder (at the project root) named `explain-<feature-name>.md`.
The file must explain:
1. **What was done** and **why** it was done.
2. Write the explanation in simple, clear terms, as if you are **explaining to a freshman CS student**.
3. **What are the alternative designs/approaches** you considered, and why you chose your specific approach.

This is a strict requirement for all PR approvals.

---

## View Reference

| View | Hash | Owner |
|---|---|---|
| Dashboard | #dashboard | Fawmy |
| Events List | #events | Fawmy |
| Event Detail | #event/:id | Ezz |
| Create Event | #new-event | Ezz |
| Edit Event | #edit-event/:id | Ezz |
