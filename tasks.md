# Convene – Dev Plan

> **Team:** Ezz + 4awmy
> **Deadline:** Today
> **Stack:** Node/Express/MongoDB · Vanilla JS SPA
> **Architecture:** MVC — strict separation of Models, Controllers, Routes
> **Style:** Clean and readable. Consistent naming within each file. No strict camelCase required.
> **Repo:** Monorepo — `backend/` and `frontend/` in one shared repo
> **Git:** Feature branches branched off `dev` and targeting `dev` for PRs (e.g. `feature/event-crud`, `feature/registration`)
> **SPA Routing:** Hash-based (`#dashboard`, `#events`, `#event/:id`)
> **Frontend API base:** `const API = "http://localhost:5000"` at top of `app.js`
> **Deployment:** MongoDB Atlas + Render.com (backend) + Vercel (frontend) — see DEPLOYMENT.md

---

## Repo Structure (Final)

```
convene/                          ← repo root
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── eventController.js
│   │   ├── registrationController.js   ← 4awmy creates
│   │   ├── dashboardController.js      ← 4awmy creates
│   │   └── healthController.js         ← done
│   ├── middleware/
│   │   ├── errorHandler.js             ← done (needs registering)
│   │   └── notFound.js                 ← done (needs registering)
│   ├── models/
│   │   ├── Event.js                    ← minor fix needed
│   │   └── Registration.js             ← add unique index
│   ├── routes/
│   │   ├── eventRoutes.js              ← 4awmy adds registration routes
│   │   ├── dashboardRoutes.js          ← 4awmy creates
│   │   └── healthRoutes.js             ← done
│   ├── utilities/
│   │   └── eventValidator.js           ← rename + Ezz wires it
│   ├── seed.js                         ← shared test data
│   ├── server.js                       ← fix wiring (shared)
│   ├── .env                            ← create locally, gitignored
│   ├── .env.example                    ← committed
│   ├── AGENTS.md                       ← agent instructions (backend)
│   └── README.md                       ← Ezz writes
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── app.js                          ← const API + router + toast
│   ├── views/
│   │   ├── dashboard.js                ← 4awmy
│   │   ├── events.js                   ← 4awmy
│   │   ├── detail.js                   ← Ezz
│   │   └── form.js                     ← Ezz
│   ├── AGENTS.md                       ← agent instructions (frontend)
│   └── README.md                       ← 4awmy writes
├── PLAN.md                             ← this file
├── DEPLOYMENT.md                       ← deployment guide + trade-offs
└── Event-Platform-Requirements-Full.md ← original requirements
```

---

## Who Owns What

| Area | Owner |
|---|---|
| Backend – Event CRUD + Validation | **Ezz** |
| Backend – Registration endpoints | **4awmy** |
| Backend – Dashboard endpoint | **4awmy** |
| Frontend – Router + Toast + Dashboard + Events List | **4awmy** |
| Frontend – Event Detail + Create/Edit views | **Ezz** |
| Shared setup, Phase 0 | **Both** |

---

## Phase 0 — Shared Setup *(Do this together before splitting)*

> Both devs sit together and knock this out. Server will not run without it.

- [x] Move existing files into `backend/` folder (monorepo structure)
- [x] Fix `backend/config/db.js` — implement `connectDB()` and export it
- [x] Call `connectDB()` in `server.js` before `app.listen()`
- [x] Register `notFound` and `errorHandler` at the bottom of `server.js`
- [x] Create `backend/.env` (Local only, gitignored) — must contain: `MONGO_URI`, `PORT`, `CLIENT_ORIGIN`
- [x] Create `backend/.env.example` (same keys, empty values)
- [x] Rename `utilities/  eventValidator.js` to `utilities/eventValidator.js`
- [x] Add unique compound index to `Registration` model:
  ```js
  registrationSchema.index({ eventId: 1, email: 1 }, { unique: true });
  ```
- [x] Add `min: 1` to `capacity` in `Event` model
- [x] Create `backend/seed.js` (see Shared Seed Data section below)
- [x] Add `npm run dev` script to `backend/package.json` (nodemon):
  ```json
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
  ```
- [x] Fix CORS origin in `server.js` — must explicitly allow `http://localhost:5500` for local dev:
  ```js
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5500" }));
  ```

**Done when:** `node server.js` connects to MongoDB and `GET /api/health` returns `{ success: true }`.

---

## Shared Seed Data

> Create `backend/seed.js`. Run once after Phase 0. Both devs test against this.

