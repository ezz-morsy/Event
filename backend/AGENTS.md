# AGENTS.md — Backend

> Instructions for any AI agent working on the **Convene** backend.
> Read this file fully before touching any code.

---

## Quick-Start: First Thing To Do

1. Read `PLAN.md` at the repo root to understand the full scope and who owns what.
2. Check which branch you should be on:
   ```
   git branch -a
   ```
3. Create or checkout your feature branch:
   ```
   git checkout -b feature/<your-task-name>
   ```
   Examples: `feature/event-crud`, `feature/registration`, `feature/dashboard`
4. Make sure the server runs before you write any logic:
   ```
   npm install
   cp .env.example .env
   node server.js
   ```
5. Run the seed script once to populate test data:
   ```
   node seed.js
   ```
6. Confirm `GET http://localhost:5000/api/health` returns `{ "success": true }` before proceeding.

---

## Project Architecture — MVC (Strict)

This project follows the **Model-View-Controller** pattern. Never mix responsibilities between layers.

```
backend/
├── config/         → DB connection only
├── controllers/    → All business logic lives here
├── middleware/     → Express middleware (error handler, 404)
├── models/         → Mongoose schemas only — no logic
├── routes/         → Wire URL paths to controller functions only
├── utilities/      → Shared helpers (validator, etc.)
└── server.js       → App setup: middleware, routes, listen
```

### Rules per layer

**Models** (`models/`)
- Define the Mongoose schema and export the model.
- No methods, no business logic, no DB queries.

**Controllers** (`controllers/`)
- Import models and handle all DB operations.
- Handle `req`, build `res`. That is it.
- Each function must be exported and imported by a route file.
- Never define a route inside a controller.

**Routes** (`routes/`)
- Import controller functions and map HTTP methods + paths to them.
- Zero logic. No `if`, no DB calls, nothing.

**Middleware** (`middleware/`)
- `errorHandler.js` — global 4-argument error handler, registered last in `server.js`.
- `notFound.js` — catch-all 404, registered after all routes in `server.js`.

---

## API Response Format — Always Follow This

Every response must use this envelope.

Success:
```json
{ "success": true, "data": {} }
```

Failure:
```json
{ "success": false, "message": "Descriptive error here" }
```

Validation errors (create/update only):
```json
{
  "success": false,
  "errors": [
    { "field": "title", "message": "Title is required" },
    { "field": "capacity", "message": "Capacity must be greater than 0" }
  ]
}
```

Never send raw error objects, stack traces, or Mongoose error messages directly to the client.

---

## Error Handling Rules

- Use `try/catch` in every async controller function.
- In the `catch` block, call `next(err)` to pass to the global error handler.
- For 404s (not found), return immediately with status 404 — do not call `next()`.
- For validation failures, return status 400 with the errors array.
- HTTP status codes:
  - `200` — success
  - `201` — resource created
  - `400` — bad request / validation error
  - `404` — not found
  - `500` — unexpected server error (handled by errorHandler middleware)

---

## Coding Style

- Keep code readable and clean.
- Naming: be consistent within your own file. You do not have to camelCase everything — pick one style per file and stick to it.
- No magic numbers — store meaningful values in named variables.
- No commented-out dead code. Delete what you remove.
- Only comment non-obvious logic.
- Keep functions short and single-purpose.

---

## Environment Variables

Never hardcode values. Always use `process.env.*`.

Required variables (must be in `.env`):
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/convene
CLIENT_ORIGIN=http://localhost:3000
```

The `.env` file is gitignored. The `.env.example` file must always exist with the correct keys but no real values.

---

## npm Package Policy

- Do not install new packages without leaving a comment in the code explaining why.
- Approved packages: `express`, `mongoose`, `cors`, `dotenv`, `nodemon`.
- If you add a new package, comment above the require:
  ```js
  // Added: needed for X because Y
  const something = require("some-package");
  ```

---

## Git Workflow — GitHub CLI

### Start a task
```
git checkout -b feature/<task-name>
```

### Commit often with descriptive messages
```
git add .
git commit -m "add registration controller with duplicate email check"
```

### Push and open a PR
```
git push origin feature/<task-name>
gh pr create --title "<short description>" --body "<what you did and what was tested>"
```

PR description must include: what endpoints were added/changed and what curl commands were used to verify.

---

## Verification Before Pushing (Required)

Test every endpoint you touched with curl before opening a PR.

GET all events:
```
curl http://localhost:5000/api/events
```

POST create event:
```
curl -X POST http://localhost:5000/api/events -H "Content-Type: application/json" -d "{\"title\":\"Test\",\"category\":\"Tech\",\"location\":\"Cairo\",\"date\":\"2025-12-01\",\"capacity\":50,\"description\":\"Test\"}"
```

POST register:
```
curl -X POST http://localhost:5000/api/events/<id>/register -H "Content-Type: application/json" -d "{\"name\":\"Omar\",\"email\":\"omar@test.com\"}"
```

GET dashboard:
```
curl http://localhost:5000/api/dashboard
```

Every endpoint you touch must return the correct response shape before you push.

---

## Endpoint Reference

| Method | Route | Owner |
|---|---|---|
| GET | /api/health | Done |
| GET | /api/events | Ezz |
| POST | /api/events | Ezz |
| GET | /api/events/:id | Ezz |
| PUT | /api/events/:id | Ezz |
| DELETE | /api/events/:id | Ezz |
| POST | /api/events/:id/register | 4awmy |
| GET | /api/events/:id/attendees | 4awmy |
| DELETE | /api/events/:id/registrations/:registrationId | 4awmy |
| GET | /api/dashboard | 4awmy |

---

## Schema Reference

**Event:** title, category, location, date, capacity (min 1), description — all required

**Registration:** eventId (ref Event), name, email, registeredAt (default now)
Unique index: { eventId, email }
