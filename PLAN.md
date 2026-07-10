# Convene – Dev Plan

> **Team:** Ezz + Fawmy
> **Deadline:** Today
> **Stack:** Node/Express/MongoDB · Vanilla JS SPA
> **Architecture:** MVC — strict separation of Models, Controllers, Routes
> **Style:** Clean and readable. Consistent naming within each file. No strict camelCase required.
> **Repo:** Monorepo — `backend/` and `frontend/` in one shared repo
> **Git:** Feature branches per task (e.g. `feature/event-crud`, `feature/registration`)
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
│   │   ├── registrationController.js   ← Fawmy creates
│   │   ├── dashboardController.js      ← Fawmy creates
│   │   └── healthController.js         ← done
│   ├── middleware/
│   │   ├── errorHandler.js             ← done (needs registering)
│   │   └── notFound.js                 ← done (needs registering)
│   ├── models/
│   │   ├── Event.js                    ← minor fix needed
│   │   └── Registration.js             ← add unique index
│   ├── routes/
│   │   ├── eventRoutes.js              ← Fawmy adds registration routes
│   │   ├── dashboardRoutes.js          ← Fawmy creates
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
│   │   ├── dashboard.js                ← Fawmy
│   │   ├── events.js                   ← Fawmy
│   │   ├── detail.js                   ← Ezz
│   │   └── form.js                     ← Ezz
│   ├── AGENTS.md                       ← agent instructions (frontend)
│   └── README.md                       ← Fawmy writes
├── PLAN.md                             ← this file
├── DEPLOYMENT.md                       ← deployment guide + trade-offs
└── Event-Platform-Requirements-Full.md ← original requirements
```

---

## Who Owns What

| Area | Owner |
|---|---|
| Backend – Event CRUD + Validation | **Ezz** |
| Backend – Registration endpoints | **Fawmy** |
| Backend – Dashboard endpoint | **Fawmy** |
| Frontend – Router + Toast + Dashboard + Events List | **Fawmy** |
| Frontend – Event Detail + Create/Edit views | **Ezz** |
| Shared setup, Phase 0 | **Both** |

---

## Phase 0 — Shared Setup *(Do this together before splitting)*

> Both devs sit together and knock this out. Server will not run without it.

- [ ] Move existing files into `backend/` folder (monorepo structure)
- [ ] Fix `backend/config/db.js` — implement `connectDB()` and export it
- [ ] Call `connectDB()` in `server.js` before `app.listen()`
- [ ] Register `notFound` and `errorHandler` at the bottom of `server.js`
- [ ] Create `backend/.env`:
  ```
  PORT=5000
  MONGO_URI=mongodb://localhost:27017/convene
  CLIENT_ORIGIN=http://localhost:3000
  ```
- [ ] Create `backend/.env.example` (same keys, empty values)
- [ ] Rename `utilities/  eventValidator.js` to `utilities/eventValidator.js`
- [ ] Add unique compound index to `Registration` model:
  ```js
  registrationSchema.index({ eventId: 1, email: 1 }, { unique: true });
  ```
- [ ] Add `min: 1` to `capacity` in `Event` model
- [ ] Create `backend/seed.js` (see Shared Seed Data section below)

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

**Definition of Done:**
- [ ] `GET /api/events` returns all 3 seeded events
- [ ] `GET /api/events?search=tech` returns only Tech Summit
- [ ] `GET /api/events?category=Art` returns only Art Expo

---

#### Task 2 — getEventById
- `Event.findById(req.params.id)`
- 404 with `{ success: false, message: "Event not found" }` if missing

**Definition of Done:**
- [ ] Valid ID returns the event
- [ ] Fake ID returns 404

---

#### Task 3 — createEvent
- Run validator, return errors array if invalid
- `Event.create(req.body)` if valid
- Return `{ success: true, data: newEvent }`

**Definition of Done:**
- [ ] POST with all fields → 200 + new event doc
- [ ] POST missing title → `[{ field: "title", message: "..." }]`

---

#### Task 4 — updateEvent
- Same validation as create
- `Event.findByIdAndUpdate(id, body, { new: true })`
- Return updated document, 404 if not found

**Definition of Done:**
- [ ] PUT with valid data → returns updated doc
- [ ] PUT with missing field → validation error
- [ ] PUT with bad ID → 404

---

#### Task 5 — deleteEvent
- `Event.findByIdAndDelete(id)`
- `Registration.deleteMany({ eventId: id })` — cascade delete
- Return `{ success: true, message: "Event deleted" }`

**Definition of Done:**
- [ ] DELETE valid ID → event and its registrations gone
- [ ] DELETE bad ID → 404

---

#### Task 6 — Wire the Validator
- Import `eventValidator.js` in `eventController.js`
- Call it in `createEvent` and `updateEvent`
- Errors shape: `[{ field, message }]`

---

## Phase 1 — Backend: Fawmy Tasks

### Branch: `feature/registration`

#### Task 7 — registrationController.js

**registerAttendee — POST /api/events/:id/register**
- Find event, 404 if missing
- Count registrations vs capacity, 400 if full
- Check for duplicate email, 400 if exists
- `Registration.create(...)` and return it

**Definition of Done:**
- [ ] Valid registration → 200 + registration doc
- [ ] Duplicate email → 400 "Already registered"
- [ ] Full event → 400 "Event is at capacity"

---

**getAttendees — GET /api/events/:id/attendees**
- `Registration.find({ eventId: id }).select("name email")`
- Return `{ success: true, data: attendees }`

**Definition of Done:**
- [ ] Returns name + email only
- [ ] Empty array if no registrations

---

**deleteRegistration — DELETE /api/events/:id/registrations/:registrationId**
- `Registration.findByIdAndDelete(registrationId)`
- 404 if not found

**Definition of Done:**
- [ ] Valid ID → deleted, 200
- [ ] Bad ID → 404

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
- [ ] Returns all 4 fields with correct values against seeded data
- [ ] `mostPopularEvent` is null/empty if no registrations (no crash)

---

## Phase 2 — Frontend: Fawmy Tasks

### Branch: `feature/frontend-setup`

#### Task 10 — Project Setup
- [ ] `index.html`: single `<div id="app">`, nav with `#dashboard`, `#events`, `#new-event`
- [ ] `app.js`: `const API = "http://localhost:5000"` (update to live URL before deploy), hash router
- [ ] Global `showToast(message, type)` and `showModal(message, onConfirm)` in `app.js`