```js
const mongoose = require("mongoose");
require("dotenv").config();
const Event = require("./models/Event");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Event.deleteMany({});
  await Event.insertMany([
    {
      title: "Tech Summit 2025",
      category: "Technology",
      location: "Cairo",
      date: new Date("2025-12-01T10:00:00"),
      capacity: 100,
      description: "A summit for tech enthusiasts."
    },
    {
      title: "Art Expo",
      category: "Art",
      location: "Alexandria",
      date: new Date("2025-11-15T14:00:00"),
      capacity: 50,
      description: "Annual art exhibition."
    },
    {
      title: "Past Event",
      category: "Other",
      location: "Giza",
      date: new Date("2024-01-01T10:00:00"),
      capacity: 30,
      description: "This event has already passed."
    }
  ]);
  console.log("Seeded.");
  process.exit();
}

seed();
```

Run with: `node seed.js`

---

## Phase 1 — Backend: Ezz Tasks

### Branch: `feature/event-crud`

#### Task 1 — getEvents
- Query `Event.find()` with optional filters from `req.query`
  - `search` → `{ title: { $regex: search, $options: "i" } }`
  - `category`, `location` → exact match if provided
  - `date` → match events on that calendar day
- Return `{ success: true, data: events }`

> ⚠️ **Gap:** Currently returns hardcoded `[]` — no DB query, no filters implemented.

**Definition of Done:**
- [x] `GET /api/events` returns all 3 seeded events
- [x] `GET /api/events?search=tech` returns only Tech Summit
- [x] `GET /api/events?category=Art` returns only Art Expo

---

#### Task 2 — getEventById
- `Event.findById(req.params.id)`
- 404 with `{ success: false, message: "Event not found" }` if missing

> ⚠️ **Gap:** Currently returns hardcoded `{}` — no DB lookup, no 404 handling.

**Definition of Done:**
- [x] Valid ID returns the event
- [x] Fake ID returns 404

---

#### Task 3 — createEvent
- Run validator, return errors array if invalid
- `Event.create(req.body)` if valid
- Return `{ success: true, data: newEvent }`

> ⚠️ **Gap:** Currently returns a static message — no `Event.create()`, validator never called.

**Definition of Done:**
- [x] POST with all fields → 200 + new event doc
- [x] POST missing title → `[{ field: "title", message: "..." }]`

---

#### Task 4 — updateEvent
- Same validation as create
- `Event.findByIdAndUpdate(id, body, { new: true })`
- Return updated document, 404 if not found

> ⚠️ **Gap:** Currently returns a static message — no DB update, no validation, no 404.

**Definition of Done:**
- [x] PUT with valid data → returns updated doc
- [x] PUT with missing field → validation error
- [x] PUT with bad ID → 404

---

#### Task 5 — deleteEvent
- `Event.findByIdAndDelete(id)`
- `Registration.deleteMany({ eventId: id })` — cascade delete
- Return `{ success: true, message: "Event deleted" }`

> ⚠️ **Gap:** Currently returns a static message — no DB delete, cascade delete not implemented.

**Definition of Done:**
- [x] DELETE valid ID → event and its registrations gone
- [x] DELETE bad ID → 404

---

#### Task 6 — Wire the Validator
- Import `eventValidator.js` in `eventController.js`
- Call it in `createEvent` and `updateEvent`
- Errors shape: `[{ field, message }]`

> ⚠️ **Gap:** `eventValidator.js` exists in `utilities/` but is never imported or called anywhere.

---

## Phase 1 — Backend: 4awmy Tasks

### Branch: `feature/registration`

#### Task 7 — registrationController.js

**registerAttendee — POST /api/events/:id/register**
- Find event, 404 if missing
- Count registrations vs capacity, 400 if full
- Check for duplicate email, 400 if exists
- `Registration.create(...)` and return it

**Definition of Done:**
- [x] Valid registration → 200 + registration doc
- [x] Duplicate email → 400 "Already registered"
- [x] Full event → 400 "Event is at capacity"

---

**getAttendees — GET /api/events/:id/attendees**
- `Registration.find({ eventId: id }).select("name email")`
- Return `{ success: true, data: attendees }`

**Definition of Done:**
- [x] Returns name + email only
- [x] Empty array if no registrations

---

**deleteRegistration — DELETE /api/events/:id/registrations/:registrationId**
- `Registration.findByIdAndDelete(registrationId)`
- 404 if not found

**Definition of Done:**
- [x] Valid ID → deleted, 200
- [x] Bad ID → 404

---

#### Task 8 — Add Registration Routes to eventRoutes.js
```js
router.post("/:id/register", registerAttendee);
router.get("/:id/attendees", getAttendees);
router.delete("/:id/registrations/:registrationId", deleteRegistration);
```

---

### Branch: `feature/dashboard`

#### Task 9 — dashboardController.js + dashboardRoutes.js

**GET /api/dashboard** — returns:
```json
{
  "success": true,
  "data": {
    "totalEvents": 3,
    "upcomingEvents": 2,
    "totalRegistrations": 5,
    "mostPopularEvent": {}
  }
}
```

- `upcomingEvents` = events where `date > new Date()`
- `mostPopularEvent` = event with highest registration count (null if none)
- Mount in `server.js`: `app.use("/api/dashboard", require("./routes/dashboardRoutes"))`

**Definition of Done:**
- [x] Returns all 4 fields with correct values against seeded data
- [x] `mostPopularEvent` is null/empty if no registrations (no crash)

---

## Phase 2 — Frontend: 4awmy Tasks

### Branch: `feature/frontend-setup`

#### Task 10 — Project Setup
- [x] `index.html`: single `<div id="app">`, nav with `#dashboard`, `#events`, `#new-event`
- [x] `app.js`: `const API = "https://convene-backend-6hzd.onrender.com"` (live Render URL set), hash router
- [x] Global `showToast(message, type)` and `showModal(message, onConfirm)` in `app.js`
- [x] Verify nav bar is **fixed at top** in `style.css` with **active-state** styling on current link
- [x] Verify toasts are styled **green** for `success` type and **red** for `error` type in `style.css`

---

#### Task 11 — Dashboard View (#dashboard)
- Create **`frontend/views/dashboard.js`** ← ⚠️ FILE DOES NOT EXIST
- Fetch `GET /api/dashboard`, render 4 stat cards, loading + error states

**Definition of Done:**
- [x] `frontend/views/dashboard.js` created
- [x] Cards show correct data
- [x] Error toast shows if API is down

---

#### Task 12 — Events List View (#events)
- Create **`frontend/views/events.js`** ← ⚠️ FILE DOES NOT EXIST
- Fetch events, render cards, search/filter as query params, confirm modal on delete

**Definition of Done:**
- [x] `frontend/views/events.js` created
- [x] All seeded events show, filtering works, delete removes card

---

## Phase 2 — Frontend: Ezz Tasks

### Branch: `feature/frontend-detail-form`

#### Task 13 — Event Detail View (#event/:id)
- Create **`frontend/views/detail.js`** ← ⚠️ FILE DOES NOT EXIST
- Fetch event + attendees, registration form (disabled when full), attendee delete

**Definition of Done:**
- [x] `frontend/views/detail.js` created
- [x] Event info renders, registering adds attendee, form disables when full, delete works

---

#### Task 14 — Create / Edit Event Form (#new-event / #edit-event/:id)
- Create **`frontend/views/form.js`** ← ⚠️ FILE DOES NOT EXIST
- Detect mode from **URL hash** (`#edit-event/:id` vs `#new-event`), pre-fill on edit, POST/PUT, inline errors, success toast + redirect
- Inline errors must be styled **red** and placed **beneath each invalid field**

**Definition of Done:**
- [x] `frontend/views/form.js` created
- [x] Empty submit shows inline errors (red, beneath each field), create redirects to list, edit pre-fills and saves

---

## Phase 3 — Final Stretch (Both)

| Task | Owner | Done when |
|---|---|---|
| `README.md` for backend | Ezz | Setup steps, .env vars, all endpoints listed [x] |
| `README.md` for frontend | 4awmy | How to run, what each view does [x] |
| Cross-test each other's work | Both | No console errors, no CORS issues [ ] |
| Deploy (see DEPLOYMENT.md) | Both | Live URLs working, DB seeded [ ] |
| Record demo video | Both | Shows all 6 required flows [ ] |
| **Split monorepo into two repos** | Both | `event-platform-backend` + `event-platform-frontend` submitted separately [ ] |

> ⚠️ **Repo naming is a submission requirement from the PDF.** Current repo `ezz-morsy/Event` must be split before final hand-in.

---

## Deployment Summary

> Full guide with exact steps and trade-offs: see **DEPLOYMENT.md**

| Service | Role | Trade-off |
|---|---|---|
| MongoDB Atlas (M0 free) | Database | Free, managed — but slow first connect |
| Render.com (free tier) | Backend | Auto-deploy from GitHub — but cold starts after 15 min idle |
| Vercel (hobby free) | Frontend | Instant CDN — must update `const API` to live Render URL before deploy |

Before recording demo: hit `/api/health` once to wake up Render, then record.

---

## Quick Rules

- MVC is strict — controllers have logic, routes only wire, models are dumb schemas
- Be consistent within your own file — naming style is your call
- No extra npm packages without agreeing first
- Test every endpoint in Postman/curl before marking it done
- Merge to `main` only after your branch works end-to-end
- Read `backend/AGENTS.md` or `frontend/AGENTS.md` for agent-specific instructions