---

#### Task 11 — Dashboard View (#dashboard)
- Fetch `GET /api/dashboard`, render 4 stat cards, loading + error states

**Definition of Done:**
- [ ] Cards show correct data
- [ ] Error toast shows if API is down

---

#### Task 12 — Events List View (#events)
- Fetch events, render cards, search/filter as query params, confirm modal on delete

**Definition of Done:**
- [ ] All seeded events show, filtering works, delete removes card

---

## Phase 2 — Frontend: Ezz Tasks

### Branch: `feature/frontend-detail-form`

#### Task 13 — Event Detail View (#event/:id)
- Fetch event + attendees, registration form (disabled when full), attendee delete

**Definition of Done:**
- [ ] Event info renders, registering adds attendee, form disables when full, delete works

---

#### Task 14 — Create / Edit Event Form (#new-event / #edit-event/:id)
- Detect mode, pre-fill on edit, POST/PUT, inline errors, success toast + redirect

**Definition of Done:**
- [ ] Empty submit shows inline errors, create redirects to list, edit pre-fills and saves

---

## Phase 3 — Final Stretch (Both)

| Task | Owner | Done when |
|---|---|---|
| `README.md` for backend | Ezz | Setup steps, .env vars, all endpoints listed |
| `README.md` for frontend | Fawmy | How to run, what each view does |
| Cross-test each other's work | Both | No console errors, no CORS issues |
| Deploy (see DEPLOYMENT.md) | Both | Live URLs working, DB seeded |
| Record demo video | Both | Shows all 6 required flows |

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
